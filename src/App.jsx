// src/App.jsx
// Main router with protected admin routes and persistent layout
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { useAuth }      from './hooks/useAuth';
import { useTheme }     from './hooks/useTheme';

import Navbar          from './components/layout/Navbar';
import Footer          from './components/layout/Footer';
import FloatingActions from './components/layout/FloatingActions';
import BottomTabBar     from './components/layout/BottomTabBar';

import HomePage        from './pages/HomePage';
import TrackerPage     from './pages/TrackerPage';
import AccessoriesPage from './pages/AccessoriesPage';
import ContactPage     from './pages/ContactPage';
import AdminLogin      from './pages/admin/AdminLogin';
import AdminDashboard  from './pages/admin/AdminDashboard';

/** Protect /admin/dashboard — redirect to login if not authenticated */
function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/admin" replace />;
}

/** Wrapper that adds Navbar + Footer + FABs + bottom tab bar only on public pages */
function PublicLayout() {
  return (
    <>
      <Navbar />
      <div className="page-shell">
        <Routes>
          <Route path="/"            element={<HomePage />}        />
          <Route path="/tracker"     element={<TrackerPage />}     />
          <Route path="/accessories" element={<AccessoriesPage />} />
          <Route path="/contact"     element={<ContactPage />}     />
        </Routes>
        <Footer />
      </div>
      <FloatingActions />
      <BottomTabBar />
    </>
  );
}

export default function App() {
  useTheme(); // applies the saved/system appearance to <html> app-wide, including admin pages

  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter basename="/msp-store">
          <Routes>
            {/* Admin routes — no public layout */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <RequireAuth>
                  <AdminDashboard />
                </RequireAuth>
              }
            />

            {/* Public routes with shared layout */}
            <Route path="/*" element={<PublicLayout />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
