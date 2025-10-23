"use client";

import React, { useState, useEffect } from "react";
import { FoodImage, FilterOptions } from "@/types/collection.types";
import UploadImageModal from "@/app/components/collections/UploadImageModal";
import FilterBar from "@/app/components/collections/FilterBar";
import ImageGrid from "@/app/components/collections/ImageGrid";
import ImageDetailModal from "@/app/components/collections/ImageDetailModal";
import NutritionAnalysisModal from "@/app/components/collections/NutritionAnalysisModal";
import { getMealHistory, MealHistoryItem } from "@/lib/api/analysis.api";

// Transform API meal data to FoodImage format
const transformMealToFoodImage = (meal: MealHistoryItem): FoodImage => {
  return {
    id: meal.id.toString(),
    imageUrl: meal.image_url,
    date: meal.meal_time ? meal.meal_time.split('T')[0] : new Date().toISOString().split('T')[0],
    mealType: meal.meal_type,
    analyzed: meal.analysis_status === 'completed',
    createdAt: meal.created_at || new Date().toISOString(),
    dishName: meal.meal_name,
    nutritionInfo: {
      calories: meal.nutrition_summary.total_calories,
      protein: meal.nutrition_summary.total_protein,
      carbs: meal.nutrition_summary.total_carbs,
      fat: meal.nutrition_summary.total_fat,
      fiber: meal.nutrition_summary.total_fiber,
      sodium: meal.nutrition_summary.total_sodium,
    },
  };
};

export default function CollectionsPage() {
  const [images, setImages] = useState<FoodImage[]>([]);
  const [filteredImages, setFilteredImages] = useState<FoodImage[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<FoodImage | null>(null);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    mealType: 'all',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  // Fetch meals from API
  useEffect(() => {
    const fetchMeals = async () => {
      try {
        setLoading(true);
        setError("");
        
        const response = await getMealHistory({ limit: 100 });
        const transformedImages = response.meals.map(transformMealToFoodImage);
        console.log("transformedImages", transformedImages);
        
        
        setImages(transformedImages); 
      } catch (err) {
        console.error("Failed to fetch meals:", err);
        setError("Failed to load your meal history. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, []);

  const applyFilters = React.useCallback(() => {
    let filtered = [...images];

    // Filter by date range
    if (filters.startDate) {
      filtered = filtered.filter(
        (img) => new Date(img.date) >= new Date(filters.startDate!)
      );
    }
    if (filters.endDate) {
      filtered = filtered.filter(
        (img) => new Date(img.date) <= new Date(filters.endDate!)
      );
    }

    // Filter by meal type
    if (filters.mealType && filters.mealType !== 'all') {
      filtered = filtered.filter((img) => img.mealType === filters.mealType);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setFilteredImages(filtered);
  }, [images, filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleUploadSuccess = (newImage: FoodImage) => {
    setImages([newImage, ...images]);
    setShowUploadModal(false);
  };

  const handleDeleteImage = (imageId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    setImages(images.filter((img) => img.id !== imageId));
    if (selectedImage?.id === imageId) {
      setSelectedImage(null);
    }
  };

  const handleImageClick = (image: FoodImage) => {
    setSelectedImage(image);
  };

  const handleSelectImage = (imageId: string) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId);
    } else {
      newSelected.add(imageId);
    }
    setSelectedImages(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedImages.size === filteredImages.length) {
      setSelectedImages(new Set());
    } else {
      setSelectedImages(new Set(filteredImages.map((img) => img.id)));
    }
  };

  const handleAnalyzeNutrition = () => {
    if (selectedImages.size === 0) {
      alert("Please select at least one image to analyze");
      return;
    }
    setShowAnalysisModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Food Collections</h1>
            <p className="text-gray-600 mt-1">
              Track and analyze your meals with photos
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors shadow-md"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Upload Image
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
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
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-red-600 hover:text-red-800 underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <svg
                className="animate-spin h-12 w-12 text-orange-500 mx-auto mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="text-gray-600">Loading your meals...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Filter Bar */}
            <FilterBar
              filters={filters}
              onFilterChange={setFilters}
              totalImages={filteredImages.length}
              selectedCount={selectedImages.size}
              onSelectAll={handleSelectAll}
              onAnalyze={handleAnalyzeNutrition}
            />

            {/* Image Grid */}
            {filteredImages.length === 0 ? (
              <div className="text-center py-16">
            <svg
              className="w-24 h-24 mx-auto text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No images found
            </h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your filters or upload a new meal photo
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Upload Image
            </button>
          </div>
        ) : (
          <ImageGrid
            images={filteredImages}
            selectedImages={selectedImages}
            onImageClick={handleImageClick}
            onSelectImage={handleSelectImage}
            onDeleteImage={handleDeleteImage}
          />
        )}
          </>
        )}
      </div>

      {/* Modals */}
      {showUploadModal && (
        <UploadImageModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}

      {selectedImage && (
        <ImageDetailModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          onDelete={handleDeleteImage}
          onUpdate={(updated: FoodImage) => {
            setImages(images.map((img) => (img.id === updated.id ? updated : img)));
            setSelectedImage(updated);
          }}
        />
      )}

      {showAnalysisModal && (
        <NutritionAnalysisModal
          imageIds={Array.from(selectedImages)}
          images={images.filter((img) => selectedImages.has(img.id))}
          onClose={() => setShowAnalysisModal(false)}
        />
      )}
    </div>
  );
}
