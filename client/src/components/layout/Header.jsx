import { server } from "@/constants/config";
import { userNotExists } from "@/redux/reducers/auth";
import Logo from "@/assets/logo";
import {
  setIsMobile,
  setIsNewGroup,
  setIsNotification,
  setIsProfile,
  setIsSearch,
} from "@/redux/reducers/misc";
import axios from "axios";
import {
  BellIcon,
  CircleFadingPlusIcon,
  LogOutIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { Suspense, lazy, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Link } from "../styles/StyledComponents";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { ModeToggle } from "../ui/mode-toggler";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { useTheme } from "../ui/theme-provider";

// Lazy load dialogs
const SearchDialog = lazy(() => import("../specific/Search"));
const NotificationDialog = lazy(() => import("../specific/Notifications"));
const NewGroupDialog = lazy(() => import("../specific/NewGroup"));

const Header = () => {
  const { isSearch, isNotification, isNewGroup } = useSelector(
    (state) => state.misc
  );  // Accessing app state for dialog visibility
  const { notificationCount } = useSelector((state) => state.chat);  // Notification count from chat state
  const [isLoading, setIsLoading] = useState(false);  // Loading state for logout

  const navigate = useNavigate();  // For navigation
  const dispatch = useDispatch();  // For dispatching actions

  // Handlers for opening dialogs and mobile state
  const handleMobile = () => {
    dispatch(setIsMobile(true));
  };
  const openSearchDialog = () => {
    dispatch(setIsSearch(true));
  };
  const openNewGroup = () => {
    dispatch(setIsNewGroup(true));
  };
  const openNotification = () => {
    dispatch(setIsNotification(true));
  };
  const navigateToGroup = () => {
    navigate(`/groups`);
  };

  // Utility function for capitalizing first letter
  function capitalizeFirstLetter(string) {
    if (!string) return string;
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // Handler for logging out the user
  const logoutHandler = async () => {
    const toastId = toast.loading("Logging Out...");
    setIsLoading(true);
    try {
      const { data } = await axios.get(`${server}/api/v1/user/logout`, {
        withCredentials: true,
      })
      dispatch(userNotExists());
      toast.success(data.message, {id: toastId});

    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong", { id: toastId });
    }finally{
      setIsLoading(false);
    }
  };

  // Navigates to the profile page
  const handleProfile = () => {
    navigate("/profile")
  };

  const { theme } = useTheme();  // Accessing theme context for dark/light mode

  return (
    <>
      <div className="md:hidden flex flex-col items-start gap-7 mt-10 md:disabled:">
        <TooltipProvider>
          <IconBtn
            title={"Search"}
            icon={<SearchIcon />}
            onClick={openSearchDialog}
          />
          <IconBtn
            title={"New Group"}
            icon={<UserPlus />}
            onClick={openNewGroup}
          />
          <Link to={"/groups"}>
            <IconBtn
              title={"Manage Group"}
              icon={<UsersRound />}
              onClick={navigateToGroup}
            />
          </Link>
          <IconBtn
            title={"Notifications"}
            icon={<BellIcon />}
            onClick={openNotification}
            value={notificationCount}
          />
          <IconBtn
            title={"Logout"}
            icon={<LogOutIcon />}
            onClick={logoutHandler}
          />
          <IconBtn
            title={"Profile"}
            icon={<UserIcon />}
            onClick={handleProfile}
          />
          <div className="flex items-center gap-5">
                    <ModeToggle />
                    <p className="text-xl dark:text-white text-neutral-800 font-bold">{capitalizeFirstLetter(theme)}</p>
                    
                    </div>
        </TooltipProvider>
      </div>
      <Card className="md:mx-3 md:my-2 md:block hidden">
        <CardHeader className="px-9 py-1">
          <CardTitle className="">
            <nav className="h-[4rem] grid grid-cols-12 items-center">
              <div className="col-span-6 md:col-span-2 text-[#6d28d9]">
                <div className="flex gap-1 items-center">
                <Logo className="w-full"/>
              <h1 className="text-2xl font-extrabold leading-none tracking-tight md:text-3xl lg:text-4xl dark:text-white">ConvoCube</h1>
                </div>
                <Button
                  className="shadow-xl rounded-full px-2 md:hidden"
                  variant="icon"
                >
                  <MenuIcon className="font-bold" onClick={handleMobile} />
                </Button>
              </div>
              <div className="col-span-6 md:col-span-10 flex justify-end">
                <div className="flex space-x-4">
                  <TooltipProvider>
                    <IconBtn
                      title={"Search"}
                      icon={<SearchIcon />}
                      onClick={openSearchDialog}
                    />
                    <IconBtn
                      title={"New Group"}
                      icon={<CircleFadingPlusIcon />}
                      onClick={openNewGroup}
                    />
                    <Link to={"/groups"}>
                      <IconBtn
                        title={"Manage Group"}
                        icon={<UsersRound />}
                        onClick={navigateToGroup}
                      />
                    </Link>
                    <IconBtn
                      title={"Notifications"}
                      icon={<BellIcon />}
                      onClick={openNotification}
                      value={notificationCount}
                    />
                    <IconBtn
                      title={"Logout"}
                      icon={<LogOutIcon />}
                      onClick={logoutHandler}
                    />
                    <ModeToggle />
                  </TooltipProvider>
                </div>
              </div>
            </nav>
          </CardTitle>
        </CardHeader>
      </Card>
      {isSearch && (
        <Suspense
          fallback={
            <div className="backdrop-opacity-10 backdrop-invert bg-white/20 min-h-screen"></div>
          }
        >
          <SearchDialog isOpen={isSearch} setIsOpen={setIsSearch} />
        </Suspense>
      )}
      {isNotification && (
        <Suspense
          fallback={
            <div className="backdrop-opacity-10 backdrop-invert bg-white/20 min-h-screen"></div>
          }
        >
          <NotificationDialog
            isOpen={isNotification}
            setIsOpen={setIsNotification}
          />
        </Suspense>
      )}
      {isNewGroup && (
        <Suspense fallback={<div>Loading...</div>}>
          <NewGroupDialog isOpen={isNewGroup} setIsOpen={setIsNewGroup} />
        </Suspense>
      )}
    </>
  );
};

// Icon Button component with tooltip and badge for notifications
const IconBtn = ({ title, icon, onClick, value }) => {
  return (
    <Tooltip>
      <TooltipTrigger>
        <div className="flex items-center gap-5" onClick={onClick}>
        <Button className="shadow-xl rounded-full px-2">
          {value ? (
            <div className="relative">
              <Badge className="absolute -top-3" variant="destructive">
                {value}
              </Badge>
              {icon}
            </div>
          ) : (
            icon
          )}
        </Button>
          <p className="md:hidden block text-xl dark:text-white font-bold text-neutral-700">{title}</p>
        </div>
        
      </TooltipTrigger>
      <TooltipContent className="md:block hidden">
        <p>{title}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default Header;
