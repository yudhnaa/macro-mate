'use client';

import React, { useState } from 'react';
import ChevronLeftIcon from '../icon/ChevronLeftIcon';
import ChevronRightIcon from '../icon/ChevronRightIcon';
import CalendarIcon from '../icon/CalendarIcon';
import MoreVerticalIcon from '../icon/MoreVerticalIcon';

interface DateNavigatorProps {
  initialDate?: Date;
  onDateChange?: (date: Date) => void;
}

export default function DateNavigator({
  initialDate = new Date(),
  onDateChange,
}: DateNavigatorProps) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  const openDatePicker = () => {
    // This would open a date picker modal
    console.log('Open date picker');
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6 gap-3 sm:gap-4">
      <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
        <button
          onClick={() => setViewMode('day')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-base flex-1 sm:flex-none ${
            viewMode === 'day'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Day
        </button>
        <button
          onClick={() => setViewMode('week')}
          className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-colors text-sm sm:text-base flex-1 sm:flex-none ${
            viewMode === 'week'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Week
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-center">
        <button
          onClick={() => navigateDate('prev')}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
        </button>

        <button
          onClick={openDatePicker}
          className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 hover:bg-gray-50 rounded-lg transition-colors flex-1 sm:flex-none justify-center"
        >
          <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 flex-shrink-0" />
          <span className="font-semibold text-gray-800 text-xs sm:text-base truncate">
            <span className="hidden md:inline">{formatDate(currentDate)}</span>
            <span className="md:hidden">{currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </span>
        </button>

        <button
          onClick={() => navigateDate('next')}
          className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
        >
          <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
        </button>
      </div>

      <button className="text-gray-400 hover:text-gray-600 transition-colors hidden sm:block">
        <MoreVerticalIcon className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  );
}
