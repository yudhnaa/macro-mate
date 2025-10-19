"use client";

import React from "react";

interface MoreVerticalIconProps extends React.SVGProps<SVGSVGElement> {
  width?: number | string;
  height?: number | string;
}

function MoreVerticalIcon({
  width = 24,
  height = 24,
  className = "w-6 h-6",
  ...props
}: MoreVerticalIconProps) {
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
        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
      />
    </svg>
  );
}

export default MoreVerticalIcon;
