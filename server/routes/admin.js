import express from 'express';
import { adminLogin, adminLogout, allChats, allMessages, allUsers, getAdminData, getDashboardStats } from '../controllers/admin.js';
import { adminLoginValidator, validateHandler } from '../lib/validators.js';
import { adminOnly } from '../middlewares/auth.js';

// Create a new router instance
const app = express.Router();

// Route for admin login with validation
app.post("/verify", adminLoginValidator(), validateHandler, adminLogin);

// Route for admin logout
app.get("/logout", adminLogout);

// Only admin can access the following routes
app.use(adminOnly);

// Route to get admin data
app.get("/", getAdminData);

// Route to get all users
app.get("/users", allUsers);

// Route to get all chats
app.get("/chats", allChats);

// Route to get all messages
app.get("/messages", allMessages);

// Route to get dashboard statistics
app.get("/stats", getDashboardStats);

export default app;