import { TryCatch } from "../middlewares/error.js";
import User from "../models/user.js";
import Chat from "../models/chat.js";
import Message from "../models/message.js";
import { ErrorHandler } from "../utils/utitlity.js";
import jwt from "jsonwebtoken";
import { cookieOptions } from "../utils/features.js";
import { adminSecretKey } from "../app.js";

const adminLogin = TryCatch(async (req, res, next) => {
  // Check if the secret key matches
  if (req.body.secretKey !== adminSecretKey) {
      return next(new ErrorHandler("Invalid Secret Key", 401));
  }
  
  // Create a token and send it in a cookie
  const token = jwt.sign(secretKey, process.env.JWT_SECRET);
  return res.status(200)
      .cookie("chatapp-admin-token", token, { ...cookieOptions, maxAge: 1000 * 60 * 15 })
      .json({ success: true, message: "Admin Login Successful" });
});

// Get All Users - This gives you a nice list of all users with some extra stats
const allUsers = TryCatch(async (req, res) => {
  const users = await User.find({});
  
  // Transform each user to include their group and friend counts
  const transformedUsers = await Promise.all(users.map(async ({ name, username, avatar, _id }) => {
      const [groups, friends] = await Promise.all([
          Chat.countDocuments({ groupChat: true, members: _id }),
          Chat.countDocuments({ groupChat: false, members: _id })
      ]);
      
      return { name, username, avatar: avatar.url, _id, groups, friends };
  }));
  
  return res.status(200).json({ status: 'success', users: transformedUsers });
});

// Get All Chats - Shows all chats with member details and message counts
const allChats = TryCatch(async (req, res) => {
  const chats = await Chat.find({})
      .populate("members", "name avatar")
      .populate("creator", "name avatar");
  
  // Add extra info like total messages for each chat
  const transformedChats = await Promise.all(
      chats.map(async ({ members, _id, groupChat, avatar, name, creator }) => {
          const totalMessages = await Message.countDocuments({ chat: _id });
          
          return {
              _id, avatar: avatar.url, groupChat, name,
              members: members.map(m => ({
                  _id: m._id,
                  name: m.name,
                  avatar: m.avatar.url,
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
  
  return res.status(200).json({ status: "success", chats: transformedChats });
});

// Get All Messages - Fetches all messages with sender and chat info
const allMessages = TryCatch(async (req, res) => {
  const messages = await Message.find({})
      .populate("sender", "name avatar")
      .populate("chat", "groupChat");
  
  // Clean up the message data for sending
  const transformedMessages = messages.map(msg => ({
      _id: msg._id,
      attachments: msg.attachments,
      content: msg.content,
      createdAt: msg.createdAt,
      chat: msg.chat._id,
      groupChat: msg.chat.groupChat,
      sender: {
          _id: msg.sender._id,
          name: msg.sender.name,
          avatar: msg.sender.avatar.url,
      },
  }));
  
  return res.status(200).json({ success: true, messages: transformedMessages });
});

// Get Dashboard Stats - The fun one! Gets all the numbers for your dashboard
const getDashboardStats = TryCatch(async (req, res) => {
  // Get all the basic counts
  const [groupsCount, usersCount, messagesCount, totalChatsCount] = await Promise.all([
      Chat.countDocuments({ groupChat: true }),
      User.countDocuments(),
      Message.countDocuments(),
      Chat.countDocuments(),
  ]);
  
  // Get message counts for the last 7 days for a chart
  const today = new Date();
  const last7Days = new Date(today - 7 * 24 * 60 * 60 * 1000);
  
  const last7DaysMessages = await Message.find({
      createdAt: { $gte: last7Days, $lte: today }
  }).select("createdAt");
  
  // Create a 7-day message count array
  const messages = new Array(7).fill(0);
  const dayInMiliseconds = 1000 * 60 * 60 * 24;
  
  // Fill in the message counts for each day
  last7DaysMessages.forEach(message => {
      const dayIndex = 6 - Math.floor((today - message.createdAt) / dayInMiliseconds);
      messages[dayIndex]++;
  });
  
  return res.status(200).json({
      success: true,
      stats: {
          groupsCount,
          usersCount,
          messagesCount,
          totalChatsCount,
          messagesChart: messages,
      },
  });
});

// Admin Logout - Simply clears the admin cookie
const adminLogout = TryCatch(async (req, res, next) => {
  return res.status(200)
      .cookie("chatapp-admin-token", "", { ...cookieOptions, maxAge: 0 })
      .json({ success: true, message: "Logout Successful" });
});

// Get Admin Data - Just confirms if you're an admin
const getAdminData = TryCatch(async (req, res, next) => {
  return res.status(200).json({ admin: true });
});

export { allUsers, allChats, allMessages, getDashboardStats, adminLogin, adminLogout, getAdminData };