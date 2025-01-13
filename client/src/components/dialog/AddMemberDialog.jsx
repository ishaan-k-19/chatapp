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

const AddMemberDialog = ({chatId}) => {

  const {isAddMember} = useSelector(state => state.misc)

  const {isLoading, data, isError, error} = useAvailableFriendsQuery(chatId)

  
  const dispatch = useDispatch();
  
  
  const [selectedMembers, setSelectedMembers] = useState([])
  
  const [ addMember, isLoadingAddMember] = useAsyncMutation(useAddGroupMembersMutation)
  
  
  const selectMemberHandler =(id) =>{
    setSelectedMembers((prev)=>(prev.includes(id) ? prev.filter((currentElement) => currentElement !== id) : [...prev, id]))
  }
  
  const closeHandler = ()=>{
    dispatch(setIsAddMember(false))
  }
  const addMemberSubmitHandler = ()=>{
    addMember("Adding Members...", { members: selectedMembers, chatId})

  }
  
  useErrors([{isError, error}])

  return (
    <div>
      <Dialog open={isAddMember} onOpenChange={closeHandler}>
      <DialogContent>
        <DialogHeader>
        <div className="flex flex-col items-center w-full ">
            <DialogTitle className="text-center text-3xl py-5">
              Add Member
            </DialogTitle>
            <DialogDescription className=" w-full">
                < div className="flex flex-col list-none">
                    { isLoading ? <ChatListSkeleton/> : data?.friends?.length>0 ? 
                    (<ScrollArea className="h-[47svh] 2xl:h-[50svh] scroll-smooth">
                    {data?.friends?.map(i=>(
                            <UserItem key={i.id} user={i} handler={selectMemberHandler} isAdded={selectedMembers.includes(i._id)}/>
                    ))}
                    </ScrollArea>
                    ) : (
                      <div className='h-[47svh] 2xl:h-[50svh]'>

                        <h5 className='text-center text-2xl mt-10'>No Friends</h5>
                      </div>
                    )}
                </div>
            </DialogDescription>
                <div className="flex gap-4">
                <Button className='text-red-500 font-semibold border border-neutral-200' variant='secondary' onClick={closeHandler}>Cancel</Button>
                <Button disabled={isLoadingAddMember} onClick={addMemberSubmitHandler}>Add Member</Button>
                </div>
          </div>  
        </DialogHeader>
      </DialogContent>
    </Dialog>
    </div>
  )
}

export default AddMemberDialog
