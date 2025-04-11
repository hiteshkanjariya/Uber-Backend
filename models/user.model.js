const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: [true, "First name is required"],
        minlength: [3, "First name must be at least 3 characters"],
    },
    lastname: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
        required: [true, "Email is required"],
        match: [/\S+@\S+\.\S+/, "Email format is invalid"],
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        select: false,
    },
    socketId: {
        type: String,
    },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Generate JWT
userSchema.methods.generateAuthToken = function () {
    return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: "24h" });
};

// Compare password
userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;
