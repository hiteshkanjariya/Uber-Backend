const express = require("express");
const {authUser} = require("../middlewares/auth.middleware")
const router = express.Router();
const {body} = require('express-validator');
const { registerUser, loginUser, getUserProfile, userLogout } = require("../controllers/user.contollers");
const { validateRegistration, validateLogin } = require("../Validations/validation");

router.post('/register', validateRegistration, registerUser);

router.post('/login', validateLogin, loginUser);

// router.get('/logout',logoutUser);
router.get("/profile",authUser, getUserProfile);

router.get("/logout",authUser, userLogout);

module.exports = router;