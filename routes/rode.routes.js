const express = require("express");

const rideRoutes = express.Router();

const { body } = require("express-validator");
const { createRide, getAllFare, confirmRide, verifyOTPandStartRide, endRide } = require("../controllers/ride.controllers");
const { authUser, authCaption } = require("../middlewares/auth.middleware");

rideRoutes.post("/create", authUser,
    body("userId").isString().withMessage("Invalid userId"),
    body("pickup").isString().withMessage("Invalid pickup address"),
    body("destination").isString().withMessage("Invalid destination address"),
    createRide
);
rideRoutes.get("/get-all-fare", authUser, getAllFare);
rideRoutes.post("/confirm-ride", authCaption,
    body("rideId").isMongoId().withMessage("Invalid ride id"),
    confirmRide
);

rideRoutes.post("/start-ride", authCaption,
    body("rideId").isMongoId().withMessage("Invalid ride id"),
    body('otp').isString().isLength({ min: 4, max: 4 }).withMessage("OTP is required"),
    verifyOTPandStartRide
)

rideRoutes.post("/end-ride", authCaption,
    body("rideId").isMongoId().withMessage("Invalid ride id"),
    endRide
)
module.exports = rideRoutes;