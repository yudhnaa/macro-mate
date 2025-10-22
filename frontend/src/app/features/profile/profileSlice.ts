import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ProfileState, UserProfile, UserProfileUpdate } from '@/types/profile.types';
import { profileApi } from '@/lib/api/profile.api';
import { ApiError } from '@/types/api.types';

// Initial state
const initialState: ProfileState = {
  profile: null,
  isLoading: false,
  isSaving: false,
  error: null,
  lastUpdated: null,
};

// Async thunks
export const getMyProfile = createAsyncThunk<
  UserProfile,
  void,
  { rejectValue: string }
>(
  'profile/getMyProfile',
  async (_, { rejectWithValue }) => {
    try {
      const profile = await profileApi.getMyProfile();
      return profile;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.detail || 'Failed to get profile');
    }
  }
);

export const updateMyProfile = createAsyncThunk<
  UserProfile,
  UserProfileUpdate,
  { rejectValue: string }
>(
  'profile/updateMyProfile',
  async (data, { rejectWithValue }) => {
    try {
      const profile = await profileApi.updateProfile(data);
      return profile;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.detail || 'Failed to update profile');
    }
  }
);

export const createMyProfile = createAsyncThunk<
  UserProfile,
  UserProfileUpdate,
  { rejectValue: string }
>(
  'profile/createMyProfile',
  async (data, { rejectWithValue }) => {
    try {
      const profile = await profileApi.createProfile(data);
      return profile;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.detail || 'Failed to create profile');
    }
  }
);

export const partialUpdateMyProfile = createAsyncThunk<
  UserProfile,
  UserProfileUpdate,
  { rejectValue: string }
>(
  'profile/partialUpdateMyProfile',
  async (data, { rejectWithValue }) => {
    try {
      const profile = await profileApi.partialUpdateProfile(data);
      return profile;
    } catch (error) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.detail || 'Failed to update profile');
    }
  }
);

// Profile slice
const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileError: (state) => {
      state.error = null;
    },
    clearProfile: (state) => {
      state.profile = null;
      state.error = null;
      state.lastUpdated = null;
    },
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Get profile
    builder
      .addCase(getMyProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMyProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.error = null;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(getMyProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to get profile';
      });

    // Update profile
    builder
      .addCase(updateMyProfile.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.isSaving = false;
        state.profile = action.payload;
        state.error = null;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateMyProfile.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload || 'Failed to update profile';
      });

    // Create profile
    builder
      .addCase(createMyProfile.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(createMyProfile.fulfilled, (state, action) => {
        state.isSaving = false;
        state.profile = action.payload;
        state.error = null;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(createMyProfile.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload || 'Failed to create profile';
      });

    // Partial update profile
    builder
      .addCase(partialUpdateMyProfile.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(partialUpdateMyProfile.fulfilled, (state, action) => {
        state.isSaving = false;
        state.profile = action.payload;
        state.error = null;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(partialUpdateMyProfile.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload || 'Failed to update profile';
      });
  },
});

export const { clearProfileError, clearProfile, setProfile } = profileSlice.actions;
export default profileSlice.reducer;
