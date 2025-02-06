import React, { createContext, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useProfileStore } from '../store/profileStore';

interface AuthContextType {
  user: any;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, isAdmin: false });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isAdmin, checkUser } = useAuthStore();
  const { profile, loading: profileLoading, error: profileError, fetchProfile } = useProfileStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user && !profile && !profileLoading) {
      fetchProfile();
    }
  }, [user, profileLoading]);

  useEffect(() => {
    // Handle navigation after auth state changes
    if (!loading && !profileLoading) {
      const isReferralPath = location.pathname.startsWith('/refer/') || 
                           (location.state && location.state.referredBy);
      
      if (!user && 
          location.pathname !== '/' && 
          !location.pathname.startsWith('/login') && 
          !isReferralPath) {
        navigate('/login');
      } else if (user) {
        if (location.pathname === '/login') {
          navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
        } else if (profile) {
          // Check if profile is incomplete
          const isProfileIncomplete = !profile.full_name || !profile.phone;
          if (isProfileIncomplete && location.pathname !== '/profile') {
            navigate('/profile', { 
              replace: true,
              state: { 
                isNewProfile: true,
                message: location.pathname === '/login' 
                  ? 'Please complete your profile to continue'
                  : undefined
              }
            });
          }
          
          // Check if clinic is inactive
          if (profile.clinic && !profile.clinic.enabled) {
            return (
              <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                  <h2 className="text-xl font-bold text-red-600 mb-4">
                    {profile.language === 'uz' 
                      ? 'Klinika faol emas'
                      : 'Клиника неактивна'}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {profile.language === 'uz'
                      ? 'Kechirasiz, sizning klinikangiz obunasi to\'xtatilgan. Iltimos, administrator bilan bog\'laning.'
                      : 'Извините, подписка вашей клиники приостановлена. Пожалуйста, свяжитесь с администратором.'}
                  </p>
                  <button
                    onClick={() => {
                      localStorage.removeItem('sb-' + import.meta.env.VITE_SUPABASE_URL + '-auth-token');
                      navigate('/login');
                    }}
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
                  >
                    {profile.language === 'uz' ? 'Tizimdan chiqish' : 'Выйти'}
                  </button>
                </div>
              </div>
            );
          }
        }
      }
    }
  }, [user, loading, isAdmin, profile, profileLoading, location.pathname]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Profile</h2>
          <p className="text-gray-600 mb-6">{profileError}</p>
          <button
            onClick={() => fetchProfile()}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};