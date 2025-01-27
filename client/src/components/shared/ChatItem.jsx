import { transformImage } from '@/lib/features';
import { memo } from 'react';
import { Link } from '../styles/StyledComponents';
import { Avatar, AvatarImage } from '../ui/avatar';
import { useTheme } from '../ui/theme-provider';

const ChatItem = ({
  avatar = [],  // Avatar images (array), default to an empty array
  name,  // Name of the user or group
  _id,  // Unique identifier for the chat
  groupChat = false,  // Whether the chat is a group chat
  sameSender,  // Whether this chat is from the same sender (for styling)
  isOnline,  // Whether the user is online
  newMessageAlert,  // Whether there is a new message alert for this chat
}) => {

  // Extracting theme-related values from the custom theme hook
  const { theme, systemTheme } = useTheme();

  return (
    <>
      {/* Link to the individual chat page */}
      <Link className='hover:bg-[#7b39ed] hover:bg-opacity-45 rounded-lg mx-2' to={`/chat/${_id}`}>
        <div
          className='rounded-lg md:gap-[1px] gap-3'  // Flexbox styling for the chat item container
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0.4rem 0rem',
            margin: '2px 0px',
            backgroundColor: sameSender ? '#7b39ed' : 'unset',  // Highlight chat if from the same sender
            color: sameSender || theme === 'dark' || (theme === 'system' && systemTheme === 'dark') ? 'white' : 'unset',  // Color based on theme and same sender
            position: 'relative',
          }}
        >
          {/* Avatar section */}
          <Avatar className="object-cover md:my-2 md:ml-2 ml-10 shadow-lg">
            <AvatarImage className="object-cover" src={transformImage(avatar[0])} />
          </Avatar>

          {/* Chat details (name and new message alert) */}
          <div className="flex-col flex">
            <h5 className='text-lg mx-2'>{name}</h5>
            {newMessageAlert && (
              <h6 className='text-lg'>{newMessageAlert.count} New Message</h6>  // Show new message alert if there is one
            )}
          </div>

          {/* Online status indicator */}
          {isOnline && groupChat === false ? (
            <div className='w-[10px] h-[10px] rounded-full bg-green-500 absolute top-[50%] right-4 -translate-y-[50%]' />  // Green dot for online users
          ) : (
            <div className='w-[10px] h-[10px] rounded-full top-[50%] right-4 -translate-y-[50%]' />  // Empty dot if not online
          )}
        </div>
      </Link>
    </>
  );
};

// Memoizing the component to prevent unnecessary re-renders
export default memo(ChatItem);
