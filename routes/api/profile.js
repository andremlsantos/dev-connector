const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator/check");

const Profile = require("../../models/Profile");
const User = require("../../models/User");

// @route GET api/profile/me
// @desc Get current users profile
// @access Private
router.get("/me", auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.user.id })
            .populate("user", ["name", "avatar"]);

        if (!profile) {
            return res.status(400).json({ msg: "There is no profile for this user" });
        }

        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

// @route POST api/profile/
// @desc Create or update user profile
// @access Private
router.post("/", [auth, [
    check("status", "Status is required").not().isEmpty(),
    check("skills", "Skills is required").not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    const { company, location, website, bio, skills, status,
        githubusername, youtube, twitter,
        instagram, linkedin, facebook } = req.body;

    const profileFields = {};
    profileFields.user = req.user.id;

    // Build profile object
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
        profileFields.skills = skills.split(",").map(skill => skill.trim());
    }

    // Build social object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
        let profile = await Profile.findOne({ user: req.user.id });

        if (profile) {
            // Update
            profile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true });
        } else {
            // Create
            profile = new Profile(profileFields);
            await profile.save();
        }

        return res.json(profile);
    } catch (err) {
        console.error(err);
    }

    console.log(profileFields);
    res.send(profileFields);
});

// @route GET api/profile/
// @desc Get all profiles
// @access Public
router.get("/", async (req, res) => {
    try {
        const profiles = await Profile.find().populate("user", ["name, avatar"]);
        res.status(200).json(profiles);

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error");
    }
});

// @route GET api/profile/user/:user_id
// @desc Get profile by user id
// @access Public
router.get("/user/:user_id", async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id })
            .populate("user", ["name, avatar"]);

        if (!profile) {
            return res.status(400).json({ msg: "Profile not found" });
        }

        res.status(200).json(profile);

    } catch (error) {
        console.error(error.message);

        if (error.kind === "ObjectId") {
            return res.status(400).json({ msg: "Profile not found" });
        }

        res.status(500).send("Server error");
    }
});

module.exports = router;
