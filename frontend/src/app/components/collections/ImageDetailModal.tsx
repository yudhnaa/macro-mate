"use client";

import React from "react";
import Image from "next/image";
import { FoodImage } from "@/types/collection.types";

interface ImageDetailModalProps {
  image: FoodImage;
  onClose: () => void;
  onDelete: (imageId: string) => void;
  onUpdate: (image: FoodImage) => void;
}

export default function ImageDetailModal({
  image,
  onClose,
  onDelete,
}: ImageDetailModalProps) {
  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return 'bg-yellow-100 text-yellow-800';
      case 'lunch':
        return 'bg-green-100 text-green-800';
      case 'dinner':
        return 'bg-blue-100 text-blue-800';
      case 'snack':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">Food Details</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDelete(image.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Image */}
          <div className="relative rounded-lg overflow-hidden bg-gray-100 h-96">
            <Image
              src={image.imageUrl}
              alt={`Food from ${formatDate(image.date)}`}
              fill
              className="object-contain"
            />
          </div>

          {/* Meta Information */}
          <div className="flex items-center justify-between">
            <div>
              {image.dishName && (
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {image.dishName}
                </h3>
              )}
              <p className="text-lg font-semibold text-gray-700">
                {formatDate(image.date)}
              </p>
              <p className="text-sm text-gray-500">
                Uploaded on {new Date(image.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getMealTypeColor(
                  image.mealType
                )}`}
              >
                {image.mealType}
              </span>
              {image.analyzed && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Analyzed
                </span>
              )}
            </div>
          </div>

          {/* Safety Information */}
          {image.safety && (
            <div className={`rounded-lg p-4 ${
              image.safety.is_food && !image.safety.is_potentially_poisonous
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                <svg
                  className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                    image.safety.is_food && !image.safety.is_potentially_poisonous
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="flex-1">
                  <h4 className={`font-semibold ${
                    image.safety.is_food && !image.safety.is_potentially_poisonous
                      ? 'text-green-800'
                      : 'text-red-800'
                  }`}>
                    Safety Check
                  </h4>
                  <p className={`text-sm mt-1 ${
                    image.safety.is_food && !image.safety.is_potentially_poisonous
                      ? 'text-green-700'
                      : 'text-red-700'
                  }`}>
                    {image.safety.reason}
                  </p>
                  <p className="text-xs mt-1 text-gray-600">
                    Confidence: {(image.safety.confidence * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Nutrition Information */}
          {image.nutritionInfo ? (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Nutrition Information
              </h4>

              {/* Ingredients Detail */}
              {image.ingredients && image.ingredients.length > 0 && (
                <div className="mb-6">
                  <h5 className="font-semibold text-gray-700 mb-3">Ingredients</h5>
                  <div className="space-y-3">
                    {image.ingredients.map((ingredient, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h6 className="font-semibold text-gray-900">{ingredient.name}</h6>
                          <span className="text-sm text-gray-600">
                            ~{ingredient.estimated_weight}g
                          </span>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                          <div className="text-center">
                            <div className="text-gray-500">Cal</div>
                            <div className="font-semibold">{ingredient.nutrition.calories}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-500">Protein</div>
                            <div className="font-semibold">{ingredient.nutrition.protein}g</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-500">Fat</div>
                            <div className="font-semibold">{ingredient.nutrition.fat}g</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-500">Carbs</div>
                            <div className="font-semibold">{ingredient.nutrition.carbs}g</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-500">Fiber</div>
                            <div className="font-semibold">{ingredient.nutrition.fiber}g</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-500">Sodium</div>
                            <div className="font-semibold">{ingredient.nutrition.sodium}g</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Main Macros */}
              <h5 className="font-semibold text-gray-700 mb-3">Total Nutrition</h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {image.nutritionInfo.calories}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Calories</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {image.nutritionInfo.protein}g
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Protein</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {image.nutritionInfo.carbs}g
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Carbs</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-yellow-600">
                    {image.nutritionInfo.fat}g
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Fat</div>
                </div>
              </div>

              {/* Additional Info */}
              {(image.nutritionInfo.fiber !== undefined ||
                image.nutritionInfo.sugar !== undefined ||
                image.nutritionInfo.sodium !== undefined) && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-700 mb-3">Additional Details</h5>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    {image.nutritionInfo.fiber !== undefined && (
                      <div>
                        <span className="text-gray-600">Fiber:</span>
                        <span className="font-semibold ml-2">{image.nutritionInfo.fiber}g</span>
                      </div>
                    )}
                    {image.nutritionInfo.sugar !== undefined && (
                      <div>
                        <span className="text-gray-600">Sugar:</span>
                        <span className="font-semibold ml-2">{image.nutritionInfo.sugar}g</span>
                      </div>
                    )}
                    {image.nutritionInfo.sodium !== undefined && (
                      <div>
                        <span className="text-gray-600">Sodium:</span>
                        <span className="font-semibold ml-2">{image.nutritionInfo.sodium}g</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Food Items */}
              {image.nutritionInfo.foodItems && image.nutritionInfo.foodItems.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-700 mb-3">Detected Food Items</h5>
                  <div className="flex flex-wrap gap-2">
                    {image.nutritionInfo.foodItems.map((item, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 border border-gray-200"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <svg
                className="w-16 h-16 mx-auto text-gray-300 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <p className="text-gray-600">No nutrition information available yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Select this image and click &quot;Analyze Nutrition&quot; to get details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
