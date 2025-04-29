
const captionModle = require("../models/caption.modle");
const Ride = require("../models/ride.model");
const User = require("../models/user.model");
const { getDistanceTimes, getCoordinates } = require("../services/map.service");
const { sendMessageToSocketId } = require("../socket");

// Fare calculation logic based on vehicle type
async function getFare(pickup, destination, vehicleType) {
    if (!pickup || !destination) {
        throw new Error("Pickup and destination are required");
    }

    const { distanceInKm } = await getDistanceTimes(pickup, destination);
    if (!distanceInKm) {
        throw new Error("Failed to get distance");
    }

    let farePerKm = 0;
    let baseFare = 0;

    switch (vehicleType) {
        case 'car':
            baseFare = 50;
            farePerKm = 5;
            break;
        case 'auto':
            baseFare = 30;
            farePerKm = 3;
            break;
        case 'motorcycle':
            baseFare = 20;
            farePerKm = 1;
            break;
        default:
            throw new Error("Invalid vehicle type");
    }

    const totalFare = baseFare + (distanceInKm * farePerKm);
    return { totalFare, distanceInKm };
}

async function getAllFare(req, res) {
    const { pickup, destination } = req.query;
    try {
        if (!pickup || !destination) {
            res.status(400).json({ message: "Pickup and destination are required" });
        }

        const { distanceInKm } = await getDistanceTimes(pickup, destination);
        if (!distanceInKm) {
            res.status(400).json({ message: "Failed to get distance" });
        }

        const fareConfig = {
            car: { baseFare: 50, farePerKm: 5 },
            auto: { baseFare: 30, farePerKm: 3 },
            motorcycle: { baseFare: 20, farePerKm: 1 }
        };

        const fares = {};

        for (const [vehicleType, { baseFare, farePerKm }] of Object.entries(fareConfig)) {
            const totalFare = Math.round(baseFare + (distanceInKm * farePerKm));
            fares[vehicleType] = {
                baseFare,
                farePerKm,
                distanceInKm,
                totalFare
            };
        }

        // return fares;
        res.status(200).json({ message: "Fare retrived successfully", data: fares })
    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
    }
}


// Controller to create a ride
const createRide = async (req, res) => {
    try {
        const { pickup, destination, vehicleType } = req.body;

        if (!pickup || !destination || !vehicleType) {
            return res.status(400).json({ message: "pickup, destination, and vehicleType are required" });
        }

        const fareData = await getFare(pickup, destination, vehicleType);

        const ride = new Ride({
            userId: req.user.id,
            pickup,
            destination,
            vehicleType,
            otp: generateOTP(),
            distance: fareData.distanceInKm,
            fare: fareData.totalFare
        });
        await ride.save();
        const pickupCoordinates = await getCoordinates(pickup);
        const user = await User.findById("67e8d9489e35e7b914dcbbf9");
        console.log(user);

        // const pickupCoordinates = { latitude: 22.4732415, longitude: 70.0552102 }; // Rajkot
        const rideData = await Ride.findOne({ _id: ride._id }).populate("userId").lean();
        // Fix query: Ensure correct coordinate order
        const captions = await captionModle.find({
            location: {
                $geoWithin: {
                    $centerSphere: [[pickupCoordinates.longitude, pickupCoordinates.latitude], 2500 / 6371]
                }
            }
        });
        Promise.all(captions?.map(async caption => {
            sendMessageToSocketId(caption.socketId, {
                event: "new-ride",
                data: rideData,
            });
        }))

        return res.status(200).json({
            message: "Ride created successfully",
            data: ride
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Server Error" });
    }
};

const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000)
};

const confirmRide = async (req, res, next) => {
    try {
        const { rideId } = req.body;
        if (!rideId) {
            res.status(400).json({ message: "Ride id is required" })
        }
        const id = req.caption._id;
        await Ride.findByIdAndUpdate(
            rideId,
            { status: "accepted", caption: id },
            { new: true }
        );

        const ride = await Ride.findOne({ _id: rideId }).populate("userId").populate("caption").select("otp")
        if (!ride) {
            res.status(400).json({ message: "Ride not found" })
        }

        sendMessageToSocketId(ride.userId.socketId, {
            event: "ride-confirm",
            data: ride
        })
        res.status(200).json({ data: ride })
    } catch (error) {
        res.status(500).json({ message: "Internal server error" })
        next();
    }
}

const verifyOTPandStartRide = async (req, res) => {
    try {
        const { rideId, otp } = req.body;
        const ride = await Ride.findOne({ _id: rideId }).select("otp").populate("userId", "socketId");
        if (!ride) {
            return res.status(404).json({ message: "Ride not found" });
        }
        if (ride.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" })
        }
        const updateRide = await Ride.findByIdAndUpdate(rideId, {
            status: "ongoing"
        }, { new: true })
        const rideData = await Ride.findOne({ _id: rideId }).select("-otp").populate("userId", "-password").populate("caption", "-password");
        if (ride.userId.socketId) {
            sendMessageToSocketId(ride.userId.socketId, {
                event: "ride-started",
                data: rideData,
            })
        }

        res.status(200).json({ message: "Ride successfully started" })
    } catch (error) {
        console.log("🚀 ~ verifyOTPandStartRide ~ error:", error)
        res.status(500).json({ message: "Internal server error" })
    }
}

const endRide = async (req, res) => {
    try {
        const { rideId } = req.body;
        const caption = req.caption;
        if (!caption || !caption._id) {
            return res.status(401).json({ message: "Unauthorized: Invalid caption" });
        }

        const ride = await Ride.findOne({
            _id: rideId,
            caption: caption._id
        }).populate("userId", "socketId")

        if (!ride) {
            return res.status(400).json({ message: "Ride not found" })
        }

        if (ride.status !== 'ongoing') {
            return res.status(400).json({ message: "Ride not ongoing" })
        }

        await Ride.findByIdAndUpdate(rideId, {
            status: "completed"
        });

        if (ride.userId.socketId) {
            sendMessageToSocketId(ride.userId.socketId, {
                event: "ride-end",
                data: ride,
            })
        }
        return res.status(200).json({ message: "Ride ended successfully" });
    } catch (error) {
        console.log("🚀 ~ endRide ~ error:", error)
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
}
module.exports = { createRide, getFare, getAllFare, confirmRide, verifyOTPandStartRide, endRide };
