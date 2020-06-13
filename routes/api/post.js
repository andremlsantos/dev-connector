const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const auth = require("../../middleware/auth");

const User = require("../../models/User");
const Profile = require("../../models/Profile");
const Post = require("../../models/Post");

// @route POST api/post
// @desc Create a post
// @access Private
router.post("/", [auth,
    [check("text", "Text is required").not().isEmpty()]
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findById(req.user.id).select("-password");

        const newPost = new Post({
            text: req.body.text,
            user: req.user.id,
            name: user.name,
            avatar: user.avatar,
        });

        const post = await newPost.save();
        res.json(post);

    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }

});

// @route GET api/post
// @desc Get all posts
// @access Private
router.get("/", auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({
            date: -1
        });
        res.json(posts);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});

// @route GET api/post/:id
// @desc Get post by id
// @access Private
router.get("/:id", auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ msg: "Post not found" });
        }

        res.json(post);
    } catch (error) {
        if (error.kind === "ObjectId") {
            return res.status(404).json({ msg: "Post not found" });
        }

        console.error(error);
        res.status(500).send("Server error");
    }
});

// @route DELETE api/post/:id
// @desc Delete post by id
// @access Private
router.delete("/:id", auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: "Post not found" });
        }

        // The user that deletes the post must be him
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: "User not authorized to removed this post" });
        }

        await post.remove();
        res.json({ msg: "Post removed" });
    } catch (error) {
        if (error.kind === "ObjectId") {
            return res.status(404).json({ msg: "Post not found" });
        }

        console.error(error);
        res.status(500).send("Server error");
    }
});

// @route PUT api/post/like/:id
// @desc Like a post
// @access Private
router.put("/like/:id", auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: "Post not found" });
        }

        // Check if post was already being liked by same user
        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({ msg: "Post already liked" });
        }

        post.likes.unshift({ user: req.user.id });
        await post.save();

        res.json(post.likes);
    } catch (error) {
        if (error.kind === "ObjectId") {
            return res.status(404).json({ msg: "Post not found" });
        }

        console.error(error);
        res.status(500).send("Server error");
    }
});

// @route PUT api/post/unlike/:id
// @desc Unlike a post
// @access Private
router.put("/unlike/:id", auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ msg: "Post not found" });
        }

        // Check if as been like
        if (post.likes.filter(like => like.user.toString() === req.user.id).length == 0) {
            return res.status(400).json({ msg: "Post has not been liked" });
        }

        // Get removed index
        const removedIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
        post.likes.splice(removedIndex, 1);
        await post.save();

        res.json(post.likes);
    } catch (error) {
        if (error.kind === "ObjectId") {
            return res.status(404).json({ msg: "Post not found" });
        }

        console.error(error);
        res.status(500).send("Server error");
    }
});

module.exports = router;
