const { validationResult } = require("express-validator");
const Caption = require("../models/caption.modle");
const captionModle = require("../models/caption.modle");
const JWTBlacklist = require("../models/blackListToken.model");

const captionRegister = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { firstname, lastname, email, password, color, plate, capacity, vehicleType, lat, lng } = req.body;

    try {
        // Check if the email is already in use
        const existingUser = await Caption.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email is already registered" });
        }

        // Hash the password
        const hashedPassword = await Caption.hashPassword(password);

        // Create a new Caption user
        const newCaption = new Caption({
            firstname,
            lastname,
            email,
            password: hashedPassword,
            vehicle: {
                color,
                plate,
                capacity,
                vehicleType,
            },
            // location: {
            //     lat,
            //     lng,
            // },
        });

        await newCaption.save();

        // Generate authentication token
        const token = newCaption.generateAuthToken();

        res.status(201).json({
            message: "User registered successfully",
            user: newCaption,
            token: token,
        });
    } catch (error) {
        console.error("Error during registration:", error);
        res.status(500).json({ message: error.message || "Internal Server Error" });
    }
};

const captionLogin = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { email, password } = req.body;
        const caption = await Caption.findOne({ email }).select('+password');
        if (!caption) {
            return res.status(400).json({ message: "Invalid email or password" })
        }
        const ismatch = await caption.comparePassword(password)
        if (!ismatch) {
            return res.status(400).json({ message: "Invalid email or password" })
        }
        const token = await caption.generateAuthToken();
        res.status(200).json({ token, caption });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
const getCaptionProfile = async (req, res, next) => {
    try {
        const caption = await captionModle.findById(req.caption._id).select("-password");
        if (!caption) {
            return res.status(404).json({ message: "Caption not found" });
        }
        res.status(200).json({ caption });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}

const captionLogout = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
        await JWTBlacklist.create({ token });
        res.clearCookie('token');
        res.status(200).json({ message: "Logout Successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
}
module.exports = { captionRegister, captionLogin, getCaptionProfile, captionLogout };
