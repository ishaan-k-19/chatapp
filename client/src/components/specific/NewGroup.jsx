import { useFileHandler, useInputValidation } from "6pp";
import { server } from "@/constants/config";
import { useErrors } from "@/hooks/hooks";
import { setIsNewGroup } from "@/redux/reducers/misc";
import axios from "axios";
import { CameraIcon, CircleIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  useAvailableFriendsQuery,
} from "../../redux/api/api";
import UserItem from "../shared/UserItem";
import { Button } from "../ui/button";
import { ChatListSkeleton } from "../ui/chatListSkeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";

const NewGroup = () => {
  const { isNewGroup } = useSelector((state) => state.misc);  // Redux state to determine if the "New Group" dialog is open
  const dispatch = useDispatch();  // Redux dispatch for actions
  const avatar = useFileHandler("single");  // Custom hook for handling file uploads (group avatar)

  // Query to fetch available friends for the group
  const { isError, isLoading, error, data } = useAvailableFriendsQuery();

  const [isLoadingNewGroup, setIsLoadingNewGroup] = useState(false);  // State to track the loading status of the group creation process

  // Input validation hook for the group name
  const groupName = useInputValidation("");
  const [selectedMembers, setSelectedMembers] = useState([]);  // State to store the selected members for the group

  const errors = [
    {
      isError,
      error,
    },
  ];

  // Custom hook to handle errors
  useErrors(errors);

  // Handler for selecting/deselecting members
  const selectMemberHandler = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id)
        ? prev.filter((currentElement) => currentElement !== id)
        : [...prev, id]
    );
  };

  // Submit handler for creating the group
  const submitHandler = async () => {
    // Validate the inputs before submitting
    if (!avatar.file) return toast.error("Avatar is required");

    if (!groupName.value) return toast.error("Group name is required");

    if (selectedMembers.length < 2) {
      return toast.error("Group must have at least 3 members");
    }

    const toastId = toast.loading("Creating Group...");  // Show loading toast
    setIsLoadingNewGroup(true);
    const formData = new FormData();  // Prepare form data for the POST request
    formData.append("name", groupName.value);  // Add group name
    formData.append("members", JSON.stringify(selectedMembers));  // Add selected members
    formData.append("avatar", avatar.file);  // Add avatar image

    const config = {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    try {
      // Send POST request to create the group
      const response = await axios.post(`${server}/api/v1/chat/new`, formData, config);
      toast.success(response.data.message, { id: toastId });  // Show success toast
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong", { id: toastId });  // Show error toast
    } finally {
      setIsLoadingNewGroup(false);
    }
    closeHandler();  // Close the dialog after submission
  };

  // Close handler for closing the "New Group" dialog
  const closeHandler = () => {
    dispatch(setIsNewGroup(false));  // Set the dialog state to false in Redux
  };

  return (
    <Dialog open={isNewGroup} onOpenChange={closeHandler}>
      <DialogContent className="flex items-center flex-col">
        <DialogHeader className={"w-full"}>
          {/* Dialog header with title and avatar upload button */}
          <DialogTitle className="text-center md:py-5 py-1 flex flex-col">
            <h1 className="text-3xl mb-5">New Group</h1>
            <div className="flex justify-center items-center">
              <Button
                className=" relative rounded-full bg-opacity-80 cursor-pointer px-0"
                variant="icon"
              >
                {/* Avatar upload preview */}
                <div className="flex flex-col items-center justify-center relative">
                  {avatar.preview ? (
                    <img
                      className="h-[3rem] w-[3rem] rounded-full object-cover"
                      src={avatar.preview}
                      alt="Avatar Preview"
                    />
                  ) : (
                    <CircleIcon size={45} strokeWidth={1} stroke="#a3a3a3" />
                  )}
                  {/* Camera icon for avatar upload */}
                  <CameraIcon className=" absolute dark:bg-slate-900 bg-opacity-70 bg-neutral-400 p-1 rounded-full" />
                  <input
                    className="cursor-pointer border-none h-[1px] p-[10px] overflow-hidden whitespace-nowrap w-[1px] absolute opacity-0"
                    id="picture"
                    type="file"
                    onChange={avatar.changeHandler}
                  />
                </div>
              </Button>
              {/* Input for group name */}
              <Input
                className="rounded-full py-2 text-sm w-full mx-3 font-medium"
                value={groupName.value}
                type="text"
                onChange={groupName.changeHandler}
                placeholder="Group Name"
              />
            </div>
          </DialogTitle>
          <DialogDescription className="w-full list-none flex flex-col">
            {/* Display loading skeleton or friends list */}
            {isLoading ? (
              <ChatListSkeleton />
            ) : (
              <ScrollArea className="h-[calc(100svh-25.8rem)] md:h-[calc(100vh-27.5rem)] 2xl:h-[calc(100vh-35.5rem)] scroll-smooth">
                {data?.friends.map((i) => (
                  <div className="px-4" key={i._id}>
                    <UserItem
                      user={i}
                      handler={selectMemberHandler}  // Handler for selecting members
                      isAdded={selectedMembers.includes(i._id)}  // Check if the user is already added
                    />
                  </div>
                ))}
              </ScrollArea>
            )}
            {/* Action buttons */}
            <div className="flex gap-16 justify-center mt-3">
              <Button variant="destructive" onClick={closeHandler}>Cancel</Button>
              <Button onClick={submitHandler} disabled={isLoadingNewGroup}>Create</Button>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default NewGroup;
