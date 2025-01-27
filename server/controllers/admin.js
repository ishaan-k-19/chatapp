import { TryCatch } from "../middlewares/error.js";
import User from "../models/user.js";
import Chat from "../models/chat.js";
import Message from "../models/message.js";
import { ErrorHandler } from "../utils/utitlity.js";
import jwt from "jsonwebtoken";
import { cookieOptions } from "../utils/features.js";
import { adminSecretKey } from "../app.js";

// Admin Login Handler
const adminLogin = TryCatch(async (req, res, next) => {

    // Extract the secret key from the request body
    const { secretKey } = req.body;

    // Check if the provided secret key matches the admin secret key
    const isMatched = secretKey === adminSecretKey;

    // If the keys don't match, return an error
    if (!isMatched) return next(new ErrorHandler("Invalid Secret Key", 401));

    // Generate a JWT token for the admin session
    const token = jwt.sign(secretKey, process.env.JWT_SECRET);

    // Send the JWT token as a cookie and respond with a success message
    return res.status(200).cookie("chatapp-admin-token", token, { ...cookieOptions, maxAge: 1000 * 60 * 15 }).json({
        success: true,
        message: "Admin Login Successful",
    });
});

// Fetch all users
const allUsers = TryCatch(async (req, res) => {

    // Retrieve all users from the database
    const users = await User.find({});

    // Transform the user data to include group and friend counts
    const transformedUsers = await Promise.all(users.map(async ({ name, username, avatar, _id }) => {

        // Count the number of groups and friends for each user
        const [groups, friends] = await Promise.all([
            Chat.countDocuments({ groupChat: true, members: _id }),
            Chat.countDocuments({ groupChat: false, members: _id })
        ]);

        // Return the transformed user data
        return {
            name,
            username,
            avatar: avatar.url,
            _id,
            groups,
            friends,
        }
    }));

    // Respond with the transformed user data
    return res.status(200).json({
        status: 'success',
        users: transformedUsers,
    });
});

// Fetch all chats
const allChats = TryCatch(async (req, res) => {
    // Retrieve all chats and populate relevant data for members and creators
    const chats = await Chat.find({})
      .populate("members", "name avatar")
      .populate("creator", "name avatar");
  
    // Transform the chat data, including total messages and members
    const transformedChats = await Promise.all(
      chats.map(async ({ members, _id, groupChat, avatar, name, creator }) => {
        const totalMessages = await Message.countDocuments({ chat: _id });
  
        return {
          _id,
          avatar: avatar.url,
          groupChat,
          name,
          members: members.map(({ _id, name, avatar }) => ({
            _id,
            name,
            avatar: avatar.url,
          })),
          creator: {
            name: creator?.name || "None",
            avatar: creator?.avatar.url || "",
          },
          totalMembers: members.length,
          totalMessages,
        };
      })
    );
  
    // Respond with the transformed chat data
    return res.status(200).json({
      status: "success",
      chats: transformedChats,
    });
});

// Fetch all messages
const allMessages = TryCatch(async (req, res) => {
    // Retrieve all messages, populating sender and chat data
    const messages = await Message.find({})
      .populate("sender", "name avatar")
      .populate("chat", "groupChat");

    // Transform the message data
    const transformedMessages = messages.map(
      ({ content, attachments, _id, sender, createdAt, chat }) => ({
        _id,
        attachments,
        content,
        createdAt,
        chat: chat ? chat._id : null,  
        groupChat: chat ? chat.groupChat : null, 
        sender: {
          _id: sender ? sender._id : null, 
          name: sender ? sender.name : null, 
          avatar: sender ? sender.avatar.url : null, 
        },
      })
    );

    // Respond with the transformed message data
    return res.status(200).json({
      success: true,
      messages: transformedMessages,
    });
});

// Fetch dashboard statistics
const getDashboardStats = TryCatch(async (req, res) => {
    // Fetch various counts for groups, users, messages, and total chats
    const [groupsCount, usersCount, messagesCount, totalChatsCount] =
      await Promise.all([
        Chat.countDocuments({ groupChat: true }),
        User.countDocuments(),
        Message.countDocuments(),
        Chat.countDocuments(),
      ]);
  
    const today = new Date();
  
    // Get the messages from the last 7 days
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
  
    const last7DaysMessages = await Message.find({
      createdAt: {
        $gte: last7Days,
        $lte: today,
      },
    }).select("createdAt");
  
    // Initialize an array to hold the count of messages per day for the last 7 days
    const messages = new Array(7).fill(0);
    const dayInMilliseconds = 1000 * 60 * 60 * 24;
  
    // Loop through the messages to count how many messages were sent each day
    last7DaysMessages.forEach((message) => {
      const indexApprox =
        (today.getTime() - message.createdAt.getTime()) / dayInMilliseconds;
      const index = Math.floor(indexApprox);
  
      messages[6 - index]++;
    });
  
    // Construct the stats object
    const stats = {
      groupsCount,
      usersCount,
      messagesCount,
      totalChatsCount,
      messagesChart: messages,
    };
  
    // Respond with the statistics data
    return res.status(200).json({
      success: true,
      stats,
    });
});

// Admin Logout Handler
const adminLogout = TryCatch(async (req, res, next) => {

    // Clear the admin token cookie and respond with a success message
    return res.status(200).cookie("chatapp-admin-token", "", { ...cookieOptions, maxAge: 0 }).json({
        success: true,
        message: "Logout Successful",
    });
});

// Get admin data (check if admin is logged in)
const getAdminData = TryCatch(async (req, res, next) => {
    // Respond with a simple admin status object
    return res.status(200).json({
        admin: true
    });
});

export { allUsers, allChats, allMessages, getDashboardStats, adminLogin, adminLogout, getAdminData };