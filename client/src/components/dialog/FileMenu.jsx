import React, { useRef } from "react";

import { useDispatch, useSelector } from "react-redux";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { AudioLines, FileUpIcon, ImageIcon, Paperclip, VideoIcon } from "lucide-react";
import { Button } from "../ui/button";
import { setIsFileMenu, setUploadingLoader } from "@/redux/reducers/misc";
import toast from "react-hot-toast";
import { useSendAttachmentsMutation } from "@/redux/api/api";
import { ScrollArea } from "../ui/scroll-area";


/**
 * FileMenu Component:
 * This component provides a pop-up menu for selecting and uploading files like images, audio, video, or other file types.
 * It manages file selection, validation, and upload process.
 * 
 * Props:
 * - chatId: The ID of the chat where files will be sent.
 */
const FileMenu = ({ chatId }) => {
  
  // Creating refs for file input elements (for images, audio, video, and other files)
  const imageRef = useRef(null);
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const fileRef = useRef(null);

  // Using Redux hooks
  const dispatch = useDispatch(); // Dispatch function to trigger Redux actions

  // Function to close the file menu by dispatching the `setIsFileMenu` action
  const closeFileMenu = () => dispatch(setIsFileMenu(false));

  // Functions to trigger file input elements
  const selectImage = () => imageRef.current?.click();
  const selectAudio = () => audioRef.current?.click();
  const selectVideo = () => videoRef.current?.click();
  const selectFile = () => fileRef.current?.click();

  // Calling the mutation hook to send attachments
  const [sendAttachments] = useSendAttachmentsMutation();

  // Function to handle file selection and upload
  const fileChangeHandler = async (e, key) => {
    e.preventDefault(); // Preventing default form submission

    const files = Array.from(e.target.files); // Converting selected files to an array

    if (files.length <= 0) return; // If no files are selected, do nothing

    // Limiting the number of files to 5
    if (files.length > 5) return toast.error(`You can only send 5 ${key} at a time`);

    dispatch(setUploadingLoader(true)); // Dispatch action to show loader during file upload
    
    const toastId = toast.loading(`Sending ${key}...`); // Displaying loading toast while sending files

    closeFileMenu(); // Close the file menu after file selection

    try {
      const myForm = new FormData(); // Creating FormData to send files as multipart form data

      myForm.append("chatId", chatId); // Appending chatId to the form
      files.forEach(file => myForm.append("files", file)); // Appending selected files to the form

      const res = await sendAttachments(myForm); // Sending the files using the mutation hook

      // Handling response from the API
      if (res.data) {
        toast.success(`${key} sent successfully`, { id: toastId }); // Success toast
      } else {
        toast.error(`Failed to send ${key}`, { id: toastId }); // Error toast
      }
    } catch (error) {
      toast.error(error, { id: toastId }); // Display error if something goes wrong
    } finally {
      dispatch(setUploadingLoader(false)); // Hide loader once the file upload process is complete
    }
  };

  // Accessing the isFileMenu state from the Redux store to control the visibility of the file menu
  const isFileMenu = useSelector((state) => state.misc.isFileMenu);

  return (
    <Popover open={isFileMenu} onOpenChange={closeFileMenu}>
      <PopoverTrigger asChild>
        <Paperclip/>
      </PopoverTrigger>
      <PopoverContent className="text-white">
        <Button className="bg-white w-full border-none bg-opacity-0" variant="outline" onClick={selectImage}>
          <ImageIcon />
          <p className="px-2">Image</p>
          <input
            className="hidden"
            type="file"
            multiple
            accept="image/png, image/jpeg, image/gif"
            onChange={(e) => fileChangeHandler(e, "Images")}
            ref={imageRef}
          />
        </Button>
        <Button className="bg-white w-full border-none bg-opacity-0" variant="outline" onClick={selectAudio}>
          <AudioLines/>
          <p className="px-2">Audio</p>
          <input
            className="hidden"
            type="file"
            multiple
            accept="audio/mpeg, audio/wav"
            onChange={(e) => fileChangeHandler(e, "Audios")}
            ref={audioRef}
          />
        </Button>
        <Button className="bg-white w-full border-none bg-opacity-0" variant="outline" onClick={selectVideo}>
          <VideoIcon/>
          <p className="px-2">Video</p>
          <input
            className="hidden"
            type="file"
            multiple
            accept="video/mp4, video/webm, video/ogg"
            onChange={(e) => fileChangeHandler(e, "Videos")}
            ref={videoRef}
          />
        </Button>
        <Button className="bg-white w-full border-none bg-opacity-0" variant="outline" onClick={selectFile}>
          <FileUpIcon/>
          <p className="px-3">Files</p>
          <input
            className="hidden"
            type="file"
            multiple
            accept="*"
            onChange={(e) => fileChangeHandler(e, "Files")}
            ref={fileRef}
          />
        </Button>
      </PopoverContent>
    </Popover>
  );
};

export default FileMenu;
