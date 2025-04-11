const axios = require('axios');

const getDistanceTimes = async (origin, destination, res) => {
    if (!origin || !destination) {
        return res.status(400).json({ message: "Origin and destination are required" });
    }

    try {

        // Get Coordinates for Origin
        const originCoords = await getCoordinates(origin);
        if (!originCoords || !originCoords.latitude || !originCoords.longitude) {
            return res.status(400).json({ message: `Invalid origin address: ${origin}` });
        }

        // Get Coordinates for Destination
        const destinationCoords = await getCoordinates(destination);
        if (!destinationCoords || !destinationCoords.latitude || !destinationCoords.longitude) {
            return res.status(400).json({ message: `Invalid destination address: ${destination}` });
        }

        const { latitude: lat1, longitude: lon1 } = originCoords;
        const { latitude: lat2, longitude: lon2 } = destinationCoords;

        // ✅ Replace with your actual API Key
        const API_KEY = "5b3ce3597851110001cf6248b3882323dd68415cafa1f43cf711b1c6";

        // ✅ Ensure longitude,latitude format (ORS API requirement)
        const orsUrl = "https://api.openrouteservice.org/v2/directions/driving-car";

        // ✅ Test coordinates before making API request
        const response = await axios.get(`${orsUrl}?start=-74.0060152,40.7127281&end=-118.242766,34.0536909`, {
            headers: {
                'Authorization': API_KEY, // Some APIs expect it like this instead of query param
                'Accept': 'application/geo+json;charset=UTF-8',
            }
        });

        console.log("🚀 ~ mapRoutes.get ~ response.data:", response.data)

        res.status(200).json({ message: "test", data: response.data });
        if (!data.routes || data.routes.length === 0) {
            return res.status(404).json({ message: "No route found between the given locations." });
        }

        // const data = response.data;
        // const { distance, duration } = data.routes[0].summary;

        // return res.status(200).json({
        //     origin,
        //     destination,
        //     distance: (distance / 1000).toFixed(2) + " km", // Convert meters to km
        //     duration: (duration / 60).toFixed(2) + " mins" // Convert seconds to minutes
        // });

    } catch (error) {
        console.error("❌ Error fetching distance & time:", error.message);
        return res.status(500).json({
            message: "Failed to fetch distance and duration",
            error: error.message
        });
    }
};

// 📌 Function to Get Coordinates Using OpenStreetMap Nominatim API
async function getCoordinates(address) {
    try {
        console.log(`📌 Fetching coordinates for: ${address}`);

        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: { q: address, format: 'json' },
            headers: { 'User-Agent': 'YourAppName/1.0' }
        });

        if (!response.data || response.data.length === 0) {
            console.error(`❌ No coordinates found for: ${address}`);
            return null;
        }

        const { lat, lon } = response.data[0];
        return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
    } catch (error) {
        console.error("❌ Error fetching coordinates:", error.message);
        return null;
    }
}

module.exports = { getDistanceTimes, getCoordinates };
