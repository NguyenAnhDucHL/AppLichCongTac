import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, Platform } from 'react-native';
import { Text, Card, Button, TextInput, ActivityIndicator, FAB, IconButton, Divider } from 'react-native-paper';
import { format, addDays, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { collection, doc, getDoc, setDoc, deleteDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { hasPermission } from '../services/AuthService';

const ScheduleManagement = ({ onBack }) => {
  const [schedules, setSchedules] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({ time: '', content: '' });
  const [canWrite, setCanWrite] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    loadSchedules();
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const writePermission = await hasPermission('schedule:write');
    const deletePermission = await hasPermission('schedule:delete');
    setCanWrite(writePermission);
    setCanDelete(deletePermission);
  };

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const schedulesData = {};
      
      // Load 7 ngày từ hôm nay
      for (let i = 0; i < 7; i++) {
        const date = format(addDays(new Date(), i), 'yyyy-MM-dd');
        const scheduleDoc = await getDoc(doc(db, 'schedules', date));
        if (scheduleDoc.exists()) {
          schedulesData[date] = scheduleDoc.data().events || [];
        } else {
          schedulesData[date] = [];
        }
      }
      
      setSchedules(schedulesData);
    } catch (error) {
      console.error('Error loading schedules:', error);
      Alert.alert('Lỗi', 'Không thể tải lịch công tác');
    } finally {
      setLoading(false);
    }
  };

  const saveSchedule = async (date, events) => {
    try {
      await setDoc(doc(db, 'schedules', date), {
        date,
        events,
        updatedAt: new Date(),
        updatedBy: 'admin' // TODO: get from current user
      });
      
      setSchedules(prev => ({
        ...prev,
        [date]: events
      }));
    } catch (error) {
      console.error('Error saving schedule:', error);
      throw error;
    }
  };

  const handleAddEvent = async () => {
    if (!newEvent.time || !newEvent.content) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      const currentEvents = schedules[selectedDate] || [];
      const eventId = `event-${Date.now()}`;
      const updatedEvents = [...currentEvents, {
        id: eventId,
        time: newEvent.time,
        content: newEvent.content,
        createdAt: new Date(),
        createdBy: 'admin'
      }];

      // Sắp xếp theo thời gian
      updatedEvents.sort((a, b) => a.time.localeCompare(b.time));

      await saveSchedule(selectedDate, updatedEvents);
      
      setNewEvent({ time: '', content: '' });
      setShowAddModal(false);
      Alert.alert('Thành công', 'Đã thêm sự kiện mới');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thêm sự kiện');
    }
  };

  const handleEditEvent = async () => {
    if (!editingEvent.time || !editingEvent.content) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      const currentEvents = schedules[selectedDate] || [];
      const updatedEvents = currentEvents.map(event => 
        event.id === editingEvent.id 
          ? { ...editingEvent, updatedAt: new Date(), updatedBy: 'admin' }
          : event
      );

      // Sắp xếp theo thời gian
      updatedEvents.sort((a, b) => a.time.localeCompare(b.time));

      await saveSchedule(selectedDate, updatedEvents);
      
      setEditingEvent(null);
      setShowEditModal(false);
      Alert.alert('Thành công', 'Đã cập nhật sự kiện');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật sự kiện');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa sự kiện này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const currentEvents = schedules[selectedDate] || [];
              const updatedEvents = currentEvents.filter(event => event.id !== eventId);
              
              await saveSchedule(selectedDate, updatedEvents);
              Alert.alert('Thành công', 'Đã xóa sự kiện');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa sự kiện');
            }
          }
        }
      ]
    );
  };

  const formatDisplayDate = (dateKey) => {
    return format(parseISO(dateKey), "EEEE, 'ngày' dd/MM/yyyy", { locale: vi });
  };

  const EventModal = ({ visible, onDismiss, title, event, onSave, onEventChange }) => {
    // Local state để tránh re-render modal
    const [localEvent, setLocalEvent] = useState(() => event || { time: '', content: '' });
    const prevVisibleRef = useRef(false);

    // CHỈ sync với prop event khi modal mở lần đầu (visible chuyển từ false -> true)
    useEffect(() => {
      const wasVisible = prevVisibleRef.current;
      const isNowVisible = visible;
      
      // Khi modal mở lần đầu (false -> true)
      if (!wasVisible && isNowVisible && event) {
        setLocalEvent({ ...event });
      }
      
      // Khi modal đóng (true -> false)
      if (wasVisible && !isNowVisible) {
        // Reset để sẵn sàng cho lần mở tiếp theo
        setLocalEvent({ time: '', content: '' });
      }
      
      prevVisibleRef.current = isNowVisible;
    }, [visible]); // CHỈ phụ thuộc vào visible, KHÔNG phụ thuộc vào event

    const formatTime = (timeStr) => {
      if (!timeStr) return '';
      // Đảm bảo format HH:mm
      const parts = timeStr.split(':');
      if (parts.length === 2) {
        return `${String(parts[0]).padStart(2, '0')}:${String(parts[1]).padStart(2, '0')}`;
      }
      return timeStr;
    };

    const handleTimeChange = (text) => {
      // Chỉ cho phép số và dấu :
      const cleaned = text.replace(/[^0-9:]/g, '');
      
      // Validate format HH:mm
      if (cleaned.length <= 5) {
        let formatted = cleaned;
        
        // Tự động thêm dấu : sau 2 số đầu (chỉ khi chưa có dấu :)
        if (cleaned.length > 2 && !cleaned.includes(':')) {
          formatted = cleaned.slice(0, 2) + ':' + cleaned.slice(2);
        }
        
        // Validate giờ và phút
        if (formatted.includes(':')) {
          const [hours, minutes] = formatted.split(':');
          const h = parseInt(hours) || 0;
          const m = minutes ? parseInt(minutes) : null;
          
          // Validate giờ (0-23)
          if (h > 23) {
            // Nếu giờ > 23, không cho phép
            return;
          }
          
          // Validate phút (0-59) - cho phép nhập từng số một
          if (m !== null) {
            // Nếu đã có phút đầy đủ (2 số)
            if (minutes.length === 2) {
              if (m > 59) {
                // Nếu phút > 59, không cho phép
                return;
              }
            }
            // Nếu đang nhập phút (1 số hoặc 2 số), cho phép tiếp tục
            setLocalEvent(prev => ({ ...prev, time: formatted }));
          } else {
            // Chưa có phút, cho phép tiếp tục nhập
            setLocalEvent(prev => ({ ...prev, time: formatted }));
          }
        } else {
          // Chưa có dấu :, cho phép tiếp tục nhập
          setLocalEvent(prev => ({ ...prev, time: formatted }));
        }
      }
    };

    const handleContentChange = (text) => {
      setLocalEvent(prev => ({ ...prev, content: text }));
    };

    // Handle save - truyền localEvent lên parent
    const handleSave = () => {
      if (onSave) {
        // Update parent state trước khi save
        if (onEventChange) {
          onEventChange(localEvent);
        }
        onSave();
      }
    };

    return (
      <>
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{title}</Text>
              
              {/* Time Input */}
              <TextInput
                label="Thời gian (HH:mm)"
                value={formatTime(localEvent.time)}
                onChangeText={handleTimeChange}
                placeholder="08:00"
                style={styles.input}
                mode="outlined"
                keyboardType="numeric"
                right={<TextInput.Icon icon="clock-outline" />}
              />
              
              <TextInput
                label="Nội dung"
                value={localEvent.content}
                onChangeText={handleContentChange}
                placeholder="Nhập nội dung sự kiện..."
                multiline
                numberOfLines={4}
                style={styles.input}
                mode="outlined"
              />
              
              <View style={styles.modalButtons}>
                <Button onPress={onDismiss} style={styles.modalButton}>Hủy</Button>
                <Button mode="contained" onPress={handleSave} style={styles.modalButton}>Lưu</Button>
              </View>
            </View>
          </View>
        </Modal>

      </>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Đang tải lịch công tác...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Quản lý Lịch Công Tác</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Date selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateSelector}>
        {Object.keys(schedules).map((dateKey) => (
          <TouchableOpacity
            key={dateKey}
            style={[
              styles.dateButton,
              selectedDate === dateKey && styles.selectedDateButton
            ]}
            onPress={() => setSelectedDate(dateKey)}
          >
            <Text style={[
              styles.dateButtonText,
              selectedDate === dateKey && styles.selectedDateButtonText
            ]}>
              {format(parseISO(dateKey), 'dd/MM')}
            </Text>
            <Text style={[
              styles.dateButtonDay,
              selectedDate === dateKey && styles.selectedDateButtonText
            ]}>
              {format(parseISO(dateKey), 'EEE', { locale: vi })}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Selected date display */}
      <Text style={styles.selectedDateTitle}>{formatDisplayDate(selectedDate)}</Text>

      {/* Events list */}
      <ScrollView style={styles.eventsList}>
        {(schedules[selectedDate] || []).length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>Không có sự kiện nào trong ngày này</Text>
            </Card.Content>
          </Card>
        ) : (
          (schedules[selectedDate] || []).map((event, index) => (
            <Card key={event.id} style={styles.eventCard}>
              <Card.Content>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTime}>{event.time}</Text>
                  <View style={styles.eventActions}>
                    {canWrite && (
                      <IconButton
                        icon="pencil"
                        size={16}
                        onPress={() => {
                          setEditingEvent(event);
                          setShowEditModal(true);
                        }}
                      />
                    )}
                    {canDelete && (
                      <IconButton
                        icon="delete"
                        size={16}
                        onPress={() => handleDeleteEvent(event.id)}
                      />
                    )}
                  </View>
                </View>
                <Text style={styles.eventContent}>{event.content}</Text>
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Add button */}
      {canWrite && (
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => setShowAddModal(true)}
          label="Thêm sự kiện"
        />
      )}

      {/* Add Event Modal */}
      <EventModal
        visible={showAddModal}
        onDismiss={() => setShowAddModal(false)}
        title="Thêm sự kiện mới"
        event={newEvent}
        onEventChange={setNewEvent}
        onSave={handleAddEvent}
      />

      {/* Edit Event Modal */}
      <EventModal
        visible={showEditModal}
        onDismiss={() => setShowEditModal(false)}
        title="Sửa sự kiện"
        event={editingEvent || { time: '', content: '' }}
        onEventChange={setEditingEvent}
        onSave={handleEditEvent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1976d2',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSpacer: {
    width: 40,
  },
  dateSelector: {
    backgroundColor: '#fff',
    paddingVertical: 12,
  },
  dateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedDateButton: {
    backgroundColor: '#1976d2',
  },
  dateButtonText: {
    fontSize: 14,
    color: '#333',
  },
  dateButtonDay: {
    fontSize: 12,
    color: '#666',
  },
  selectedDateButtonText: {
    color: '#fff',
  },
  selectedDateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
    padding: 16,
    backgroundColor: '#fff',
    textAlign: 'center',
  },
  eventsList: {
    flex: 1,
    padding: 16,
  },
  emptyCard: {
    marginBottom: 16,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
  eventCard: {
    marginBottom: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  eventActions: {
    flexDirection: 'row',
  },
  eventContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 8,
    minWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    minWidth: 100,
  },
});

export default ScheduleManagement;