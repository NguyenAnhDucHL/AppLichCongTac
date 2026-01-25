import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal, Platform, FlatList } from 'react-native';
import { Text, Card, Button, TextInput, ActivityIndicator, FAB, IconButton, Divider, Avatar, Tooltip } from 'react-native-paper';
import { format, addDays, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { collection, doc, getDoc, setDoc, deleteDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { hasPermission } from '../services/AuthService';
import TimePickerField from '../components/TimePickerField';
import CommonModal from '../components/CommonModal';
import { PlusIcon, EditIcon, DeleteIcon } from '../components/PlatformIcon';

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
  const [isSaving, setIsSaving] = useState(false);
  
  // CommonModal state
  const [modalState, setModalState] = useState({
    visible: false,
    title: '',
    message: '',
    onConfirm: null,
    showCancel: true,
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    confirmButtonStyle: 'default' // 'default' | 'destructive' | 'success'
  });
  
  const showModal = (title, message, onConfirm = null, options = {}) => {
    setModalState({
      visible: true,
      title,
      message,
      onConfirm,
      showCancel: options.showCancel !== false,
      confirmText: options.confirmText || 'Xác nhận',
      cancelText: options.cancelText || 'Hủy',
      confirmButtonStyle: options.confirmButtonStyle || 'default'
    });
  };
  
  const hideModal = () => {
    setModalState(prev => ({ ...prev, visible: false }));
  };

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
      showModal('Lỗi', 'Không thể tải lịch công tác', null, { showCancel: false, confirmText: 'Đóng' });
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
      // Lỗi sẽ được xử lý bởi nơi gọi (handleAddEvent, handleEditEvent, handleDeleteEvent)
      // Các hàm đó đã có showModal để hiển thị lỗi cho người dùng
      throw error;
    }
  };

  // Format thời gian thành HH:mm (đảm bảo 2 số cho cả giờ và phút)
  const formatTimeForSave = (timeStr) => {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      const hours = parts[0] || '00';
      const minutes = parts[1] || '00';
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    return timeStr;
  };

  const handleAddEvent = async (eventData = null) => {
    // Sử dụng eventData từ modal nếu có, nếu không thì dùng newEvent state
    // Validation đã được xử lý trong EventModal, nên eventData phải hợp lệ khi đến đây
    const eventToSave = eventData || newEvent;
    
    // Defensive check: nếu vẫn không có dữ liệu (không nên xảy ra), thì return
    if (!eventToSave || (!eventToSave.time?.trim() || !eventToSave.content?.trim())) {
      console.warn('handleAddEvent: Invalid event data, validation should have caught this');
      return;
    }

    setIsSaving(true);
    try {
      const currentEvents = schedules[selectedDate] || [];
      const eventId = `event-${Date.now()}`;
      const updatedEvents = [...currentEvents, {
        id: eventId,
        time: formatTimeForSave(eventToSave.time),
        content: eventToSave.content.trim(),
        createdAt: new Date(),
        createdBy: 'admin'
      }];

      // Sắp xếp theo thời gian, nếu cùng giờ thì sắp xếp theo thời gian tạo (mới nhất trước)
      updatedEvents.sort((a, b) => {
        const timeCompare = a.time.localeCompare(b.time);
        if (timeCompare === 0) {
          // Nếu cùng giờ, sắp xếp theo thời gian tạo (mới nhất trước)
          const aCreated = a.createdAt?.getTime?.() || new Date(a.createdAt).getTime() || 0;
          const bCreated = b.createdAt?.getTime?.() || new Date(b.createdAt).getTime() || 0;
          return bCreated - aCreated; // Mới nhất trước
        }
        return timeCompare;
      });

      await saveSchedule(selectedDate, updatedEvents);
      
      // Đóng modal và reset form TRƯỚC để UI cập nhật ngay
      setIsSaving(false);
      setShowAddModal(false);
      setNewEvent({ time: '', content: '' });
      
      // Hiển thị thông báo sau khi UI đã cập nhật
      setTimeout(() => {
        showModal('Thành công', 'Đã thêm sự kiện mới', null, { 
          showCancel: false, 
          confirmText: 'Đóng',
          confirmButtonStyle: 'success'
        });
      }, 100);
    } catch (error) {
      setIsSaving(false);
      showModal('Lỗi', 'Không thể thêm sự kiện', null, { 
        showCancel: false, 
        confirmText: 'Đóng',
        confirmButtonStyle: 'default'
      });
    }
  };

  const handleEditEvent = async (eventData = null) => {
    // Sử dụng eventData từ modal nếu có, nếu không thì dùng editingEvent state
    // Validation đã được xử lý trong EventModal, nên eventData phải hợp lệ khi đến đây
    const eventToSave = eventData || editingEvent;
    
    // Defensive check: nếu vẫn không có dữ liệu (không nên xảy ra), thì return
    if (!eventToSave || (!eventToSave.time?.trim() || !eventToSave.content?.trim())) {
      console.warn('handleEditEvent: Invalid event data, validation should have caught this');
      return;
    }

    setIsSaving(true);
    try {
      const currentEvents = schedules[selectedDate] || [];
      const updatedEvents = currentEvents.map(event => 
        event.id === eventToSave.id 
          ? { ...eventToSave, time: formatTimeForSave(eventToSave.time), content: eventToSave.content.trim(), updatedAt: new Date(), updatedBy: 'admin' }
          : event
      );

      // Sắp xếp theo thời gian, nếu cùng giờ thì sắp xếp theo thời gian tạo (mới nhất trước)
      updatedEvents.sort((a, b) => {
        const timeCompare = a.time.localeCompare(b.time);
        if (timeCompare === 0) {
          // Nếu cùng giờ, sắp xếp theo thời gian tạo (mới nhất trước)
          const aCreated = a.createdAt?.getTime?.() || new Date(a.createdAt).getTime() || 0;
          const bCreated = b.createdAt?.getTime?.() || new Date(b.createdAt).getTime() || 0;
          return bCreated - aCreated; // Mới nhất trước
        }
        return timeCompare;
      });

      await saveSchedule(selectedDate, updatedEvents);
      
      // Đóng modal và reset TRƯỚC để UI cập nhật ngay
      setIsSaving(false);
      setShowEditModal(false);
      setEditingEvent(null);
      
      // Hiển thị thông báo sau khi UI đã cập nhật
      setTimeout(() => {
        showModal('Thành công', 'Đã cập nhật sự kiện', null, { 
          showCancel: false, 
          confirmText: 'Đóng',
          confirmButtonStyle: 'success'
        });
      }, 100);
    } catch (error) {
      setIsSaving(false);
      showModal('Lỗi', 'Không thể cập nhật sự kiện', null, { 
        showCancel: false, 
        confirmText: 'Đóng',
        confirmButtonStyle: 'default'
      });
    }
  };

  const handleDeleteEvent = async (eventId) => {
    showModal(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa sự kiện này?',
      async () => {
        try {
          const currentEvents = schedules[selectedDate] || [];
          const updatedEvents = currentEvents.filter(event => event.id !== eventId);
          
          await saveSchedule(selectedDate, updatedEvents);
          hideModal();
          setTimeout(() => {
            showModal('Thành công', 'Đã xóa sự kiện', null, { 
              showCancel: false, 
              confirmText: 'Đóng',
              confirmButtonStyle: 'success'
            });
          }, 100);
        } catch (error) {
          hideModal();
          setTimeout(() => {
            showModal('Lỗi', 'Không thể xóa sự kiện', null, { 
              showCancel: false, 
              confirmText: 'Đóng',
              confirmButtonStyle: 'default'
            });
          }, 100);
        }
      },
      {
        confirmText: 'Xóa',
        cancelText: 'Hủy',
        confirmButtonStyle: 'destructive'
      }
    );
  };

  const formatDisplayDate = (dateKey) => {
    return format(parseISO(dateKey), "EEEE, 'ngày' dd/MM/yyyy", { locale: vi });
  };

  // Custom Tooltip component - cách tốt nhất cho cả web và mobile
  const HoverTooltip = ({ children, text }) => {
    const [showTooltip, setShowTooltip] = useState(false);

    if (Platform.OS === 'web') {
      // Trên web: dùng mouse events để hiển thị tooltip khi hover
      return (
        <View 
          style={styles.tooltipContainer}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {children}
          {showTooltip && (
            <View style={styles.tooltip}>
              <Text style={styles.tooltipText}>{text}</Text>
            </View>
          )}
        </View>
      );
    }

    // Trên mobile: dùng Tooltip từ react-native-paper (long press)
    return (
      <Tooltip title={text}>
        {children}
      </Tooltip>
    );
  };

  const EventModal = ({ visible, onDismiss, title, event, onSave, onEventChange, isLoading = false }) => {
    // Local state để tránh re-render modal
    const [localEvent, setLocalEvent] = useState(() => event || { time: '', content: '' });
    const [errors, setErrors] = useState({});
    const [showValidationErrors, setShowValidationErrors] = useState(false);
    const scrollViewRef = useRef(null);
    const contentInputRef = useRef(null);
    const prevVisibleRef = useRef(false);

    // CHỈ sync với prop event khi modal mở lần đầu (visible chuyển từ false -> true)
    useEffect(() => {
      const wasVisible = prevVisibleRef.current;
      const isNowVisible = visible;
      
      // Khi modal mở lần đầu (false -> true)
      if (!wasVisible && isNowVisible && event) {
        setLocalEvent({ ...event });
        setErrors({}); // Reset errors khi mở modal
        setShowValidationErrors(false); // Reset validation flag
      }
      
      // Khi modal đóng (true -> false)
      if (wasVisible && !isNowVisible) {
        // Reset để sẵn sàng cho lần mở tiếp theo
        setLocalEvent({ time: '', content: '' });
        setErrors({}); // Reset errors khi đóng modal
        setShowValidationErrors(false); // Reset validation flag
      }
      
      prevVisibleRef.current = isNowVisible;
    }, [visible]); // CHỈ phụ thuộc vào visible, KHÔNG phụ thuộc vào event

    const handleTimeChange = (hhmm) => {
      // TimePickerField đã xử lý validation và format HH:mm rồi
      // Chỉ cần set giá trị trực tiếp
      setLocalEvent(prev => ({ ...prev, time: hhmm || '' }));
      // Clear error khi user bắt đầu nhập
      if (errors.time) {
        setErrors(prev => ({ ...prev, time: '' }));
        // Nếu không còn lỗi nào, ẩn validation errors
        if (!errors.content) {
          setShowValidationErrors(false);
        }
      }
    };

    const handleContentChange = (text) => {
      setLocalEvent(prev => ({ ...prev, content: text }));
      // Clear error khi user bắt đầu nhập
      if (errors.content) {
        setErrors(prev => ({ ...prev, content: '' }));
        // Nếu không còn lỗi nào, ẩn validation errors
        if (!errors.time) {
          setShowValidationErrors(false);
        }
      }
    };

    // Validate form
    const validateForm = () => {
      const newErrors = {};
      
      // Validate thời gian (bắt buộc)
      if (!localEvent.time || !localEvent.time.trim()) {
        newErrors.time = 'Vui lòng nhập thời gian sự kiện';
      } else {
        // Validate format HH:mm
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(localEvent.time.trim())) {
          newErrors.time = 'Thời gian không hợp lệ. Vui lòng nhập theo định dạng HH:mm (ví dụ: 08:00)';
        }
      }
      
      // Validate nội dung (bắt buộc)
      if (!localEvent.content || !localEvent.content.trim()) {
        newErrors.content = 'Vui lòng nhập nội dung sự kiện';
      }
      
      // QUAN TRỌNG: Luôn set errors (kể cả khi rỗng) để clear errors cũ
      // Nếu không có lỗi, newErrors = {} (rỗng) → setErrors({}) sẽ clear tất cả errors
      setErrors(newErrors);
      
      // Hiển thị validation errors nếu có lỗi
      if (Object.keys(newErrors).length > 0) {
        setShowValidationErrors(true);
        // Scroll lên đầu để hiển thị error banner
        setTimeout(() => {
          if (scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: 0, animated: true });
          }
        }, 100);
      } else {
        // Nếu không có lỗi, ẩn validation errors
        setShowValidationErrors(false);
      }
      
      return Object.keys(newErrors).length === 0;
    };

    // Handle save - truyền localEvent lên parent
    const handleSave = () => {
      // Validate trước khi save
      if (!validateForm()) {
        return; // Dừng lại nếu có lỗi validation (errors đã được set và showValidationErrors đã được set thành true)
      }
      
      // Nếu validation pass, ẩn validation errors
      setShowValidationErrors(false);
      
      if (onSave) {
        // Update parent state trước khi save
        if (onEventChange) {
          onEventChange(localEvent);
        }
        // Truyền localEvent trực tiếp vào onSave để đảm bảo có dữ liệu
        onSave(localEvent);
      }
    };

    // Kiểm tra xem có lỗi validation không - sử dụng showValidationErrors flag
    const hasErrors = showValidationErrors && Object.keys(errors).length > 0;
    const firstError = errors.time || errors.content;

    return (
      <>
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{title}</Text>
                
                {/* Error banner - hiển thị ở trên cùng nếu có lỗi */}
                {hasErrors && (
                  <View style={styles.errorBanner}>
                    <Text style={styles.errorBannerText}>
                      {firstError || 'Vui lòng kiểm tra lại thông tin đã nhập'}
                    </Text>
                  </View>
                )}
              </View>
              
              <ScrollView 
                ref={scrollViewRef}
                style={styles.modalScrollView}
                contentContainerStyle={styles.modalScrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={true}
              >
                {/* Time Input (mobile: native picker; web: HH:mm input) */}
                <View style={styles.fieldContainer}>
                  <TimePickerField
                    value={localEvent.time || ''}
                    onChange={(hhmm) => handleTimeChange(hhmm)}
                    label="Thời gian (HH:mm)"
                    placeholder="08:00"
                    error={!!errors.time}
                    helperText={errors.time}
                  />
                </View>
                
                <View style={styles.fieldContainer}>
                  <TextInput
                    ref={contentInputRef}
                    label="Nội dung"
                    value={localEvent.content}
                    onChangeText={handleContentChange}
                    placeholder="Nhập nội dung sự kiện..."
                    multiline
                    numberOfLines={4}
                    style={styles.input}
                    mode="outlined"
                    error={!!errors.content}
                    helperText={errors.content}
                  />
                </View>
              </ScrollView>
              
              {isLoading ? (
                <View style={styles.modalLoadingContainer}>
                  <ActivityIndicator size="large" color="#1976d2" />
                  <Text style={styles.modalLoadingText}>Đang lưu...</Text>
                </View>
              ) : (
                <View style={styles.modalButtons}>
                  <Button onPress={onDismiss} style={styles.modalButton} disabled={isLoading}>Hủy</Button>
                  <Button 
                    mode="contained" 
                    onPress={handleSave} 
                    style={styles.modalButton} 
                    disabled={isLoading}
                    loading={isLoading}
                  >
                    Lưu
                  </Button>
                </View>
              )}
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
      <View style={styles.eventsList}>
        {(schedules[selectedDate] || []).length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>Không có sự kiện nào trong ngày này</Text>
            </Card.Content>
          </Card>
        ) : (
          <FlatList
            data={schedules[selectedDate] || []}
            keyExtractor={(item) => item.id}
            renderItem={({ item: event }) => (
              <Card style={styles.eventCard}>
                <Card.Content>
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventTime}>{event.time}</Text>
                    <View style={styles.eventActions}>
                      <HoverTooltip text="Chỉnh sửa">
                        <TouchableOpacity
                          onPress={() => {
                            if (canWrite) {
                              setEditingEvent(event);
                              setShowEditModal(true);
                            } else {
                              showModal('Lỗi', 'Bạn không có quyền chỉnh sửa sự kiện', null, { 
                                showCancel: false, 
                                confirmText: 'Đóng'
                              });
                            }
                          }}
                          style={styles.iconButton}
                          activeOpacity={0.7}
                        >
                          <EditIcon size={28} color="#004bff" />
                        </TouchableOpacity>
                      </HoverTooltip>
                      <HoverTooltip text="Xóa">
                        <TouchableOpacity
                          onPress={() => {
                            if (canDelete) {
                              handleDeleteEvent(event.id);
                            } else {
                              showModal('Lỗi', 'Bạn không có quyền xóa sự kiện', null, { 
                                showCancel: false, 
                                confirmText: 'Đóng'
                              });
                            }
                          }}
                          style={styles.iconButton}
                          activeOpacity={0.7}
                        >
                          <DeleteIcon size={28} color="#ff0000" />
                        </TouchableOpacity>
                      </HoverTooltip>
                    </View>
                  </View>
                  <Text style={styles.eventContent}>{event.content}</Text>
                </Card.Content>
              </Card>
            )}
            contentContainerStyle={styles.flatListContent}
            showsVerticalScrollIndicator={true}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        )}
      </View>

      {/* Add button */}
      {canWrite && (
        <FAB
          style={styles.fab}
          icon={() => <PlusIcon size={24} color="#fff" />}
          onPress={() => setShowAddModal(true)}
          label="Thêm sự kiện"
        />
      )}

      {/* Add Event Modal */}
      <EventModal
        visible={showAddModal}
        onDismiss={() => !isSaving && setShowAddModal(false)}
        title="Thêm sự kiện mới"
        event={newEvent}
        onEventChange={setNewEvent}
        onSave={handleAddEvent}
        isLoading={isSaving}
      />

      {/* Edit Event Modal */}
      <EventModal
        visible={showEditModal}
        onDismiss={() => !isSaving && setShowEditModal(false)}
        title="Sửa sự kiện"
        event={editingEvent || { time: '', content: '' }}
        onEventChange={setEditingEvent}
        onSave={handleEditEvent}
        isLoading={isSaving}
      />

      {/* CommonModal for all alerts */}
      <CommonModal
        visible={modalState.visible}
        onClose={hideModal}
        title={modalState.title}
        message={modalState.message}
        onConfirm={modalState.onConfirm || hideModal}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        showCancel={modalState.showCancel}
        confirmButtonStyle={modalState.confirmButtonStyle}
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
  },
  flatListContent: {
    padding: 16,
    paddingBottom: 100, // Thêm padding bottom để không bị che bởi FAB
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
    alignItems: 'center',
    gap: 4, // Khoảng cách giữa các icon
  },
  iconButton: {
    marginLeft: 8,
  },
  editIcon: {
    backgroundColor: '#1976d2',
  },
  deleteIcon: {
    backgroundColor: '#d32f2f',
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
    maxHeight: '80%',
    position: 'relative',
  },
  modalHeader: {
    width: '100%',
    marginBottom: 8,
    zIndex: 10000,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: '#ffebee',
    borderLeftWidth: 4,
    borderLeftColor: '#d32f2f',
    padding: 12,
    marginBottom: 0,
    marginTop: 0,
    borderRadius: 4,
    zIndex: 10001,
    elevation: 10, // Cho Android - tăng elevation
    width: '100%',
  },
  errorBannerText: {
    color: '#d32f2f',
    fontSize: 14,
    fontWeight: '500',
  },
  modalScrollView: {
    maxHeight: 300,
  },
  modalScrollContent: {
    paddingBottom: 8,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 0,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    minWidth: 100,
  },
  modalLoadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalLoadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  tooltipContainer: {
    position: 'relative',
    display: 'inline-flex',
  },
  tooltip: {
    position: 'absolute',
    bottom: '100%',
    left: '50%',
    marginBottom: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    zIndex: 99999,
    elevation: 20,
    ...(Platform.OS === 'web' && {
      transform: [{ translateX: -50 }],
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
    }),
  },
  tooltipText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'normal', // Không in đậm
    textAlign: 'center',
    ...(Platform.OS === 'web' && {
      whiteSpace: 'nowrap',
    }),
  },
});

export default ScheduleManagement;