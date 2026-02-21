import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Platform } from 'react-native';
import { PaperProvider, Portal, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScheduleScreen from './src/screens/ScheduleScreen';
import AppRouter from './src/AppRouter';
import { initializeNotifications, scheduleNotifications } from './src/services/NotificationService';
import { useScheduleSync } from './src/hooks/useScheduleSync';
import { useScheduleMultiDays } from './src/hooks/useScheduleMultiDays';
import { ThemeProvider, useThemeContext } from './src/contexts/ThemeContext';

const MainApp = () => {
  const isWeb = Platform.OS === 'web';
  const { scheduleData, loading, refresh } = useScheduleSync();
  const { allDaysData, loading: loadingMulti, refresh: refreshMulti } = useScheduleMultiDays(7);
  const [refreshing, setRefreshing] = useState(false);
  const { isDarkMode, isLoaded } = useThemeContext();

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    // Schedule notifications when data changes
    if (scheduleData && scheduleData.length > 0) {
      scheduleNotifications(scheduleData);
    }
  }, [scheduleData]);

  const initializeApp = async () => {
    try {
      // Initialize notifications
      await initializeNotifications();
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (isWeb) {
      await refreshMulti();
    } else {
      await refresh();
    }
    setRefreshing(false);
  };

  // Use router on web, normal navigation on mobile
  if (isWeb) {
    return <AppRouter />;
  }

  if (!isLoaded) return null;

  return (
    <PaperProvider theme={isDarkMode ? MD3DarkTheme : MD3LightTheme}>
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        <ScheduleScreen
          scheduleData={scheduleData}
          loading={loading}
          onRefresh={onRefresh}
          refreshing={refreshing}
        />
        <Portal.Host />
      </SafeAreaView>
    </PaperProvider>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <MainApp />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
