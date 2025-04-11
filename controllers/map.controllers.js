// const axios = require('axios');
// const mapService = require('../services/map.service');

// const getCoordinates = async (req, res, next) => {
//     console.log("🚀 ~ getCoordinates ~ req:", req)
//     const { address } = req.query;
//     if (!address) {
//         return res.status(400).json({ message: "Not found" })
//     }

//     try {
//         const coordinates = await mapService.getCoordinates(address);
//         return res.status(200).json(coordinates);
//     } catch (error) {
//         console.error('Error fetching coordinates:', error.message);
//         return res.status(500).json({ message: "Internal server error" })
//     }
// }
// const getDistanceTime = async (req, res, next) => {
//     const { origin, destination } = req.query; // Get parameters from query string
//     await mapService.getDistanceTimes(origin, destination, res); // Call function
// }
// const getAutoSuggestions =  async (req,res,next) =>{
//     const {query} = req.query;

//     if (!query) {
//         return res.status(400).json({ message: "Query param  is required" });
//     }

//     try {
//         const results = await mapService.mapSuggestion(query);
//         return res.status(200).json({ suggestions: results });
//     } catch (error) {
//         return res.status(500).json({ message: error.message });
//     }
// }
// module.exports = { getCoordinates, getDistanceTime,getAutoSuggestions };
const mapService = require('../services/map.service');

const getCoordinates = async (req, res) => {
    const { address } = req.query;
    if (!address) {
        return res.status(400).json({ message: "Address is required" });
    }

    try {
        const coordinates = await mapService.getCoordinates(address);
        return res.status(200).json(coordinates);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getDistanceTime = async (req, res) => {
    const { origin, destination } = req.query;
    if (!origin || !destination) {
        return res.status(400).json({ message: "Origin and destination are required" });
    }

    try {
        const data = await mapService.getDistanceTimes(origin, destination);
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getAutoSuggestions = async (req, res) => {
    const { query } = req.query;
    if (!query) {
        return res.status(400).json({ message: "Query param is required" });
    }

    try {
        const results = await mapService.mapSuggestion(query);
        return res.status(200).json({ suggestions: results });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = { getCoordinates, getDistanceTime, getAutoSuggestions };
