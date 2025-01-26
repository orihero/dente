import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin }) => {
  const { user, loading: authLoading, isAdmin, initialized: authInitialized } = useAuthStore();
  const { profile, loading: profileLoading, fetchProfile, initialized: profileInitialized } = useProfileStore();
  const location = useLocation();

  useEffect(() => {
    if (user && !profileInitialized) {
      fetchProfile();
    }
  }, [user, profileInitialized]);

  // Show loading while auth is initializing
  if (!authInitialized || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Show loading while profile is loading (only after auth is confirmed)
  if (!profileInitialized || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Check admin requirement
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user is admin and trying to access regular dashboard, redirect to admin dashboard
  if (isAdmin && location.pathname === '/dashboard') {
    return <Navigate to="/admin" replace />;
  }

  // If profile is not complete and not on profile page, redirect to profile
  if (profile && 
      (!profile.full_name || !profile.phone) && 
      location.pathname !== '/profile') {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
};