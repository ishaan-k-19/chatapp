import { transformImage } from '@/lib/features';
import { FileJsonIcon } from 'lucide-react';
import React from 'react'

const RenderAttachment = (file, url) => {
    // Determine what type of attachment is passed and render it accordingly
    switch (file) {
      case "video":
        // If the file is a video, render a <video> element with controls
        return <video className='py-3' src={url} preload='none' width={"200px"} controls />;
        
      case "image":
        // If the file is an image, render an <img> element
        // Use `transformImage` to resize the image before displaying
        return <img className='py-3' src={transformImage(url, 200)} alt="Attachment" width={"200px"} height={"150px"} />;
        
      case "audio":
        // If the file is audio, render an <audio> element with controls
        return <audio className='py-3' src={url} preload='none' controls />;
        
      default:
        // If the file type is unknown or not recognized, render a default icon (JSON icon here)
        return <FileJsonIcon />;
    }
  };

export default RenderAttachment
