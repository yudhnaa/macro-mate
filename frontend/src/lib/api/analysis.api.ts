    import axiosInstance from './axios';

// Types matching the API response
export interface SafetyCheck {
  is_food: boolean;
  is_potentially_poisonous: boolean;
  confidence: number;
  reason: string;
}

export interface Nutrition {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  sodium: number;
}

export interface Ingredient {
  name: string;
  estimated_weight: number;
  nutrition: Nutrition;
}

export interface Analysis {
  safety: SafetyCheck;
  dish_name: string;
  total_estimated_calories: number;
  ingredients: Ingredient[];
}

export interface Upload {
  url: string;
  thumbnail_url: string | null;
  public_id: string;
  width: number;
  height: number;
  format: string;
  size: number;
}

export interface NutritionSummary {
  total_calories: number;
  total_protein: number;
  total_fat: number;
  total_carbs: number;
  total_fiber: number;
  total_sodium: number;
}

export interface UploadAndAnalyzeResponse {
  meal_id: number;
  upload: Upload;
  analysis: Analysis;
  nutrition_summary: NutritionSummary;
}

/**
 * Upload an image and analyze it
 * @param file - The image file to upload
 * @param mealType - Type of meal (breakfast, lunch, dinner, snack)
 * @param mealTime - ISO format time string (optional)
 */
export const uploadAndAnalyzeImage = async (
  file: File,
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  mealTime?: string
): Promise<UploadAndAnalyzeResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('meal_type', mealType);
  
  if (mealTime) {
    formData.append('meal_time', mealTime);
  }

  const response = await axiosInstance.post<UploadAndAnalyzeResponse>(
    '/analyze/upload-and-analyze-image',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds for image analysis
    }
  );

  return response.data;
};

// Get meal history types
export interface MealHistoryItem {
  id: number;
  meal_name: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  meal_time: string | null;
  image_url: string;
  analysis_status: 'pending' | 'completed' | 'failed';
  nutrition_summary: {
    total_calories: number;
    total_protein: number;
    total_fat: number;
    total_carbs: number;
    total_fiber: number;
    total_sodium: number;
  };
  items_count: number;
  created_at: string | null;
}

export interface MealHistoryResponse {
  total: number;
  skip: number;
  limit: number;
  meals: MealHistoryItem[];
}

export interface GetMealsParams {
  meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  skip?: number;
  limit?: number;
}

/**
 * Get user's meal history
 * @param params - Query parameters for filtering and pagination
 */
export const getMealHistory = async (
  params?: GetMealsParams
): Promise<MealHistoryResponse> => {
  const response = await axiosInstance.get<MealHistoryResponse>(
    '/analyze/meals',
    { params }
  );

  return response.data;
};

// Meal detail types (matching the actual API response)
export interface MealItem {
  id: number;
  name: string;
  estimated_weight: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  sodium: number;
}

export interface MealDetailResponse {
  id: number;
  meal_name: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  meal_time: string;
  image_url: string;
  analysis_status: string;
  nutrition_summary: {
    total_calories: number;
    total_protein: number;
    total_fat: number;
    total_carbs: number;
    total_fiber: number;
    total_sodium: number;
  };
  items: MealItem[];
  created_at: string;
}

/**
 * Get detailed information about a specific meal
 * @param mealId - The ID of the meal to retrieve
 */
export const getMealDetail = async (
  mealId: number
): Promise<MealDetailResponse> => {
  const response = await axiosInstance.get<MealDetailResponse>(
    `/analyze/meals/${mealId}`
  );

  return response.data;
};
