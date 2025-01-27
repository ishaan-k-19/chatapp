import React, {useState} from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { sampleUsers } from '../../constants/sampleData'
import UserItem from '../shared/UserItem'
import { useAsyncMutation, useErrors } from '@/hooks/hooks'
import { useAddGroupMembersMutation, useAvailableFriendsQuery } from '@/redux/api/api'
import { useDispatch, useSelector } from 'react-redux'
import { setIsAddMember } from '@/redux/reducers/misc'
import { Skeleton } from '../ui/skeleton'
import { ChatListSkeleton } from '../ui/chatListSkeleton'
import { ScrollArea } from '../ui/scroll-area'

/**
 * AddMemberDialog Component
 * This component allows users to add new members to a group chat.
 */
const AddMemberDialog = ({ chatId }) => {
  // Extracting the state for showing the Add Member dialog from the Redux store
  const { isAddMember } = useSelector(state => state.misc);

  // Fetching available friends for adding to the group
  const { isLoading, data, isError, error } = useAvailableFriendsQuery(chatId);

  // Initializing Redux's dispatch function
  const dispatch = useDispatch();

  // State to manage the selected members
  const [selectedMembers, setSelectedMembers] = useState([]);

  // Hook to handle the add member mutation
  const [addMember, isLoadingAddMember] = useAsyncMutation(useAddGroupMembersMutation);

  /**
   * Handles selecting/deselecting a member.
   * If the member is already selected, it removes them; otherwise, it adds them.
   */
  const selectMemberHandler = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id)
        ? prev.filter((currentElement) => currentElement !== id)
        : [...prev, id]
    );
  };

  /**
   * Closes the Add Member dialog.
   */
  const closeHandler = () => {
    dispatch(setIsAddMember(false));
  };

  /**
   * Submits the selected members to be added to the group.
   */
  const addMemberSubmitHandler = () => {
    addMember("Adding Members...", { members: selectedMembers, chatId });
  };

  // Custom hook to handle errors from the API
  useErrors([{ isError, error }]);

  // Render the dialog
  return (
    <div>
      <Dialog open={isAddMember} onOpenChange={closeHandler}>
        <DialogContent>
          <DialogHeader>
            <div className="flex flex-col items-center w-full">
              <DialogTitle className="text-center text-3xl py-5">
                Add Member
              </DialogTitle>
              <DialogDescription className="w-full">
                <div className="flex flex-col list-none">
                  {/* If loading, show skeleton loader; otherwise, display available friends or a message */}
                  {isLoading ? (
                    <ChatListSkeleton />
                  ) : data?.friends?.length > 0 ? (
                    <ScrollArea className="h-[47svh] md:h-[55.5svh] 2xl:h-[63svh] scroll-smooth">
                      {data?.friends?.map((i) => (
                        <UserItem
                          key={i.id}
                          user={i}
                          handler={selectMemberHandler}
                          isAdded={selectedMembers.includes(i._id)}
                        />
                      ))}
                    </ScrollArea>
                  ) : (
                    <div className="h-[47svh] 2xl:h-[50svh]">
                      <h5 className="text-center text-2xl mt-10">No Friends</h5>
                    </div>
                  )}
                </div>
              </DialogDescription>
              <div className="flex gap-4">
                {/* Cancel button to close the dialog */}
                <Button
                  className="text-red-500 font-semibold border border-neutral-200"
                  variant="secondary"
                  onClick={closeHandler}
                >
                  Cancel
                </Button>
                {/* Add Member button to submit the selected members */}
                <Button
                  disabled={isLoadingAddMember}
                  onClick={addMemberSubmitHandler}
                >
                  Add Member
                </Button>
              </div>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddMemberDialog
