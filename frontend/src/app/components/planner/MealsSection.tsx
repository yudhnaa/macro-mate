'use client';

import React from 'react';
import MealCard from './MealCard';
import AlertTriangleIcon from '../icon/AlertTriangleIcon';
import RefreshIcon from '../icon/RefreshIcon';
import MoreVerticalIcon from '../icon/MoreVerticalIcon';

export default function MealsSection() {
  const meals = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-800">Meals</h2>
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

      <div className="grid grid-cols-1 gap-4">
        {meals.map((meal) => (
          <MealCard key={meal} mealType={meal} />
        ))}
      </div>
    </div>
  );
}
