import React, { useMemo, useState } from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ClockIcon } from './PlatformIcon';

function pad2(n) {
  return String(n).padStart(2, '0');
}

function dateToHHmm(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function hhmmToDate(hhmm) {
  if (!hhmm || typeof hhmm !== 'string') return null;
  const m = hhmm.match(/^(\d{1,2}):(\d{1,2})$/);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isFinite(h) || !Number.isFinite(min) || h < 0 || h > 23 || min < 0 || min > 59) return null;
  const d = new Date();
  d.setHours(h, min, 0, 0);
  return d;
}

/**
 * TimePickerField
 * - Mobile (iOS/Android): native time picker (@react-native-community/datetimepicker)
 * - Web: input HH:mm (fallback)
 */
export default function TimePickerField({
  value,
  onChange,
  label = 'Thời gian (HH:mm)',
  placeholder = '08:00',
  disabled = false,
  error = false,
  helperText,
}) {
  const [showPicker, setShowPicker] = useState(false);

  const parsed = useMemo(() => {
    const d = hhmmToDate(value);
    if (d) return d;
    const fallback = new Date();
    fallback.setHours(8, 0, 0, 0);
    return fallback;
  }, [value]);

  if (Platform.OS === 'web') {
    return (
      <TextInput
        label={label}
        value={value || ''}
        onChangeText={(text) => {
          // Chỉ cho phép số và dấu :
          const cleaned = text.replace(/[^0-9:]/g, '');
          
          // Giới hạn độ dài tối đa là 5 ký tự (HH:mm)
          if (cleaned.length > 5) return;
          
          let formatted = cleaned;
          
          // Tự động thêm dấu : sau 2 số đầu (chỉ khi chưa có dấu :)
          if (cleaned.length > 2 && !cleaned.includes(':')) {
            formatted = cleaned.slice(0, 2) + ':' + cleaned.slice(2);
          }
          
          // Xử lý khi đã có dấu :
          if (formatted.includes(':')) {
            const parts = formatted.split(':');
            let hours = parts[0] || '';
            let minutes = parts[1] || '';
            
            // Giới hạn giờ tối đa 2 số
            if (hours.length > 2) {
              hours = hours.slice(0, 2);
            }
            
            // Giới hạn phút tối đa 2 số
            if (minutes.length > 2) {
              minutes = minutes.slice(0, 2);
            }
            
            // Tạo lại formatted sau khi giới hạn
            formatted = hours + ':' + minutes;
            
            // Validate giờ (0-23) - CHỈ validate khi đã nhập đủ 2 số
            if (hours.length === 2) {
              const h = parseInt(hours, 10);
              if (isNaN(h) || h > 23) {
                return; // Không cho phép giờ > 23
              }
            }
            
            // Validate phút (0-59) - CHỈ validate khi đã nhập đủ 2 số
            // QUAN TRỌNG: Cho phép nhập từng số một (ví dụ: "08:1" → cho phép)
            if (minutes.length === 2) {
              const m = parseInt(minutes, 10);
              if (isNaN(m) || m > 59) {
                return; // Không cho phép phút > 59
              }
            }
            
            // Cho phép nhập tiếp (kể cả khi chưa đủ 2 số cho phút)
            onChange?.(formatted);
          } else {
            // Chưa có dấu :, đang nhập giờ
            if (cleaned.length === 2) {
              const h = parseInt(cleaned, 10);
              if (isNaN(h) || h > 23) {
                return; // Không cho phép giờ > 23
              }
            }
            // Cho phép nhập tiếp
            onChange?.(formatted);
          }
        }}
        placeholder={placeholder}
        mode="outlined"
        disabled={disabled}
        error={error}
        helperText={helperText}
        right={<TextInput.Icon icon={() => <ClockIcon size={24} color="#666" />} />}
        keyboardType="numeric"
      />
    );
  }

  return (
    <View>
      <TouchableOpacity disabled={disabled} onPress={() => setShowPicker(true)} activeOpacity={0.8}>
        <View pointerEvents="none">
          <TextInput
            label={label}
            value={value || ''}
            placeholder={placeholder}
            mode="outlined"
            disabled={disabled}
            error={error}
            helperText={helperText}
            right={<TextInput.Icon icon={() => <ClockIcon size={24} color="#666" />} />}
          />
        </View>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={parsed}
          mode="time"
          is24Hour
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_event, selectedDate) => {
            setShowPicker(false);
            if (!selectedDate) return; // dismissed
            onChange?.(dateToHHmm(selectedDate));
          }}
        />
      )}
    </View>
  );
}

