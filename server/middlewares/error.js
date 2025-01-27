import { response } from "express";
import { envMode } from "../app.js";

// Middleware to handle errors
const errorMiddleware = (err, req, res, next) => {
    // Set default error message and status code if not provided
    err.message ||= "Internal Server Error";
    err.statusCode ||= 500;

    // Handle duplicate key error (e.g., unique constraint violation)
    if (err.code === 11000) {
        const error = Object.keys(err.keyPattern).join(", ");
        err.message = `Duplicate field - ${error}`;
        err.statusCode = 400;
    }

    // Handle invalid format error (e.g., invalid ObjectId)
    if (err.name === "CastEror") {
        const errorPath = err.path;
        err.message = `Invalid Format of ${errorPath}`;
        err.statusCode = 400;
    }

    // Prepare the response object
    const response = {
        success: false,
        message: err.message,
        ...(envMode === "DEVELOPMENT" && { error: err }), // Include error details in development mode
    };

    // Send the error response
    return res.status(err.statusCode).json(response);
};

// Wrapper function to handle async errors
const TryCatch = (passedFunc) => async (req, res, next) => {
    try {
        await passedFunc(req, res, next);
    } catch (err) {
        next(err); // Pass the error to the error middleware
    }
};

export { errorMiddleware, TryCatch };