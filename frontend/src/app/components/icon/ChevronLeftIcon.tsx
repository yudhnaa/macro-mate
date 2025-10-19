"use client";

import React from "react";

interface ChevronLeftIconProps extends React.SVGProps<SVGSVGElement> {
  width?: number | string;
  height?: number | string;
}

function ChevronLeftIcon({
  width = 20,
  height = 20,
  className = "w-5 h-5",
  ...props
}: ChevronLeftIconProps) {
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
        d="M15 19l-7-7 7-7"
      />
    </svg>
  );
}

export default ChevronLeftIcon;
