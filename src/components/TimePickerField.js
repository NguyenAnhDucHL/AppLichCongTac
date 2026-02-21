import React, { useMemo, useState } from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
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
    // Dùng input type="time" của HTML5 - mở đồng hồ chọn giờ native của trình duyệt
    return (
      <View>
        {/* Label */}
        <Text style={{
          fontSize: 12,
          color: error ? '#B00020' : '#6200ea',
          marginBottom: 4,
          marginLeft: 2,
          fontWeight: '500',
        }}>
          {label}
        </Text>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: error ? 2 : 1,
          borderColor: error ? '#B00020' : '#6200ea',
          borderRadius: 4,
          backgroundColor: disabled ? '#f5f5f5' : '#fff',
          paddingHorizontal: 12,
          height: 56,
        }}>
          <input
            type="time"
            value={value || ''}
            disabled={disabled}
            onChange={(e) => {
              onChange?.(e.target.value);
            }}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: 16,
              color: value ? '#333' : '#999',
              backgroundColor: 'transparent',
              fontFamily: 'inherit',
              cursor: disabled ? 'not-allowed' : 'pointer',
              WebkitAppearance: 'none',
            }}
          />
        </View>
        {helperText ? (
          <Text style={{
            fontSize: 12,
            color: error ? '#B00020' : '#666',
            marginTop: 4,
            marginLeft: 2,
          }}>
            {helperText}
          </Text>
        ) : null}
      </View>
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

