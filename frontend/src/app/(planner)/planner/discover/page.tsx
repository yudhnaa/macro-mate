'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface Food {
  id: string;
  name: string;
  calories: number;
  image: string;
}

export default function DiscoverPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'my-food' | 'my-collections'>('my-food');

  // Sample data - replace with real data from API
  const foods: Food[] = [
    {
      id: '1',
      name: 'Easy Hard-Boiled Eggs',
      calories: 72,
      image: '/images/foods/eggs.jpg',
    },
    {
      id: '2',
      name: 'Chicken Caesar Salad',
      calories: 358,
      image: '/images/foods/chicken-salad.jpg',
    },
    {
      id: '3',
      name: 'Simple Spinach Scramble',
      calories: 252,
      image: '/images/foods/spinach-scramble.jpg',
    },
    {
      id: '4',
      name: 'Basic scrambled eggs',
      calories: 273,
      image: '/images/foods/scrambled-eggs.jpg',
    },
    {
      id: '5',
      name: 'Easy Grilled Chicken Teriyaki',
      calories: 373,
      image: '/images/foods/chicken-teriyaki.jpg',
    },
    {
      id: '6',
      name: 'Microwaved sweet potato',
      calories: 112,
      image: '/images/foods/sweet-potato.jpg',
    },
    {
      id: '7',
      name: 'All American Tuna',
      calories: 317,
      image: '/images/foods/tuna.jpg',
    },
    {
      id: '8',
      name: 'Easy Grilled Chicken',
      calories: 316,
      image: '/images/foods/grilled-chicken.jpg',
    },
    {
      id: '9',
      name: 'Tuna Salad',
      calories: 237,
      image: '/images/foods/tuna-salad.jpg',
    },
    {
      id: '10',
      name: 'Easy Garlic Chicken',
      calories: 225,
      image: '/images/foods/garlic-chicken.jpg',
    },
    {
      id: '11',
      name: 'Coconut Milk Protein Shake',
      calories: 360,
      image: '/images/foods/protein-shake.jpg',
    },
    {
      id: '12',
      name: 'Easy To Peel Hard-Boiled Eggs',
      calories: 144,
      image: '/images/foods/hard-boiled-eggs.jpg',
    },
  ];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Menu and Dark mode */}
          <div className="flex items-center gap-3">
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

          {/* Center - Filter and Tabs */}
          <div className="flex items-center gap-4">
            {/* Filter Button */}
            <button className="flex items-center gap-2 px-4 py-2 border-2 border-orange-500 text-orange-500 rounded-full hover:bg-orange-50 transition-colors">
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
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              <span className="font-medium">Filters (1)</span>
            </button>

            {/* Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('my-food')}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  activeTab === 'my-food'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                My Food
              </button>
              <button
                onClick={() => setActiveTab('my-collections')}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  activeTab === 'my-collections'
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                My Collections
              </button>
            </div>
          </div>

          {/* Right side - Search and View Toggle */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search Foods..."
                className="w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <svg
                className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
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
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
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
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1600px] mx-auto p-6">
          {/* Results Header */}
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Results</h2>
            <svg
              className="w-6 h-6 text-gray-400"
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
          </div>

          {/* Food Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-6">
            {foods.map((food) => (
              <div
                key={food.id}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
              >
                {/* Food Image */}
                <div className="relative h-48 bg-gray-200">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    {/* Placeholder - replace with actual image */}
                    <svg
                      className="w-20 h-20"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Food Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors">
                    {food.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-400 to-blue-500"></div>
                    <span className="text-sm text-gray-600">
                      {food.calories} Calories
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}