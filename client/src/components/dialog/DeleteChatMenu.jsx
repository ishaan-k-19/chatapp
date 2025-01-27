import React, { useEffect, useRef } from 'react'
import { Button } from '../ui/button'
import { setIsDeleteMenu } from '@/redux/reducers/misc';
import { useDispatch, useSelector } from 'react-redux';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog"
import { useDeleteChatMutation, useLeaveGroupMutation } from '@/redux/api/api';
import { useAsyncMutation } from '@/hooks/hooks';
import { useNavigate } from 'react-router-dom';
  


/**
 * DeleteChatMenu Component:
 * This component displays a dialog where the user can confirm the deletion of a chat or leaving a group.
 * 
 * Props:
 * - chatId: The ID of the chat or group to be deleted or left.
 * - isGroup: A boolean to determine whether the item is a group or a chat.
 */
const DeleteChatMenu = ({ chatId, isGroup }) => {
    
  // Retrieving isDeleteMenu state from Redux store
  const { isDeleteMenu } = useSelector((state) => state.misc);

  // Initializing mutation hooks for deleting chat and leaving group
  const [deleteChat, _, deleteChatData] = useAsyncMutation(useDeleteChatMutation);
  const [leaveGroup, __, leaveGroupData] = useAsyncMutation(useLeaveGroupMutation);

  // Hook for navigating between pages
  const navigate = useNavigate();

  // Redux dispatch function to trigger actions
  const dispatch = useDispatch();

  // Function to close the delete menu by dispatching an action
  const closeHandler = () => {
      dispatch(setIsDeleteMenu(false)); // Sets isDeleteMenu to false to close the dialog
  };

  // Function to handle leaving the group
  const leaveGroupHandler = () => {
      closeHandler(); // Close the delete menu
      leaveGroup("Leaving Group...", chatId); // Trigger the mutation for leaving the group
      navigate("/"); // Navigate to the home page
  };

  // Function to handle deleting the chat
  const deleteChatHandler = () => {
      closeHandler(); // Close the delete menu
      deleteChat("Deleting Chat...", chatId); // Trigger the mutation for deleting the chat
  };

  // Effect hook to navigate when either delete or leave action is successful
  useEffect(() => {
      if (deleteChatData || leaveGroupData) navigate("/"); // Navigate to home if deletion or leaving is successful
  }, [deleteChatData, leaveGroupData]);

  return (

    <AlertDialog open={isDeleteMenu} onOpenChange={closeHandler}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
      <AlertDialogDescription>
        Are you sure you want to {
            isGroup 
           ? <>leave this group?</>
           : <>delete this chat?</>
        }
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel onClick={closeHandler}>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={isGroup?leaveGroupHandler:deleteChatHandler}>
        {
            isGroup 
           ? <>Leave Group</>
           : <>Delete Chat</>
        }
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
  )
}

export default DeleteChatMenu
