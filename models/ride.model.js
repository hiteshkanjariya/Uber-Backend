const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    caption: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Caption"
    },
    pickup: { type: String, required: true },
    destination: { type: String, required: true },
    fare: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'ongoing', 'completed', 'cancelled'],
        default: 'pending'
    },
    // in seconds
    duration: {
        type: Number
    },
    // in meters
    distance: {
        type: Number,
    },
    paymentId: {
        type: String,
    },
    orderId: {
        type: String,
    },
    signature: {
        type: String
    },
    vehicleType: {
        type: String
    },
    otp: { type: String, select: false, required: true }
});

const Ride = mongoose.model('Ride', rideSchema);
module.exports = Ride;
