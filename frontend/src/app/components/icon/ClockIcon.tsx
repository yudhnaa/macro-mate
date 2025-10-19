"use client";

import React from "react";

interface ClockIconProps extends React.SVGProps<SVGSVGElement> {
  width?: number | string;
  height?: number | string;
}

function ClockIcon({
  width = 20,
  height = 20,
  className = "w-5 h-5",
  ...props
}: ClockIconProps) {
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
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export default ClockIcon;
