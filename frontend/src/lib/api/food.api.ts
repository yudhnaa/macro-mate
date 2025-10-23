import axiosInstance from './axios';
import { Food } from '@/types/food.types';

export interface GetFoodsParams {
  skip?: number;
  limit?: number;
  meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';
  equipment?: string;
  max_complexity?: number;
  search?: string;
}

/**
 * Get list of foods with optional filters
 */
export const getFoods = async (params?: GetFoodsParams): Promise<Food[]> => {
  const response = await axiosInstance.get<Food[]>('/foods/', { params });
  return response.data;
};

/**
 * Get a specific food by ID
 */
export const getFoodById = async (foodId: number): Promise<Food> => {
  const response = await axiosInstance.get<Food>(`/foods/${foodId}`);
  return response.data;
};

/**
 * Create a new food item
 */
export const createFood = async (foodData: Partial<Food>): Promise<Food> => {
  const response = await axiosInstance.post<Food>('/foods/', foodData);
  return response.data;
};

/**
 * Update a food item
 */
export const updateFood = async (foodId: number, foodData: Partial<Food>): Promise<Food> => {
  const response = await axiosInstance.put<Food>(`/foods/${foodId}`, foodData);
  return response.data;
};

/**
 * Delete a food item
 */
export const deleteFood = async (foodId: number): Promise<void> => {
  await axiosInstance.delete(`/foods/${foodId}`);
};
