'use client';

import React from 'react';
import Image from 'next/image';
import { Food } from '@/types/food.types';
import ImageIcon from '@/app/components/icon/ImageIcon';

interface FoodDetailModalProps {
  food: Food;
  isOpen: boolean;
  onClose: () => void;
}

const getMockNutrition = (food: Food) => {
    const baseCalories = 50 + (food.id * 23) % 500;
  const protein = Math.round((baseCalories * 0.25) / 4);
  const carbs = Math.round((baseCalories * 0.45) / 4);
  const fat = Math.round((baseCalories * 0.30) / 9);

  return {
    servingSize: food.grams || 50,
    calories: baseCalories,
    protein: protein,
    carbs: carbs,
    fat: fat,
    fiber: Math.round(carbs * 0.1),
    sodium: Math.round(baseCalories * 0.3),
    cholesterol: Math.round(baseCalories * 0.5),
  };
};

export default function FoodDetailModal({ food, isOpen, onClose }: FoodDetailModalProps) {
  const nutrition = getMockNutrition(food);
  const proteinPercent = Math.round((nutrition.protein * 4 / nutrition.calories) * 100);
  const carbsPercent = Math.round((nutrition.carbs * 4 / nutrition.calories) * 100);
  const fatPercent = Math.round((nutrition.fat * 9 / nutrition.calories) * 100);

  const [isAnimating, setIsAnimating] = React.useState(false);
  const [chartAnimation, setChartAnimation] = React.useState({
    fat: 0,
    carbs: 0,
    protein: 0,
  });

  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsAnimating(true), 10);
      setTimeout(() => {
        let fatProgress = 0;
        const fatInterval = setInterval(() => {
          fatProgress += 5;
          if (fatProgress >= fatPercent) {
            fatProgress = fatPercent;
            clearInterval(fatInterval);
          }
          setChartAnimation(prev => ({ ...prev, fat: fatProgress }));
        }, 20);
      }, 600);

      setTimeout(() => {
        let carbsProgress = 0;
        const carbsInterval = setInterval(() => {
          carbsProgress += 5;
          if (carbsProgress >= carbsPercent) {
            carbsProgress = carbsPercent;
            clearInterval(carbsInterval);
          }
          setChartAnimation(prev => ({ ...prev, carbs: carbsProgress }));
        }, 20);
      }, 900);

      setTimeout(() => {
        let proteinProgress = 0;
        const proteinInterval = setInterval(() => {
          proteinProgress += 5;
          if (proteinProgress >= proteinPercent) {
            proteinProgress = proteinPercent;
            clearInterval(proteinInterval);
          }
          setChartAnimation(prev => ({ ...prev, protein: proteinProgress }));
        }, 20);
      }, 1200);
    } else {
      setIsAnimating(false);
      setChartAnimation({ fat: 0, carbs: 0, protein: 0 });
    }
  }, [isOpen, fatPercent, carbsPercent, proteinPercent]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with smooth fade animation */}
      <div
        className={`fixed inset-0 bg-black z-40 transition-opacity duration-500 ease-out ${
          isAnimating ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Modal with smooth scale and fade animation */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl transform transition-all duration-500 ease-out ${
            isAnimating ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
          }`}
          style={{
            transformOrigin: 'center center',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg
                className="w-6 h-6 text-gray-600"
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
            </button>
            <h2 className="text-xl font-bold text-gray-800 flex-1 text-center">{food.name}</h2>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="p-6">
              {/* Image */}
              <div className="relative h-80 bg-gray-200 rounded-xl overflow-hidden mb-6">
                {food.image_url ? (
                  <Image
                    src={food.image_url}
                    alt={food.name}
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 896px"
                    quality={95}
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <ImageIcon className="w-32 h-32" />
                  </div>
                )}
              </div>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Time Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    {food.prep_time !== null && (
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-600">Prep Time</span>
                        <span className="text-sm font-semibold text-gray-800">{food.prep_time} minutes</span>
                      </div>
                    )}
                    {food.cook_time !== null && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Cook Time</span>
                        <span className="text-sm font-semibold text-gray-800">{food.cook_time} minutes</span>
                      </div>
                    )}
                  </div>

                  {/* Scale Recipe */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-base font-semibold text-gray-800">Scale Recipe</h3>
                      <button className="text-sm text-blue-600 hover:text-blue-700">View Original</button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        defaultValue={food.grams || 50}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <option>grams</option>
                        <option>serving</option>
                      </select>
                    </div>
                  </div>

                  {/* Ingredients - Placeholder */}
                  <div>
                    <h3 className="text-base font-semibold text-gray-800 mb-3">Ingredients</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                        <div className="w-12 h-12 bg-orange-200 rounded-lg"></div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">Main Ingredient</p>
                          <p className="text-sm text-gray-600">1 large • {food.grams}g</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Directions */}
                  {food.direction && food.direction.length > 0 && (
                    <div>
                      <h3 className="text-base font-semibold text-gray-800 mb-3">Directions</h3>
                      <div className="space-y-3">
                        {food.direction
                          .sort((a, b) => a.order - b.order)
                          .map((step, index) => (
                            <div key={step.id} className="flex gap-3 items-start">
                              <div className="flex-shrink-0 w-6 h-6 bg-gray-800 text-white rounded flex items-center justify-center font-semibold text-xs">
                                {index + 1}
                              </div>
                              <p className="flex-1 text-sm text-gray-700 leading-relaxed pt-0.5">
                                {step.direction}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Nutrition */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-base font-semibold text-gray-800 mb-4">Nutrition</h3>
                    <p className="text-xs text-gray-500 mb-4">Source: User Entered</p>

                    {/* Pie Chart */}
                    <div className="flex justify-center mb-6">
                      <div className="relative w-48 h-48">
                        <svg viewBox="0 0 100 100" className="transform -rotate-90">
                          {/* Fat segment - animated */}
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="#06B6D4"
                            strokeWidth="20"
                            strokeDasharray={`${chartAnimation.fat * 2.51} ${251 - chartAnimation.fat * 2.51}`}
                            strokeDashoffset="0"
                            style={{ transition: 'stroke-dasharray 0.3s ease-out' }}
                          />
                          {/* Carbs segment - animated */}
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="#FCD34D"
                            strokeWidth="20"
                            strokeDasharray={`${chartAnimation.carbs * 2.51} ${251 - chartAnimation.carbs * 2.51}`}
                            strokeDashoffset={`-${chartAnimation.fat * 2.51}`}
                            style={{ transition: 'stroke-dasharray 0.3s ease-out, stroke-dashoffset 0.3s ease-out' }}
                          />
                          {/* Protein segment - animated */}
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="#C084FC"
                            strokeWidth="20"
                            strokeDasharray={`${chartAnimation.protein * 2.51} ${251 - chartAnimation.protein * 2.51}`}
                            strokeDashoffset={`-${(chartAnimation.fat + chartAnimation.carbs) * 2.51}`}
                            style={{ transition: 'stroke-dasharray 0.3s ease-out, stroke-dashoffset 0.3s ease-out' }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="text-xs text-gray-500">Fat</div>
                          <div className="text-2xl font-bold text-cyan-500 transition-all duration-300">
                            {Math.round(chartAnimation.fat)}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                          <span className="text-sm text-gray-600">Fats</span>
                        </div>
                        <span className="text-sm font-medium text-gray-800">{nutrition.fat}g</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                          <span className="text-sm text-gray-600">Carbs</span>
                        </div>
                        <span className="text-sm font-medium text-gray-800">{nutrition.carbs}g</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                          <span className="text-sm text-gray-600">Protein</span>
                        </div>
                        <span className="text-sm font-medium text-gray-800">{nutrition.protein}g</span>
                      </div>
                    </div>

                    {/* Nutrition Details */}
                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-xs text-gray-600 mb-3">For {nutrition.servingSize}g</p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Calories</span>
                          <span className="text-sm font-semibold text-gray-800">{nutrition.calories}</span>
                        </div>
                        <div className="flex justify-between items-center pl-4">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                            <span className="text-sm text-gray-600">Carbs</span>
                          </div>
                          <span className="text-sm text-gray-700">{nutrition.carbs}g</span>
                        </div>
                        <div className="flex justify-between items-center pl-4">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                            <span className="text-sm text-gray-600">Fats</span>
                          </div>
                          <span className="text-sm text-gray-700">{nutrition.fat}g</span>
                        </div>
                        <div className="flex justify-between items-center pl-4">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                            <span className="text-sm text-gray-600">Protein</span>
                          </div>
                          <span className="text-sm text-gray-700">{nutrition.protein}g</span>
                        </div>
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                          <span className="text-sm text-gray-600">Fiber</span>
                          <span className="text-sm text-gray-700">{nutrition.fiber}g</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Sodium</span>
                          <span className="text-sm text-gray-700">{nutrition.sodium}mg</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Cholesterol</span>
                          <span className="text-sm text-gray-700">{nutrition.cholesterol}mg</span>
                        </div>
                      </div>

                      <button className="w-full mt-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        Detailed Nutrition Information
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
