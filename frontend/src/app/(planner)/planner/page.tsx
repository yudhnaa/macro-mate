'use client';

import React from 'react';
import DateNavigator from '@/app/components/planner/DateNavigator';
import MealsSection from '@/app/components/planner/MealsSection';
import NutritionPanel from '@/app/components/planner/NutritionPanel';
import { FoodImage } from '@/types/collection.types';

export default function PlannerPage() {
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [mealImages, setMealImages] = React.useState<{ [key: string]: FoodImage[] }>({
    breakfast: [],
    lunch: [],
    dinner: [],
  });

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    console.log('Date changed to:', date);
  };

  // Calculate total nutrition from all meals
  const calculateTotalNutrition = React.useMemo(() => {
    const allMeals = [...mealImages.breakfast, ...mealImages.lunch, ...mealImages.dinner];

    return allMeals.reduce(
      (totals, meal) => ({
        calories: totals.calories + (meal.nutritionInfo?.calories || 0),
        protein: totals.protein + (meal.nutritionInfo?.protein || 0),
        carbs: totals.carbs + (meal.nutritionInfo?.carbs || 0),
        fat: totals.fat + (meal.nutritionInfo?.fat || 0),
        fiber: totals.fiber + (meal.nutritionInfo?.fiber || 0),
        sodium: totals.sodium + (meal.nutritionInfo?.sodium || 0),
        cholesterol: 0, // Not tracked in current API
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0, cholesterol: 0 }
    );
  }, [mealImages]);

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Date Navigator */}
        <DateNavigator onDateChange={handleDateChange} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Meals Section - Takes 2 columns */}
          <div className="lg:col-span-2">
            <MealsSection
              selectedDate={selectedDate}
              mealImages={mealImages}
              onMealImagesChange={setMealImages}
            />
          </div>

          {/* Nutrition Panel - Takes 1 column */}
          <div className="lg:col-span-1">
            <NutritionPanel data={calculateTotalNutrition} />
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-4 lg:mt-6 flex justify-between items-center gap-2">
          <button
            onClick={() => {
              const prevDate = new Date(selectedDate);
              prevDate.setDate(prevDate.getDate() - 1);
              handleDateChange(prevDate);
            }}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm sm:text-base"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="hidden sm:inline">Previous Day</span>
            <span className="sm:hidden">Previous</span>
          </button>

          <button
            onClick={() => {
              const nextDate = new Date(selectedDate);
              nextDate.setDate(nextDate.getDate() + 1);
              handleDateChange(nextDate);
            }}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm sm:text-base"
          >
            <span className="hidden sm:inline">Next Day</span>
            <span className="sm:hidden">Next</span>
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
