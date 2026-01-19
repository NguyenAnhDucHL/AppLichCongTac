import { format, parse, startOfDay, addDays, isToday, isTomorrow } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Format date theo định dạng Việt Nam
 */
export const formatVietnameseDate = (date) => {
  return format(date, "EEEE, 'ngày' dd/MM/yyyy", { locale: vi });
};

/**
 * Parse time string (HH:mm) thành Date object
 */
export const parseTime = (timeString, baseDate = new Date()) => {
  try {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date(baseDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
  } catch (error) {
    console.error('Error parsing time:', error);
    return null;
  }
};

/**
 * Check xem thời gian đã qua chưa
 */
export const isTimePassed = (timeString, baseDate = new Date()) => {
  const eventTime = parseTime(timeString, baseDate);
  if (!eventTime) return false;
  return eventTime < baseDate;
};

/**
 * Get date string cho Firestore (format: yyyy-MM-dd)
 */
export const getDateKey = (date = new Date()) => {
  return format(date, 'yyyy-MM-dd');
};
