'use client';

import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import ClockIcon from '../icon/ClockIcon';
import SmileIcon from '../icon/SmileIcon';
import AlertCircleIcon from '../icon/AlertCircleIcon';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

interface NutritionData {
  calories: number;
  carbs: number;
  fat: number;
  protein: number;
  fiber: number;
  sodium: number;
  cholesterol: number;
}

interface NutritionTargets {
  calories: number;
  carbs: string;
  fat: string;
  protein: string;
  fiber: number;
}

interface NutritionPanelProps {
  data?: NutritionData;
  targets?: NutritionTargets;
}

const defaultData: NutritionData = {
  calories: 0,
  carbs: 0,
  fat: 0,
  protein: 0,
  fiber: 0,
  sodium: 0,
  cholesterol: 0,
};

const defaultTargets: NutritionTargets = {
  calories: 2008,
  carbs: '49 - 251g',
  fat: '82 - 112g',
  protein: '81 - 251g',
  fiber: 25,
};

export default function NutritionPanel({
  data = defaultData,
  targets = defaultTargets,
}: NutritionPanelProps) {
  // Chart data
  const chartData = {
    labels: ['Carbs', 'Fat', 'Protein'],
    datasets: [
      {
        data: [data.carbs || 33, data.fat || 33, data.protein || 34], // Default equal distribution if all are 0
        backgroundColor: [
          '#FFD700', // Yellow for Carbs
          '#00CED1', // Cyan for Fat
          '#9370DB', // Purple for Protein
        ],
        borderColor: ['#FFD700', '#00CED1', '#9370DB'],
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  // Chart options
  const chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: true,
    cutout: '60%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = data.carbs + data.fat + data.protein || 100;
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value}g (${percentage}%)`;
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000,
    },
  };

  return (
    <div className="bg-white rounded-lg p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Nutrition</h2>
        <div className="flex gap-1 sm:gap-2">
          {/* Clock/History Icon */}
          <button
            className="p-1.5 sm:p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            title="View History"
          >
            <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          {/* Settings Icon */}
          <button
            className="p-1.5 sm:p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            title="Settings"
          >
            <SmileIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Doughnut Chart */}
      <div className="flex justify-center mb-4 sm:mb-6">
        <div className="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64">
          <Doughnut data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Warning Message */}
      {data.calories === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4 flex items-center gap-2">
          <AlertCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0" />
          <span className="text-xs sm:text-sm text-yellow-800">
            Some targets are not being met
          </span>
        </div>
      )}

      {/* Nutrition Table */}
      <div className="space-y-2 sm:space-y-3">
        {/* Table Header */}
        <div className="flex justify-between text-xs sm:text-sm border-b pb-2">
          <span className="font-medium text-gray-700"></span>
          <div className="flex gap-4 sm:gap-8 lg:gap-12">
            <span className="font-medium text-gray-700 w-12 sm:w-16 text-right">
              Totals
            </span>
            <span className="font-medium text-gray-700 w-16 sm:w-20 lg:w-24 text-right">
              Target
            </span>
          </div>
        </div>

        {/* Calories */}
        <div className="flex justify-between items-center text-xs sm:text-sm">
          <span className="text-gray-800 font-medium">Calories</span>
          <div className="flex gap-4 sm:gap-8 lg:gap-12 items-center">
            <span className="text-gray-800 w-12 sm:w-16 text-right">
              {data.calories.toFixed(2)}
            </span>
            <span className="text-gray-600 w-16 sm:w-20 lg:w-24 text-right">
              {targets.calories}
            </span>
          </div>
        </div>

        {/* Carbs */}
        <div className="flex justify-between items-center text-xs sm:text-sm">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-yellow-400"></div>
            <span className="text-gray-800">Carbs</span>
          </div>
          <div className="flex gap-4 sm:gap-8 lg:gap-12 items-center">
            <span className="text-gray-800 w-12 sm:w-16 text-right">
              {data.carbs.toFixed(2)}g
            </span>
            <span className="text-gray-600 w-16 sm:w-20 lg:w-24 text-right">
              {targets.carbs}
            </span>
          </div>
        </div>

        {/* Fat */}
        <div className="flex justify-between items-center text-xs sm:text-sm">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-cyan-400"></div>
            <span className="text-gray-800">Fat</span>
          </div>
          <div className="flex gap-4 sm:gap-8 lg:gap-12 items-center">
            <span className="text-gray-800 w-12 sm:w-16 text-right">{data.fat.toFixed(2)}g</span>
            <span className="text-gray-600 w-16 sm:w-20 lg:w-24 text-right">
              {targets.fat}
            </span>
          </div>
        </div>

        {/* Protein */}
        <div className="flex justify-between items-center text-xs sm:text-sm">
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-purple-400"></div>
            <span className="text-gray-800">Protein</span>
          </div>
          <div className="flex gap-4 sm:gap-8 lg:gap-12 items-center">
            <span className="text-gray-800 w-12 sm:w-16 text-right">
              {data.protein.toFixed(2)}g
            </span>
            <span className="text-gray-600 w-16 sm:w-20 lg:w-24 text-right">
              {targets.protein}
            </span>
          </div>
        </div>

        {/* Fiber */}
        <div className="flex justify-between items-center border-t pt-2 sm:pt-3 text-xs sm:text-sm">
          <span className="text-gray-800">Fiber</span>
          <div className="flex gap-4 sm:gap-8 lg:gap-12 items-center">
            <span className="text-gray-800 w-12 sm:w-16 text-right">
              {data.fiber.toFixed(2)}g
            </span>
            <span className="text-gray-600 w-16 sm:w-20 lg:w-24 text-right">
              {targets.fiber}g
            </span>
          </div>
        </div>

        {/* Sodium */}
        <div className="flex justify-between items-center text-xs sm:text-sm">
          <span className="text-gray-800">Sodium</span>
          <div className="flex gap-4 sm:gap-8 lg:gap-12 items-center">
            <span className="text-gray-800 w-12 sm:w-16 text-right">
              {data.sodium.toFixed(2)}mg
            </span>
            <span className="text-gray-600 w-16 sm:w-20 lg:w-24 text-right">-</span>
          </div>
        </div>

        {/* Cholesterol */}
        <div className="flex justify-between items-center text-xs sm:text-sm">
          <span className="text-gray-800">Cholesterol</span>
          <div className="flex gap-4 sm:gap-8 lg:gap-12 items-center">
            <span className="text-gray-800 w-12 sm:w-16 text-right">
              {data.cholesterol.toFixed(2)}mg
            </span>
            <span className="text-gray-600 w-16 sm:w-20 lg:w-24 text-right">-</span>
          </div>
        </div>
      </div>

      {/* Detailed Nutrition Button */}
      <button className="w-full mt-4 sm:mt-6 py-2 sm:py-3 px-3 sm:px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium text-xs sm:text-sm">
        Detailed Nutrition Information
      </button>
    </div>
  );
}
