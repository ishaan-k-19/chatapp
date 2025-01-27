import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import {v4 as uuid} from "uuid";
import { v2 as cloudinary} from "cloudinary";
import { getBase64, getSockets } from "../lib/helper.js";

// Cookie options for setting secure HTTP cookies
const cookieOptions = {
    maxAge: 15 * 24 * 60 * 60 * 1000, // Cookie expires in 15 days
    sameSite: "none", // Cookie works across different sites
    httpOnly: true, // Cookie cannot be accessed via client-side JavaScript
    secure: true, // Cookie is sent only over HTTPS
};

// Function to connect to the MongoDB database
const connectDB = (uri) => {
    mongoose
        .connect(uri, { dbName: "chatApp" }) // Connect to the "chatApp" database
        .then((data) => {
            console.log(`Connected to database: ${data.connection.host}`); // Log success message
        })
        .catch((err) => {
            throw err; // Throw an error if the connection fails
        });
};

// Function to send a JSON Web Token (JWT) to the client as an HTTP cookie
const sendToken = (res, user, code, message) => {
    const token = user.getJWTToken(); // Generate a JWT for the user

    // Set the token as a cookie and return a JSON response
    return res
        .status(code)
        .cookie("chatapp-token", token, cookieOptions) // Set the JWT in a cookie
        .json({
            success: true, // Indicate success
            token, // Return the JWT
            message, // Custom message
            user, // Return user details
        });
};

// Function to emit events to specific users via WebSocket
const emitEvent = (req, event, users, data) => {
    let io = req.app.get("io"); // Retrieve the Socket.IO instance from the app
    const usersSocket = getSockets(users); // Get the socket IDs of the target users
    io.to(usersSocket).emit(event, data); // Emit the event to the specified users
};

// Function to upload multiple files to Cloudinary
const uploadFilesToCloudinary = async (files = []) => {
    // Map over files and return promises for each file upload
    const uploadPromises = files.map((file) => {
        return new Promise((resolve, reject) => {
            cloudinary.uploader.upload(
                getBase64(file), // Convert the file to base64 format
                {
                    resource_type: "auto", // Automatically detect the file type
                    public_id: uuid(), // Generate a unique public ID for the file
                },
                (err, result) => {
                    if (err) return reject(err); // Reject the promise if an error occurs
                    resolve(result); // Resolve the promise with the upload result
                }
            );
        });
    });

    try {
        const results = await Promise.all(uploadPromises); // Wait for all upload promises to resolve

        // Format the results to include only the public ID and secure URL
        const formattedResults = results.map((result) => ({
            public_id: result.public_id, // Cloudinary public ID
            url: result.secure_url, // Secure URL of the uploaded file
        }));
        return formattedResults; // Return the formatted results
    } catch (error) {
        throw new Error("Error uploading files to Cloudinary", error); // Throw an error if uploads fail
    }
};

// Function to delete files from Cloudinary
const delteFilesFromCloudinary = async (public_ids) => {
    try {
        await cloudinary.v2.api.delete_resources(public_ids);
    } catch (error) {
        throw new Error("Error deleting files from cloudinary", error);
    }
};

export  {connectDB, sendToken, cookieOptions, emitEvent, delteFilesFromCloudinary, uploadFilesToCloudinary};