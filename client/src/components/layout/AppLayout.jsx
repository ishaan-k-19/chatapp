import { NEW_MESSAGE_ALERT, NEW_REQUEST, ONLINE_USERS, REFETCH_CHATS } from "@/constants/events";
import { useErrors, useSocketEvents } from "@/hooks/hooks";
import { getOrSaveFromStorage } from "@/lib/features";
import { useChatDetailsQuery, useMyChatsQuery } from "@/redux/api/api";
import { incrementNotification, setNewMessagesAlert } from "@/redux/reducers/chat";
import { setIsDeleteMenu, setSelectedDeleteChat } from "@/redux/reducers/misc";
import { getSocket } from "@/socket";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import OtpDialog from "../dialog/OtpDialog";
import Title from "../shared/Title";
import ChatList from "../specific/ChatList";
import Profile from "../specific/Profile";
import Header from "./Header";


// High-order component to wrap another component (WrappedComponent) with additional logic
const AppLayout = () => (WrappedComponent) => {
  return (props) => {
    const params = useParams();  // Extract parameters from the URL
    const chatId = params.chatId;  // Extract chatId from URL params
    const dispatch = useDispatch();  // Redux dispatch hook
    const navigate = useNavigate();  // React Router navigate hook
    const socket = getSocket();  // Get socket instance

    const [onlineUsers, setOnlineUsers] = useState([]);  // State to store online users
    const [otherUser, setOtherUser] = useState();  // State to store the other user in the chat (for single chats)

    // Extract states from Redux store
    const { isMobile, isProfile } = useSelector((state) => state.misc);
    const { user } = useSelector((state) => state.auth);
    const { newMessagesAlert } = useSelector((state) => state.chat);
    
    // Fetch user chats using the `useMyChatsQuery` hook
    const { isLoading, data, isError, error, refetch } = useMyChatsQuery("");

    // Fetch chat details using the `useChatDetailsQuery` hook
    const chatDetails = useChatDetailsQuery(
      { chatId, populate: true },
      { skip: !chatId }
    );

    const chatInfo = chatDetails?.data?.chat;  // Extract chat info from query result

    // Custom error handling hook
    useErrors([{ isError, error }]);

    // Effect hook to store `newMessagesAlert` in localStorage
    useEffect(() => {
      getOrSaveFromStorage({ key: NEW_MESSAGE_ALERT, value: newMessagesAlert });
    }, [newMessagesAlert]);

    // Handle delete chat action
    const handleDeleteChat = (e, chatId, groupChat) => {
      dispatch(setIsDeleteMenu(true));  // Open delete menu
      dispatch(setSelectedDeleteChat({ chatId, groupChat }));  // Set chat to be deleted
    };

    // Listeners for socket events
    const newRequestListener = useCallback(() => {
      dispatch(incrementNotification());  // Increment notification count
    }, [dispatch]);

    const refetchListener = useCallback(() => {
      refetch();  // Refetch the data
      navigate("/");  // Navigate to the homepage
    }, [refetch, navigate]);

    const newMessagesAlertListener = useCallback(
      (data) => {
        if (data.chatId === chatId) return;  // Ignore alerts for current chat
        dispatch(setNewMessagesAlert(data));  // Set new message alert
      },
      [chatId]
    );

    const onlineUsersListener = useCallback((data) => {
      setOnlineUsers(data);  // Update online users state
    }, []);

    // Event handlers object mapping event names to their respective listeners
    const eventHandlers = {
      [NEW_MESSAGE_ALERT]: newMessagesAlertListener,
      [NEW_REQUEST]: newRequestListener,
      [REFETCH_CHATS]: refetchListener,
      [ONLINE_USERS]: onlineUsersListener,
    };

    // Effect hook to update `otherUser` when chat details change
    useEffect(() => {
      if (chatInfo && chatInfo.groupChat === false) {
        const result = chatInfo.members.filter(
          (member) => member._id.toString() !== user._id.toString()
        );
        setOtherUser(result[0]);  // Set other user for single chat
      } else {
        setOtherUser(chatInfo);  // Set chat info for group chat
      }
    }, [chatInfo, chatId]);

    // Use custom hook to handle socket events
    useSocketEvents(socket, eventHandlers);

    return (
      <>
      <OtpDialog verfied={user.verified}/>
        <Title />
        <div className="hidden md:block">
        <Header/>
        </div>
        <div className="grid grid-cols-12 ">
          {/* Chat List */}
          <div className={`
          ${chatId ? `col-span-12 md:col-span-3 lg:col-span-3 md:block hidden` : `col-span-12 md:col-span-6 lg:col-span-6 md:block`}
          `}>
              <ChatList
              chats={data?.chats}
              chatId={chatId}
              onlineUsers={onlineUsers}
              handleDeleteChat={handleDeleteChat}
              newMessagesAlert={newMessagesAlert}
              />
            {/* <DeleteChatMenu dispatch={dispatch} deleteMenuAnchor={deleteMenuAnchor.current}/> */}
          </div>
          {/* Main Content */}
          {
           chatId ? <div className={`
          ${isProfile ? `md:col-span-5 lg:col-span-6 md:block hidden` : `col-span-12 md:col-span-9 md:mr-3`}
            `}>
            <WrappedComponent {...props} chatId={chatId} user= {user} otherUser={otherUser} chats={data}/>
          </div> : 
          <div className="md:col-span-6 md:block hidden">
            <Profile user={user}/>
          </div>
          }
          {/* Profile */}
          <div className={`
          ${isProfile ? "col-span-12 md:col-span-4 lg:col-span-3 block" : "hidden"}
          ${chatId ? `block col-span-12` : `hidden`}
          `}>
              <Profile user={user} otherUser={otherUser} chatId={chatId}/>
          </div>
        </div>
      </>
    );
  };
};



export default AppLayout;
