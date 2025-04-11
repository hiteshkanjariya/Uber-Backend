const JWTBlacklist = require("../models/blackListToken.model");
const User = require("../models/user.model");
const { validationResult } = require("express-validator");

const registerUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg);
            return res.status(400).json({ message: errorMessages });
        }

        const { firstname, lastname, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const newUser = new User({ firstname, lastname, email, password });
        await newUser.save();

        const token = newUser.generateAuthToken();
        res.status(201).json({ token, user: newUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        const user = await User.findOne({ email }).select("+password");
        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = user.generateAuthToken();
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600000,
        });

        res.status(200).json({ token, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const userLogout = async (req, res) => {
    try {
        const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(" ")[1]);
        if (token) {
            await JWTBlacklist.create({ token });
        }

        res.clearCookie("token");
        res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, getUserProfile, userLogout };
