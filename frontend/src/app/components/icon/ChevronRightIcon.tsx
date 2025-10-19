"use client";

import React from "react";

interface ChevronRightIconProps extends React.SVGProps<SVGSVGElement> {
  width?: number | string;
  height?: number | string;
}

function ChevronRightIcon({
  width = 20,
  height = 20,
  className = "w-5 h-5",
  ...props
}: ChevronRightIconProps) {
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
        d="M9 5l7 7-7 7"
      />
    </svg>
  );
}

export default ChevronRightIcon;
