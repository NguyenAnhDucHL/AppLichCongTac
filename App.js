import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Platform } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScheduleScreen from './src/screens/ScheduleScreen';
import ScheduleScreenWeb from './src/screens/ScheduleScreenWeb';
import { initializeNotifications, scheduleNotifications } from './src/services/NotificationService';
import { useScheduleSync } from './src/hooks/useScheduleSync';
import { useScheduleMultiDays } from './src/hooks/useScheduleMultiDays';

export default function App() {
  const isWeb = Platform.OS === 'web';
  const { scheduleData, loading, refresh } = useScheduleSync();
  const { allDaysData, loading: loadingMulti, refresh: refreshMulti } = useScheduleMultiDays(7);
  const [refreshing, setRefreshing] = useState(false);

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

  return (
    <PaperProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar style="auto" />
        {isWeb ? (
          <ScheduleScreenWeb 
            scheduleData={scheduleData}
            loading={loading || loadingMulti}
            onRefresh={onRefresh}
            refreshing={refreshing}
            allDaysData={allDaysData}
          />
        ) : (
          <ScheduleScreen 
            scheduleData={scheduleData}
            loading={loading}
            onRefresh={onRefresh}
            refreshing={refreshing}
          />
        )}
      </SafeAreaView>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
