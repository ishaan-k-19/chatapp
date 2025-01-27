import express from 'express';
import { acceptFriendRequest, editMyProfile, forgetPassword, getMyFriends, getMyNotifications, getMyProfile, login, logout, newUser, resetPassword, searchUser, sendFriendRequest, updatePassword, verify } from '../controllers/user.js';
import { multerUpload, singleAvatar } from '../middlewares/multer.js';
import { isAuthenticated } from '../middlewares/auth.js';
import { acceptRequestValidator, loginValidator, registerValidator, sendRequestValidator, updatePasswordValidator, updateProfileValidator, validateHandler } from '../lib/validators.js';


// Create a new router instance
const app = express.Router();

// Route for user registration
// Uses the `singleAvatar` middleware to handle avatar upload, followed by validation
app.post("/new", singleAvatar, registerValidator(), validateHandler, newUser);

// Route for user login
// Validates login data before proceeding
app.post("/login", loginValidator(), validateHandler, login);

// Route to initiate the forget password process
app.post("/forgetpassword", forgetPassword);

// Route to reset the password with a token
app.put("/resetpassword", resetPassword);

// Middleware to protect routes below this line - requires authentication
app.use(isAuthenticated);

// Route to verify user account (e.g., email or phone)
app.post("/verify", verify);

// Route to retrieve the logged-in user's profile
app.get("/me", getMyProfile);

// Route to update the logged-in user's profile
// Allows avatar update and profile data validation
app.put("/me/editprofile", singleAvatar, updateProfileValidator(), validateHandler, editMyProfile);

// Route to update the user's password
app.put("/me/updatepassword", updatePasswordValidator(), validateHandler, updatePassword);

// Route to log the user out
app.get("/logout", logout);

// Route to search for users
app.get("/search", searchUser);

// Route to send a friend request
// Validates request data before proceeding
app.put("/sendrequest", sendRequestValidator(), validateHandler, sendFriendRequest);

// Route to accept a friend request
// Validates acceptance data before proceeding
app.put("/acceptrequest", acceptRequestValidator(), validateHandler, acceptFriendRequest);

// Route to fetch notifications for the logged-in user
app.get("/notifications", getMyNotifications);

// Route to fetch the logged-in user's friend list
app.get("/friends", getMyFriends);

// Export the router to be used in the main application
export default app;