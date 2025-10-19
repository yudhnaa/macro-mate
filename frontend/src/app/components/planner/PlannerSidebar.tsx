"use client";

import { usePathname, useRouter } from "next/navigation";
import React from "react";
import NProgress from "nprogress";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { logout } from "@/app/features/auth/authSlice";
import ProfileIcon from "../icon/ProfileIcon";
import PlannerIcon from "../icon/PlannerIcon";
import GroceriesIcon from "../icon/GroceriesIcon";
import DiscoverIcon from "../icon/DiscoverIcon";
import ChatbotIcon from "../icon/ChatbotIcon";
import CustomRecipesIcon from "../icon/CustomRecipesIcon";
import CollectionsIcon from "../icon/CollectionsIcon";
import SavedPlansIcon from "../icon/SavedPlansIcon";
import DietNutritionIcon from "../icon/DietNutritionIcon";
import MealsScheduleIcon from "../icon/MealsScheduleIcon";
import PhysicalStatsIcon from "../icon/PhysicalStatsIcon";
import WeightGoalIcon from "../icon/WeightGoalIcon";
import GeneratorSettingsIcon from "../icon/GeneratorSettingsIcon";

export default function PlannerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleNavigation = (path: string) => {
    if (pathname !== path) {
      NProgress.start();
      router.push(path);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    NProgress.start();
    router.push("/");
  };
  const menuItems = [
    {
      name: "Profile",
      icon: <ProfileIcon />,
      path: "/planner/profile",
    },
    {
      name: "Planner",
      icon: <PlannerIcon />,
      path: "/planner",
    },
    {
      name: "Discover",
      icon: <DiscoverIcon />,
      path: "/planner/discover",
    },
    {
      name: "Chatbot",
      icon: <ChatbotIcon />,
      path: "/planner/chatbot",
    },
    {
      name: "Groceries",
      icon: <GroceriesIcon />,
      path: "/groceries",
    },
    {
      name: "Custom Recipes",
      icon: <CustomRecipesIcon />,
      path: "/custom-recipes",
    },
    {
      name: "Collections",
      icon: <CollectionsIcon />,
      path: "/collections",
    },
    {
      name: "Saved Plans",
      icon: <SavedPlansIcon />,
      path: "/saved-plans",
    },
  ];

  const settingsMenu = [
    {
      name: "Diet & Nutrition",
      icon: <DietNutritionIcon />,
      path: "/diet-nutrition",
    },
    {
      name: "Meals & Schedule",
      icon: <MealsScheduleIcon />,
      path: "/meals-schedule",
    },
    {
      name: "Physical Stats",
      icon: <PhysicalStatsIcon />,
      path: "/physical-stats",
    },
    {
      name: "Weight and Goal",
      icon: <WeightGoalIcon />,
      path: "/weight-goal",
    },
    {
      name: "Generator Settings",
      icon: <GeneratorSettingsIcon />,
      path: "/generator-settings",
    },
  ];

  const accountMenu = [
    {
      name: "Credentials",
      path: "/credentials",
    },
    {
      name: "Linked Accounts",
      path: "/linked-accounts",
    },
    {
      name: "Notifications",
      path: "/notifications",
    },
    {
      name: "Subscription",
      path: "/subscription",
    },
  ];

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-screen overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <button className="p-2 rounded-lg hover:bg-gray-100">
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <button className="p-2 rounded-lg hover:bg-gray-100">
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          </button>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold">
            {user?.username?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase() || "U"}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-800">
              {user?.username || user?.email?.split('@')[0] || "User"}
            </p>
            <span className="inline-block px-2 py-1 text-xs bg-orange-500 text-white rounded">
              What&apos;s in Premium?
            </span>
          </div>
        </div>
      </div>

      {/* Main Menu */}
      <nav className="flex-1 py-4">
        <div className="px-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors w-full ${
                  isActive
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}
        </div>

        {/* Settings Section */}
        <div className="mt-6 px-4">
          {settingsMenu.map((item, index) => {
            const isActive = pathname === item.path;
            const hasSubMenu = index === 4; // Generator Settings has submenu
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors w-full ${
                  isActive
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {item.icon}
                <span className="font-medium flex-1 text-left">
                  {item.name}
                </span>
                {hasSubMenu && (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {/* Account Section */}
        <div className="mt-6 px-4">
          <button className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 w-full">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="font-medium flex-1 text-left">Account</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Account submenu */}
          <div className="ml-4 mt-1 space-y-1">
            {accountMenu.map((item) => (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg w-full text-left"
              >
                {item.name}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-6 px-4 space-y-1">
          <button
            onClick={() => handleNavigation("/invite")}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 w-full"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            <span className="font-medium">Invite Friends</span>
          </button>

          <button
            onClick={() => handleNavigation("/help")}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 w-full"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-medium">Help</span>
          </button>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => handleNavigation("/")}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 w-full"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span className="font-medium">Home</span>
        </button>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 w-full transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span className="font-medium">Log Out</span>
        </button>

        <div className="mt-4 flex items-center gap-2">
          <span className="text-orange-500 font-bold text-lg">Macro Mate</span>
          <svg
            className="w-6 h-6 text-orange-500"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>
      </div>
    </aside>
  );
}
