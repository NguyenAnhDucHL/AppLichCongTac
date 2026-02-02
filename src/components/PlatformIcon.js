import React from 'react';
import { Platform, View } from 'react-native';
import { Avatar } from 'react-native-paper';
import { 
  MdCameraAlt, 
  MdEditCalendar, 
  MdPeople, 
  MdBarChart, 
  MdSettings,
  MdChevronRight,
  MdAccountCircle,
  MdAdd,
  MdAccessTime,
  MdEdit,
  MdDelete,
  MdSearch,
  MdExpandMore,
  MdCheckBox,
  MdCheckBoxOutlineBlank
} from 'react-icons/md';

/**
 * Platform-aware Icon Component
 * - Web: Uses react-icons (no registerWebModule error)
 * - Mobile: Uses react-native-paper Avatar.Icon
 */

// Helper to render icon consistently
const renderIcon = (WebIcon, mobileIcon, size, color, style) => {
  if (Platform.OS === 'web') {
    return <WebIcon size={size} color={color} style={style} />;
  }
  return <Avatar.Icon size={size} icon={mobileIcon} style={style} />;
};

export const CameraIcon = ({ size = 20, color = '#fff', style }) => {
  return renderIcon(MdCameraAlt, 'camera-outline', size, color, style);
};

export const CalendarEditIcon = ({ size = 40, color = '#1976d2', style }) => {
  return renderIcon(MdEditCalendar, 'calendar-edit', size, color, style);
};

export const AccountGroupIcon = ({ size = 40, color = '#1976d2', style }) => {
  return renderIcon(MdPeople, 'account-group', size, color, style);
};

export const ChartLineIcon = ({ size = 40, color = '#1976d2', style }) => {
  return renderIcon(MdBarChart, 'chart-line', size, color, style);
};

export const CogIcon = ({ size = 40, color = '#1976d2', style }) => {
  return renderIcon(MdSettings, 'cog', size, color, style);
};

export const ChevronRightIcon = ({ size = 24, color = '#666', style }) => {
  return renderIcon(MdChevronRight, 'chevron-right', size, color, style);
};

export const AccountIcon = ({ size = 20, color = '#666', style }) => {
  return renderIcon(MdAccountCircle, 'account', size, color, style);
};

export const PlusIcon = ({ size = 24, color = '#fff', style }) => {
  return renderIcon(MdAdd, 'plus', size, color, style);
};

export const ClockIcon = ({ size = 24, color = '#666', style }) => {
  return renderIcon(MdAccessTime, 'clock-outline', size, color, style);
};

export const EditIcon = ({ size = 28, color = '#1976d2', style }) => {
  return renderIcon(MdEdit, 'square-edit-outline', size, color, style);
};

export const DeleteIcon = ({ size = 28, color = '#ff0000', style }) => {
  return renderIcon(MdDelete, 'delete-outline', size, color, style);
};

export const SearchIcon = ({ size = 24, color = '#666', style }) => {
  return renderIcon(MdSearch, 'magnify', size, color, style);
};

export const FilterIcon = ({ size = 24, color = '#666', style }) => {
  return renderIcon(MdExpandMore, 'chevron-down', size, color, style);
};

export const CheckboxIcon = ({ size = 24, color = '#666', style, checked = false }) => {
  if (checked) {
    return renderIcon(MdCheckBox, 'checkbox-marked', size, color, style);
  }
  return renderIcon(MdCheckBoxOutlineBlank, 'checkbox-blank-outline', size, color, style);
};
