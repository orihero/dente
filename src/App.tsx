import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminDashboard } from './pages/AdminDashboard';
import { DentistProfile } from './pages/DentistProfile';
import Draft from './pages/Draft';
import { Home } from './pages/home/index';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { UserDetails } from './pages/UserDetails';
import { Users } from './pages/Users';
import { useAuthStore } from './store/authStore';

export default function App() {
  const { checkUser } = useAuthStore();

  useEffect(() => {
    checkUser();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/refer/:dentistId" element={<Landing />} />
        <Route path="/dentistProfile/:id" element={<DentistProfile />} />
        <Route path="/shifokor/:id" element={<DentistProfile />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/users/:id"
          element={
            <ProtectedRoute>
              <UserDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/draft"
          element={
            <ProtectedRoute>
              <Draft />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}