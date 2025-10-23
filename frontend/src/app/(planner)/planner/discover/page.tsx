'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import MenuIcon from '@/app/components/icon/MenuIcon';
import MoonIcon from '@/app/components/icon/MoonIcon';
import FilterIcon from '@/app/components/icon/FilterIcon';
import SearchIcon from '@/app/components/icon/SearchIcon';
import GridIcon from '@/app/components/icon/GridIcon';
import ChevronDownIcon from '@/app/components/icon/ChevronDownIcon';
import ImageIcon from '@/app/components/icon/ImageIcon';

import { getFoods } from '@/lib/api/food.api';
import { Food } from '@/types/food.types';
import FoodDetailModal from '@/app/components/common/FoodDetailModal';

export default function DiscoverPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'my-food' | 'my-collections'>('my-food');
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const ITEMS_PER_PAGE = 20;

  // Fetch foods from API
  const fetchFoods = async (skip: number, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const data = await getFoods({
        skip,
        limit: ITEMS_PER_PAGE,
        search: searchQuery || undefined,
      });

      if (append) {
        setFoods(prev => [...prev, ...data]);
      } else {
        setFoods(data);
      }

      // Check if there are more items
      setHasMore(data.length === ITEMS_PER_PAGE);

    } catch (err) {
      const errorMessage = (err as { detail?: string })?.detail || 'Failed to load foods';
      setError(errorMessage);
      console.error('Error fetching foods:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    setPage(0);
    fetchFoods(0, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Load more
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFoods(nextPage * ITEMS_PER_PAGE, true);
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle food click
  const handleFoodClick = (food: Food) => {
    setSelectedFood(food);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFood(null);
  };

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
                value={searchQuery}
                onChange={handleSearch}
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
            <h2 className="text-2xl font-semibold text-gray-800">
              Results ({foods.length} foods)
            </h2>
            <ChevronDownIcon className="w-6 h-6 text-gray-400" />
          </div>

          {/* Loading State */}
          {loading && foods.length === 0 && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Food Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {foods.map((food) => (
              <div
                key={food.id}
                onClick={() => handleFoodClick(food)}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
              >
                {/* Food Image */}
                <div className="relative h-48 bg-gray-200">
                  {food.image_url ? (
                    <Image
                      src={food.image_url}
                      alt={food.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 20vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-20 h-20" />
                    </div>
                  )}
                </div>

                {/* Food Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                    {food.name}
                  </h3>

                  {/* Meal Type Tags */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {food.is_breakfast && (
                      <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                        Breakfast
                      </span>
                    )}
                    {food.is_lunch && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                        Lunch
                      </span>
                    )}
                    {food.is_dinner && (
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        Dinner
                      </span>
                    )}
                    {food.is_snack && (
                      <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                        Snack
                      </span>
                    )}
                  </div>

                  {/* Time Info */}
                  {food.total_time && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-400 to-blue-500"></div>
                      <span className="text-sm text-gray-600">
                        {food.total_time} mins
                      </span>
                    </div>
                  )}

                  {/* Complexity */}
                  {food.complexity && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-xs text-gray-500">
                        Complexity: {food.complexity}/10
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {!loading && foods.length === 0 && !error && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">No foods found</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
            </div>
          )}

          {/* Load More Button */}
          {!loading && hasMore && foods.length > 0 && (
            <div className="flex justify-center mt-8 mb-8">
              <button
                onClick={handleLoadMore}
                className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium shadow-md hover:shadow-lg"
              >
                See More
              </button>
            </div>
          )}

          {/* Loading More Indicator */}
          {loading && foods.length > 0 && (
            <div className="flex justify-center mt-8 mb-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          )}
        </div>
      </main>

      {/* Food Detail Modal */}
      {selectedFood && (
        <FoodDetailModal
          food={selectedFood}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
