import { TryCatch } from "../middlewares/error.js";
import { ErrorHandler } from "../utils/utitlity.js";
import Chat from "../models/chat.js";
import User from "../models/user.js";
import Message from "../models/message.js";
import { emitEvent, uploadFilesToCloudinary } from "../utils/features.js";
import { ALERT, NEW_MESSAGE, NEW_MESSAGE_ALERT, REFETCH_CHATS } from "../constants/events.js";
import { getOtherMembers } from "../lib/helper.js";
import { delteFilesFromCloudinary } from "../utils/features.js";


const newGroupChat = TryCatch(async (req, res, next) => {

    let { name, members } = req.body;
    const file = req.file;

    if (typeof members === 'string') {
        members = JSON.parse(members);
      }


    if(!file) return next(new ErrorHandler("Please upload your picture"))

    const result = await uploadFilesToCloudinary([file]);

    const avatar = {
        public_id: result[0].public_id,
        url: result[0].url,
    }

    if (members.length < 2){
        return next(
            new ErrorHandler("Group chat must have atleast 3 members", 400
        ));
    }
    const allMembers = [...members, req.user];

    await Chat.create({
        name,
        groupChat: true,
        creator: req.user,
        members: allMembers,
        avatar,
    })

    emitEvent(req, ALERT, allMembers, `Welcome to ${name} group`);
    emitEvent(req, REFETCH_CHATS, members);

    return res.status(201).json({
        success: true,
        message: "Group chat created successfully",
    })
});
const getMyChats = TryCatch(async (req, res, next) => {
    const chats = await Chat.find({ members: req.user }).populate(
        "members",
        "name avatar"
    );

    const chatMessages = await Promise.all(
        chats.map(async (chat) => {
            const latestMessage = await Message.findOne({ chat: chat._id })
                .sort({ createdAt: -1 })
                .select("createdAt");
            return {
                chat,
                latestMessage: latestMessage ? latestMessage.createdAt : new Date(0), // Use a very old date if no messages
            };
        })
    );

    // Sort chats based on the latest message timestamp
    chatMessages.sort((a, b) => b.latestMessage - a.latestMessage);

    // Transform sorted chats
    const transformedChats = chatMessages.map(({ chat }) => {
        const { _id, name, members, groupChat, avatar } = chat;
        const otherMember = getOtherMembers(members, req.user);

        return {
            _id,
            groupChat,
            avatar: groupChat ? [avatar.url] : [otherMember.avatar.url],
            name: groupChat ? name : otherMember.name,
            members: members.reduce((prev, curr) => {
                if (curr._id.toString() !== req.user.toString()) {
                    prev.push(curr._id);
                }
                return prev;
            }, []),
        };
    });

    return res.status(200).json({
        success: true,
        chats: transformedChats,
    });
});


const getMyGroups = TryCatch(async (req, res, next) => {
  const chats = await Chat.find({
    members: req.user,
    groupChat: true,
    creator: req.user,
  }).populate("members", "name avatar");

  const groups = chats.map(({members, _id, groupChat, name, avatar }) => ({
    _id,
    groupChat,
    name,
    avatar: avatar.url,
  }));
  return res.status(200).json({
    success: true,
    groups,
  });
});

