"use client";

import React from "react";
import Image from "next/image";
import { FoodImage } from "@/types/collection.types";

interface ImageGridProps {
  images: FoodImage[];
  selectedImages: Set<string>;
  onImageClick: (image: FoodImage) => void;
  onSelectImage: (imageId: string) => void;
  onDeleteImage: (imageId: string) => void;
}

export default function ImageGrid({
  images,
  selectedImages,
  onImageClick,
  onSelectImage,
  onDeleteImage,
}: ImageGridProps) {
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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {images.map((image) => (
        <div
          key={image.id}
          className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
        >
          {/* Image Container */}
          <div className="relative aspect-square bg-gray-100">
            <Image
              src={image.imageUrl}
              alt={`Food from ${formatDate(image.date)}`}
              fill
              className="object-cover cursor-pointer"
              onClick={() => onImageClick(image)}
              unoptimized
              onError={() => {
                console.error('Image failed to load:', image.imageUrl);
              }}
            />
            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-30 transition-all">
              {/* Checkbox */}
              <div className="absolute top-3 left-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectImage(image.id);
                  }}
                  className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                    selectedImages.has(image.id)
                      ? 'bg-orange-500 border-orange-500'
                      : 'bg-white border-gray-300 opacity-0 group-hover:opacity-100'
                  }`}
                >
                  {selectedImages.has(image.id) && (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {/* Delete Button */}
              <div className="absolute top-3 right-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteImage(image.id);
                  }}
                  className="w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Analyzed Badge */}
            {image.analyzed && (
              <div className="absolute bottom-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Analyzed
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                {formatDate(image.date)}
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getMealTypeColor(
                  image.mealType
                )}`}
              >
                {image.mealType}
              </span>
            </div>

            {/* Nutrition Preview */}
            {image.nutritionInfo && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-50 rounded px-2 py-1">
                  <span className="text-gray-500">Calories:</span>
                  <span className="font-semibold ml-1">{image.nutritionInfo.calories}</span>
                </div>
                <div className="bg-gray-50 rounded px-2 py-1">
                  <span className="text-gray-500">Protein:</span>
                  <span className="font-semibold ml-1">{image.nutritionInfo.protein}g</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
