"use client";

import React from "react";

interface ChatbotIconProps extends React.SVGProps<SVGSVGElement> {
  width?: number | string;
  height?: number | string;
}

function ChatbotIcon({
  width = 20,
  height = 20,
  className = "w-5 h-5",
  ...props
}: ChatbotIconProps) {
  return (
    <svg
      width={width}
      height={height}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      className={className}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
      />
    </svg>
  );
}

export default ChatbotIcon;
