"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/app/store/hooks";
import { logout } from "@/app/features/auth/authSlice";
import LoadingSpinner from "@/app/components/layout/LoadingSpinner";

export default function LogoutPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(logout());

    const timer = setTimeout(() => {
      router.push("/");
    }, 1000);

    return () => clearTimeout(timer);
  }, [dispatch, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner text="Logging out..." />
        <p className="mt-4 text-gray-600">You are being logged out...</p>
      </div>
    </div>
  );
}
