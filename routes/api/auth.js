const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const config = require("config");
const bcryptjs = require("bcryptjs");
const { check, validationResult } = require("express-validator/check");
const auth = require("../../middleware/auth");
const User = require("../../models/User");

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

// @route POST api/auth
// @desc Authenticate user & get token
// @access Public
router.post(
    "/",
    [
        check("email", "Please include a valid email").isEmail(),
        check("password", "Password is required").exists()
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            // See if user exists
            let user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
            }

            const isMath = await bcryptjs.compare(password, user.password);
            if (!isMath) {
                return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
            }

            // Return token
            const payload = {
                user: {
                    id: user.id,
                }
            };

            jwt.sign(payload, config.get("jwtSecret"),
                { expiresIn: 3600 },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                });

        } catch (err) {
            console.error(err);
            res.status(500).send("Server error");
        }
    }
);


module.exports = router;
