const express = require("express");
const { body } = require("express-validator");
const captionRouter = express.Router();
const { captionLogin, captionRegister, getCaptionProfile, captionLogout } = require("../controllers/caption.controllers.js");
const { authCaption } = require("../middlewares/auth.middleware.js");

captionRouter.post(
    '/register',
    [
        body('firstname')
            .isLength({ min: 3 })
            .withMessage("Firstname must be at least 3 characters long"),
        body('lastname')
            .notEmpty()
            .withMessage("Lastname is required"),
        body('email')
            .isEmail()
            .withMessage("Invalid email format"),
        body('password')
            .notEmpty()
            .withMessage("Password is required")
    ],
    captionRegister
);
captionRouter.post("/login", [
    body('email')
        .isEmail()
        .withMessage("Invalid email format"),
    body('password')
        .notEmpty()
        .withMessage("Password is required")
], captionLogin)

captionRouter.get("/profile", authCaption, getCaptionProfile);
captionRouter.get("/logout", authCaption, captionLogout)
module.exports = captionRouter;
