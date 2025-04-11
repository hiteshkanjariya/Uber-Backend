const axios = require('axios');

const getDistanceTimes = async (origin, destination) => {
    const originCoords = await getCoordinates(origin);
    const destinationCoords = await getCoordinates(destination);

    if (!originCoords || !destinationCoords) {
        throw new Error("Invalid origin or destination address");
    }

    const { latitude: lat1, longitude: lon1 } = originCoords;
    const { latitude: lat2, longitude: lon2 } = destinationCoords;

    const API_KEY = "5b3ce3597851110001cf6248b3882323dd68415cafa1f43cf711b1c6";
    const orsUrl = "https://api.openrouteservice.org/v2/directions/driving-car";

    const response = await axios.get(`${orsUrl}?start=${lon1},${lat1}&end=${lon2},${lat2}`, {
        headers: {
            'Authorization': API_KEY,
            'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
            'Content-Type': 'application/json; charset=utf-8'
        }
    });

    console.log("🚀 ~ getDistanceTimes ~ response:", response)
    const formattedData = formatDistanceDuration(response.data);

    return {
        distanceInKm: parseFloat(formattedData.distance.value / 1000),
        ...formattedData
    };
};

// async function getCoordinates(address) {
//     const response = await axios.get('https://nominatim.openstreetmap.org/search', {
//         params: { q: address, format: 'json' },
//         headers: { 'User-Agent': 'YourAppName/1.0' }
//     });

//     if (!response.data || response.data.length === 0) {
//         return null;
//     }

//     const { lat, lon } = response.data[0];
//     return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
// }
async function getCoordinates(address) {
    try {
        const response = await axios.get("https://nominatim.openstreetmap.org/search", {
            params: { q: address, format: "json" },
            headers: { "User-Agent": "YourAppName/1.0" }
        });

        if (!response.data || response.data.length === 0) {
            throw new Error("Location not found");
        }

        const { lat, lon } = response.data[0];

        return { latitude: parseFloat(lat), longitude: parseFloat(lon) }; // Fix: Use "lng" for MongoDB
    } catch (error) {
        console.error("Error fetching coordinates:", error.message);
        return { latitude: 0, longitude: 0 }; // Fix: Provide a fallback value
    }
}

const formatDistanceDuration = (data) => {
    const segment = data.features[0].properties.segments[0];
    const distanceMeters = segment.distance;
    const durationSeconds = segment.duration;
    const distanceKm = (distanceMeters / 1000).toFixed(0);
    const days = Math.floor(durationSeconds / (3600 * 24));
    const hours = Math.floor((durationSeconds % (3600 * 24)) / 3600);

    return {
        distance: {
            text: `${Number(distanceKm).toLocaleString()} km`,
            value: Math.round(distanceMeters)
        },
        duration: {
            text: `${days > 0 ? `${days} day${days > 1 ? 's' : ''} ` : ''}${hours} hour${hours > 1 ? 's' : ''}`,
            value: Math.round(durationSeconds)
        },
        status: "OK"
    };
};

const mapSuggestion = async (input) => {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: { q: input, format: 'json', addressdetails: 1, limit: 5 },
        headers: { 'User-Agent': 'YourAppName/1.0' }
    });

    return response.data.map(place => {
        const displayName = place.display_name;
        const addressParts = [];

        if (place.address.city) addressParts.push(place.address.city);
        else if (place.address.town) addressParts.push(place.address.town);
        else if (place.address.village) addressParts.push(place.address.village);
        if (place.address.state) addressParts.push(place.address.state);
        if (place.address.country) addressParts.push(place.address.country);

        const terms = addressParts.map(part => ({
            offset: displayName.indexOf(part),
            value: part
        }));

        return { display_name: displayName, lat: place.lat, lon: place.lon, terms };
    });
};

module.exports = { getDistanceTimes, getCoordinates, mapSuggestion };
