import { useInfiniteScrollTop } from "6pp";
import DeleteChatMenu from "@/components/dialog/DeleteChatMenu";
import FileMenu from "@/components/dialog/FileMenu";
import ProfileDropMenu from "@/components/dialog/ProfileDropMenu";
import AppLayout from "@/components/layout/AppLayout";
import { TypingLoader } from "@/components/layout/Loaders";
import MessageComponent from "@/components/shared/MessageComponent";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import TypingBubble from "@/components/ui/typingBubble";
import {
  ALERT,
  CHAT_JOINED,
  CHAT_LEAVE,
  NEW_MESSAGE,
  START_TYPING,
  STOP_TYPING,
} from "@/constants/events";
import { useErrors, useSocketEvents } from "@/hooks/hooks";
import { transformImage } from "@/lib/features";
import {
  useChatDetailsQuery,
  useGetMessagesQuery,
  useMyChatsQuery,
} from "@/redux/api/api";
import { removeNewMessagesAlert } from "@/redux/reducers/chat";
import { setIsFileMenu } from "@/redux/reducers/misc";
import { getSocket } from "@/socket";
import {
  ArrowLeft,
  AtSignIcon,
  EllipsisVertical,
  SendIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

const Chat = ({ chatId, user, otherUser }) => {
  const containerRef = useRef(null);  // Ref for the messages container
  const inputRef = useRef(null);  // Ref for the message input field
  const bottomRef = useRef(null);  // Ref for the bottom of the chat for scrolling

  const socket = getSocket();  // Retrieve the socket connection
  const navigate = useNavigate();  // React Router's hook for navigation

  const [IamTyping, setIamTyping] = useState(false);  // Track if the current user is typing
  const [userTyping, setUserTyping] = useState(false);  // Track if the other user is typing
  const [senderTyping, setSenderTyping] = useState("");  // Store who is typing

  const typingTimeout = useRef(null);  // To store the typing timeout reference

  const [message, setMessage] = useState("");  // Store the current message input
  const [page, setPage] = useState(1);  // Current page of messages
  const [messages, setMessages] = useState([]);  // Store the chat messages
  const dispatch = useDispatch();  // Redux dispatch to trigger actions

  const chatDetails = useChatDetailsQuery({
    chatId,  // Fetch chat details based on chatId
    skip: !chatId,  // Skip if there's no chatId
  });

  const { refetch } = useMyChatsQuery("");  // Refetch to update chat list if needed

  const isGroup = chatDetails?.data?.chat?.groupChat;  // Check if the chat is a group

  const oldMessagesChunk = useGetMessagesQuery({ chatId, page });  // Fetch old messages for pagination

  const { data: oldMessages, setData: setOldMessages } = useInfiniteScrollTop(
    containerRef,  // Infinite scroll hook for messages
    oldMessagesChunk.data?.totalPages,  // Total pages for pagination
    page,  // Current page
    setPage,  // Function to update the page
    oldMessagesChunk.data?.messages  // Old messages to load initially
  );

  const errors = [
    { isError: chatDetails.isError, error: chatDetails.error },
    { isError: oldMessagesChunk.isError, error: oldMessagesChunk.error },
  ];

  const members = chatDetails?.data?.chat?.members;  // List of chat members

  // Handle message input changes
  const messageOnChange = (e) => {
    setMessage(e.target.value);

    if (!IamTyping) {
      socket.emit(START_TYPING, { members, chatId, user });  // Emit typing start event
      setIamTyping(true);
    }

    if (typingTimeout.current) clearTimeout(typingTimeout.current);  // Clear existing typing timeout

    typingTimeout.current = setTimeout(() => {
      socket.emit(STOP_TYPING, { members, chatId });  // Emit typing stop event after delay
      setIamTyping(false);
    }, [3000]);  // Delay typing stop after 3 seconds
  };

  // Handle message submission
  const submitHandler = (e) => {
    e.preventDefault();

    if (!message.trim()) return;  // Avoid sending empty messages

    // Emit new message event to the server
    socket.emit(NEW_MESSAGE, { chatId, members, message });
    setMessage("");  // Clear message input
    typingTimeout.current = setTimeout(() => {
      socket.emit(STOP_TYPING, { members, chatId });
      setIamTyping(false);
    }, [0]);  // Immediately stop typing after sending a message
  };

  // Navigate back to previous page
  const navigateBack = () => {
    navigate("/");
  };

  useEffect(() => {
    socket.emit(CHAT_JOINED, { userId: user._id, members });  // Emit event when the user joins the chat
    dispatch(removeNewMessagesAlert(chatId));  // Remove new message alert from the chat

    return () => {
      setMessages([]);  // Reset messages on component unmount
      setMessage("");  // Clear message input
      setOldMessages([]);  // Clear old messages
      setPage(1);  // Reset page to 1
      socket.emit(CHAT_LEAVE, { userId: user._id, members });  // Emit event when the user leaves the chat
    };
  }, [chatId]);

  // Scroll to the bottom of the chat when new messages are added
  useEffect(() => {
    requestAnimationFrame(() => {
      if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: "smooth" });
      }
    });
  }, [messages]);

  // Handle chat errors and navigate back if error occurs
  useEffect(() => {
    if (chatDetails.isError) return navigate("/");
  }, [chatDetails.isError]);

  // Handle file menu opening on button click or "Enter" key
  const handleFileOpen = (e) => {
    if (e.type === "click" || (e.type === "keydown" && e.key !== "Enter")) {
      dispatch(setIsFileMenu(true));
    }
  };

  // Listener for new messages
  const newMessagesListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;
      setMessages((prev) => [...prev, data.message]);  // Add new message to the chat
      refetch();  // Refetch chat data if needed
    },
    [chatId]
  );

  // Listener for the start of typing
  const startTypingListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;
      setUserTyping(true);
      setSenderTyping(data?.user);
    },
    [chatId]
  );

  // Listener for the stop of typing
  const stopTypingListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;
      setUserTyping(false);
      setSenderTyping("");
    },
    [chatId]
  );

  // Listener for alerts
  const alertListener = useCallback(
    (data) => {
      if (data.chatId !== chatId) return;
      const messageForAlert = {
        content: data.message,
        sender: {
          _id: "dsadasdasdasdasdas",  // Placeholder for sender ID
          name: "Admin",  // Placeholder for sender name
          avatar: "https://example.com/admin-avatar.jpg",  // Placeholder for sender avatar
        },
        chat: chatId,
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, messageForAlert]);  // Add alert message to the chat
    },
    [chatId]
  );

  const eventHandler = {
    [ALERT]: alertListener,
    [NEW_MESSAGE]: newMessagesListener,
    [START_TYPING]: startTypingListener,
    [STOP_TYPING]: stopTypingListener,
  };

  // Set up socket event listeners
  useSocketEvents(socket, eventHandler);
  useErrors(errors);  // Handle errors using the custom hook

  const allMessages = [...oldMessages, ...messages];  // Combine old and new messages for display

  // Handle "Enter" key event to submit the message
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        submitHandler(e);
      }
    };

    const inputElement = inputRef.current;
    if (inputElement) {
      inputElement.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      if (inputElement) {
        inputElement.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [submitHandler]);

  // Render loading state while chat details are loading
  return chatDetails.isLoading ? (
    <Skeleton />
  ) : (
    <>
      <Card className="h-[100svh] md:h-[calc(100vh-8rem)] md:my-3 py-2 md:ml-0 overflow-hidden">
        <CardHeader className="shadow-md pb-2 pt-0">
          <CardTitle className=" flex items-center justify-between pt-2 md:pt-0">
            <div className="flex items-center gap-3 text-base">
              <ArrowLeft onClick={navigateBack} />
              <Avatar className="object-cover shadow-lg border">
                <AvatarImage
                  className="object-cover"
                  src={transformImage(otherUser?.avatar?.url)}  // Display avatar image of the other user
                />
              </Avatar>
              <div>
                {otherUser?.name}
                {!isGroup && (
                  <div className="flex text-[12px] items-center gap-[2px] -mt-1 text-neutral-400">
                    <AtSignIcon size={12} />
                    {otherUser?.username}
                  </div>
                )}
              </div>
            </div>
            <ProfileDropMenu
              toggle={<EllipsisVertical size={21} />}
              isGroup={isGroup}
              chatId={chatId}
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="px-1 md:px-2">
          <div
            ref={containerRef}
            className="flex flex-col overflow-y-scroll overscroll-y-auto overflow-x-hidden h-[calc(100svh-8.5rem)] md:h-[calc(100vh-15.5rem)] md:px-3 py-1 pb-5"
          >
            {allMessages.map((message, index) => {
              const previousMessage = index > 0 ? allMessages[index - 1] : null;
              return (
                <MessageComponent
                  key={message._id}
                  message={message}
                  user={user}
                  group={isGroup}
                  previousMessage={previousMessage}
                />
              );
            })}
            <div ref={bottomRef} />
          </div>
          {userTyping && <TypingBubble user={senderTyping} group={isGroup} />}
        </CardContent>

        <CardFooter className="px-4">
          <form
            className="flex items-center gap-6 relative w-full pt-1"
            onSubmit={submitHandler}
          >
            <Button
              className="absolute left-2"
              variant="icon"
              onClick={handleFileOpen}
            >
              <FileMenu chatId={chatId} />
            </Button>
            <input
              className="w-[100%] rounded-full py-3 px-14 dark:bg-neutral-700 dark:text-white bg-neutral-100 text-black"
              placeholder="Type Message here..."
              value={message}
              onChange={messageOnChange}
              ref={inputRef}
            />
            <Button className="px-2 rounded-full mr-2" type="submit">
              <SendIcon />
            </Button>
          </form>
        </CardFooter>
      </Card>
      <DeleteChatMenu chatId={chatId} isGroup={isGroup} />
    </>
  );
};

export default AppLayout()(Chat);
