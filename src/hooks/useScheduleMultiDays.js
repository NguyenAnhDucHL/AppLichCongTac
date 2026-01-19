import { useEffect, useState } from 'react';
import { syncScheduleData, subscribeToScheduleUpdates } from '../services/FirebaseService';
import { addDays as addDaysFns, format as formatFns } from 'date-fns';

/**
 * Custom hook để sync lịch công tác cho nhiều ngày (dùng cho web)
 */
export const useScheduleMultiDays = (numberOfDays = 7) => {
  const [allDaysData, setAllDaysData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribes = [];

    const loadAllDays = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const today = new Date();
        const daysData = {};

        // Load data cho nhiều ngày
        for (let i = 0; i < numberOfDays; i++) {
          const date = addDaysFns(today, i);
          const dateKey = formatFns(date, 'yyyy-MM-dd');
          
          // Load initial data
          const data = await syncScheduleData(dateKey);
          daysData[dateKey] = data;

          // Subscribe to updates
          const unsubscribe = subscribeToScheduleUpdates(dateKey, (updatedData) => {
            setAllDaysData(prev => ({
              ...prev,
              [dateKey]: updatedData
            }));
          });
          
          unsubscribes.push(unsubscribe);
        }

        setAllDaysData(daysData);
      } catch (err) {
        console.error('Error in useScheduleMultiDays:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAllDays();

    return () => {
      unsubscribes.forEach(unsub => unsub && unsub());
      unsubscribes = [];
    };
  }, [numberOfDays]);

  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const today = new Date();
      const daysData = {};

      for (let i = 0; i < numberOfDays; i++) {
        const date = addDaysFns(today, i);
        const dateKey = formatFns(date, 'yyyy-MM-dd');
        const data = await syncScheduleData(dateKey);
        daysData[dateKey] = data;
      }

      setAllDaysData(daysData);
    } catch (err) {
      console.error('Error refreshing multi-days schedule:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    allDaysData,
    loading,
    error,
    refresh,
  };
};
