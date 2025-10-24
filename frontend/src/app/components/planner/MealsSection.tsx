'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import AlertTriangleIcon from '../icon/AlertTriangleIcon';
import RefreshIcon from '../icon/RefreshIcon';
import MoreVerticalIcon from '../icon/MoreVerticalIcon';
import UploadImageModal from '../collections/UploadImageModal';
import { FoodImage } from '@/types/collection.types';
import { getMealHistory, MealHistoryItem } from '@/lib/api/analysis.api';

interface MealsSectionProps {
  selectedDate?: Date;
  mealImages?: { [key: string]: FoodImage[] };
  onMealImagesChange?: (images: { [key: string]: FoodImage[] }) => void;
}

// Transform API meal data to FoodImage format
const transformMealToFoodImage = (meal: MealHistoryItem): FoodImage => {
  return {
    id: meal.id.toString(),
    imageUrl: meal.image_url,
    date: meal.meal_time ? meal.meal_time.split('T')[0] : new Date().toISOString().split('T')[0],
    mealType: meal.meal_type,
    analyzed: meal.analysis_status === 'completed',
    createdAt: meal.created_at || new Date().toISOString(),
    dishName: meal.meal_name,
    nutritionInfo: {
      calories: meal.nutrition_summary.total_calories,
      protein: meal.nutrition_summary.total_protein,
      carbs: meal.nutrition_summary.total_carbs,
      fat: meal.nutrition_summary.total_fat,
      fiber: meal.nutrition_summary.total_fiber,
      sodium: meal.nutrition_summary.total_sodium,
    },
  };
};

export default function MealsSection({ 
  selectedDate = new Date(),
  mealImages: externalMealImages,
  onMealImagesChange
}: MealsSectionProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [internalMealImages, setInternalMealImages] = useState<{ [key: string]: FoodImage[] }>({
    breakfast: [],
    lunch: [],
    dinner: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Use external state if provided, otherwise use internal state
  const mealImages = externalMealImages ?? internalMealImages;
  const updateMealImages = onMealImagesChange ?? setInternalMealImages;

  // Fetch meals for the selected date
  useEffect(() => {
    const fetchMealsForDate = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await getMealHistory({ limit: 100 });
        const transformedImages = response.meals.map(transformMealToFoodImage);
        
        // Filter meals by selected date
        const selectedDateStr = selectedDate.toISOString().split('T')[0];
        const mealsForDate = transformedImages.filter(meal => meal.date === selectedDateStr);
        
        // Group meals by type
        const groupedMeals: { [key: string]: FoodImage[] } = {
          breakfast: mealsForDate.filter(m => m.mealType === 'breakfast'),
          lunch: mealsForDate.filter(m => m.mealType === 'lunch'),
          dinner: mealsForDate.filter(m => m.mealType === 'dinner'),
        };
        
        updateMealImages(groupedMeals);
      } catch (err) {
        console.error('Failed to fetch meals:', err);
        setError('Failed to load meals for this date');
      } finally {
        setLoading(false);
      }
    };

    fetchMealsForDate();
  }, [selectedDate, updateMealImages]); // Re-fetch when date changes

  const meals: Array<{ type: 'breakfast' | 'lunch' | 'dinner'; label: string;  }> = [
    { type: 'breakfast', label: 'Breakfast' },
    { type: 'lunch', label: 'Lunch' },
    { type: 'dinner', label: 'Dinner' },
  ];

  const handleAddImage = (mealType: 'breakfast' | 'lunch' | 'dinner') => {
    setSelectedMealType(mealType);
    setShowUploadModal(true);
  };

  const handleUploadSuccess = (newImage: FoodImage) => {
    // Add the new image to the appropriate meal type
    const currentMeals = mealImages[selectedMealType] || [];
    const updatedMeals = {
      ...mealImages,
      [selectedMealType]: [...currentMeals, newImage]
    };
    
    if (onMealImagesChange) {
      // Using external state
      onMealImagesChange(updatedMeals);
    } else {
      // Using internal state
      setInternalMealImages(updatedMeals);
    }
    
    setShowUploadModal(false);
  };

  const handleRemoveImage = (mealType: string, imageId: string) => {
    if (onMealImagesChange) {
      // Using external state
      onMealImagesChange({
        ...mealImages,
        [mealType]: mealImages[mealType]?.filter((img: FoodImage) => img.id !== imageId) || []
      });
    } else {
      // Using internal state
      setInternalMealImages(prev => ({
        ...prev,
        [mealType]: prev[mealType]?.filter((img: FoodImage) => img.id !== imageId) || []
      }));
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Today&apos;s Meals</h2>
            <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <AlertTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
              <span className="text-gray-600">
                {Object.values(mealImages).flat().reduce((sum: number, img: FoodImage) => sum + (img.nutritionInfo?.calories || 0), 0)} / 2008
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button 
              onClick={() => {
                // Re-fetch meals
                window.location.reload();
              }}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
              disabled={loading}
            >
              <RefreshIcon className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <MoreVerticalIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs sm:text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-6 sm:py-8">
            <svg
              className="animate-spin h-6 w-6 sm:h-8 sm:w-8 text-orange-500 mx-auto mb-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <p className="text-gray-600 text-xs sm:text-sm">Loading meals...</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {meals.map((meal) => (
            <div key={meal.type} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-gray-300 transition-colors">
              {/* Meal Header */}
              <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-800 text-base sm:text-lg">{meal.label}</h3>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {mealImages[meal.type]?.length || 0} {mealImages[meal.type]?.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleAddImage(meal.type)}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0"
                >
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="hidden xs:inline">Add Photo</span>
                  <span className="xs:hidden">Add</span>
                </button>
              </div>

              {/* Meal Images Grid */}
              {mealImages[meal.type]?.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                  {mealImages[meal.type].map((image) => (
                    <div key={image.id} className="relative aspect-square group">
                      <Image
                        src={image.imageUrl}
                        alt={`${meal.label} food`}
                        fill
                        className="object-cover rounded-lg"
                      />
                      {/* Remove button */}
                      <button
                        onClick={() => handleRemoveImage(meal.type, image.id)}
                        className="absolute top-1 right-1 sm:top-2 sm:right-2 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      {/* Nutrition badge if analyzed */}
                      {image.analyzed && image.nutritionInfo && (
                        <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 bg-black/70 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[10px] sm:text-xs">
                          {image.nutritionInfo.calories} cal
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <svg className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500 text-xs sm:text-sm">No food photos yet</p>
                  <p className="text-gray-400 text-[10px] sm:text-xs mt-1">Add photos to track your meal</p>
                </div>
              )}

              {/* Quick Stats */}
              {mealImages[meal.type]?.length > 0 && (
                <div className="mt-3 sm:mt-4 flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className="text-gray-500">Total Calories:</span>
                    <span className="font-semibold text-gray-800">
                      {mealImages[meal.type].reduce((sum: number, img: FoodImage) => sum + (img.nutritionInfo?.calories || 0), 0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className="text-gray-500">Protein:</span>
                    <span className="font-semibold text-gray-800">
                      {mealImages[meal.type].reduce((sum: number, img: FoodImage) => sum + (img.nutritionInfo?.protein || 0), 0).toFixed(1)}g
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadImageModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
          initialMealType={selectedMealType}
          initialDate={selectedDate}
        />
      )}
    </>
  );
}
