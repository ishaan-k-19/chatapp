import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useInputValidation } from '6pp'
import { PasswordInput } from '../ui/password-input'
import { useAsyncMutation } from '@/hooks/hooks'
import { useUpdatePasswordMutation } from '@/redux/api/api'
import toast from 'react-hot-toast'
import { useDispatch } from 'react-redux'

/**
 * ChangePasswordDialog Component
 * This component renders a dialog allowing users to change their password.
 */
const ChangePasswordDialog = () => {
  // Initializing input validation hooks for the old password, new password, and confirm password
  const oldPassword = useInputValidation(""); // Manages old password input
  const newPassword = useInputValidation(""); // Manages new password input
  const cPassword = useInputValidation("");  // Manages confirm password input

  // State to control the dialog's open/close state
  const [open, setOpen] = useState(false);

  // Redux dispatch function (not used directly in this code, but likely needed for further enhancements)
  const dispatch = useDispatch();

  // Hook for handling the password update API mutation
  const [updatePassword, isLoading, data] = useAsyncMutation(useUpdatePasswordMutation);

  /**
   * Handles the form submission for changing the password.
   */
  const submitHandler = () => {
    // Validates that the new password matches the confirm password
    if (cPassword.value !== newPassword.value) {
      toast.error("New Password and Confirm Password did not match");
      return;
    }
    // Calls the mutation to update the password
    updatePassword("Changing Password...", { oldPassword: oldPassword.value, newPassword: newPassword.value });
  };

  /**
   * Effect to handle actions after the password has been successfully updated.
   */
  useEffect(() => {
    if (data) {
      setOpen(false); // Closes the dialog
      oldPassword.clear(); // Clears the old password field
      newPassword.clear(); // Clears the new password field
      cPassword.clear(); // Clears the confirm password field
    }
  }, [data]); // Runs whenever `data` changes

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="dark:border-neutral-600 mt-0 md:mt-0 2xl:mt-20 w-1/2 self-center py-5 dark:bg-neutral-700">Change Password</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[25rem] min-h-[23rem] w-full">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <div className="gap-3 py-4 flex-col flex items-center">
          <div className="w-full">
            <Label htmlFor="oldPassword" className="text-right ml-2">
              Old Password
            </Label>
            <PasswordInput
            id="oldPassword"
            placeholder="Enter password"
            className="mt-2"
            value={oldPassword.value}
            onChange={oldPassword.changeHandler}
            />
          </div>
          <div className="w-full">
            <Label htmlFor="newPassword" className="text-right ml-2">
              New Password
            </Label>
            <PasswordInput
              id="newPassword"
              placeholder="Enter password"
              className="mt-2"
              value={newPassword.value}
              onChange={newPassword.changeHandler}
              minLength={8}
            />
          </div>
          <div className="w-full mb-5">
            <Label htmlFor="cPassword" className="text-right ml-2">
              Confirm Password
            </Label>
            <PasswordInput
              id="cPassword"
              placeholder="Enter password"
              className="mt-2"
              value={cPassword.value}
              onChange={cPassword.changeHandler}
            />
          </div>
          <Button className="w-1/2" onClick={submitHandler} disabled={!oldPassword.value || !newPassword.value || !cPassword.value || isLoading}>Change Password</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ChangePasswordDialog
