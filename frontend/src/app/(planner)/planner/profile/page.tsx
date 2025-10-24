'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { getMyProfile, updateMyProfile, clearProfileError } from '@/app/features/profile/profileSlice';
import { UserProfileUpdate, ACTIVITY_LEVELS, GENDER_OPTIONS, BODY_SHAPE_OPTIONS, FITNESS_GOAL_OPTIONS } from '@/types/profile.types';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { profile, isLoading, isSaving, error } = useAppSelector((state) => state.profile);
  const { user } = useAppSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfileUpdate>({
    full_name: '',
    age: null,
    gender: null,
    weight: null,
    height: null,
    body_shape: null,
    health_conditions: null,
    fitness_goal: null,
    dietary_restrictions: null,
    allergies: null,
    activity_level: null,
  });

  // Load profile on mount
  useEffect(() => {
    dispatch(getMyProfile());
  }, [dispatch]);

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        age: profile.age || null,
        gender: profile.gender || null,
        weight: profile.weight || null,
        height: profile.height || null,
        body_shape: profile.body_shape || null,
        health_conditions: profile.health_conditions || '',
        fitness_goal: profile.fitness_goal || null,
        dietary_restrictions: profile.dietary_restrictions || '',
        allergies: profile.allergies || '',
        activity_level: profile.activity_level || null,
      });
    }
  }, [profile]);

  const handleInputChange = (field: keyof UserProfileUpdate, value: string | number | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value === '' ? null : value,
    }));
  };

  const handleSave = async () => {
    try {
      await dispatch(updateMyProfile(formData)).unwrap();
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        age: profile.age || null,
        gender: profile.gender || null,
        weight: profile.weight || null,
        height: profile.height || null,
        body_shape: profile.body_shape || null,
        health_conditions: profile.health_conditions || '',
        fitness_goal: profile.fitness_goal || null,
        dietary_restrictions: profile.dietary_restrictions || '',
        allergies: profile.allergies || '',
        activity_level: profile.activity_level || null,
      });
    }
    setIsEditing(false);
    dispatch(clearProfileError());
  };

  const displayValue = (value: string | number | null | undefined): string => {
    if (value === null || value === undefined || value === '') {
      return 'Chưa cập nhật';
    }
    return String(value);
  };

  if (isLoading && !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Profile Settings</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Quản lý thông tin cá nhân và sở thích của bạn
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 sm:py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    'Lưu thay đổi'
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <span className="hidden xs:inline">Chỉnh sửa Profile</span>
                <span className="xs:hidden">Chỉnh sửa</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-5xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center justify-between text-sm">
            <span>{error}</span>
            <button
              onClick={() => dispatch(clearProfileError())}
              className="text-red-500 hover:text-red-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-5xl mx-auto p-3 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold">
                    {profile?.full_name?.[0]?.toUpperCase() || profile?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                </div>
                <h2 className="mt-3 sm:mt-4 text-lg sm:text-xl font-bold text-gray-800 text-center">
                  {profile?.full_name || profile?.username || 'User'}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 text-center break-all">{profile?.email || user?.email}</p>
                <span className="mt-2 sm:mt-3 inline-block px-3 py-1 text-xs bg-orange-100 text-orange-600 rounded-full font-medium">
                  {profile?.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Quick Stats */}
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                  Thống kê nhanh
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-600">Chiều cao</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-800">
                      {profile?.height ? `${profile.height} cm` : 'Chưa cập nhật'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-600">Cân nặng</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-800">
                      {profile?.weight ? `${profile.weight} kg` : 'Chưa cập nhật'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-600">BMI</span>
                    <span className={`text-xs sm:text-sm font-semibold ${profile?.bmi ? 'text-green-600' : 'text-gray-400'}`}>
                      {profile?.bmi ? profile.bmi.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-gray-600">Tuổi</span>
                    <span className="text-xs sm:text-sm font-semibold text-gray-800">
                      {profile?.age || 'Chưa cập nhật'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Details */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                Thông tin cá nhân
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.full_name || ''}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      placeholder="Nhập họ tên"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-3 py-2 text-gray-800">{displayValue(profile?.full_name)}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <p className="px-3 py-2 text-gray-600 bg-gray-50 rounded-lg">
                    {profile?.email || user?.email || 'Chưa cập nhật'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tuổi
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formData.age || ''}
                      onChange={(e) => handleInputChange('age', e.target.value ? parseInt(e.target.value) : null)}
                      placeholder="Nhập tuổi"
                      min="0"
                      max="150"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-3 py-2 text-gray-800">{displayValue(profile?.age)}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới tính
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.gender || ''}
                      onChange={(e) => handleInputChange('gender', e.target.value || null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Chọn giới tính</option>
                      {GENDER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="px-3 py-2 text-gray-800">
                      {GENDER_OPTIONS.find(o => o.value === profile?.gender)?.label || displayValue(profile?.gender)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Physical Stats */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                Thông số thể chất
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chiều cao (cm)
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formData.height || ''}
                      onChange={(e) => handleInputChange('height', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="175"
                      min="0"
                      max="300"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-3 py-2 text-gray-800">
                      {profile?.height ? `${profile.height} cm` : displayValue(profile?.height)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cân nặng (kg)
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formData.weight || ''}
                      onChange={(e) => handleInputChange('weight', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="70"
                      min="0"
                      max="500"
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-3 py-2 text-gray-800">
                      {profile?.weight ? `${profile.weight} kg` : displayValue(profile?.weight)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dáng người
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.body_shape || ''}
                      onChange={(e) => handleInputChange('body_shape', e.target.value || null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Chọn dáng người</option>
                      {BODY_SHAPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="px-3 py-2 text-gray-800">{displayValue(profile?.body_shape)}</p>
                  )}
                </div>
              </div>

              <div className="mt-3 sm:mt-4">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Mức độ hoạt động
                </label>
                {isEditing ? (
                  <select
                    value={formData.activity_level || ''}
                    onChange={(e) => handleInputChange('activity_level', e.target.value || null)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="">Chọn mức độ hoạt động</option>
                    {ACTIVITY_LEVELS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="px-3 py-2 text-sm text-gray-800">
                    {ACTIVITY_LEVELS.find(o => o.value === profile?.activity_level)?.label || displayValue(profile?.activity_level)}
                  </p>
                )}
              </div>
            </div>

            {/* Health & Fitness */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                Sức khỏe & Mục tiêu
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mục tiêu Fitness
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.fitness_goal || ''}
                      onChange={(e) => handleInputChange('fitness_goal', e.target.value || null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="">Chọn mục tiêu</option>
                      {FITNESS_GOAL_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="px-3 py-2 text-gray-800">{displayValue(profile?.fitness_goal)}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tình trạng sức khỏe
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.health_conditions || ''}
                      onChange={(e) => handleInputChange('health_conditions', e.target.value)}
                      placeholder="Ví dụ: tiểu đường loại 2, huyết áp cao..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-3 py-2 text-gray-800">{displayValue(profile?.health_conditions)}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hạn chế chế độ ăn
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.dietary_restrictions || ''}
                      onChange={(e) => handleInputChange('dietary_restrictions', e.target.value)}
                      placeholder="Ví dụ: chay, không gluten, không lactose..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-3 py-2 text-gray-800">{displayValue(profile?.dietary_restrictions)}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dị ứng thực phẩm
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.allergies || ''}
                      onChange={(e) => handleInputChange('allergies', e.target.value)}
                      placeholder="Ví dụ: đậu phộng, hải sản, trứng..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-3 py-2 text-gray-800">{displayValue(profile?.allergies)}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                Thông tin tài khoản
              </h3>
              <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Tên người dùng</span>
                  <span className="font-medium text-gray-800 break-all text-right ml-2">{profile?.username || user?.username}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Email</span>
                  <span className="font-medium text-gray-800 break-all text-right ml-2">{profile?.email || user?.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Ngày tạo</span>
                  <span className="font-medium text-gray-800">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Cập nhật lần cuối</span>
                  <span className="font-medium text-gray-800">
                    {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString('vi-VN') : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
