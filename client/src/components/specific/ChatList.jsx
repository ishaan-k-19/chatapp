import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import Header from "../layout/Header";
import ChatItem from "../shared/ChatItem";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import Logo from "@/assets/logo";
import { useDispatch } from "react-redux";
import { setIsSearch } from "@/redux/reducers/misc";
import { Separator } from "../ui/separator";



// Main ChatList component
const ChatList = ({
  w = "100%",  // Default width for the chat list
  chats = [],  // List of chats to display
  chatId,  // Current selected chat ID
  onlineUsers = [],  // List of online users to show chat activity
  newMessagesAlert = [  // New message alert data
    {
      chatId: "",
      count: 0,
    },
  ],
  handleDeleteChat,  // Function to handle deleting a chat
}) => {
  const dispatch = useDispatch();  // Initialize Redux dispatch

  return (
    <Card className="h-[100svh] md:h-[calc(100vh-8rem)] md:m-3">
      <CardHeader>
        <CardTitle className="md:block flex justify-between">
          {/* Logo and title for mobile view */}
          <div className="md:hidden flex items-center">
            <Logo />
            <p className="dark:text-white text-[#6d28d9] font-bold text-3xl bg-slate-50">ConvoCube</p>
          </div>
          {/* Title for desktop view */}
          <p className="hidden md:block">Chats</p>
          {/* Menu items trigger for mobile */}
          <MenuItems />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col" style={{ width: { w } }}>
          <ScrollArea className="h-[78svh] md:h-[calc(100vh-12.5rem)] md:mx-3 rounded-md mt-5">
            {/* No chats available message */}
            {chats?.length === 0 && (
              <div className="text-center text-lg text-gray-500 mt-4 flex flex-col items-center gap-6">
                No chats found
                <Button
                  className="w-2/5 dark:bg-neutral-900 text-neutral-500 bg-neutral-700"
                  onClick={() => dispatch(setIsSearch(true))}
                >
                  Add Friends
                </Button>
              </div>
            )}
            {/* Map through the chats to display them */}
            {chats?.map((data, index) => {
              const { avatar, _id, name, groupChat, members } = data;

              // Find the new message alert for the current chat
              const newMessageAlert = newMessagesAlert.find(
                ({ chatId }) => chatId === _id
              );

              // Check if the current chat has any online members
              const isOnline = members?.some((member) => onlineUsers.includes(member));

              return (
                <div className="flex flex-col" key={_id}>
                  {/* Render each individual chat item */}
                  <ChatItem
                    index={index}
                    newMessageAlert={newMessageAlert}
                    isOnline={isOnline}
                    avatar={avatar}
                    name={name}
                    _id={_id}
                    groupChat={groupChat}
                    sameSender={chatId === _id}
                    handleDeleteChat={handleDeleteChat}
                  />
                  {/* Separator between chat items for mobile */}
                  <Separator className="my-2 dark:bg-neutral-800 self-center w-[95%] md:hidden" />
                </div>
              );
            })}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

// Menu component for the mobile side menu
const MenuItems = () => {
  return (
    <Sheet>
      {/* Trigger the menu on mobile view */}
      <SheetTrigger className="md:hidden block">
        <Button className="rounded-full px-2" variant="icon">
          <MenuIcon />
        </Button>
      </SheetTrigger>
      {/* Sheet content with header and description */}
      <SheetContent className="dark:bg-neutral-900">
        <SheetHeader>
          <SheetTitle className="text-3xl mt-14">Menu</SheetTitle>
          <SheetDescription>
            <Header />
          </SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
};

export default ChatList;
