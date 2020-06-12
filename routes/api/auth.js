const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const auth = require("../../middleware/auth");

// @route GET api/auth
// @desc Test route
// @access Public
router.get("/", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);

    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});

module.exports = router;