const getGroupDetails = TryCatch(async (req, res, next) => {

    const chat = await Chat.findById(req.params.id)
    .where({ groupChat: true })
    .populate("members", "name avatar")
    .lean();

        if(!chat) return next(new ErrorHandler("Group not found", 404));

        const group = {
            _id: chat._id,
            name: chat.name,
            groupChat: chat.groupChat,
            avatar :  chat.avatar?.url,
            
        }
         
        res.status(200).json({
            success: true,
            group,
        });



});
const addMembers = TryCatch(async (req, res, next) => {
    const {chatId, members} = req.body;

    if(!members || members.length < 1) return next(new ErrorHandler("Please provide members", 400));

    const chat = await Chat.findById(chatId);

    if(!chat) return next(new ErrorHandler("Chat not found", 404));
    if(!chat.groupChat) return next(new ErrorHandler("This is not a group Chat", 404));

    if(chat.creator.toString()!== req.user.toString()) return next(new ErrorHandler("You are not allowed to add members", 403));

    const allNewMembersPromise = members.map((i) => User.findById(i, "name"));

    const allNewMembers = await Promise.all(allNewMembersPromise);

    const uniqueMembers = allNewMembers.filter((i) =>!chat.members.includes(i._id.toString())).map((i) => i._id);

    chat.members.push(...uniqueMembers);

    if(chat.members.length > 100) return next(new ErrorHandler("Group members limit exceeded", 400));

    await chat.save();

    const allUsersName = allNewMembers.map((i) => i.name).join(", ");

    emitEvent(req, ALERT, chat.members, `${allUsersName} has been added to the group`);

    emitEvent(req, REFETCH_CHATS, chat.members);

  return res.status(200).json({
    success: true,
    message: "Members added successfully",
  });
});
const leaveGroup = TryCatch(async (req, res, next) => {
   const  chatId  = req.params.id;

    const chat = await Chat.findById(chatId);

   if(!chat) return next(new ErrorHandler("Chat not found", 404));

    if(!chat.groupChat) return next(new ErrorHandler("This is not a group Chat", 400));

    const remainingMembers = chat.members.filter(
        (member) => member.toString()!== req.user.toString()
    );

    if(remainingMembers.length < 3) return next(new ErrorHandler("Group chat must have atleast 3 members", 400));

    if(chat.creator.toString() === req.user.toString()){
        const newCreator = remainingMembers[0];
        chat.creator = newCreator;
    }

    chat.members = remainingMembers

    const [user] = await Promise.all([
        User.findById(req.user, "name"),
        chat.save()
    ]);

   await chat.save();

    emitEvent(req, ALERT, chat.members, {
        chatId,
        message: `${user.name} has left the group`,
    });

   return res.status(200).json({
    success: true,
    message: "Leave Group successfully",
   });
});


const removeMembers = TryCatch(async (req, res, next) => {
   const { userId, chatId } = req.body;

   const [chat, userThatWillBeRemoved] = await Promise.all([
    Chat.findById(chatId),
    User.findById(userId),
   ])

   if(!chat) return next(new ErrorHandler("Chat not found", 404));
   if(!chat.groupChat) return next(new ErrorHandler("This is not a group Chat", 404));

   if(chat.creator.toString()!== req.user.toString()) return next(new ErrorHandler("You are not allowed to add members", 403));

   if(chat.members.length <= 3) return next(new ErrorHandler("Group chat must have atleast 3 members", 400));

   const allChatMembers = chat.members.map((i) => i.toString());

   chat.members = chat.members.filter(
    (member) => member.toString()!== userId.toString()
   );

   await chat.save();

   emitEvent(req, ALERT, chat.members, {
    message: `${userThatWillBeRemoved.name} has been removed from the group`,
    chatId,
   });

   emitEvent(req, REFETCH_CHATS, allChatMembers);

   return res.status(200).json({
    success: true,
    message: "Members removed successfully",
   });
});

const sendAttachments = TryCatch(async (req, res, next) => {

    const { chatId } = req.body;

    const files = req.files || [];

    console.log(files)

    if(files.length < 1 ) return next(new ErrorHandler("Please upload Attachments", 400));

    if(files.length > 5) return next(new ErrorHandler("Files can't be more than 5", 400));


    const [chat, me] = await Promise.all([
        Chat.findById(chatId),
        User.findById(req.user, "username")]);

        
    if(!chat) return next(new ErrorHandler("Chat not found", 404));
        
 
    if(files.length<1) return next(new ErrorHandler("No attachments found", 400));

    // Upload files here
    
    const attachments = await uploadFilesToCloudinary(files);

    
    const messageForDB = {
        content: "",
        attachments,
        sender: {
            _id: me._id,
            name: me.name,
            username: me.username,
            avatar: me.avatar,
        },
        chat: chatId,
    };



    const messageForRealTime = {
        ...messageForDB
    };

    
    const message = await Message.create(messageForDB);

    emitEvent(req, NEW_MESSAGE, chat.members, {
        message: messageForRealTime,
        chatId,
    });

    emitEvent(req, NEW_MESSAGE_ALERT, chat.members, { chatId });

    return res.status(200).json({
        success: true,
        message: message,
    })
})

