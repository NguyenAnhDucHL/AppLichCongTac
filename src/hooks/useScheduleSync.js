import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { syncScheduleData, subscribeToScheduleUpdates } from '../services/FirebaseService';
import { getDateKey } from '../utils/dateUtils';

/**
 * Custom hook để sync lịch công tác tự động
 */
export const useScheduleSync = () => {
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe = null;

    const loadAndSubscribe = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const today = getDateKey();
        
        // Load initial data
        const data = await syncScheduleData(today);
        setScheduleData(data);
        
        // Subscribe to realtime updates
        unsubscribe = subscribeToScheduleUpdates(today, (updatedData) => {
          setScheduleData(updatedData);
        });
      } catch (err) {
        console.error('Error in useScheduleSync:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAndSubscribe();

    // Reload when app comes to foreground
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        loadAndSubscribe();
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      subscription?.remove();
    };
  }, []);

  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const today = getDateKey();
      const data = await syncScheduleData(today);
      setScheduleData(data);
    } catch (err) {
      console.error('Error refreshing schedule:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    scheduleData,
    loading,
    error,
    refresh,
  };
};
