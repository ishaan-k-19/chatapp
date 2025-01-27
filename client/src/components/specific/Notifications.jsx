import { useAsyncMutation, useErrors } from '@/hooks/hooks';
import { useAcceptFriendRequestMutation, useGetNotificationsQuery } from '@/redux/api/api';
import { setIsNotification } from '@/redux/reducers/misc';
import { Check, XIcon } from 'lucide-react';
import { memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Avatar, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Skeleton } from '../ui/skeleton';
import { ChatListSkeleton } from '../ui/chatListSkeleton';
import { decrementNotification } from '@/redux/reducers/chat';
import { ScrollArea } from '../ui/scroll-area';

const Notifications = () => {
  const dispatch = useDispatch();  // Redux dispatch for triggering actions

  const { isNotification } = useSelector((state) => state.misc);  // Get notification state from Redux

  const { isLoading, data, error, isError } = useGetNotificationsQuery();  // API query to fetch notifications

  const [acceptRequest] = useAsyncMutation(useAcceptFriendRequestMutation);  // Mutation hook for accepting the friend request

  // Handler for accepting or rejecting the friend request
  const friendRequestHandler = async ({ _id, accept }) => {
    dispatch(setIsNotification(false));  // Close the notification dialog
    dispatch(decrementNotification());  // Decrease the notification count in Redux
    await acceptRequest("Accepting...", { requestId: _id, accept: accept });  // Accept or reject the request
  };

  // Handler for closing the notifications dialog
  const closeHandler = () => dispatch(setIsNotification(false));

  // Handle errors
  useErrors([{ error, isError }]);

  return (
    <Dialog open={isNotification} onOpenChange={closeHandler}>
      <DialogContent>
        <DialogHeader>
          <div className="flex flex-col items-center justify-center w-full">
            <DialogTitle className="text-center text-3xl py-5">
              Notifications
            </DialogTitle>
            <DialogDescription className="w-full list-none">
              {
                isLoading ? (
                  <ChatListSkeleton />  // Show skeleton while loading notifications
                ) : (
                  <ScrollArea className="h-[calc(100svh-20.5rem)] md:h-[calc(100vh-20rem)] scroll-smooth px-3">
                    <>
                      {
                        data?.allRequests.length > 0 ? (
                          // If there are requests, map over them and render NotificationItem
                          data?.allRequests?.map((i) => (
                            <NotificationItem 
                              sender={i.sender} 
                              _id={i._id} 
                              handler={friendRequestHandler} 
                              key={i._id}
                            />
                          ))
                        ) : <p className='text-center'>0 Notifications</p>  // If no requests, display message
                      }
                    </>
                  </ScrollArea>
                )
              }
            </DialogDescription>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

// Memoized NotificationItem component to optimize re-rendering
const NotificationItem = memo(({ sender, _id, handler }) => {
  const { name, avatar } = sender;

  return (
    <>
      <ul>
        <div className="flex items-center w-full">
          <div className="flex gap-2 items-center">
            {/* Avatar display */}
            <Avatar className="object-cover my-4 border-2 shadow-lg">
              <AvatarImage className="object-cover" src={avatar} />
            </Avatar>
            {/* Notification message */}
            <p className="text-lg grow overflow-hidden" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
              {`${name} sent you a friend request`}
            </p>
          </div>
          <div className="ml-3 flex gap-2">
            {/* Accept button */}
            <Button className="px-2 rounded-full" onClick={() => handler({ _id, accept: true })}>
              <Check />
            </Button>
            {/* Reject button */}
            <Button className="text-red-400 rounded-full px-2" onClick={() => handler({ _id, accept: false })} variant="secondary">
              <XIcon />
            </Button>
          </div>
        </div>
      </ul>
    </>
  );
});

export default Notifications
