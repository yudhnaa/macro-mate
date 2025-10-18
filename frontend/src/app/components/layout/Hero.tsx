"use client";

import Image from "next/image";
import Link from "next/link";
import { TypeAnimation } from 'react-type-animation';
import { COLORS } from "@/app/utils/constants";

export default function Hero() {
  return (
    <section className="w-full py-10 md:py-10 lg:py-15 xl:py-20 bg-gradient-to-b from-orange-50 to-white overflow-hidden">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="space-y-4">
              <h1 
                className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none min-h-[100px] sm:min-h-[100px]"
                style={{ color: COLORS.text.primary }}
              >
                Put your diet{" "}
                <br />
                on{" "}
                <TypeAnimation
                  sequence={[
                    'autopilot.',
                    3000,
                    'track.',
                    2000,
                    'schedule.',
                    2000,
                    'autopilot.',
                    2000,
                  ]}
                  wrapper="span"
                  speed={50}
                  style={{ color: COLORS.primary.DEFAULT }}
                  repeat={Infinity}
                  cursor={true}
                />
              </h1>
              <p 
                className="max-w-[600px] text-lg md:text-xl leading-relaxed"
                style={{ color: COLORS.text.secondary }}
              >
                Eat This Much creates personalized meal plans based on your food preferences, budget, and schedule. 
                Reach your diet and nutritional goals with our calorie calculator, weekly meal plans, grocery 
                lists and more.
              </p>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <button
                  className="px-8 py-4 text-white text-lg font-semibold rounded-lg shadow-lg transition-all transform hover:scale-105"
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
                  Get Started Free
                </button>
              </Link>
              <Link href="#how-it-works">
                <button
                  className="px-8 py-4 text-lg font-semibold rounded-lg border-2 transition-all"
                  style={{
                    color: COLORS.primary.DEFAULT,
                    borderColor: COLORS.primary.DEFAULT,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.primary.DEFAULT;
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = COLORS.primary.DEFAULT;
                  }}
                >
                  Learn More
                </button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white bg-gray-200"
                    style={{ backgroundColor: COLORS.gray[300] }}
                  />
                ))}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: COLORS.text.primary }}>
                  10,000+ users
                </p>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      style={{ color: '#F59E0B' }}
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Image - Floating Cards */}
          <div className="relative w-full max-w-[600px] mx-auto">
            {/* Main Hero Image - Center */}
            <div className="relative z-10">
              <div className="relative w-full aspect-square animate-float">
                <Image
                  src="/images/hero-1.webp"
                  fill
                  alt="Meal planning on autopilot"
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            </div>

            {/* Floating Card 1 - Top Left */}
            <div 
              className="absolute top-[5%] left-[-5%] bg-white rounded-xl shadow-xl p-3 z-20 animate-float-delayed-1 hover:scale-110 transition-transform"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-bold text-sm">✓</span>
                </div>
                <div>
                  <p className="text-xs font-bold whitespace-nowrap" style={{ color: COLORS.text.primary }}>
                    2,000 cal
                  </p>
                  <p className="text-[10px] whitespace-nowrap" style={{ color: COLORS.text.secondary }}>
                    Daily Goal
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Card 2 - Top Right */}
            <div 
              className="absolute top-[15%] right-[-5%] bg-white rounded-xl shadow-xl p-3 z-20 animate-float-delayed-2 hover:scale-110 transition-transform"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl flex-shrink-0">🥗</span>
                <div>
                  <p className="text-xs font-bold whitespace-nowrap" style={{ color: COLORS.text.primary }}>
                    Healthy
                  </p>
                  <p className="text-[10px] whitespace-nowrap" style={{ color: COLORS.text.secondary }}>
                    Balanced
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Card 3 - Bottom Left */}
            <div 
              className="absolute bottom-[20%] left-[-8%] bg-white rounded-xl shadow-xl p-3 z-20 animate-float-delayed-3 hover:scale-110 transition-transform"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl flex-shrink-0">⏱️</span>
                <div>
                  <p className="text-xs font-bold whitespace-nowrap" style={{ color: COLORS.text.primary }}>
                    15 min
                  </p>
                  <p className="text-[10px] whitespace-nowrap" style={{ color: COLORS.text.secondary }}>
                    Prep Time
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Card 4 - Bottom Right */}
            <div 
              className="absolute bottom-[15%] right-[-8%] bg-white rounded-xl shadow-xl p-3 z-20 animate-float-delayed-4 hover:scale-110 transition-transform"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl flex-shrink-0">💪</span>
                <div>
                  <p className="text-xs font-bold whitespace-nowrap" style={{ color: COLORS.text.primary }}>
                    45g Protein
                  </p>
                  <p className="text-[10px] whitespace-nowrap" style={{ color: COLORS.text.secondary }}>
                    Per Meal
                  </p>
                </div>
              </div>
            </div>

            {/* Background Decoration Circles */}
            <div 
              className="absolute top-[-15%] right-[-10%] w-48 h-48 rounded-full opacity-30 blur-3xl -z-10"
              style={{ backgroundColor: COLORS.primary.light }}
            />
            <div 
              className="absolute bottom-[-15%] left-[-10%] w-40 h-40 rounded-full opacity-30 blur-3xl -z-10"
              style={{ backgroundColor: COLORS.primary.DEFAULT }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}