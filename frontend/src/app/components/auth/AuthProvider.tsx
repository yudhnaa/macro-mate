"use client";

import { useEffect } from 'react';
import { useAppDispatch } from '@/app/store/hooks';
import { getCurrentUser, setToken } from '@/app/features/auth/authSlice';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Check for token in localStorage on mount
    const token = localStorage.getItem('token');
    
    if (token) {
      // Set token in Redux state
      dispatch(setToken(token));
      
      // Fetch current user info
      dispatch(getCurrentUser());
    }
  }, [dispatch]);

  return <>{children}</>;
}
