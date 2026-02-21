import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useScheduleSync } from './hooks/useScheduleSync';
import { useScheduleMultiDays } from './hooks/useScheduleMultiDays';
import { initializeNotifications, scheduleNotifications } from './services/NotificationService';
import ScheduleScreenWeb from './screens/ScheduleScreenWeb';
import LoginScreen from './screens/LoginScreen';
import AdminDashboard from './screens/AdminDashboard';
import ScheduleManagement from './screens/ScheduleManagement';
import UserManagement from './screens/UserManagement';
import { getCurrentUser, logout } from './services/AuthService';
import SearchScreen from './screens/SearchScreen';

// Search Page Component
const SearchPage = () => {
  return <SearchScreen />;
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return null; // Hoặc loading spinner
  }

  if (!user) {
    navigate('/app/login');
    return null;
  }

  return children;
};

// Home Page Component
const HomePage = () => {
  const { scheduleData, loading, refresh } = useScheduleSync();
  const { allDaysData, loading: loadingMulti, refresh: refreshMulti } = useScheduleMultiDays(7);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    if (scheduleData && scheduleData.length > 0) {
      scheduleNotifications(scheduleData);
    }
  }, [scheduleData]);

  const initializeApp = async () => {
    try {
      await initializeNotifications();
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshMulti();
    setRefreshing(false);
  };

  const handleQuanTriClick = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        navigate('/app/admin');
      } else {
        navigate('/app/login', { state: { from: { pathname: '/app/admin' } } });
      }
    } catch (error) {
      navigate('/app/login', { state: { from: { pathname: '/app/admin' } } });
    }
  };

  return (
    <ScheduleScreenWeb
      scheduleData={scheduleData}
      loading={loading || loadingMulti}
      onRefresh={onRefresh}
      refreshing={refreshing}
      allDaysData={allDaysData}
      onQuanTriClick={handleQuanTriClick}
    />
  );
};

// Login Page Component
const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = (user) => {
    console.log('Login successful:', user);
    // Redirect to admin if coming from protected route, otherwise go to home
    const from = location.state?.from?.pathname || '/app/admin';
    navigate(from);
  };

  const handleBack = () => {
    navigate('/app/');
  };

  return (
    <LoginScreen
      onLogin={handleLogin}
      onBack={handleBack}
    />
  );
};

// Admin Dashboard Component with nested routes
const AdminDashboardWrapper = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/app/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleBack = () => {
    navigate('/app/');
  };

  // Check if we're on a nested route
  // Debug: log current pathname
  console.log('AdminDashboardWrapper - Current pathname:', location.pathname);

  if (location.pathname === '/app/admin/schedule') {
    return (
      <ScheduleManagement
        onBack={() => navigate('/app/admin')}
      />
    );
  }

  if (location.pathname === '/app/admin/users') {
    console.log('Rendering UserManagement component');
    return (
      <UserManagement
        onBack={() => navigate('/app/admin')}
      />
    );
  }

  return (
    <AdminDashboard
      onLogout={handleLogout}
      onBack={handleBack}
      navigate={navigate}
    />
  );
};

// Main Router Component
const AppRouter = () => {
  return (
    <BrowserRouter>
      <PaperProvider>
        <SafeAreaView style={styles.container} edges={['bottom']}>
          <StatusBar style="auto" />
          <Routes>
            <Route path="/app/" element={<HomePage />} />
            <Route path="/app/search" element={<SearchPage />} />
            <Route path="/app/login" element={<LoginPage />} />
            {/* Nested routes phải đặt trước parent route */}
            <Route
              path="/app/admin/schedule"
              element={
                <ProtectedRoute>
                  <AdminDashboardWrapper />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/admin/users"
              element={
                <ProtectedRoute>
                  <AdminDashboardWrapper />
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboardWrapper />
                </ProtectedRoute>
              }
            />
            <Route path="/app/*" element={<Navigate to="/app/" replace />} />
          </Routes>
        </SafeAreaView>
      </PaperProvider>
    </BrowserRouter>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 0,
  },
});

export default AppRouter;
