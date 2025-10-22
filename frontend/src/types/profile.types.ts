// Profile related types matching backend API

export interface UserProfileBase {
  full_name?: string | null;
  age?: number | null;
  gender?: string | null; // 'male', 'female', 'other'
  weight?: number | null; // kg
  height?: number | null; // cm
  body_shape?: string | null; // 'gầy', 'bình thường', 'mập', 'béo phì'
  health_conditions?: string | null;
  fitness_goal?: string | null; // 'giảm cân', 'tăng cân', 'tăng cơ', 'duy trì sức khỏe'
  dietary_restrictions?: string | null;
  allergies?: string | null;
  activity_level?: string | null; // 'sedentary', 'light', 'moderate', 'active', 'very_active'
}

export interface UserProfile extends UserProfileBase {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  bmi?: number | null; // Auto-calculated by backend
}

// Type aliases for clearer semantics
export type UserProfileCreate = UserProfileBase;

export type UserProfileUpdate = UserProfileBase;

export interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// Activity level options
export const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentary (ít vận động)' },
  { value: 'light', label: 'Light (vận động nhẹ)' },
  { value: 'moderate', label: 'Moderate (vận động vừa phải)' },
  { value: 'active', label: 'Active (vận động nhiều)' },
  { value: 'very_active', label: 'Very Active (vận động rất nhiều)' },
] as const;

// Gender options
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' },
] as const;

// Body shape options
export const BODY_SHAPE_OPTIONS = [
  { value: 'gầy', label: 'Gầy' },
  { value: 'bình thường', label: 'Bình thường' },
  { value: 'mập', label: 'Mập' },
  { value: 'béo phì', label: 'Béo phì' },
] as const;

// Fitness goal options
export const FITNESS_GOAL_OPTIONS = [
  { value: 'giảm cân', label: 'Giảm cân' },
  { value: 'tăng cân', label: 'Tăng cân' },
  { value: 'tăng cơ', label: 'Tăng cơ' },
  { value: 'duy trì sức khỏe', label: 'Duy trì sức khỏe' },
] as const;
