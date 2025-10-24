"use client";

import React from "react";
import { FilterOptions } from "@/types/collection.types";

interface FilterBarProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  totalImages: number;
  selectedCount: number;
  onSelectAll: () => void;
  onAnalyze: () => void;
}

export default function FilterBar({
  filters,
  onFilterChange,
  totalImages,
  selectedCount,
  onSelectAll,
  onAnalyze,
}: FilterBarProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-6 space-y-3 sm:space-y-4">
      {/* Filters Row */}
      <div className="flex flex-wrap gap-3 sm:gap-4">
        {/* Start Date */}
        <div className="flex-1 min-w-[140px] sm:min-w-[200px]">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            From Date
          </label>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
            className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* End Date */}
        <div className="flex-1 min-w-[140px] sm:min-w-[200px]">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            To Date
          </label>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
            className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>

        {/* Meal Type */}
        <div className="flex-1 min-w-[140px] sm:min-w-[200px]">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Meal Type
          </label>
          <select
            value={filters.mealType || 'all'}
            onChange={(e) => onFilterChange({ ...filters, mealType: e.target.value as FilterOptions['mealType'] })}
            className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Meals</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
        </div>

        {/* Clear Filters */}
        <div className="flex items-end w-full sm:w-auto">
          <button
            onClick={() => onFilterChange({ mealType: 'all' })}
            className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Actions Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t pt-3 sm:pt-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onSelectAll}
            className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            {selectedCount === totalImages && totalImages > 0 ? 'Deselect All' : 'Select All'}
          </button>
          <span className="text-xs sm:text-sm text-gray-500">
            {selectedCount > 0 ? `${selectedCount} selected` : `${totalImages} images`}
          </span>
        </div>

        {selectedCount > 0 && (
          <button
            onClick={onAnalyze}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            Analyze Nutrition
          </button>
        )}
      </div>
    </div>
  );
}
