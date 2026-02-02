import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, useWindowDimensions } from 'react-native';
import { Text, Card, Switch, TextInput, Button, ActivityIndicator, Divider } from 'react-native-paper';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { hasPermission, getCurrentUser } from '../services/AuthService';
import CommonModal from '../components/CommonModal';

const BREAKPOINT_MOBILE = 768;

const SystemSettings = ({ onBack }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < BREAKPOINT_MOBILE;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);
  const [showResetSuccessModal, setShowResetSuccessModal] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'Lịch Công Tác UBND Phường Cẩm Phả',
    allowPublicView: true,
    maxEventsPerDay: 20,
    defaultEventDuration: 60,
    notificationEnabled: true,
    maintenanceMode: false,
    autoBackup: true,
    backupFrequency: 'daily',
    emailNotifications: true,
    maxLoginAttempts: 5,
    sessionTimeout: 24,
    debugMode: false
  });
  const [canManage, setCanManage] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    checkPermissions();
    loadSettings();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);
  };

  const checkPermissions = async () => {
    const managePermission = await hasPermission('system:manage');
    setCanManage(managePermission);
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settingsDoc = await getDoc(doc(db, 'system_settings', 'app_config'));
      if (settingsDoc.exists()) {
        setSettings(prevSettings => ({
          ...prevSettings,
          ...settingsDoc.data()
        }));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Lỗi', 'Không thể tải cài đặt hệ thống');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (!canManage) {
      Alert.alert('Lỗi', 'Bạn không có quyền thay đổi cài đặt hệ thống');
      return;
    }

    try {
      setSaving(true);
      await setDoc(doc(db, 'system_settings', 'app_config'), {
        ...settings,
        updatedAt: new Date(),
        updatedBy: currentUser?.id || 'admin'
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Lỗi', 'Không thể lưu cài đặt');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setShowResetConfirmModal(true);
  };

  const handleConfirmReset = async () => {
    try {
      setSaving(true);
      const defaultSettings = {
        siteName: 'Lịch Công Tác UBND Phường Cẩm Phả',
        allowPublicView: true,
        maxEventsPerDay: 20,
        defaultEventDuration: 60,
        notificationEnabled: true,
        maintenanceMode: false,
        autoBackup: true,
        backupFrequency: 'daily',
        emailNotifications: true,
        maxLoginAttempts: 5,
        sessionTimeout: 24,
        debugMode: false
      };
      
      setSettings(defaultSettings);
      
      // Lưu vào database
      await setDoc(doc(db, 'system_settings', 'app_config'), {
        ...defaultSettings,
        updatedAt: new Date(),
        updatedBy: currentUser?.id || 'admin'
      });
      
      setShowResetConfirmModal(false);
      setShowResetSuccessModal(true);
    } catch (error) {
      console.error('Error resetting settings:', error);
      Alert.alert('Lỗi', 'Không thể khôi phục cài đặt mặc định');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const SettingCard = ({ title, children }) => (
    <Card style={[styles.settingCard, isMobile && styles.settingCardMobile]}>
      <Card.Content>
        <Text style={styles.settingTitle}>{title}</Text>
        {children}
      </Card.Content>
    </Card>
  );

  const SettingRow = ({ label, value, onValueChange, type = 'switch', disabled = false, ...props }) => (
    <View style={[styles.settingRow, isMobile && styles.settingRowMobile]}>
      <Text style={[styles.settingLabel, disabled && styles.disabledLabel]}>{label}</Text>
      {type === 'switch' && (
        <Switch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled || !canManage}
        />
      )}
      {type === 'text' && (
        <TextInput
          value={value?.toString()}
          onChangeText={onValueChange}
          style={styles.settingInput}
          mode="outlined"
          dense
          disabled={disabled || !canManage}
          {...props}
        />
      )}
      {type === 'number' && (
        <TextInput
          value={value?.toString()}
          onChangeText={(text) => onValueChange(parseInt(text) || 0)}
          style={styles.settingInput}
          mode="outlined"
          dense
          keyboardType="numeric"
          disabled={disabled || !canManage}
          {...props}
        />
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Đang tải cài đặt...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, isMobile && styles.headerMobile]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backButtonText, isMobile && styles.backButtonTextMobile]}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={[styles.title, isMobile && styles.titleMobile]}>Cài đặt Hệ thống</Text>
        <View style={[styles.headerSpacer, isMobile && styles.headerSpacerMobile]} />
      </View>

      {!canManage && (
        <Card style={[styles.warningCard, isMobile && styles.warningCardMobile, { backgroundColor: '#fff3cd' }]}>
          <Card.Content>
            <Text style={styles.warningText}>
              ⚠️ Bạn chỉ có quyền xem cài đặt. Không thể thay đổi.
            </Text>
          </Card.Content>
        </Card>
      )}

      <ScrollView style={[styles.content, isMobile && styles.contentMobile]}>
        {/* General Settings */}
        <SettingCard title="Cài đặt chung">
          <SettingRow
            label="Tên website"
            value={settings.siteName}
            onValueChange={(value) => updateSetting('siteName', value)}
            type="text"
            placeholder="Nhập tên website"
          />
          <Divider style={styles.divider} />
          <SettingRow
            label="Cho phép xem công khai"
            value={settings.allowPublicView}
            onValueChange={(value) => updateSetting('allowPublicView', value)}
          />
          <Divider style={styles.divider} />
          <SettingRow
            label="Số sự kiện tối đa/ngày"
            value={settings.maxEventsPerDay}
            onValueChange={(value) => updateSetting('maxEventsPerDay', value)}
            type="number"
            placeholder="20"
          />
          <Divider style={styles.divider} />
          <SettingRow
            label="Thời gian mặc định sự kiện (phút)"
            value={settings.defaultEventDuration}
            onValueChange={(value) => updateSetting('defaultEventDuration', value)}
            type="number"
            placeholder="60"
          />
        </SettingCard>

        {/* Notification Settings */}
        <SettingCard title="Cài đặt thông báo">
          <SettingRow
            label="Bật thông báo"
            value={settings.notificationEnabled}
            onValueChange={(value) => updateSetting('notificationEnabled', value)}
          />
          <Divider style={styles.divider} />
          <SettingRow
            label="Email thông báo"
            value={settings.emailNotifications}
            onValueChange={(value) => updateSetting('emailNotifications', value)}
          />
        </SettingCard>

        {/* Security Settings */}
        <SettingCard title="Cài đặt bảo mật">
          <SettingRow
            label="Số lần đăng nhập sai tối đa"
            value={settings.maxLoginAttempts}
            onValueChange={(value) => updateSetting('maxLoginAttempts', value)}
            type="number"
            placeholder="5"
          />
          <Divider style={styles.divider} />
          <SettingRow
            label="Thời gian session (giờ)"
            value={settings.sessionTimeout}
            onValueChange={(value) => updateSetting('sessionTimeout', value)}
            type="number"
            placeholder="24"
          />
        </SettingCard>

        {/* Backup Settings */}
        <SettingCard title="Cài đặt sao lưu">
          <SettingRow
            label="Tự động sao lưu"
            value={settings.autoBackup}
            onValueChange={(value) => updateSetting('autoBackup', value)}
          />
          <Divider style={styles.divider} />
          <Text style={styles.settingLabel}>Tần suất sao lưu</Text>
          <View style={[styles.frequencyContainer, isMobile && styles.frequencyContainerMobile]}>
            {['daily', 'weekly', 'monthly'].map(freq => (
              <TouchableOpacity
                key={freq}
                style={[
                  styles.frequencyButton,
                  settings.backupFrequency === freq && styles.selectedFrequency,
                  !canManage && styles.disabledButton
                ]}
                onPress={() => canManage && updateSetting('backupFrequency', freq)}
                disabled={!canManage}
              >
                <Text style={[
                  styles.frequencyText,
                  settings.backupFrequency === freq && styles.selectedFrequencyText
                ]}>
                  {freq === 'daily' ? 'Hàng ngày' : freq === 'weekly' ? 'Hàng tuần' : 'Hàng tháng'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SettingCard>

        {/* System Settings */}
        <SettingCard title="Cài đặt hệ thống">
          <SettingRow
            label="Chế độ bảo trì"
            value={settings.maintenanceMode}
            onValueChange={(value) => updateSetting('maintenanceMode', value)}
          />
          <Text style={styles.helperText}>
            Khi bật, chỉ admin có thể truy cập hệ thống
          </Text>
          <Divider style={styles.divider} />
          <SettingRow
            label="Chế độ debug"
            value={settings.debugMode}
            onValueChange={(value) => updateSetting('debugMode', value)}
          />
          <Text style={styles.helperText}>
            Hiển thị thông tin debug trong console
          </Text>
        </SettingCard>

        {/* System Information */}
        <SettingCard title="Thông tin hệ thống">
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phiên bản:</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cơ sở dữ liệu:</Text>
            <Text style={styles.infoValue}>Firebase Firestore</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Hosting:</Text>
            <Text style={styles.infoValue}>Firebase Hosting</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cập nhật cuối:</Text>
            <Text style={styles.infoValue}>
              {settings.updatedAt ? new Date(settings.updatedAt.seconds * 1000).toLocaleString() : 'Chưa có'}
            </Text>
          </View>
        </SettingCard>

        {/* Action Buttons */}
        {canManage && (
          <View style={[styles.actionButtons, isMobile && styles.actionButtonsMobile]}>
            <Button
              mode="outlined"
              onPress={resetToDefaults}
              style={[styles.actionButton, isMobile && styles.actionButtonMobile]}
            >
              Khôi phục mặc định
            </Button>
            <Button
              mode="contained"
              onPress={saveSettings}
              loading={saving}
              disabled={saving}
              style={styles.actionButton}
            >
              {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
            </Button>
          </View>
        )}
      </ScrollView>

      {/* Success Modal - Save Settings */}
      <CommonModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Thành công"
        message="Đã lưu cài đặt hệ thống"
        confirmText="Đóng"
        showCancel={false}
        confirmButtonStyle="success"
        onConfirm={() => setShowSuccessModal(false)}
      />

      {/* Confirm Reset Modal */}
      <CommonModal
        visible={showResetConfirmModal}
        onClose={() => setShowResetConfirmModal(false)}
        title="Khôi phục mặc định"
        message="Bạn có chắc chắn muốn khôi phục tất cả cài đặt về mặc định?"
        confirmText="Khôi phục"
        cancelText="Hủy"
        showCancel={true}
        confirmButtonStyle="danger"
        onConfirm={handleConfirmReset}
        onCancel={() => setShowResetConfirmModal(false)}
      />

      {/* Reset Success Modal */}
      <CommonModal
        visible={showResetSuccessModal}
        onClose={() => setShowResetSuccessModal(false)}
        title="Thành công"
        message="Đã khôi phục cài đặt mặc định"
        confirmText="Đóng"
        showCancel={false}
        confirmButtonStyle="success"
        onConfirm={() => setShowResetSuccessModal(false)}
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
  headerMobile: {
    padding: 12,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  backButtonTextMobile: {
    fontSize: 14,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  titleMobile: {
    fontSize: 16,
  },
  headerSpacer: {
    width: 40,
  },
  headerSpacerMobile: {
    width: 32,
  },
  warningCard: {
    margin: 16,
    marginBottom: 8,
  },
  warningCardMobile: {
    margin: 12,
    marginBottom: 6,
  },
  warningText: {
    color: '#856404',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  contentMobile: {
    paddingHorizontal: 12,
  },
  settingCard: {
    marginVertical: 8,
  },
  settingCardMobile: {
    marginVertical: 6,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingRowMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
  },
  settingLabel: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  disabledLabel: {
    color: '#999',
  },
  settingInput: {
    width: 120,
    height: 40,
  },
  divider: {
    marginVertical: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
  frequencyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  frequencyContainerMobile: {
    flexDirection: 'column',
    gap: 8,
  },
  frequencyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedFrequency: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
  disabledButton: {
    opacity: 0.5,
  },
  frequencyText: {
    fontSize: 12,
    color: '#666',
  },
  selectedFrequencyText: {
    color: '#fff',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 24,
  },
  actionButtonsMobile: {
    flexDirection: 'column',
    paddingVertical: 16,
    gap: 8,
  },
  actionButton: {
    minWidth: 140,
  },
  actionButtonMobile: {
    width: '100%',
  },
});

export default SystemSettings;