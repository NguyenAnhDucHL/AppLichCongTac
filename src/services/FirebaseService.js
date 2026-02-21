import { doc, getDoc, onSnapshot, collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../config/firebase';

const SCHEDULE_COLLECTION = 'schedules';
const CACHE_KEY_PREFIX = 'schedule_cache_';

/**
 * Lấy lịch công tác từ Firestore hoặc cache
 */
export const syncScheduleData = async (date) => {
  try {
    // Thử lấy từ Firestore trước
    const scheduleRef = doc(db, SCHEDULE_COLLECTION, date);
    const scheduleDoc = await getDoc(scheduleRef);

    if (scheduleDoc.exists()) {
      const data = scheduleDoc.data();
      const events = data.events || [];

      // Lưu vào cache
      await AsyncStorage.setItem(
        `${CACHE_KEY_PREFIX}${date}`,
        JSON.stringify(events)
      );

      return events;
    } else {
      // Nếu không có trên server, thử lấy từ cache
      const cachedData = await AsyncStorage.getItem(`${CACHE_KEY_PREFIX}${date}`);
      if (cachedData) {
        return JSON.parse(cachedData);
      }

      return [];
    }
  } catch (error) {
    console.error('Error syncing schedule data:', error);

    // Fallback to cache nếu có lỗi network
    try {
      const cachedData = await AsyncStorage.getItem(`${CACHE_KEY_PREFIX}${date}`);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    } catch (cacheError) {
      console.error('Error reading cache:', cacheError);
    }

    return [];
  }
};

/**
 * Lắng nghe thay đổi realtime từ Firestore
 */
export const subscribeToScheduleUpdates = (date, callback) => {
  const scheduleRef = doc(db, SCHEDULE_COLLECTION, date);

  return onSnapshot(
    scheduleRef,
    async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const events = data.events || [];

        // Lưu vào cache
        await AsyncStorage.setItem(
          `${CACHE_KEY_PREFIX}${date}`,
          JSON.stringify(events)
        );

        callback(events);
      }
    },
    (error) => {
      console.error('Error in schedule subscription:', error);
    }
  );
};

/**
 * Parse schedule text thành structured data
 */
export const parseScheduleText = (text) => {
  const events = [];
  const lines = text.split('\n').filter(line => line.trim());

  let currentEvent = null;

  for (const line of lines) {
    // Match pattern: **HH:mm:** hoặc **HH:mm:**
    const timeMatch = line.match(/\*\*(\d{2}:\d{2}):\*\*/);

    if (timeMatch) {
      // Save previous event if exists
      if (currentEvent) {
        events.push(currentEvent);
      }

      // Start new event
      const time = timeMatch[1];
      const content = line.replace(/\*\*(\d{2}:\d{2}):\*\*/, '').trim();

      currentEvent = {
        time: time,
        content: content,
        id: `${time}-${Date.now()}-${Math.random()}`
      };
    } else if (currentEvent) {
      // Continue adding to current event
      currentEvent.content += ' ' + line.trim();
    }
  }

  // Add last event
  if (currentEvent) {
    events.push(currentEvent);
  }

  return events;
};

/**
 * Tìm kiếm lịch công tác theo khoảng thời gian và từ khóa
 * @param {string} startDate - yyyy-MM-dd
 * @param {string} endDate   - yyyy-MM-dd
 * @param {string} keyword   - từ khóa tìm trong nội dung (có thể rỗng)
 * @returns {Array} mảng flat các event kèm trường date
 */
export const searchSchedules = async (startDate, endDate, keyword = '') => {
  try {
    const schedulesRef = collection(db, SCHEDULE_COLLECTION);
    const q = query(
      schedulesRef,
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'asc')
    );

    const snapshot = await getDocs(q);
    const results = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const events = data.events || [];
      const dateStr = data.date || docSnap.id;

      events.forEach((event) => {
        // Lọc theo từ khóa (case-insensitive) nếu có
        const kw = keyword.trim().toLowerCase();
        if (!kw || (event.content && event.content.toLowerCase().includes(kw))) {
          results.push({
            ...event,
            date: dateStr,
            _id: `${dateStr}-${event.id || event.time}-${Math.random()}`,
          });
        }
      });
    });

    return results;
  } catch (error) {
    console.error('Error searching schedules:', error);
    throw error;
  }
};
