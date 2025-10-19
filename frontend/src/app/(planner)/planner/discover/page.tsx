'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import MenuIcon from '@/app/components/icon/MenuIcon';
import MoonIcon from '@/app/components/icon/MoonIcon';
import FilterIcon from '@/app/components/icon/FilterIcon';
import SearchIcon from '@/app/components/icon/SearchIcon';
import GridIcon from '@/app/components/icon/GridIcon';
import ChevronDownIcon from '@/app/components/icon/ChevronDownIcon';
import ImageIcon from '@/app/components/icon/ImageIcon';

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
              <MenuIcon className="w-6 h-6 text-gray-600" />
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100">
              <MoonIcon className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Center - Filter and Tabs */}
          <div className="flex items-center gap-4">
            {/* Filter Button */}
            <button className="flex items-center gap-2 px-4 py-2 border-2 border-orange-500 text-orange-500 rounded-full hover:bg-orange-50 transition-colors">
              <FilterIcon className="w-5 h-5" />
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
              <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
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
                <GridIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <MenuIcon className="w-5 h-5" />
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
            <ChevronDownIcon className="w-6 h-6 text-gray-400" />
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
                    <ImageIcon className="w-20 h-20" />
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