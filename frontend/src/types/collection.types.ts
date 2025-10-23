export interface FoodImage {
  id: string;
  imageUrl: string;
  date: string; // ISO date string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  nutritionInfo?: NutritionInfo;
  analyzed: boolean;
  createdAt: string;
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  foodItems?: string[];
}

export interface UploadImagePayload {
  image: File;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface NutritionAnalysisResult {
  selectedImages: FoodImage[];
  totalNutrition: NutritionInfo;
  advice: string;
  breakdown: {
    imageId: string;
    contribution: NutritionInfo;
  }[];
}

export interface FilterOptions {
  startDate?: string;
  endDate?: string;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'all';
}
