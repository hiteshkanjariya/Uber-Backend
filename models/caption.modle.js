const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const captionSchema = mongoose.Schema({
    firstname: {
        type: String,
        required: [true, "Firstname is required"],
        minlength: [3, "Firstname must be at least 3 characters long"]
    },
    lastname: {
        type: String,
        required: [true, "Lastname is required"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    socketId: {
        type: String
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "inactive"
    },
    vehicle: {
        color: {
            type: String,
            required: [true, "Vehicle color is required"],
            minlength: [3, "Color must be at least 3 characters long"]
        },
        plate: {
            type: String,
            required: [true, "Vehicle plate is required"],
            minlength: [3, "Plate must be at least 3 characters long"]
        },
        capacity: {
            type: Number,
            required: [true, "Vehicle capacity is required"],
            min: [1, "Capacity must be at least 1"]
        },
        vehicleType: {
            type: String,
            required: [true, "Vehicle type is required"],
            enum: ["car", "motorcycle", "auto"]
        }
    },
    location: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: {
            type: [Number], // Should be [lng, lat]
            required: true
        }
    },
    // location: {
    //     lat: {
    //         type: Number,
    //         // required: [true, "Latitude is required"]
    //     },
    //     lng: { // Corrected from "len" to "lng"
    //         type: Number,
    //         // required: [true, "Longitude is required"]
    //     }
    // }
});

// Method to generate authentication token
captionSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: "24h" });
    return token;
};

// Method to compare passwords
captionSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Static method to hash passwords
captionSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password, 10);
};
module.exports = mongoose.model("Caption", captionSchema);
