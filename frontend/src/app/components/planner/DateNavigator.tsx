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
    <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setViewMode('day')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'day'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Day
        </button>
        <button
          onClick={() => setViewMode('week')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            viewMode === 'week'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Week
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigateDate('prev')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeftIcon className="w-5 h-5 text-gray-700" />
        </button>

        <button
          onClick={openDatePicker}
          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <CalendarIcon className="w-5 h-5 text-gray-700" />
          <span className="font-semibold text-gray-800">{formatDate(currentDate)}</span>
        </button>

        <button
          onClick={() => navigateDate('next')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRightIcon className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      <button className="text-gray-400 hover:text-gray-600 transition-colors">
        <MoreVerticalIcon className="w-6 h-6" />
      </button>
    </div>
  );
}
