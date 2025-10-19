"use client";

import React from "react";

interface ProfileIconProps extends React.SVGProps<SVGSVGElement> {
  active?: boolean;
  width?: number | string;
  height?: number | string;
}

function ProfileIcon({
  width = 20,
  height = 20,
  className,
  ...props
}: ProfileIconProps) {
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
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

export default ProfileIcon;
