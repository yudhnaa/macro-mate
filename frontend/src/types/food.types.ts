export interface Direction {
  id: number;
  order: number;
  direction: string;
  food_id: number;
}

export interface Food {
  id: number;
  raw_id: number;
  name: string;
  is_breakfast: boolean;
  is_lunch: boolean;
  is_dinner: boolean;
  is_snack: boolean;
  is_dessert: boolean;
  needs_blender: boolean;
  needs_oven: boolean;
  needs_stove: boolean;
  needs_slow_cooker: boolean;
  needs_toaster: boolean;
  needs_food_processor: boolean;
  needs_microwave: boolean;
  needs_grill: boolean;
  complexity: number | null;
  cook_time: number | null;
  prep_time: number | null;
  wait_time: number | null;
  total_time: number | null;
  grams: number | null;
  grams_per_unit: number | null;
  default_unit: string | null;
  unit_amount: number | null;
  image_url: string | null;
  direction: Direction[];
}

export interface FoodListResponse {
  foods: Food[];
  total: number;
}
