
import { ErrorHandler } from "../utils/utitlity.js";
import { TryCatch } from "./error.js";
import jwt from "jsonwebtoken";
import { adminSecretKey } from "../app.js";
import { CHATAPP_TOKEN } from "../constants/config.js";
import User from "../models/user.js";

// Middleware to check if the user is an admin
const adminOnly = (req, res, next) => {
    // Get the admin token from cookies
    const token = req.cookies["chatapp-admin-token"];
    
    // No token? No access!
    if(!token) return next(new ErrorHandler("Invalid Token", 401));

    // Verify the token is valid
    const secretKey = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if the secret key matches our admin key
    const isMatched = secretKey === adminSecretKey;
    
    // If keys don't match, Don't authenticate
    if(!isMatched) return next(new ErrorHandler("Only Admin can access this route", 401));
    next();
};

// Middleware to check if a user is logged in
const isAuthenticated = TryCatch((req, res, next) => {
    // Get the user token from cookies
    const token = req.cookies["chatapp-token"];
    
    // No token means they're not logged in
    if(!token) return next(new ErrorHandler("Please login to continue", 401));

    // Verify and decode their token
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add their user ID to the request for later use
    req.user = decodedData._id;
    next();
});

// Special authenticator for WebSocket connections
const socketAuthenticator = async (err, socket, next) => {
    try {
        // If there's already an error, pass it along
        if(err) {
            return next(err);
        }

        // Get their auth token from cookies
        const authToken = socket.request.cookies[CHATAPP_TOKEN];
        
        // No token? Can't connect!
        if(!authToken) return next(new ErrorHandler("Please login to continue", 401));
        
        // Verify their token
        const decodedData = jwt.verify(authToken, process.env.JWT_SECRET);

        // Find the user in our database
        const user = await User.findById(decodedData._id);
        
        // If we can't find them, they need to login again
        if(!user) return next(new ErrorHandler("Please login to continue", 401));

        // Add their user info to the socket for later use
        socket.user = user;
        return next();

    } catch (error) {
        // If anything goes wrong, log it and ask them to login again
        console.log(error)
        return next(new ErrorHandler("Please login to continue", 401))
    }
};

export { isAuthenticated, adminOnly, socketAuthenticator };