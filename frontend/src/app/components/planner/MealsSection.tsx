'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import AlertTriangleIcon from '../icon/AlertTriangleIcon';
import RefreshIcon from '../icon/RefreshIcon';
import MoreVerticalIcon from '../icon/MoreVerticalIcon';
import UploadImageModal from '../collections/UploadImageModal';
import { FoodImage } from '@/types/collection.types';

interface MealsSectionProps {
  selectedDate?: Date;
}

export default function MealsSection({ selectedDate = new Date() }: MealsSectionProps) {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('lunch');
  const [mealImages, setMealImages] = useState<{ [key: string]: FoodImage[] }>({
    breakfast: [],
    lunch: [],
    dinner: [],
  });

  const meals: Array<{ type: 'breakfast' | 'lunch' | 'dinner'; label: string; icon: string }> = [
    { type: 'breakfast', label: 'Breakfast', icon: '🌅' },
    { type: 'lunch', label: 'Lunch', icon: '☀️' },
    { type: 'dinner', label: 'Dinner', icon: '🌙' },
  ];

  const handleAddImage = (mealType: 'breakfast' | 'lunch' | 'dinner') => {
    setSelectedMealType(mealType);
    setShowUploadModal(true);
  };

  const handleUploadSuccess = (newImage: FoodImage) => {
    setMealImages(prev => ({
      ...prev,
      [selectedMealType]: [...(prev[selectedMealType] || []), newImage]
    }));
    setShowUploadModal(false);
  };

  const handleRemoveImage = (mealType: string, imageId: string) => {
    setMealImages(prev => ({
      ...prev,
      [mealType]: prev[mealType]?.filter(img => img.id !== imageId) || []
    }));
  };

  return (
    <>
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-800">Today&apos;s Meals</h2>
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangleIcon className="w-5 h-5 text-orange-500" />
              <span className="text-gray-600">0 / 2008</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <RefreshIcon className="w-5 h-5 text-gray-600" />
            </button>
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              <MoreVerticalIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {meals.map((meal) => (
            <div key={meal.type} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
              {/* Meal Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{meal.icon}</span>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">{meal.label}</h3>
                    <p className="text-sm text-gray-500">
                      {mealImages[meal.type]?.length || 0} {mealImages[meal.type]?.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleAddImage(meal.type)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Photo
                </button>
              </div>

              {/* Meal Images Grid */}
              {mealImages[meal.type]?.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      {/* Nutrition badge if analyzed */}
                      {image.analyzed && image.nutritionInfo && (
                        <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                          {image.nutritionInfo.calories} cal
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                  <svg className="w-12 h-12 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500 text-sm">No food photos yet</p>
                  <p className="text-gray-400 text-xs mt-1">Add photos to track your meal</p>
                </div>
              )}

              {/* Quick Stats */}
              {mealImages[meal.type]?.length > 0 && (
                <div className="mt-4 flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Total Calories:</span>
                    <span className="font-semibold text-gray-800">
                      {mealImages[meal.type].reduce((sum, img) => sum + (img.nutritionInfo?.calories || 0), 0)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Protein:</span>
                    <span className="font-semibold text-gray-800">
                      {mealImages[meal.type].reduce((sum, img) => sum + (img.nutritionInfo?.protein || 0), 0)}g
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
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
