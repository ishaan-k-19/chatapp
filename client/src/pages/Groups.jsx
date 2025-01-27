import { useFileHandler } from "6pp";
import UserItem from "@/components/shared/UserItem";
import { Link } from "@/components/styles/StyledComponents";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LayoutSkeleton } from "@/components/ui/layoutSkeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/components/ui/theme-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { server } from "@/constants/config";
import { useAsyncMutation, useErrors } from "@/hooks/hooks";
import { transformImage } from "@/lib/features";
import {
  useChatDetailsQuery,
  useDeleteChatMutation,
  useMyGroupsQuery,
  useRemoveGroupMemberMutation
} from "@/redux/api/api";
import { setIsAddMember } from "@/redux/reducers/misc";
import { getSocket } from "@/socket";
import axios from "axios";
import {
  ArrowLeft,
  CameraIcon,
  CheckIcon,
  MenuIcon,
  PencilIcon,
  PlusIcon,
  Trash2
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet";


import { Suspense, lazy, memo, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";

const ConfirmDeleteDialog = lazy(() =>
  import("@/components/dialog/ConfirmDeleteDialog")
);
const AddMember = lazy(() => import("@/components/dialog/AddMemberDialog"));

const Groups = () => {
  // Retrieve the chatId from the URL parameters
const chatId = useSearchParams()[0].get("group");
// Initialize the navigate function for navigation
const navigate = useNavigate();
// Get the current theme (either light or dark) and system theme
const { theme, systemTheme } = useTheme();
// Hook for handling avatar file uploads
const avatar = useFileHandler("single");
// Determine the UI theme (dark or light) based on the current theme and system theme
const ui = theme === 'dark' || (theme === 'system' && systemTheme === 'dark') ? "dark" : "light";

// Redux dispatch and socket initialization
const dispatch = useDispatch();
const socket = getSocket();

// Retrieve the `isAddMember` state from the store
const { isAddMember } = useSelector((state) => state.misc);

// Queries to fetch user groups and chat details
const myGroups = useMyGroupsQuery("");
const groupDetails = useChatDetailsQuery(
  { chatId, populate: true },
  { skip: !chatId } // Only fetch if chatId exists
);

// Mutation hooks for removing members and deleting the group
const [removeMember, isLoadingRemoveMember] = useAsyncMutation(
  useRemoveGroupMemberMutation
);

const [deleteGroup, isLoadingDeleteGroupName] = useAsyncMutation(
  useDeleteChatMutation
);

// States to manage UI visibility and actions
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
const [isEdit, setIsEdit] = useState(false);
const [isLoading, setIsLoading] = useState(false);

// States for managing group name and members
const [groupName, setGroupName] = useState("");
const [groupNameUpdatedValue, setGroupNameUpdatedValue] = useState("");
const [confirmDeleteHandler, setConfirmDeleteHandler] = useState(false);
const [members, setMembers] = useState([]);

// Error handling for `myGroups` and `groupDetails` queries
const errors = [
  { isError: myGroups.isError, error: myGroups.error },
  { isError: groupDetails.isError, error: groupDetails.error },
];
useErrors(errors);

// Effect to update group data when it changes
const groupData = groupDetails.data;
useEffect(() => {
  if (groupData) {
    setGroupName(groupData.chat.name);
    setGroupNameUpdatedValue(groupData.chat.name);
    setMembers(groupData.chat.members);
  }

  // Cleanup when group details change
  return () => {
    setGroupName("");
    setGroupNameUpdatedValue("");
    setMembers([]);
    setIsEdit(false);
  };
}, [groupDetails.data]);

// Function to navigate back to the previous page
const navigateBack = () => {
  navigate("/");
};

// Toggle the mobile menu visibility
const handleMobile = () => {
  setIsMobileMenuOpen((prev) => !prev);
};

// Function to update the group name
const updateGroupName = async () => {
  setIsEdit(false);
  const toastId = toast.loading("Updating Group Details...");
  setIsLoading(true);

  // Prepare form data for the update request
  const formData = new FormData();
  if (avatar.file) {
    formData.append("avatar", avatar.file);
  } else {
    formData.append("avatar", groupData?.chat?.avatar);
  }
  formData.append("name", groupNameUpdatedValue);
  
  // Request configuration
  const config = {
    withCredentials: true,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  };

  // Make the API request to update the group
  try {
    const response = await axios.put(`${server}/api/v1/chat/${chatId}`, formData, config);
    toast.success(response.data.message, { id: toastId });
    
    // Refetch groups and chat details after the update
    myGroups.refetch();
    groupDetails.refetch();
  } catch (error) {
    toast.error(error?.response?.data?.message || "Something went wrong", { id: toastId });
    setIsLoading(false);
  } finally {
    setIsLoading(false);
  }
};

// Functions to handle the delete confirmation modal
const openConfirmDeleteHandler = () => {
  setConfirmDeleteHandler(true);
};
const closeConfirmDeleteHandler = () => {
  setConfirmDeleteHandler(false);
};

// Function to open the add member modal
const openAddMemberHandler = () => {
  dispatch(setIsAddMember(true));
};

// Function to handle the group deletion
const deleteHandler = () => {
  deleteGroup("Deleting Group...", chatId);
  closeConfirmDeleteHandler();
  navigate("/groups");
};

// Function to remove a member from the group
const removeMemberHandler = (userId) => {
  removeMember("Removing Member...", { chatId, userId });
};

// Cleanup effect when chatId changes
useEffect(() => {
  return () => {
    setGroupName("");
    setGroupNameUpdatedValue("");
    setIsEdit(false);
  };
}, [chatId]);

// Icon buttons for navigation and actions
const IconBtns = (
  <>
    {/* Mobile menu button */}
    <Button
      className="px-2 rounded-full mx-3 fixed right-0 block md:hidden top-4 md:top-2"
      onClick={handleMobile}
    >
      <MenuIcon />
    </Button>

    {/* Back button with tooltip */}
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Button
            className={`px-2 rounded-full fixed mx-3 top-4 md:top-2 md:relative ${
              theme === "dark" ||
              (theme === "system" && systemTheme === "dark")
                ? "bg-neutral-700 hover:bg-neutral-600"
                : "bg-slate-200 hover:bg-slate-300"
            }`}
            variant="icon"
            onClick={navigateBack}
          >
            <ArrowLeft />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="hidden md:block">back</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </>
);

// Group name and avatar section with edit functionality
const GroupName = (
  <div className="flex justify-center items-center overflow-hidden flex-col">
    {isEdit ? (
      <>
        {/* Editable state - Avatar and input for changing group name */}
        <div className="flex flex-col items-center justify-center relative">
          {/* Display avatar preview or default avatar */}
          {avatar.preview ? (
            <img
              className="h-[130px] w-[130px] rounded-full object-cover"
              src={avatar.preview}
              alt="Avatar Preview"
            />
          ) : (
            <Avatar className="w-[110px] h-[110px] object-cover mb-1 shadow-lg">
              <AvatarImage
                className="object-cover"
                src={transformImage(groupData?.chat?.avatar?.url, 500)}
              />
            </Avatar>
          )}
          {/* Avatar change button */}
          <Button
            className="absolute bottom-13 px-9 py-12 right-13 bg-slate-700 rounded-full bg-opacity-60 cursor-pointer hover:bg-gray-300"
            variant="icon"
          >
            <CameraIcon className="font-bold" />
            <input
              className="cursor-pointer px-20 py-24 border-none h-[1px] overflow-hidden whitespace-nowrap w-[1px] absolute opacity-0"
              id="picture"
              type="file"
              onChange={avatar.changeHandler}
            />
          </Button>
        </div>
        {/* Group name input and update button */}
        <div className="flex items-center">
          <input
            className="border mx-2 rounded-sm py-2 text-center dark:bg-neutral-900 dark:text-white dark:border-neutral-700 bg-neutral-100"
            type="text"
            value={groupNameUpdatedValue}
            onChange={(e) => setGroupNameUpdatedValue(e.target.value)}
          />
          <Button
            className="rounded-full px-2 bg-neutral-700"
            onClick={updateGroupName}
            variant="outlined"
            disabled={isLoading}
          >
            <CheckIcon size={28} />
          </Button>
        </div>
      </>
    ) : (
      <>
        {/* Non-editable state - Avatar and group name */}
        <Avatar className="w-[110px] h-[110px] object-cover shadow-lg">
          <a href={groupData?.chat?.avatar?.url} target="blank">
            <AvatarImage
              className="object-cover"
              src={transformImage(groupData?.chat?.avatar?.url, 500)}
            />
          </a>
        </Avatar>
        <div className="flex ml-[60px]">
          {/* Display group name */}
          <h4 className="text-2xl">{groupName}</h4>
          {/* Edit button to enable group name editing */}
          <Button
            variant="outlined"
            onClick={() => setIsEdit(true)}
            disabled={isLoading}
          >
            <div
              className="dark:bg-neutral-700 dark:hover:bg-neutral-600 bg-slate-100 hover:bg-slate-300 p-2 rounded-lg"
            >
              <PencilIcon size={24} />
            </div>
          </Button>
        </div>
      </>
    )}
  </div>
);
  // Button group for actions like delete and add member
  const ButtonGroup = (
    <div className="flex gap-4 justify-center my-3 flex-col-reverse items-center md:flex-row">
      <Button
        className="text-red-500 border border-neutral-200 dark:border-red-500 w-1/2 md:w-auto"
        variant="outlined"
        onClick={openConfirmDeleteHandler}
      >
        <Trash2 className="w-5 mx-1" /> Delete Group
      </Button>
      <Button onClick={openAddMemberHandler} className="w-1/2 md:w-auto">
        <PlusIcon className="w-5 mx-1" />
        Add Member
      </Button>
    </div>
  );

  return myGroups.isLoading ? (
    <LayoutSkeleton />
  ) : (
    <div className="relative h-[100svh] xl:mb-0 mb-0">
      <div className="grid grid-cols-12 h-full gap-4 md:p-4">
        <Card className={`h-full md:py-3 md:block col-span-12 md:col-span-4 ${chatId ? "hidden md:block" : "block"}`}>
          <div className="md:hidden block">
          <Button
              className={"px-2 rounded-full fixed  m-3 top-4 md:top-2 md:relative dark:bg-neutral-700 dark:hover:bg-neutral-600 bg-slate-200 hover:bg-slate-300"}
              variant="icon"
              onClick={navigateBack}
            >
              <ArrowLeft />
            </Button>
          </div>
          <CardHeader>
            <CardTitle className={"text-3xl text-center font-bold mb-4 mt-1 md:mt-0"}>
              Manage Groups
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 md:px-0">
            <GroupList myGroups={myGroups?.data?.groups} chatId={chatId} />
          </CardContent>
        </Card>
        <Card className={`col-span-12 md:col-span-8 h-full block ${chatId ? "block" : "hidden md:block"}`}>
          {IconBtns}
          {groupName ? (
            <>
              <CardHeader className="block p-3">{GroupName}</CardHeader>
              <CardContent>
                
                  <ScrollArea className="h-[50vh] md:h-[calc(100vh-20rem)]">
                <div className="flex w-full justify-center">
                  <div className="flex flex-col list-none md:max-w-[45rem] w-full box-border px-4 py-2 gap-[4px] md:mx-4">
                    {isLoadingRemoveMember ? (
                      <Skeleton />
                    ) : (
                      members?.map((i) => (
                        <UserItem
                          key={i._id}
                          user={i}
                          isAdded
                          styling={
                            theme === "light" ||
                            (theme === "system" && systemTheme === "light")
                              ? {
                                  boxShadow: "0 0 0.5rem rgba(0, 0, 0, 0.2)",
                                  padding: "0rem 2rem",
                                  borderRadius: "0.5rem",
                                  gap: "0",
                                  justifyContent: "space-between",
                                  
                                }
                              : {
                                  backgroundColor: `#262626`,
                                  boxShadow: "0 0 0.5rem rgba(0, 0, 0, 0.2)",
                                  padding: "0rem 2rem",
                                  borderRadius: "0.5rem",
                                  gap: "0",
                                  justifyContent: "space-between",
                                }
                          }
                          handler={removeMemberHandler}
                          usern={true}
                        />
                      ))
                    )}
                  </div>
                </div>
                  </ScrollArea>
              </CardContent>
              <CardFooter>{ButtonGroup}</CardFooter>
            </>
          ) : (<p className="flex justify-center text-2xl mt-28">Please Select a Group to Manage</p>)}
        </Card>
      </div>
      {/* Add Member Modal */}
      {isAddMember && (
        <Suspense fallback={<div>Loading...</div>}>
          <AddMember chatId={chatId} />
        </Suspense>
      )}
    {/* Confirm delete group modal */}
      {confirmDeleteHandler && (
        <>
          <Suspense fallback={<div>Loading</div>}>
            <ConfirmDeleteDialog
              open={confirmDeleteHandler}
              handleClose={closeConfirmDeleteHandler}
              deleteHandler={deleteHandler}
            />
          </Suspense>
        </>
      )}
      {/* Mobile menu sheet */}
      <Sheet
        open={isMobileMenuOpen}
        onOpenChange={() => setIsMobileMenuOpen(false)}
      >
        <SheetContent className="shadow-lg block md:hidden">
          <SheetHeader>
            <SheetTitle className="text-white mt-8 text-3xl mb-10">
              Manage Gropus
            </SheetTitle>
            <SheetDescription>
              <GroupList myGroups={myGroups?.data?.groups} chatId={chatId} />
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </div>
  );
};

// Component for rendering the list of groups
const GroupList = ({ myGroups = [], chatId }) => {
  return (
    <div className="flex flex-col">
      {/* Conditionally render groups if available */}
      {myGroups.length > 0 ? (
        <ScrollArea className="h-[80svh]">
          {/* Map through each group and render the GroupListItem component */}
          {myGroups.map((group) => (
            <GroupListItem group={group} chatId={chatId} key={group._id} />
          ))}
        </ScrollArea>
      ) : (
        // Show message if no groups are available
        <h6 className="text-center text-white md:text-2xl text-lg mt-20">No Groups</h6>
      )}
    </div>
  );
};

// Component for rendering a single group item in the list
const GroupListItem = memo(({ group, chatId }) => {
  const { theme, systemTheme } = useTheme(); // Get current theme and system theme
  const { _id, name, avatar } = group; // Extract group info

  return (
    <>
      {/* Link to group details page */}
      <Link
        className="rounded-lg md:mx-2 my-1 md:my-0 hover:bg-[#7b39ed] hover:bg-opacity-45"
        to={`?group=${_id}`}
        onClick={(e) => {
          // Prevent navigation if the current group is already selected
          if (chatId === _id) {
            e.preventDefault();
          }
        }}
      >
        {/* Group item container with dynamic styling based on selected group */}
        <div
          className="p-2 md:p-0 md:px-2 mx-2"
          style={{
            display: "flex",
            gap: "1rem",
            alignItems: "center",
            backgroundColor: chatId === _id ? "#7b39ed" : "unset", // Highlight if selected
            color:
              chatId === _id || theme === "dark" || (theme === "system" && systemTheme === "dark")
                ? "white" // White text for dark theme or selected group
                : "unset",
            borderRadius: "0.7rem",
            boxShadow: chatId === _id ? "0 0 0.5rem rgba(0, 0, 0, 0.2)" : "unset", // Box shadow for selected group
          }}
        >
          {/* Avatar component */}
          <Avatar className="object-cover md:my-2 shadow-lg">
            <AvatarImage className="object-cover" src={transformImage(avatar)} />
          </Avatar>
          {/* Group name */}
          <h5 className="md:text-lg text-base">{name}</h5>
        </div>
      </Link>
    </>
  );
});

export default Groups;