const getChatDetails = TryCatch(async (req, res, next) => {

    if(req.query.populate === "true"){
        const chat = await Chat.findById(req.params.id)
        .populate("members creator")
        .lean();

        if(!chat) return next(new ErrorHandler("Chat not found", 404));

        chat.members = chat.members.map(({_id, name, avatar, bio, username, createdAt}) =>
         ({
            _id, 
            name, 
            avatar,
            bio,
            username,
            createdAt,
        }));
        if(chat.avatar !== null){
            chat.avatar = chat.avatar;
        }
        return res.status(200).json({
            success: true,
            chat
        });


    }else{
        const chat = await Chat.findById(req.params.id);
        if(!chat) return next(new ErrorHandler("Chat not found", 404));
        return res.status(200).json({
            success: true,
            chat
        });
    }



});

const renameGroup = TryCatch(async (req, res, next) => {

    const chatId = req.params.id;
    const {name} = req.body;
    const file = req.file;

    const chat = await Chat.findById(chatId);

    if(!chat) return next(new ErrorHandler("Chat not found", 404));

    if(!chat.groupChat) return next(new ErrorHandler("This is not a group Chat", 404));

    if(chat.creator.toString()!== req.user.toString()) return next(new ErrorHandler("You are not allowed to rename this group", 403));

    if(file){
        const result = await uploadFilesToCloudinary([file]);

    const updatedAvatar = {
        public_id: result[0].public_id,
        url: result[0].url,
    }


    chat.avatar = updatedAvatar;

    }

    chat.name = name;


    await chat.save();

    emitEvent(req, REFETCH_CHATS, chat.members);

    return res.status(200).json({
        success: true,
        message: "Group renamed successfully",
    });

});

const deleteChat = TryCatch(async (req, res, next) => {
    const chatId = req.params.id;

    const chat = await Chat.findById(chatId);

    if(!chat) return next(new ErrorHandler("Chat not found", 404));

    const members = chat.members;


    if(chat.groupChat && chat.creator.toString() !== req.user.toString()) return next(new ErrorHandler ("You are not allowed to delete this group", 403));

    if(chat.groupChat && !chat.members.includes(req.user.toString())) {return next(new ErrorHandler("You are not allowed to delete the chat", 403))};

    // Here we have to delete all messages as well as attachments or files from cloudinary.

    const messagesWithAttachments = await Message.find({ 
        chat: chatId,
        attachments: { $exists: true, $ne: [] }
     });

     const public_ids = []
     messagesWithAttachments.forEach(({attachments}) => 
        attachments.forEach(({ public_id }) => 
            public_ids.push(public_id))
        );

        Promise.all([
            delteFilesFromCloudinary(public_ids),
            chat.deleteOne(),
            Message.deleteMany({ chat: chatId }),
        ]);

        emitEvent(req, REFETCH_CHATS, members);

        return res.status(200).json({
            success: true,
            message: "Chat deleted successfully",
        });
    
});

const getMessages = TryCatch(async (req, res, next) => {

    const chatId = req.params.id;
    const { page = 1 } = req.query;
    const resultPerPage = 20;
    const skip = (page - 1) * resultPerPage;

    const chat = await Chat.findById(chatId);

    if(!chat.members.includes(req.user.toString()))
        return next(
            new ErrorHandler("You are not allowed to access this chat", 403)
        );

    const [messages, totalMessagesCount] = await Promise.all([
        Message
        .find({ chat: chatId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(resultPerPage)
        .populate("sender", "name username avatar.url")
        .lean(),
        Message.countDocuments({ chat: chatId }),
    ]);

    const totalPages = Math.ceil(totalMessagesCount / resultPerPage) || 0;

    return res.status(200).json({
        success: true,
        messages: messages.reverse(), 
        totalPages,
        totalMessages: totalMessagesCount, 
    });

});


export { newGroupChat, getMyChats, getMyGroups, addMembers, removeMembers, leaveGroup, sendAttachments, getChatDetails, renameGroup, deleteChat, getMessages, getGroupDetails };