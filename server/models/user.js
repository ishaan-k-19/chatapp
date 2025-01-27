import mongoose, { Schema, model } from "mongoose";
import { hash } from "bcrypt";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Define the User schema
const schema = new Schema({
    name: {
        type: String,
        required: true, 
    },
    email: {
        type: String,
        required: true, 
        unique: true, 
    },
    bio: {
        type: String,
        required: true, 
    },
    username: {
        type: String,
        required: true, 
        unique: true, 
    },
    password: {
        type: String,
        required: true, 
        select: false, 
    },
    avatar: {
        public_id: {
            type: String,
            required: true, 
        },
        url: {
            type: String,
            required: true, 
        }
    },
    verified: {
        type: Boolean,
        default: false, 
    },
    otp: Number, 
    otp_expiry: Date, 
    resetPasswordOtp: Number, 
    resetPasswordOtp_expiry: Date, 
}, {
    timestamps: true, 
});

// Pre-save middleware to hash the password if modified
schema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(); // Skip if password is not modified

    this.password = await hash(this.password, 10); // Hash the password with bcrypt
});

// Method to generate JWT token for the user
schema.methods.getJWTToken = function () {
    return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
        expiresIn: 15 * 24 * 60 * 60 * 1000, // Token expires in 15 days
    });
};

// Method to compare passwords
schema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password); // Compare given password with stored hash
};

// Index to automatically expire documents based on otp_expiry
schema.index({ otp_expiry: 1 }, { expireAfterSeconds: 0 });

// Create the User model if it doesn't already exist
const User = mongoose.models.User || model("User", schema);
export default User;