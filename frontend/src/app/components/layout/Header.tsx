"use client";

import Link from "next/link";
import { useState } from "react";
import { COLORS } from "@/app/utils/constants";
import Logo from "../icon/Logo";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/login">
              <button
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
            </Link>
            <Link href="/register">
              <button
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
            </Link>
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
              <div className="flex flex-col gap-2 mt-2">
                <Link href="/login">
                  <button
                    className="w-full px-5 py-2.5 text-sm font-medium rounded-lg transition-all"
                    style={{
                      color: COLORS.text.primary,
                      border: `1px solid ${COLORS.border.DEFAULT}`,
                    }}
                  >
                    Log In
                  </button>
                </Link>
                <Link href="/register">
                  <button
                    className="w-full px-5 py-2.5 text-white text-sm font-medium rounded-lg shadow-lg"
                    style={{
                      backgroundColor: COLORS.primary.DEFAULT,
                    }}
                  >
                    Sign Up Free
                  </button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

function CarrotIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M2.27 21.68c.13-.34.35-.68.6-.97C4.43 19.08 6.4 16 6.4 16c0-2-1.4-4-2-6 .5-2 2-4 4-4s4 2 4 4c-1.5 1-2 3-2 6 0 0 2.55 3.5 4.05 5.18.3.33.53.7.62 1.05" />
      <path d="M12.5 12.5c0-2-1-4-2.5-6" />
      <path d="M12.5 12.5c0-2-1-4-2.5-6" />
      <path d="m16.5 16.5-3-3" />
      <path d="m13.5 13.5 3 3" />
      <path d="M16.5 16.5c2-2 4-4 4-6s-2-4-4-4-4 2-4 4" />
      <path d="M18 8c-2 0-4 2-4 4 0 2 2 4 4 4s4-2 4-4-2-4-4-4z" />
    </svg>
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