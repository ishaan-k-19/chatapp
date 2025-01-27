import express from 'express';
import {connectDB} from './utils/features.js';
import dotenv from 'dotenv';
import { errorMiddleware } from './middlewares/error.js';
import cookieParser from 'cookie-parser';
import { createUser } from './seeders/user.js';
import {Server} from 'socket.io';
import { createServer } from 'http'
import { CHAT_JOINED, CHAT_LEAVE, NEW_MESSAGE, NEW_MESSAGE_ALERT, ONLINE_USERS, START_TYPING, STOP_TYPING } from './constants/events.js';
import { v4 as uuid } from 'uuid';
import { getSockets } from './lib/helper.js';
import Message from './models/message.js';
import cors from 'cors';
import {v2 as cloudinary} from 'cloudinary'
import { corsOptions } from './constants/config.js';
import { socketAuthenticator } from './middlewares/auth.js';

import adminRoute from './routes/admin.js'
import userRoute from './routes/user.js';
import chatRoute from './routes/chat.js';

// Load environment variables from .env file
dotenv.config({
  path: "./.env"
});

const app = express(); // Initialize the Express app
const server = createServer(app); // Create an HTTP server

// Load MongoDB URI and other environment variables
const mongoURI = process.env.MONGO_URI;
const port = process.env.PORT || 3000;
const envMode = process.env.NODE_ENV.trim() || 'PRODUCTION';
const adminSecretKey = process.env.ADMIN_SECRET_KEY || "fdsfsdafsdafsadfsdafewf";
const userSocketIDs = new Map(); // Map to store user socket IDs
const onlineUsers = new Set(); // Set to store online users

// Initialize Socket.IO with CORS options
const io = new Server(server, {
  cors: corsOptions,
});

app.set("io", io); // Attach Socket.IO to the Express app for global access

// Connect to the MongoDB database
connectDB(mongoURI);

// Configure Cloudinary for file storage
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middleware setup
app.use(express.json()); // Parse JSON payloads
app.use(cookieParser()); // Parse cookies
app.use(cors(corsOptions)); // Enable CORS with specific options

// Root route
app.get("/", (req, res) => {
  res.send("Hello World");
});

// User-related API routes
app.use("/api/v1/user", userRoute);

// Chat-related API routes
app.use("/api/v1/chat", chatRoute);

// Admin-related API routes
app.use("/api/v1/admin", adminRoute);

// Middleware for authenticating Socket.IO connections
io.use((socket, next) => {
  cookieParser()(socket.request, socket.request.res, async (err) => { 
      await socketAuthenticator(err, socket, next); // Authenticate socket
      console.log(err); // Log any errors
  });
});

// Handle Socket.IO connections
io.on("connection", (socket) => {
  const user = socket.user; // Retrieve the authenticated user
  userSocketIDs.set(user._id.toString(), socket.id); // Map user ID to socket ID

  // Handle new message events
  socket.on(NEW_MESSAGE, async ({ chatId, members, message }) => {
      const messageForRealTime = {
          content: message,
          _id: uuid(),
          sender: {
              _id: user._id,
              name: user.name,
              username: user.username,
              avatar: user.avatar,
          },
          chat: chatId,
          createdAt: new Date().toISOString(),
      };

      const messageForDB = {
          content: message,
          sender: user._id,
          chat: chatId,
      };

      const membersSocket = getSockets(members); // Get socket IDs of chat members
      io.to(membersSocket).emit(NEW_MESSAGE, { chatId, message: messageForRealTime }); // Broadcast message to members
      io.to(membersSocket).emit(NEW_MESSAGE_ALERT, { chatId }); // Notify members of a new message

      try {
          await Message.create(messageForDB); // Save the message to the database
      } catch (error) {
          throw new Error(error); // Handle errors during database save
      }
  });

  // Handle "start typing" events
  socket.on(START_TYPING, ({ members, chatId, user }) => {
      const membersSockets = getSockets(members); // Get socket IDs of members
      socket.to(membersSockets).emit(START_TYPING, { chatId, user }); // Notify members that a user is typing
  });

  // Handle "stop typing" events
  socket.on(STOP_TYPING, ({ members, chatId }) => {
      const membersSockets = getSockets(members); // Get socket IDs of members
      socket.to(membersSockets).emit(STOP_TYPING, { chatId }); // Notify members that typing has stopped
  });

  // Handle chat joined events
  socket.on(CHAT_JOINED, ({ userId, members }) => {
      onlineUsers.add(userId?.toString()); // Add user to online users list
      const membersSocket = getSockets(members); // Get socket IDs of members
      io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers)); // Broadcast updated online users list
  });

  // Handle chat leave events
  socket.on(CHAT_LEAVE, ({ userId, members }) => {
      onlineUsers.delete(userId?.toString()); // Remove user from online users list
      const membersSocket = getSockets(members); // Get socket IDs of members
      io.to(membersSocket).emit(ONLINE_USERS, Array.from(onlineUsers)); // Broadcast updated online users list
  });

  // Handle socket disconnection
  socket.on("disconnect", () => {
      userSocketIDs.delete(user._id.toString()); // Remove user from socket ID map
      onlineUsers.delete(user._id.toString()); // Remove user from online users list
      socket.broadcast.emit(ONLINE_USERS, Array.from(onlineUsers)); // Notify others of updated online users
  });
});

// Use error handling middleware
app.use(errorMiddleware);

// Start the server
server.listen(port, () => {
  console.log(`Server is running on port ${port} in ${envMode} mode`);
});

export { envMode, adminSecretKey, userSocketIDs };
