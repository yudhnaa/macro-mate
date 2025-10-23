import React, { useState } from "react";
import { EyeOffIcon } from "../icon/EyeOffIcon";
import { EyeOpenIcon } from "../icon/EyeOpenIcon";
import { COLORS } from "@/app/utils/constants";


interface NxInputProps {
  id: string;
  name: string;
  label: string;
  type?: "text" | "email" | "password";
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  minLength?: number;
  placeholder?: string;
}

const NxInput: React.FC<NxInputProps> = ({
  id,
  name,
  label,
  type = "text",
  value,
  onChange,
  required = false,
  minLength,
  placeholder
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === "password";

  const handleTogglePassword = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium mb-2"
        style={{ color: COLORS.text.secondary }}
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={isPasswordField ? (showPassword ? "text" : "password") : type}
          required={required}
          value={value}
          onChange={onChange}
          minLength={minLength}
          className="w-full px-4 py-3 bg-white border rounded-lg focus:ring-2 focus:border-transparent transition-all outline-none placeholder-gray-400"
          style={{
            borderColor: COLORS.border.DEFAULT,
            color: COLORS.text.primary,
          }}
          placeholder={placeholder || `Enter your ${label.toLowerCase()}`}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={handleTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
            style={{ color: COLORS.text.tertiary }}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOffIcon /> : <EyeOpenIcon />}
          </button>
        )}
      </div>
    </div>
  );
};

export default NxInput;
