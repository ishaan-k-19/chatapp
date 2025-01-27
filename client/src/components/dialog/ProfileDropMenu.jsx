import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu";


  import React from 'react'
import { Button } from "../ui/button";
import { ArrowLeftFromLine, EllipsisVertical, LogOutIcon, TrashIcon, UserRound } from "lucide-react";
import { setIsDeleteMenu, setIsProfile } from "@/redux/reducers/misc";
import { useDispatch, useSelector } from "react-redux";



// ProfileDropMenu component with an optional 'isGroup' prop to conditionally render different options
const ProfileDropMenu = ({ isGroup }) => {

  const { isProfile } = useSelector((state) => state.misc);  // Getting the current profile state from Redux

  const dispatch = useDispatch();  // Initializing Redux dispatch function

  // Handler for displaying the delete menu
  const handleDeleteChat = () => {
    dispatch(setIsDeleteMenu(true));  // Dispatches action to show delete menu
  };

  // Handler for toggling the profile state
  const handleProfile = () => {
    dispatch(setIsProfile(!isProfile));  // Toggles between showing or hiding profile
  };
  
    return (
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="dark:shadow-xl rounded-full px-2" variant="icon">
            <EllipsisVertical size={21}/>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleProfile} className="flex gap-1 items-center justify-center">
            <UserRound size={20}/>
            <h6>Profile</h6>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={()=>handleDeleteChat()} className="flex gap-1 items-center justify-center text-red-500">
            {
                isGroup 
                ? <><ArrowLeftFromLine/> Leave </> 
                : <><TrashIcon/> Delete </>
            }
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
  
  export default ProfileDropMenu
  