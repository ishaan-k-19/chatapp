import { useFileHandler } from "6pp";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { transformImage } from "@/lib/features";
import { userExists } from "@/redux/reducers/auth";
import { setIsProfile } from "@/redux/reducers/misc";
import axios from "axios";
import {
  ArrowLeft,
  AtSign,
  AtSignIcon,
  Calendar,
  CameraIcon,
  CheckIcon,
  MailIcon,
  MessageSquareText,
  PenBoxIcon,
  UserIcon,
  UserRound,
  UsersIcon,
} from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { server } from "@/constants/config";
import { useNavigate } from "react-router-dom";
import ChangePasswordDialog from "../dialog/ChangePasswordDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import UserItem from "../shared/UserItem";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";

const Profile = ({ user, otherUser, chatId }) => {
  // State variables for handling profile edit, loading state, and dialog visibility
  const [isEdit, setIsEdit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  
  // Handling avatar file selection
  const avatar = useFileHandler("single");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Determine if the profile is for a group chat
  const isGroup = otherUser?.groupChat;
  const mainUser = otherUser ? otherUser : user;
  const edit = otherUser ? false : true;

  // React Hook Form for form handling
  const { register, handleSubmit } = useForm();

  // Initialize state for user data
  const [userData, setUserData] = useState({
    name: mainUser?.name,
    bio: mainUser?.bio,
    username: mainUser?.username,
  });

  // Handler to open the members dialog
  const membersDialogHandler = () => {
    setOpenDialog(true);
    console.log("clicked");
  };

  // Handle profile editing and submission
  const handleEditProfile = async (data) => {
    setIsEdit(false);
    const toastId = toast.loading("Updating Profile...");
    setIsLoading(true);

    const formData = new FormData();
    // Add avatar if changed, otherwise keep the existing avatar
    if (avatar.file) {
      formData.append("avatar", avatar.file);
    } else {
      formData.append("avatar", mainUser?.avatar);
    }
    formData.append("name", data.name);
    formData.append("bio", data.bio);
    formData.append("username", data.username);

    const config = {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    try {
      const response = await axios.put(
        `${server}/api/v1/user/me/editprofile`,
        formData,
        config
      );
      toast.success(response.data.message, { id: toastId });
      dispatch(userExists(response.data.user));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong", {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Edit profile form */}
      {isEdit ? (
        <Card className="h-[100svh] md:h-[calc(100svh-8rem)] md:m-3">
          <form
            className="flex flex-col gap-4 xl:gap-4"
            onSubmit={handleSubmit(handleEditProfile)}
          >
            <CardHeader>
              <CardTitle>
                {edit ? (
                  <div className="flex justify-between items-center">
                    Edit Profile
                    <div className="flex items-center gap-5">
                      <Button type="submit" variant="icon" disabled={isLoading}>
                        <CheckIcon />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>Profile</>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-2">
              <ScrollArea className="md:h-[calc(100svh-12.5rem)] h-[65svh] ">
                <div className="flex flex-col gap-5 xl:gap-8 items-center mt-4 justify-center">
                  {/* Avatar handling */}
                  <div className="flex flex-col items-center justify-center relative">
                    {avatar.preview ? (
                      <img
                        className="h-[10rem] w-[10rem] rounded-full object-cover"
                        src={avatar.preview}
                        alt="Avatar Preview"
                      />
                    ) : (
                      <Avatar className="w-[150px] h-[150px] md:w-[130px] md:h-[130px]  object-cover md:my-0 xl:my-4 my-4 shadow-lg">
                        <AvatarImage
                          className="object-cover"
                          src={transformImage(mainUser?.avatar?.url, 500)}
                        />
                      </Avatar>
                    )}
                    <Button
                      className="absolute bottom-13 px-9 py-12 right-13 bg-slate-700 rounded-full bg-opacity-60 cursor-pointer hover:bg-gray-300"
                      variant="icon"
                      type="button" // Change to type="button"
                    >
                      <CameraIcon className="font-bold text-neutral-300" />
                      <input
                        className="cursor-pointer px-20 py-24 border-none h-[1px] p-[10px] overflow-hidden whitespace-nowrap w-[1px] absolute opacity-0"
                        id="picture"
                        type="file"
                        onChange={avatar.changeHandler}
                      />
                    </Button>
                  </div>

                  {/* Profile form fields */}
                  <ProfileCard
                    heading={"Username"}
                    show={true}
                    isEdit={true}
                    element={
                      <input
                        className="border mx-2 rounded-sm py-1 text-center dark:bg-neutral-900 dark:text-white dark:border-neutral-700 bg-neutral-100"
                        type="text"
                        {...register("username")}
                        defaultValue={userData.username}
                        onChange={(e) =>
                          setUserData({ ...userData, username: e.target.value })
                        }
                      />
                    }
                    Icon={<AtSign size={19} />}
                  />
                  <ProfileCard
                    show={true}
                    heading={"Name"}
                    isEdit={true}
                    element={
                      <input
                        className="border mx-2 rounded-sm py-1 text-center dark:bg-neutral-900 dark:text-white dark:border-neutral-700 bg-neutral-100"
                        type="text"
                        {...register("name")}
                        defaultValue={userData.name}
                        onChange={(e) =>
                          setUserData({ ...userData, name: e.target.value })
                        }
                      />
                    }
                    Icon={<UserIcon size={19} />}
                  />
                  <ProfileCard
                    heading={"Bio"}
                    show={true}
                    isEdit={true}
                    element={
                      <input
                        className="border mx-2 rounded-sm py-1 text-center dark:bg-neutral-900 dark:text-white dark:border-neutral-700 bg-neutral-100"
                        type="text"
                        {...register("bio")}
                        defaultValue={userData.bio}
                        onChange={(e) =>
                          setUserData({ ...userData, bio: e.target.value })
                        }
                      />
                    }
                    Icon={<MessageSquareText size={19} />}
                  />
                </div>
              </ScrollArea>
              <ChangePasswordDialog />
            </CardContent>
          </form>
        </Card>
      ) : isGroup ? (
        // Group profile view
        <>
          <Card className=" h-[100svh] md:h-[calc(100svh-8rem)] md:m-3">
            <CardHeader>
              <CardTitle>
                <div className="flex gap-2 items-center">
                  <Button
                    className="rounded-full px-2 md:hidden block"
                    variant="icons"
                    onClick={() => {
                      dispatch(setIsProfile(false));
                    }}
                  >
                    <ArrowLeft />
                  </Button>
                  Group Profile
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="md:h-[calc(100svh-12.5rem)] h-[75svh]">
                <div className="flex flex-col gap-2 items-center mt-4 mb-5">
                  {/* Group avatar */}
                  <Avatar className="w-[150px] h-[150px] md:w-[130px] md:h-[130px]  object-cover md:my-0 xl:my-4 my-4 shadow-lg">
                    <a href={mainUser?.avatar?.url} target="blank">
                      <AvatarImage
                        className="object-cover"
                        src={transformImage(mainUser?.avatar?.url, 500)}
                      />
                    </a>
                  </Avatar>
                  <ProfileCard
                    heading={"Group Name"}
                    element={mainUser?.name}
                    Icon={<UserRound size={19} />}
                  />
                  <ProfileCard
                    heading={"Admin"}
                    element={mainUser?.creator?.username}
                    Icon={
                      <Avatar className="h-[30px] w-[30px]">
                        <AvatarImage
                          className="object-cover shadow-lg"
                          src={transformImage(
                            mainUser?.creator?.avatar?.url,
                            500
                          )}
                        />
                      </Avatar>
                    }
                  />
                  <ProfileCard
                    heading={"Participants"}
                    element={`${mainUser?.members?.length} Members`}
                    Icon={<UsersIcon size={19} />}
                    handler={membersDialogHandler}
                  />
                  <ProfileCard
                    heading={"Created"}
                    element={moment(mainUser?.createdAt).format("D MMM, YYYY")}
                    Icon={<Calendar size={19} />}
                    show={true}
                  />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      ) : (
        // User profile view
        <>
          <Card className="h-[100svh] md:h-[calc(100svh-8rem)] md:m-3">
            <CardHeader>
              <CardTitle>
                <div className="flex gap-2 items-center">
                  {edit ? (
                    <>
                      <Button
                        className="rounded-full px-2 md:hidden block"
                        variant="icons"
                        onClick={() => {
                          navigate("/");
                        }}
                      >
                        <ArrowLeft />
                      </Button>
                      <div className="flex justify-between items-center">
                        Profile
                        <Button variant="icon" onClick={() => setIsEdit(true)}>
                          <PenBoxIcon />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Button
                        className="rounded-full px-2 md:hidden block"
                        variant="icons"
                        onClick={() => {
                          dispatch(setIsProfile(false));
                        }}
                      >
                        <ArrowLeft />
                      </Button>
                      Profile
                    </>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="md:h-[calc(100svh-12.5rem)] h-[75svh] ">
                <div className="flex flex-col gap-2 items-center mt-4">
                  {/* User avatar */}
                  <Avatar className="w-[150px] h-[150px] md:w-[130px] md:h-[130px] object-cover shadow-lg">
                    <a href={mainUser?.avatar?.url} target="blank">
                      <AvatarImage
                        className="object-cover"
                        src={transformImage(mainUser?.avatar?.url, 500)}
                      />
                    </a>
                  </Avatar>
                  <ProfileCard
                    heading={"Username"}
                    element={mainUser?.username}
                    Icon={<AtSign size={19} />}
                    show={edit}
                  />
                  <ProfileCard
                    heading={"Name"}
                    element={mainUser?.name}
                    Icon={<UserIcon size={19} />}
                    show={edit}
                  />
                  <ProfileCard
                    heading={"Bio"}
                    element={mainUser?.bio}
                    Icon={<MessageSquareText size={19} />}
                    show={true}
                  />
                  {edit && (
                    <ProfileCard
                      heading={"Email"}
                      element={mainUser?.email}
                      Icon={<MailIcon size={19} />}
                      show={edit}
                    />
                  )}
                  <ProfileCard
                    heading={"Joined"}
                    element={moment(mainUser?.createdAt).format("D MMM, YYYY")}
                    Icon={<Calendar size={19} />}
                    show={true}
                  />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}
      <MembersDialog
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        user={mainUser}
      />
    </>
  );
};

// Profile card component for displaying individual profile info
const ProfileCard = ({ element, Icon, heading, handler, show = false, isEdit }) => (
  <Button
    className={`grid grid-cols-3 items-center -ml-16 md:-ml-3 ${isEdit && "ml-0"} w-2/3 cursor-default gap-5 h-auto`}
    variant="icon"
    onClick={handler}
    type="button"
  >
    <div className={`flex ${isEdit ? "md:justify-center -ml-10 md:ml-0" : "justify-end"}`}>{Icon}</div>
    <div className="flex flex-col">
      <div className={`flex flex-col ${isEdit ? "items-center" : "items-start"}`}>
        <p
          className={`${
            show
              ? "text-lg md:w-[14ch] md:whitespace-pre-wrap md:break-words text-start"
              : "text-lg max-w-none overflow-visible md:max-w-[9ch] md:overflow-hidden md:whitespace-nowrap md:text-ellipsis"
          }`}
        >
          {element}
        </p>
        <p className="text-[12px] text-neutral-400 -mt-[5px]">{heading}</p>
      </div>
    </div>
  </Button>
);

// MembersDialog component to display group members
const MembersDialog = ({ openDialog, setOpenDialog, user }) => {
  // Close dialog function
  const closeHandler = () => {
    setOpenDialog(false);
  };

  return (
    <Dialog open={openDialog} onOpenChange={closeHandler}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">{user.name} Group</DialogTitle>
        </DialogHeader>
        
        {/* Display total number of members */}
        <div className="text-lg font-bold text-neutral-500">
          Total Members: {user?.members?.length}
        </div>
        <Separator />
        
        {/* List of members */}
        <div className="list-none flex flex-col items-center w-full">
          <ScrollArea className="h-[47svh] 2xl:h-[50svh] scroll-smooth w-full px-3">
            {user?.members
              ?.slice() // Create a shallow copy of the members array
              .reverse() // Reverse the order to show latest members first
              .map((i) => (
                // Render each member's details
                <div key={i._id} className="flex gap-3 items-center p-2 mt-1">
                  <Avatar className="h-[50px] w-[50px]">
                    <AvatarImage
                      className="object-cover shadow-lg"
                      src={transformImage(i?.avatar?.url, 500)} // Display member avatar
                    />
                  </Avatar>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex-col">
                      <p>{i?.name}</p>
                      <div className="flex gap-[2px] items-center dark:text-neutral-500 text-neutral-400 -mt-1 text-[12px]">
                        <AtSignIcon size={12} /> {/* Display username icon */}
                        <p>{i?.username}</p>
                      </div>
                    </div>
                    {/* Display "Admin" label if the user is the group creator */}
                    {user?.creator?._id === i._id ? (
                      <p className="dark:text-neutral-400 border px-3 py-1 rounded-sm bg-neutral-200 text-neutral-500 dark:bg-neutral-900 dark:border-neutral-900">
                        Admin
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Profile;
