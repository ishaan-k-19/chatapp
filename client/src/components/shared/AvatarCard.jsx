import { transformImage } from '@/lib/features'
import { Avatar, AvatarImage } from '../ui/avatar'


// AvatarCard component that takes 'avatars' array and a 'max' limit as props
const AvatarCard = ({ avatars = [], max = 4 }, style) => {

  return (
    <div className='flex gap-1'>
      {/* Avatar wrapper */}
      <div max={max}> {/* The 'max' prop is provided but not used effectively here */}
        {/* Avatar container with custom height, width, and styles */}
        <div className='h-12 w-20' style={style}>
          {/* Avatar component from the UI library */}
          <Avatar className='border-white left-9 absolute shadow-lg'>
            {/* Avatar image with the transformed source */}
            <AvatarImage
              key={Math.random() * 100}  // Using a random key to force re-render each time
              src={transformImage(avatars[0])}  // Transforming the first avatar image URL
              alt={`Avatar`}  // Alt text for accessibility
            />
          </Avatar>
        </div>
      </div>
    </div>
  )
}

export default AvatarCard
