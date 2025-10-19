"use client";

import React from "react";

interface RefreshIconProps extends React.SVGProps<SVGSVGElement> {
  width?: number | string;
  height?: number | string;
}

function RefreshIcon({
  width = 20,
  height = 20,
  className = "w-5 h-5",
  ...props
}: RefreshIconProps) {
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
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
  );
}

export default RefreshIcon;
