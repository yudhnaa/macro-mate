'use client';

import React from 'react';
import DateNavigator from '@/app/components/planner/DateNavigator';
import MealsSection from '@/app/components/planner/MealsSection';
import NutritionPanel from '@/app/components/planner/NutritionPanel';

export default function PlannerPage() {
  const [selectedDate, setSelectedDate] = React.useState(new Date());

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    console.log('Date changed to:', date);
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Date Navigator */}
        <DateNavigator onDateChange={handleDateChange} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Meals Section - Takes 2 columns */}
          <div className="lg:col-span-2">
            <MealsSection selectedDate={selectedDate} />
          </div>

          {/* Nutrition Panel - Takes 1 column */}
          <div className="lg:col-span-1">
            <NutritionPanel />
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-6 flex justify-between items-center">
          <button className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>Thursday, Oct 16</span>
          </button>

          <button className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <span>Saturday, Oct 18</span>
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
