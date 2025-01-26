import React, { createContext, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface AuthContextType {
  user: any;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, isAdmin: false });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isAdmin, checkUser } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    // Handle navigation after auth state changes
    if (!loading) {
      const isReferralPath = location.pathname.startsWith('/refer/') || 
                           (location.state && location.state.referredBy);
      
      if (!user && 
          location.pathname !== '/' && 
          !location.pathname.startsWith('/login') && 
          !isReferralPath) {
        navigate('/login');
      } else if (user && location.pathname === '/login') {
        navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
      }
    }
  }, [user, loading, isAdmin, location.pathname]);

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};