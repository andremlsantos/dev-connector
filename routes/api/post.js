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

module.exports = router;
