"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FoodImage, NutritionAnalysisResult, NutritionInfo } from "@/types/collection.types";
import { getMealDetail, MealDetailResponse } from "@/lib/api/analysis.api";

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
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<NutritionAnalysisResult | null>(null);
  const [mealDetails, setMealDetails] = useState<MealDetailResponse[]>([]);

  const performAnalysis = React.useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // Gọi API cho từng meal được chọn
      const detailPromises = imageIds.map((id) => getMealDetail(Number(id)));
      const details = await Promise.all(detailPromises);

      setMealDetails(details);

      // Tính tổng nutrition từ các meals
      const totalNutrition: NutritionInfo = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sodium: 0,
      };

      const breakdown = details.map((detail, index) => {
        const contribution: NutritionInfo = {
          calories: detail.nutrition_summary.total_calories,
          protein: detail.nutrition_summary.total_protein,
          carbs: detail.nutrition_summary.total_carbs,
          fat: detail.nutrition_summary.total_fat,
          fiber: detail.nutrition_summary.total_fiber,
          sodium: detail.nutrition_summary.total_sodium,
        };

        totalNutrition.calories += contribution.calories;
        totalNutrition.protein += contribution.protein;
        totalNutrition.carbs += contribution.carbs;
        totalNutrition.fat += contribution.fat;
        totalNutrition.fiber! += contribution.fiber!;
        totalNutrition.sodium! += contribution.sodium!;

        return {
          imageId: imageIds[index],
          contribution,
        };
      });

      // Tạo AI advice dựa trên data thực tế
      const proteinPercent = ((totalNutrition.protein * 4) / totalNutrition.calories * 100).toFixed(0);
      const carbsPercent = ((totalNutrition.carbs * 4) / totalNutrition.calories * 100).toFixed(0);
      const fatPercent = ((totalNutrition.fat * 9) / totalNutrition.calories * 100).toFixed(0);

      const analysisResult: NutritionAnalysisResult = {
        selectedImages: images,
        totalNutrition,
        advice: `Based on your ${images.length} selected meal(s), you've consumed a total of ${totalNutrition.calories} calories.

Your macro breakdown shows ${totalNutrition.protein.toFixed(1)}g of protein (${proteinPercent}%), ${totalNutrition.carbs.toFixed(1)}g of carbs (${carbsPercent}%), and ${totalNutrition.fat.toFixed(1)}g of fat (${fatPercent}%).

Recommendations:
• Try to maintain a balanced intake of proteins, carbs, and healthy fats
• Consider adding more vegetables if not already present
• Stay hydrated throughout the day
• If you're trying to lose weight, aim for a caloric deficit while maintaining adequate protein intake
• For muscle building, ensure sufficient protein (1.6-2.2g per kg of body weight)`,
        breakdown,
      };

      setResult(analysisResult);
    } catch (err) {
      console.error("Failed to analyze meals:", err);
      setError("Failed to analyze meals. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [imageIds, images]);

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
              <p className="text-gray-600">Analyzing {imageIds.length} meal(s)...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16">
              <svg
                className="w-16 h-16 text-red-500 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={performAnalysis}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Retry
              </button>
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
                      <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
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
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <div className="text-3xl font-bold text-orange-600">
                      {result.totalNutrition.calories}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Calories</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <div className="text-3xl font-bold text-blue-600">
                      {result.totalNutrition.protein.toFixed(1)}g
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Protein</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <div className="text-3xl font-bold text-green-600">
                      {result.totalNutrition.carbs.toFixed(1)}g
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Carbs</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <div className="text-3xl font-bold text-yellow-600">
                      {result.totalNutrition.fat.toFixed(1)}g
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Fat</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <div className="text-3xl font-bold text-purple-600">
                      {result.totalNutrition.fiber?.toFixed(1)}g
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Fiber</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center shadow-sm">
                    <div className="text-3xl font-bold text-red-600">
                      {result.totalNutrition.sodium?.toFixed(1)}g
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Sodium</div>
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
                    Breakdown by Meal
                  </h3>
                  <div className="space-y-4">
                    {result.breakdown.map((item, index) => {
                      const image = images.find((img) => img.id === item.imageId);
                      const mealDetail = mealDetails[index];
                      if (!image || !mealDetail) return null;

                      return (
                        <div key={item.imageId} className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={image.imageUrl}
                                alt={mealDetail.meal_name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-semibold text-gray-900 text-lg">
                                  {mealDetail.meal_name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                <span className="capitalize">{mealDetail.meal_type}</span>
                                <span>•</span>
                                <span>{formatDate(mealDetail.meal_time)}</span>
                              </div>
                              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-sm">
                                <div className="bg-orange-50 rounded px-3 py-2">
                                  <span className="text-gray-600 block text-xs">Calories</span>
                                  <span className="font-semibold text-orange-600">{item.contribution.calories}</span>
                                </div>
                                <div className="bg-blue-50 rounded px-3 py-2">
                                  <span className="text-gray-600 block text-xs">Protein</span>
                                  <span className="font-semibold text-blue-600">{item.contribution.protein.toFixed(1)}g</span>
                                </div>
                                <div className="bg-green-50 rounded px-3 py-2">
                                  <span className="text-gray-600 block text-xs">Carbs</span>
                                  <span className="font-semibold text-green-600">{item.contribution.carbs.toFixed(1)}g</span>
                                </div>
                                <div className="bg-yellow-50 rounded px-3 py-2">
                                  <span className="text-gray-600 block text-xs">Fat</span>
                                  <span className="font-semibold text-yellow-600">{item.contribution.fat.toFixed(1)}g</span>
                                </div>
                                <div className="bg-purple-50 rounded px-3 py-2">
                                  <span className="text-gray-600 block text-xs">Fiber</span>
                                  <span className="font-semibold text-purple-600">{item.contribution.fiber?.toFixed(1)}g</span>
                                </div>
                                <div className="bg-red-50 rounded px-3 py-2">
                                  <span className="text-gray-600 block text-xs">Sodium</span>
                                  <span className="font-semibold text-red-600">{item.contribution.sodium?.toFixed(1)}g</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Food Items */}
                          {mealDetail.items && mealDetail.items.length > 0 && (
                            <div className="border-t pt-4 mt-4">
                              <h4 className="text-sm font-semibold text-gray-700 mb-3">Food Items ({mealDetail.items.length})</h4>
                              <div className="space-y-2">
                                {mealDetail.items.map((foodItem) => (
                                  <div key={foodItem.id} className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-medium text-gray-900">{foodItem.name}</span>
                                      <span className="text-sm text-gray-500">{foodItem.estimated_weight}g</span>
                                    </div>
                                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                                      <div>
                                        <span className="text-gray-500">Cal:</span>
                                        <span className="font-semibold ml-1 text-orange-600">{foodItem.calories}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Pro:</span>
                                        <span className="font-semibold ml-1 text-blue-600">{foodItem.protein}g</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Carb:</span>
                                        <span className="font-semibold ml-1 text-green-600">{foodItem.carbs}g</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Fat:</span>
                                        <span className="font-semibold ml-1 text-yellow-600">{foodItem.fat}g</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Fiber:</span>
                                        <span className="font-semibold ml-1 text-purple-600">{foodItem.fiber}g</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-500">Sodium:</span>
                                        <span className="font-semibold ml-1 text-red-600">{foodItem.sodium}g</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
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
