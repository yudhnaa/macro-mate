"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import NProgress from "nprogress";
import { COLORS } from "@/app/utils/constants";
import Logo from "../icon/Logo";
import ProfileIcon from "../icon/ProfileIcon";
import { useAppSelector } from "@/app/store/hooks";
import { useClickOutside } from "@/app/hooks/useClickOutside";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Close dropdown when clicking outside
  useClickOutside(profileMenuRef, () => setIsProfileMenuOpen(false));

  const handleNavigation = (path: string) => {
    NProgress.start();
    router.push(path);
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur-lg bg-white/80 shadow-sm">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
            prefetch={false}
          >
            <Logo width={32} height={32} style={{ color: COLORS.primary.DEFAULT }} />
            <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent">
              Macro Mate
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link
              href="#diets"
              className="text-sm font-medium transition-colors relative group"
              style={{ color: COLORS.text.secondary }}
              prefetch={false}
            >
              Supported Diets
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full"></span>
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium transition-colors relative group"
              style={{ color: COLORS.text.secondary }}
              prefetch={false}
            >
              Pricing
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full"></span>
            </Link>
            <Link
              href="#professionals"
              className="text-sm font-medium transition-colors relative group"
              style={{ color: COLORS.text.secondary }}
              prefetch={false}
            >
              For Professionals
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full"></span>
            </Link>
            <button
              onClick={() => handleNavigation("/planner")}
              className="text-sm font-medium transition-colors relative group"
              style={{ color: COLORS.text.secondary }}
            >
              Planner
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all group-hover:w-full"></span>
            </button>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              /* Authenticated User Menu */
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-gray-100"
                  style={{ color: COLORS.text.primary }}
                >
                  <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-semibold">
                    {user?.username?.substring(0, 2).toUpperCase() || user?.email?.substring(0, 2).toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-medium">
                    {user?.username || user?.email?.split('@')[0]}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`}
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

                {/* Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white border border-gray-200 py-2 z-50 animate-fadeIn">
                    <button
                      onClick={() => handleNavigation("/planner/profile")}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full"
                    >
                      <ProfileIcon width={18} height={18} />
                      Profile
                    </button>
                    <button
                      onClick={() => handleNavigation("/planner")}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Planner
                    </button>
                    <div className="border-t border-gray-200 my-2"></div>
                    <button
                      onClick={() => handleNavigation("/logout")}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Not Authenticated - Login/Signup Buttons */
              <>
                <button
                  onClick={() => handleNavigation("/login")}
                  className="px-5 py-2 text-sm font-medium rounded-lg transition-all"
                  style={{
                    color: COLORS.text.primary,
                    border: `1px solid ${COLORS.border.DEFAULT}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.background.gray;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Log In
                </button>
                <button
                  onClick={() => handleNavigation("/register")}
                  className="px-5 py-2 text-white text-sm font-medium rounded-lg shadow-lg transition-all transform hover:scale-105"
                  style={{
                    backgroundColor: COLORS.primary.DEFAULT,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.primary.dark;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.primary.DEFAULT;
                  }}
                >
                  Sign Up Free
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg transition-colors"
            style={{ color: COLORS.text.primary }}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <XIcon /> : <MenuIcon />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t animate-slideDown">
            <nav className="flex flex-col gap-4">
              <Link
                href="#diets"
                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                style={{ color: COLORS.text.secondary }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Supported Diets
              </Link>
              <Link
                href="#pricing"
                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                style={{ color: COLORS.text.secondary }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="#professionals"
                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
                style={{ color: COLORS.text.secondary }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                For Professionals
              </Link>
              <button
                onClick={() => handleNavigation("/planner")}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-colors text-left"
                style={{ color: COLORS.text.secondary }}
              >
                Planner
              </button>

              {/* Mobile Auth Buttons */}
              {isAuthenticated ? (
                <div className="flex flex-col gap-2 mt-2 border-t pt-4">
                  <button
                    onClick={() => handleNavigation("/planner/profile")}
                    className="w-full px-5 py-2.5 text-sm font-medium rounded-lg transition-all text-left flex items-center gap-2"
                    style={{
                      color: COLORS.text.primary,
                      border: `1px solid ${COLORS.border.DEFAULT}`,
                    }}
                  >
                    <ProfileIcon width={16} height={16} />
                    Profile
                  </button>
                  <button
                    onClick={() => handleNavigation("/logout")}
                    className="w-full px-5 py-2.5 text-sm font-medium rounded-lg transition-all text-left text-red-600 border border-red-200"
                  >
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2 mt-2">
                  <button
                    onClick={() => handleNavigation("/login")}
                    className="w-full px-5 py-2.5 text-sm font-medium rounded-lg transition-all"
                    style={{
                      color: COLORS.text.primary,
                      border: `1px solid ${COLORS.border.DEFAULT}`,
                    }}
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => handleNavigation("/register")}
                    className="w-full px-5 py-2.5 text-white text-sm font-medium rounded-lg shadow-lg"
                    style={{
                      backgroundColor: COLORS.primary.DEFAULT,
                    }}
                  >
                    Sign Up Free
                  </button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}