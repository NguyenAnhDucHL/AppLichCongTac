import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { parse } from 'date-fns';

// Configure notification behavior (chỉ trên mobile, không phải web)
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

/**
 * Initialize notifications và request permissions
 */
export const initializeNotifications = async () => {
  // Không chạy trên web
  if (Platform.OS === 'web') {
    return false;
  }
  
  try {
    // Request permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.warn('Notification permissions not granted');
      return false;
    }
    
    // Configure notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('schedule-reminders', {
        name: 'Lịch Công Tác',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing notifications:', error);
    return false;
  }
};

/**
 * Schedule notifications cho các sự kiện trong ngày
 */
export const scheduleNotifications = async (events) => {
  // Không chạy trên web
  if (Platform.OS === 'web') {
    return;
  }
  
  try {
    // Cancel all existing notifications
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    for (const event of events) {
      if (!event.time) continue;
      
      // Parse time (format: HH:mm)
      const [hours, minutes] = event.time.split(':').map(Number);
      
      // Create notification date for today
      const notificationDate = new Date(today);
      notificationDate.setHours(hours, minutes, 0, 0);
      
      // Nếu thời gian đã qua, schedule cho ngày mai
      if (notificationDate <= now) {
        notificationDate.setDate(notificationDate.getDate() + 1);
      }
      
      // Schedule notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Lịch Công Tác',
          body: event.content || `Sự kiện lúc ${event.time}`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: {
            eventId: event.id,
            time: event.time,
          },
        },
        trigger: {
          date: notificationDate,
          channelId: 'schedule-reminders',
        },
      });
    }
    
    console.log(`Scheduled ${events.length} notifications`);
  } catch (error) {
    console.error('Error scheduling notifications:', error);
  }
};

/**
 * Get notification token (cho FCM nếu cần)
 */
export const getNotificationToken = async () => {
  // Không chạy trên web
  if (Platform.OS === 'web') {
    return null;
  }
  
  try {
    const token = await Notifications.getExpoPushTokenAsync({
      projectId: 'YOUR_EXPO_PROJECT_ID', // Thay bằng project ID của bạn
    });
    return token.data;
  } catch (error) {
    console.error('Error getting notification token:', error);
    return null;
  }
};
