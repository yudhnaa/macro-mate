"use client";

import Link from "next/link";
import { useState } from "react";
import NxInput from "@/app/components/common/NxInput";
import { COLORS } from "@/app/utils/constants";
import LoadingSpinner from "./LoadingSpinner";
import GoogleIcon from "../icon/GoogleIcon";
import GithubIcon from "../icon/GithubIcon";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="w-full max-w-md rounded-2xl  p-8 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.text.primary }}>
          Welcome Back
        </h1>
        <p style={{ color: COLORS.text.secondary }}>
          Sign in to continue to Macro Mate
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <NxInput
          id="email"
          name="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="your.email@example.com"
        />

        {/* Password Field */}
        <NxInput
          id="password"
          name="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
        />

        {/* Forgot Password Link */}
        <div className="flex items-center justify-end">
          <Link
            href="/forgot-password"
            className="text-sm font-medium transition-colors"
            style={{ color: COLORS.primary.DEFAULT }}
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full text-white py-3 rounded-lg font-semibold transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none shadow-lg flex items-center justify-center"
          style={{
            backgroundColor: COLORS.button.primary.background,
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = COLORS.button.primary.hover;
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = COLORS.button.primary.background;
          }}
        >
          {isLoading ? (
            <LoadingSpinner text="Signing in..." />
          ) : (
            "Sign In"
          )}
        </button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: COLORS.border.DEFAULT }}></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white" style={{ color: COLORS.text.secondary }}>Or</span>
          </div>
        </div>

        {/* Social Login Buttons */}
        <div className="space-y-3">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border rounded-lg hover:bg-gray-50 transition-colors font-medium"
            style={{ 
              borderColor: COLORS.border.DEFAULT,
              color: COLORS.text.primary 
            }}
          >
            <GoogleIcon width={20} height={20} />
            Sign in with Google
          </button>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border rounded-lg hover:bg-gray-50 transition-colors font-medium"
            style={{ 
              borderColor: COLORS.border.DEFAULT,
              color: COLORS.text.primary 
            }}
          >
            <GithubIcon width={20} height={20} />
            Sign in with GitHub
          </button>
        </div>
      </form>

      {/* Sign Up Link */}
      <div className="text-center">
        <p style={{ color: COLORS.text.secondary }}>
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-medium transition-colors"
            style={{ color: COLORS.primary.DEFAULT }}
          >
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
}