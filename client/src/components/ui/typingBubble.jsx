import { AtSign } from "lucide-react";
import React, { useState, useEffect } from "react";

const TypingBubble = ({user, group}) => {

  return (
    <div className="flex items-center gap-1 absolute bottom-[60px] md:bottom-[82px]">
      <div className="h-[5px] w-[5px] bg-neutral-500 rounded-full animate-bounce duration-500"/>
      <div className="h-[5px] w-[5px] bg-neutral-500 rounded-full animate-bounce duration-700"/>
      <div className="h-[5px] w-[5px] bg-neutral-500 rounded-full animate-bounce duration-1000"/>
      {
        group ? (
          <div className="flex text-neutral-500 items-center animate-pulse text-sm">
            <AtSign size={12}/>
            <p >{user?.username}</p>
          </div>
        ) : (
          <p className="animate-pulse text-sm text-neutral-500">{user?.name}</p>
        )
      }
        <p className="animate-pulse text-sm text-neutral-500"> is typing</p>
    </div>
  );
};

export default TypingBubble;
