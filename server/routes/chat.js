import express from 'express';
import { isAuthenticated } from '../middlewares/auth.js';
import { newGroupChat, getMyChats, getMyGroups, addMembers, removeMembers, leaveGroup, sendAttachments, getChatDetails, renameGroup, deleteChat, getMessages, getGroupDetails } from '../controllers/chat.js';
import { addMembersValidator, chtIdValidator, leaveGroupValidator, newGroupValidator, removeMemberValidator, renameGroupValidator, sendAttachmentsValidator, validateHandler } from '../lib/validators.js';
import { attachmentMulter, singleAvatar } from '../middlewares/multer.js';

const app = express.Router();

// Authentication middleware
app.use(isAuthenticated)

// Create a new group chat
app.post("/new", singleAvatar, validateHandler, newGroupChat);

// Get all chats for the authenticated user
app.get("/my", getMyChats);

// Get all groups for the authenticated user
app.get("/my/groups", getMyGroups);

// Add members to a group chat
app.put("/addmembers", addMembersValidator(), validateHandler, addMembers);

// Remove a member from a group chat
app.put("/removemember", removeMemberValidator(), validateHandler, removeMembers);

// Leave a group chat
app.delete("/leave/:id", leaveGroupValidator(), validateHandler, leaveGroup)

// Send a message with attachments
app.post("/message", attachmentMulter, sendAttachmentsValidator(), validateHandler, sendAttachments);

// Get messages for a specific chat
app.get("/message/:id", chtIdValidator(), validateHandler, getMessages);

// Chat operations: get details, rename, and delete
app.route("/:id")
  .get(chtIdValidator(), validateHandler, getChatDetails)
  .put(singleAvatar, renameGroupValidator(), validateHandler, renameGroup)
  .delete(chtIdValidator(), validateHandler, deleteChat);

// Get group details
app.route("/group/:id").get(chtIdValidator(), validateHandler, getGroupDetails)


export default app;