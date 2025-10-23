export interface FoodImage {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string | null;
  date: string; // ISO date string
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  nutritionInfo?: NutritionInfo;
  analyzed: boolean;
  createdAt: string;
  dishName?: string;
  ingredients?: IngredientInfo[];
  safety?: SafetyInfo;
  imageMetadata?: ImageMetadata;
}

export interface SafetyInfo {
  is_food: boolean;
  is_potentially_poisonous: boolean;
  confidence: number;
  reason: string;
}

export interface IngredientInfo {
  name: string;
  estimated_weight: number;
  nutrition: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber: number;
    sodium: number;
  };
}

export interface ImageMetadata {
  public_id: string;
  width: number;
  height: number;
  format: string;
  size: number;
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
