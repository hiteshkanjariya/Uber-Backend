const { body } = require("express-validator");

const validateRegistration = [
    body("firstname").isLength({ min: 3 }).withMessage("First name must be at least 3 characters"),
    body("email").isEmail().withMessage("Invalid email format"),
    body("password").isLength({ min: 3 }).withMessage("Password must be at least 3 characters"),
];

const validateLogin = [
    body("email").isEmail().withMessage("Invalid email format"),
    body("password").notEmpty().withMessage("Password is required"),
];

module.exports = { validateRegistration, validateLogin };
