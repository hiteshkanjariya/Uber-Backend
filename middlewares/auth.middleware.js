const JWTBlacklist = require('../models/blackListToken.model');
const captionModle = require('../models/caption.modle');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

module.exports.authUser = async (req, res, next) => {
    try {
        // Extract token from cookies or authorization header
        const token = req.cookies.token || (req.headers.authorization && req.headers.authorization?.split(' ')[1]);
        console.log("🚀 ~ module.exports.authUser= ~ token:", token)
        if (!token) {
            return res.status(401).json({ message: "Unauthorized: Token not provided" });
        }
        const isBlackListed = await JWTBlacklist.findOne({ token: token });
        console.log("🚀 ~ module.exports.authUser= ~ isBlackListed:", isBlackListed)
        if (isBlackListed) {
            return res.status(401).json({ message: "Unauthorized: Token not provided" });
        }
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user by ID
        const user = await User.findById(decoded._id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Unauthorized: Token has expired" });
        }
        console.error("Error in authUser middleware:", error);
        res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};
module.exports.authCaption = async (req, res, next) => {
    try {
        // Extract token from cookies or authorization header
        const token = req.cookies.token || (req.headers.authorization && req.headers.authorization?.split(' ')[1]);

        if (!token) {
            return res.status(401).json({ message: "Unauthorized: Token not provided" });
        }
        const isBlackListed = await JWTBlacklist.findOne({ token: token });
        if (isBlackListed) {
            return res.status(401).json({ message: "Unauthorized: Token not provided" });
        }
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find user by ID
        const caption = await captionModle.findById(decoded._id);

        if (!caption) {
            return res.status(404).json({ message: "caption not found" });
        }

        // Attach caption to request object
        req.caption = caption;
        next();
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Unauthorized: Token has expired" });
        }
        console.error("Error in authUser middleware:", error);
        res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};