import { TryCatch } from "../middlewares/error.js";
import User from "../models/user.js";
import { compare } from "bcrypt";
import { cookieOptions, emitEvent, sendToken, uploadFilesToCloudinary } from "../utils/features.js";
import { sendMail } from "../utils/sendMail.js";
import { ErrorHandler } from "../utils/utitlity.js";
import Request from "../models/request.js";
import { NEW_REQUEST, REFETCH_CHATS } from "../constants/events.js";
import Chat from "../models/chat.js";
import { getOtherMembers } from "../lib/helper.js";

// Create a new user account with verification
const newUser = TryCatch(async (req, res, next) => {
    // Extract user details from request
    const { name, email, username, password, bio } = req.body;
    const file = req.file;

    // Ensure profile picture is provided
    if (!file) return next(new ErrorHandler("Please upload your picture"));

    // Generate 6-digit OTP for email verification
    const otp = Math.floor(100000 + Math.random() * 900000);
    
    // Upload profile picture to Cloudinary
    const result = await uploadFilesToCloudinary([file]);
    const avatar = {
        public_id: result[0].public_id,
        url: result[0].url,
    };

    // Create new user in database
    const user = await User.create({
        name,
        email: email.toLowerCase(),
        bio,
        username: username.toLowerCase(),
        password,
        avatar,
        otp,
        otp_expiry: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes expiry
    });

    // Create HTML email template for verification
    const htmlMessage = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 10px;">
            <h2 style="color: #333;">Dear ${name},</h2>
            <p>Thank you for registering with ConvoCube! To complete your account verification, please use the following One-Time Password (OTP):</p>
            <div style="background-color: #f8f8f8; padding: 10px; border-radius: 5px; text-align: center;">
                <p style="font-size: 24px; font-weight: bold; color: #555;">Your OTP Code: <span style="color: #007bff;">${otp}</span></p>
            </div>
            <p>This code is valid for the next <strong>5 minutes</strong>. Please enter it in the app to verify your account.</p>
            <p>If you did not request this code, please ignore this email. Your account will remain secure.</p>
            <hr style="border: 1px solid #e0e0e0; margin: 20px 0;">
            <p style="font-size: 14px; color: #777;">Best regards,<br>The ConvoCube Team</p>
        </div>
    `;

    // Send verification email
    await sendMail(email, "Verify Your Account: Your OTP For Registration", htmlMessage);

    // Log user in and send response
    sendToken(res, user, 201, "User created successfully");
});


// Verify user's email using OTP
const verify = TryCatch(async (req, res, next) => {
    const otp = Number(req.body.data.otp);
    const user = await User.findById(req.user);

    // Check OTP validity
    if (user.otp !== otp || user.otp_expiry < Date.now()) {
        return next(new ErrorHandler("Invalid OTP or has been Expired", 400))
    }

    // Mark user as verified
    user.verified = true;
    user.otp = null;
    user.otp_expiry = null;
    await user.save();

    sendToken(res, user, 200, "Account Verified");
});


// User login
const login = TryCatch(async (req, res, next) => {
    let { email, password } = req.body;
    email = email.toLowerCase();

    // Find user and verify password
    const user = await User.findOne({ email }).select("+password");
    if (!user) return next(new ErrorHandler("Invalid Email or Password", 400));

    const isMatch = await compare(password, user.password);
    if (!isMatch) return next(new ErrorHandler("Invalid Email or Password", 400));

    sendToken(res, user, 200, `Welcome Back, ${user.name}`);
});

// Get user's profile
const getMyProfile = TryCatch(async (req, res, next) => {
    const user = await User.findById(req.user);
    if (!user) return next(new ErrorHandler("User not found", 404));

    res.status(200).json({
        success: true,
        user,
    });
});

// Edit user's profile
const editMyProfile = TryCatch(async (req, res, next) => {
    const user = await User.findById(req.user);
    const { name, bio, username } = req.body;
    const file = req.file;

    if (!user) return next(new ErrorHandler("User not found", 404));

    // Verify user authorization
    if (user._id.toString() !== req.user.toString()) 
        return next(new ErrorHandler("You are not authorized to edit this profile.", 403));

    // Check username availability
    const existingUser = await User.find({ username: username.toLowerCase() });
    if (existingUser.length !== 0 && existingUser[0].username !== user.username) {
        return next(new ErrorHandler('Username already taken', 400));
    }

    // Update avatar if new file provided
    if (file) {
        const result = await uploadFilesToCloudinary([file]);
        user.avatar = {
            public_id: result[0].public_id,
            url: result[0].url,
        }
    }

    // Update user details
    user.name = name;
    user.bio = bio;
    user.username = username.toLowerCase();
    await user.save();

    return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user,
    });
});



// User logout
const logout = TryCatch(async (req, res, next) => {
    res.status(200)
        .cookie("chatapp-token", "", { ...cookieOptions, maxAge: 0 })
        .json({
            success: true,
            message: "Logged out successfully",
        });
});

// Update password
const updatePassword = TryCatch(async (req, res, next) => {
    const user = await User.findById(req.user).select("+password");
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return next(new ErrorHandler("Please enter both passwords", 400));
    }

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
        return next(new ErrorHandler("Invalid Old Password", 400));
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ 
        success: true, 
        message: "Password updated successfully" 
    });
});

// Search for users
const searchUser = TryCatch(async (req, res, next) => {
    const { name } = req.query;

    // Get current user's chats
    const myChats = await Chat.find({ groupChat: false, members: req.user });
    const allUsersFromMyChats = myChats.flatMap((chat) => chat.members);

    if(myChats.length < 1) {
        allUsersFromMyChats.push(req.user);
    }

    // Find users matching search criteria who aren't already friends
    const allUsersExceptMeAndFriends = await User.find({
        _id: { $nin: allUsersFromMyChats },
        username: { $regex: name, $options: "i" },
    });

    const users = allUsersExceptMeAndFriends.map(({ _id, name, avatar, username }) => ({
        _id,
        name,
        avatar: avatar.url,
        username
    }));

    res.status(200).json({
        success: true,
        message: name,
        users,
    });
});

// Send friend request
const sendFriendRequest = TryCatch(async (req, res, next) => {
    const { userId } = req.body;

    // Check if request already exists
    const request = await Request.findOne({
        $or: [
            { sender: req.user, reciver: userId },
            { sender: userId, reciver: req.user },
        ],
    });

    if (request) return next(new ErrorHandler("Friend request already sent", 400));

    // Create new request
    await Request.create({
        sender: req.user,
        reciver: userId,
    });

    emitEvent(req, NEW_REQUEST, [userId]);

    return res.status(200).json({
        success: true,
        message: "Friend request sent successfully",
    });
});

// Accept/reject friend request
const acceptFriendRequest = TryCatch(async (req, res, next) => {
    const { requestId, accept } = req.body;

    const request = await Request.findById(requestId)
        .populate("sender", "name")
        .populate("reciver", "name");

    if (!request) return next(new ErrorHandler("Request not found", 404));

    // Verify request recipient
    if (request.reciver._id.toString() !== req.user.toString()) 
        return next(new ErrorHandler("Not authorized to accept this request", 401));

    // Handle rejection
    if (!accept) {
        await request.deleteOne();
        return res.status(200).json({
            success: true,
            message: "Friend request rejected",
        });
    }

    // Handle acceptance
    const members = [request.sender._id, request.reciver._id];
    await Promise.all([
        Chat.create({
            members,
            name: `${request.sender.name} - ${request.reciver.name}`,
            avatar: "null"
        }),
        request.deleteOne(),
    ]);

    emitEvent(req, REFETCH_CHATS, members);

    return res.status(200).json({
        success: true,
        message: "Friend request accepted",
        senderId: request.sender._id,
    });
});

// Get user's notifications
const getMyNotifications = TryCatch(async (req, res, next) => {
    const requests = await Request.find({ reciver: req.user })
        .populate("sender", "name avatar");

    const allRequests = requests.map(({ _id, sender }) => ({
        _id,
        sender: {
            _id: sender._id,
            name: sender.name,
            avatar: sender.avatar.url,
        },
    }));

    return res.status(200).json({
        success: true,
        allRequests,
    });
});

// Get user's friends list
const getMyFriends = TryCatch(async (req, res, next) => {
    const chatId = req.query.chatId;
    const chats = await Chat.find({
        members: req.user,
        groupChat: false,
    }).populate("members", "name avatar");

    const friends = chats.map(({ members }) => {
        const otherUser = getOtherMembers(members, req.user);
        return {
            _id: otherUser._id,
            name: otherUser.name,
            avatar: otherUser.avatar.url,
        };
    });

    if (chatId) {
        const chat = await Chat.findById(chatId);
        const availableFriends = friends.filter(
            (friend) => !chat.members.includes(friend._id)
        );

        return res.status(200).json({
            success: true,
            friends: availableFriends,
        });
    } 

    return res.status(200).json({
        success: true,
        friends,
    });
});

// Reset password using OTP
const resetPassword = TryCatch(async (req, res, next) => {
    const { otp, newPassword } = req.body;

    const user = await User.findOne({ 
        resetPasswordOtp: otp, 
        resetPasswordOtp_expiry: { $gt: Date.now() } 
    }).select("+password");

    if (!user) {
        return next(new ErrorHandler("OTP Invalid or expired", 404));
    }

    user.password = newPassword;
    user.resetPasswordOtp = null;
    user.resetPasswordOtp_expiry = null;
    await user.save();

    res.status(200).json({ 
        success: true, 
        message: "Password Changed Successfully" 
    });
});

// Request password reset
const forgetPassword = TryCatch(async (req, res, next) => {
    const { email } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
        return next(new ErrorHandler("Invalid Email", 404));
    }

    // Generate and save OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    user.resetPasswordOtp = otp;
    user.resetPasswordOtp_expiry = Date.now() + 10 * 60 * 1000;  // 10 minutes
    await user.save();

    // Create password reset email
    const htmlMessage = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #f0f0f0; border-radius: 10px;">
            <h2 style="color: #333;">Dear ${user.name},</h2>
            <p>We received a request to reset your password. Use this OTP to proceed:</p>
            <div style="background-color: #f8f8f8; padding: 10px; border-radius: 5px; text-align: center;">
                <p style="font-size: 24px; font-weight: bold; color: #555;">OTP: <span style="color: #007bff;">${otp}</span></p>
            </div>
            <p>Valid for 5 minutes. Ignore if you didn't request this.</p>
            <p style="font-size: 14px; color: #777;">Best regards,<br>The ConvoCube Team</p>
        </div>
    `;

    await sendMail(email, "Password Reset Request", htmlMessage);

    res.status(200).json({ 
        success: true, 
        message: `OTP sent to ${email}` 
    });
});




export { login, newUser, getMyProfile, logout, searchUser, sendFriendRequest, acceptFriendRequest, getMyNotifications, getMyFriends, editMyProfile, verify, resetPassword, updatePassword, forgetPassword };