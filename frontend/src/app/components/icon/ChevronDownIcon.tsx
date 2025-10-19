"use client";

import React from "react";

interface ChevronDownIconProps extends React.SVGProps<SVGSVGElement> {
  width?: number | string;
  height?: number | string;
}

function ChevronDownIcon({
  width = 24,
  height = 24,
  className = "w-6 h-6",
  ...props
}: ChevronDownIconProps) {
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
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

export default ChevronDownIcon;
