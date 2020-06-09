const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const gravatar = require("gravatar");
const bcryptjs = require("bcryptjs");
const config = require("config");
const jwt = require("jsonwebtoken");

const User = require("../../models/User");

// @route POST api/user
// @desc Register user
// @access Public
router.post(
    "/",
    [
        check("name", "Name is required").not().isEmpty(),
        check("email", "Please include a valid email").isEmail(),
        check(
            "password",
            "Please enter a password with 6 or more characters"
        ).isLength({
            min: 6,
        }),
    ],
    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, password } = req.body;

        try {
            // See if user exists
            let user = await User.findOne({ email });
            if (user) {
                console.log("User already exists");
                return res.status(400).json({ errors: [{ msg: "User already exists" }] });
            }

            // Get users gravatar
            const avatar = gravatar.url(email, {
                s: "200",
                r: "pg",
                d: "mm"
            });

            user = new User({
                name, email, avatar, password
            });

            // Encrypt password
            const salt = await bcryptjs.genSalt(10);
            user.password = await bcryptjs.hash(password, salt);
            await user.save();

            // Return jsonwebtoken
            const payload = {
                user: {
                    id: user.id,
                    name: user.name
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
