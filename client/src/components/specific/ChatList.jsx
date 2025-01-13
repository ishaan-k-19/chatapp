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



const ChatList = ({
  w = "100%",
  chats = [],
  chatId,
  onlineUsers = [],
  newMessagesAlert = [
    {
      chatId: "",
      count: 0,
    },
  ],
  handleDeleteChat,
}) => {

  const dispatch= useDispatch()

  return (
    <Card className="h-[100svh] md:h-[calc(100vh-8rem)] md:m-3">
      <CardHeader>
        <CardTitle className="md:block flex justify-between">
          <div className="md:hidden flex  items-center">
            <Logo/>
            <p className=" dark:text-white text-[#6d28d9] font-bold text-3xl bg-slate-50">ConvoCube</p>
          </div>
          <p className="hidden md:block">Chats</p>
          <MenuItems/>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col" style={{ width: { w } }}>
          <ScrollArea className="h-[78svh] md:h-[calc(100vh-12.5rem)] md:mx-3 rounded-md mt-5">
            {chats?.length === 0 && (
              <div className="text-center text-lg text-gray-500 mt-4 flex flex-col items-center gap-6">
                No chats found
                <Button className="w-2/5 dark:bg-neutral-900 text-neutral-500 bg-neutral-700" onClick={()=>dispatch(setIsSearch(true))}>
                  Add Friends
                </Button>
              </div>
            )}
            {chats?.map((data, index) => {
              const { avatar, _id, name, groupChat, members } = data;

              const newMessageAlert = newMessagesAlert.find(
                ({ chatId }) => chatId === _id
              );

              const isOnline = members?.some((member) =>
                onlineUsers.includes(member)
              );

              return (
                <div className="flex flex-col">
                
                <ChatItem
                  key={_id}
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
                <Separator className="my-2 dark:bg-neutral-800 self-center w-[95%] md:hidden"/>
                </div>
              );
            })}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};


const MenuItems = () => {

  return(
  <Sheet >
    <SheetTrigger  className="md:hidden block">
      <Button className="rounded-full px-2" variant="icon">
        <MenuIcon/>
      </Button>
    </SheetTrigger>
    <SheetContent className="dark:bg-neutral-900">
      <SheetHeader>
        <SheetTitle className="text-3xl mt-14">Menu</SheetTitle>
        <SheetDescription>
          <Header/>
        </SheetDescription>
      </SheetHeader>
    </SheetContent>
  </Sheet>
  )
};

export default ChatList;
