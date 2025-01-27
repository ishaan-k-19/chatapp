
import { transformImage } from '@/lib/features'
import { AtSignIcon, MinusIcon, PlusIcon } from 'lucide-react'
import { memo } from 'react'
import { Avatar, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'



const UserItem = ({user, handler, handlerIsLoading, isAdded = false, styling, usern=false}) => {
    const {name, _id, avatar, username} = user
    // If the avatar URL is available, use it; otherwise, fallback to the default avatar
    const newAvatar = avatar.url ? avatar.url : avatar;

  return (
    <li>
        <div className="flex items-center justify-between" style={{...styling}}>
            <div className='flex gap-2 items-center'>
                {/* Displaying the user's avatar */}
                <Avatar className='object-cover my-[10px] shadow-lg border'>
                    <AvatarImage className='object-cover' src={transformImage(newAvatar)} />
                </Avatar>
                
                <div className='-space-y-1'>
                    {/* Display the user's name, ensuring it truncates in case it's too long */}
                    <p className='text-lg grow overflow-hidden' style={{display: "-webkit-box", WebkitLineClamp:1, WebkitBoxOrient:"vertical"}}>
                        {name}
                    </p>

                    {/* If the `usern` prop is true, display the user's username */}
                    {usern && (
                        <div className='flex gap-[1px] items-center dark:text-neutral-600 text-neutral-400 text-sm'>
                            <AtSignIcon size={10} className='' />
                            <p>{username}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Button for adding/removing the user, based on the `isAdded` prop */}
            <Button 
                className='px-2 rounded-full' 
                onClick={() => handler(_id)} 
                disabled={handlerIsLoading} 
                variant={isAdded ? "destructive" : ""}
            >
                {/* If the user is added, show the minus icon; otherwise, show the plus icon */}
                {isAdded ? <MinusIcon /> : <PlusIcon />}
            </Button>
        </div>
    </li>
  )
}

export default memo(UserItem)
