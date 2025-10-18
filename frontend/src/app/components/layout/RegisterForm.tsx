"use client";

import Link from "next/link";
import React, { useState } from "react";
import NxInput from "@/app/components/common/NxInput";
import { COLORS } from "@/app/utils/constants";
import LoadingSpinner from "./LoadingSpinner";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (!acceptTerms) {
      setError("Please agree to the terms of service!");
      return;
    }

    setIsLoading(true);

    console.log("Registering with:", formData);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
    console.log("Registration successful!");
  };

  return (
    <div className="w-full max-w-md  rounded-2xl p-8 space-y-6">
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
          id="name"
          name="name"
          label="Username"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <NxInput
          id="email"
          name="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
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
        />
        <NxInput
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        {/* Terms and Conditions */}
        <div className="flex items-start">
          <input
            id="terms"
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => {
              setError("");
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
        {error && (
          <div
            className="border px-4 py-3 rounded-lg text-sm"
            style={{
              backgroundColor: '#FEE2E2',
              borderColor: '#FCA5A5',
              color: '#991B1B'
            }}
            role="alert"
          >
            <p>{error}</p>
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