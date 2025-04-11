const express = require("express");
const { getCoordinates, getDistanceTime, getAutoSuggestions } = require("../controllers/map.controllers");
const { default: axios } = require("axios");
const { authUser } = require("../middlewares/auth.middleware");

const mapRoutes = express.Router()

mapRoutes.get('/get-coordinates', authUser, getCoordinates);
mapRoutes.get("/get-distance-time", authUser, getDistanceTime);
mapRoutes.get("/get-suggestions", authUser, getAutoSuggestions)



module.exports = mapRoutes