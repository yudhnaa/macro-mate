"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import NxInput from "@/app/components/common/NxInput";
import { COLORS } from "@/app/utils/constants";
import LoadingSpinner from "./LoadingSpinner";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { registerUser, loginUser, clearError } from "@/app/features/auth/authSlice";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [localError, setLocalError] = useState("");
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Clear error when component unmounts
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    // Redirect to planner if already authenticated
    if (isAuthenticated) {
      router.push("/planner");
    }
  }, [isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalError("");
    dispatch(clearError());
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    dispatch(clearError());

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setLocalError("Passwords do not match!");
      return;
    }

    if (formData.password.length < 8) {
      setLocalError("Password must be at least 8 characters long!");
      return;
    }

    if (!acceptTerms) {
      setLocalError("Please agree to the terms of service!");
      return;
    }

    try {
      // Register user
      await dispatch(registerUser({
        email: formData.email,
        password: formData.password,
      })).unwrap();

      // After successful registration, automatically login
      await dispatch(loginUser({
        email: formData.email,
        password: formData.password,
      })).unwrap();

      // Success - will redirect via useEffect
    } catch (err) {
      // Error is handled by Redux slice
      console.error("Registration failed:", err);
    }
  };

  const displayError = localError || error;

  return (
    <div className="w-full max-w-md  rounded-2xl p-8 space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => router.push('/')}
          className="text-sm font-medium transition-colors hover:underline"
          style={{ color: COLORS.primary.DEFAULT }}
        >
          ← Back
        </button>
      </div>

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2" style={{ color: COLORS.text.primary }}>
          Create Your Account
        </h1>
        <p style={{ color: COLORS.text.secondary }}>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium transition-colors"
            style={{ color: COLORS.primary.DEFAULT }}
          >
            Log In
          </Link>
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <NxInput
          id="email"
          name="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          placeholder="your.email@example.com"
        />
        <NxInput
          id="password"
          name="password"
          label="Password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={8}
          placeholder="••••••••"
        />
        <NxInput
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          placeholder="••••••••"
        />

        {/* Terms and Conditions */}
        <div className="flex items-start">
          <input
            id="terms"
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => {
              setLocalError("");
              dispatch(clearError());
              setAcceptTerms(e.target.checked);
            }}
            className="mt-1 h-4 w-4 border-gray-300 rounded cursor-pointer"
            style={{ accentColor: COLORS.primary.DEFAULT }}
          />
          <label htmlFor="terms" className="ml-3 text-sm" style={{ color: COLORS.text.secondary }}>
            I agree to the{" "}
            <Link 
              href="/terms" 
              className="font-medium transition-colors"
              style={{ color: COLORS.primary.DEFAULT }}
            >
              Terms of Service
            </Link>
          </label>
        </div>

        {/* Error Message */}
        {displayError && (
          <div
            className="border px-4 py-3 rounded-lg text-sm"
            style={{
              backgroundColor: '#FEE2E2',
              borderColor: '#FCA5A5',
              color: '#991B1B'
            }}
            role="alert"
          >
            <p>{displayError}</p>
          </div>
        )}

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
            <LoadingSpinner text="Creating Account..." />
          ) : (
            "Create Account"
          )}
        </button>
      </form>
    </div>
  );
}