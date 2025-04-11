const express = require("express");

const rideRoutes = express.Router();

const { body } = require("express-validator");
const { createRide, getAllFare, confirmRide } = require("../controllers/ride.controllers");
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
)

module.exports = rideRoutes;