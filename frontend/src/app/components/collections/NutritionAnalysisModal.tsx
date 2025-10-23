"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FoodImage, NutritionAnalysisResult, NutritionInfo } from "@/types/collection.types";

interface NutritionAnalysisModalProps {
  imageIds: string[];
  images: FoodImage[];
  onClose: () => void;
}

export default function NutritionAnalysisModal({
  imageIds,
  images,
  onClose,
}: NutritionAnalysisModalProps) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<NutritionAnalysisResult | null>(null);

  const performAnalysis = React.useCallback(async () => {
    setLoading(true);

    // Simulate API call với mock data
    setTimeout(() => {
      // Tính tổng nutrition từ các images đã chọn
      const totalNutrition: NutritionInfo = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      };

      const breakdown = images.map((image) => {
        const contribution = image.nutritionInfo || {
          calories: 350,
          protein: 15,
          carbs: 45,
          fat: 12,
        };

        totalNutrition.calories += contribution.calories;
        totalNutrition.protein += contribution.protein;
        totalNutrition.carbs += contribution.carbs;
        totalNutrition.fat += contribution.fat;

        return {
          imageId: image.id,
          contribution,
        };
      });

      const analysisResult: NutritionAnalysisResult = {
        selectedImages: images,
        totalNutrition,
        advice: `Based on your ${images.length} selected meal(s), you've consumed a total of ${totalNutrition.calories} calories.

Your macro breakdown shows ${totalNutrition.protein}g of protein (${((totalNutrition.protein * 4 / totalNutrition.calories) * 100).toFixed(0)}%), ${totalNutrition.carbs}g of carbs (${((totalNutrition.carbs * 4 / totalNutrition.calories) * 100).toFixed(0)}%), and ${totalNutrition.fat}g of fat (${((totalNutrition.fat * 9 / totalNutrition.calories) * 100).toFixed(0)}%).

Recommendations:
• Try to maintain a balanced intake of proteins, carbs, and healthy fats
• Consider adding more vegetables if not already present
• Stay hydrated throughout the day
• If you're trying to lose weight, aim for a caloric deficit while maintaining adequate protein intake
• For muscle building, ensure sufficient protein (1.6-2.2g per kg of body weight)`,
        breakdown,
      };

      setResult(analysisResult);
      setLoading(false);
    }, 2000);
  }, [images]);

  useEffect(() => {
    performAnalysis();
  }, [performAnalysis]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">Nutrition Analysis</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mb-4"></div>
              <p className="text-gray-600">Analyzing {imageIds.length} image(s)...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
            </div>
          ) : result ? (
            <div className="space-y-6">
              {/* Selected Images */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Analyzed Images ({images.length})
                </h3>
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                  {images.map((image) => (
                    <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden group">
                      <Image
                        src={image.imageUrl}
                        alt={formatDate(image.date)}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                        <span className="text-white text-xs opacity-0 group-hover:opacity-100">
                          {formatDate(image.date)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Nutrition */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Total Nutrition</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <div className="text-3xl font-bold text-orange-600">
                      {result.totalNutrition.calories}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Calories</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <div className="text-3xl font-bold text-blue-600">
                      {result.totalNutrition.protein}g
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Protein</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <div className="text-3xl font-bold text-green-600">
                      {result.totalNutrition.carbs}g
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Carbs</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <div className="text-3xl font-bold text-yellow-600">
                      {result.totalNutrition.fat}g
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Fat</div>
                  </div>
                </div>
              </div>

              {/* AI Advice */}
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      AI Nutritionist Advice
                    </h3>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {result.advice}
                    </p>
                  </div>
                </div>
              </div>

              {/* Breakdown by Image */}
              {result.breakdown && result.breakdown.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Breakdown by Image
                  </h3>
                  <div className="space-y-3">
                    {result.breakdown.map((item) => {
                      const image = images.find((img) => img.id === item.imageId);
                      if (!image) return null;

                      return (
                        <div key={item.imageId} className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center gap-4">
                            <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={image.imageUrl}
                                alt={formatDate(image.date)}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium text-gray-900">
                                  {formatDate(image.date)}
                                </span>
                                <span className="text-sm text-gray-500 capitalize">
                                  • {image.mealType}
                                </span>
                              </div>
                              <div className="grid grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-600">Calories:</span>
                                  <span className="font-semibold ml-1">{item.contribution.calories}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Protein:</span>
                                  <span className="font-semibold ml-1">{item.contribution.protein}g</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Carbs:</span>
                                  <span className="font-semibold ml-1">{item.contribution.carbs}g</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Fat:</span>
                                  <span className="font-semibold ml-1">{item.contribution.fat}g</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
