import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Text, Card, TextInput, Button, ActivityIndicator, Avatar, Switch, Divider } from 'react-native-paper';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getCurrentUser, logout } from '../services/AuthService';

const ProfileSettings = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    username: '',
    department: '',
    phone: '',
    bio: '',
    newPassword: '',
    confirmPassword: '',
    emailNotifications: true,
    pushNotifications: true,
    avatarInitials: '',
    avatarColor: '#1976d2'
  });
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (user) {
        setCurrentUser(user);
        
        // Load full user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.id));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfile({
            fullName: userData.fullName || '',
            email: userData.email || '',
            username: userData.username || '',
            department: userData.department || '',
            phone: userData.phone || '',
            bio: userData.bio || '',
            newPassword: '',
            confirmPassword: '',
            emailNotifications: userData.emailNotifications !== false,
            pushNotifications: userData.pushNotifications !== false,
            avatarInitials: userData.avatarInitials || userData.fullName?.charAt(0) || 'U',
            avatarColor: userData.avatarColor || '#1976d2'
          });
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin cá nhân');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!profile.fullName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ và tên');
      return false;
    }

    if (!profile.email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profile.email)) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return false;
    }

    if (profile.newPassword && profile.newPassword !== profile.confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return false;
    }

    if (profile.newPassword && profile.newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);
      
      const updateData = {
        fullName: profile.fullName,
        department: profile.department,
        phone: profile.phone,
        bio: profile.bio,
        emailNotifications: profile.emailNotifications,
        pushNotifications: profile.pushNotifications,
        avatarInitials: profile.avatarInitials,
        avatarColor: profile.avatarColor,
        updatedAt: new Date()
      };

      // Hash password mới nếu có
      if (profile.newPassword) {
        updateData.password = Platform.OS === 'web' 
          ? btoa(unescape(encodeURIComponent(profile.newPassword)))
          : Buffer.from(profile.newPassword, 'utf8').toString('base64');
      }

      await updateDoc(doc(db, 'users', currentUser.id), updateData);
      
      Alert.alert('Thành công', 'Đã cập nhật thông tin cá nhân', [
        { text: 'OK', onPress: () => {
          if (profile.newPassword) {
            // Nếu đổi mật khẩu, logout để login lại
            Alert.alert(
              'Thông báo',
              'Mật khẩu đã được thay đổi. Vui lòng đăng nhập lại.',
              [
                { text: 'OK', onPress: async () => {
                  await logout();
                  onBack();
                }}
              ]
            );
          }
        }}
      ]);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  const getAvatarColors = () => [
    '#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2',
    '#00796b', '#455a64', '#e64a19', '#5d4037', '#303f9f'
  ];

  const generateInitials = (fullName) => {
    return fullName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const updateProfile = (field, value) => {
    if (field === 'fullName') {
      // Tự động update initials khi đổi tên
      const initials = generateInitials(value);
      setProfile(prev => ({
        ...prev,
        [field]: value,
        avatarInitials: initials
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Đang tải thông tin cá nhân...</Text>
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
        <Text style={styles.title}>Thông tin cá nhân</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        {/* Avatar Section */}
        <Card style={styles.avatarCard}>
          <Card.Content style={styles.avatarSection}>
            <Avatar.Text
              size={80}
              label={profile.avatarInitials}
              style={[styles.avatar, { backgroundColor: profile.avatarColor }]}
            />
            <View style={styles.avatarInfo}>
              <Text style={styles.avatarName}>{profile.fullName}</Text>
              <Text style={styles.avatarRole}>
                {currentUser?.role === 'admin' ? 'Quản trị viên' : 
                 currentUser?.role === 'editor' ? 'Biên tập viên' : 'Người xem'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Avatar Customization */}
        <Card style={styles.settingCard}>
          <Card.Content>
            <Text style={styles.settingTitle}>Tùy chỉnh Avatar</Text>
            
            <TextInput
              label="Initials (2 ký tự)"
              value={profile.avatarInitials}
              onChangeText={(text) => updateProfile('avatarInitials', text.toUpperCase().substring(0, 2))}
              style={styles.input}
              mode="outlined"
              maxLength={2}
            />
            
            <Text style={styles.label}>Màu avatar:</Text>
            <View style={styles.colorPicker}>
              {getAvatarColors().map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    profile.avatarColor === color && styles.selectedColor
                  ]}
                  onPress={() => updateProfile('avatarColor', color)}
                />
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Basic Information */}
        <Card style={styles.settingCard}>
          <Card.Content>
            <Text style={styles.settingTitle}>Thông tin cơ bản</Text>
            
            <TextInput
              label="Họ và tên *"
              value={profile.fullName}
              onChangeText={(text) => updateProfile('fullName', text)}
              style={styles.input}
              mode="outlined"
            />
            
            <TextInput
              label="Email *"
              value={profile.email}
              onChangeText={(text) => updateProfile('email', text)}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
              editable={false}
              right={<TextInput.Icon icon="lock" />}
            />
            
            <TextInput
              label="Tên đăng nhập"
              value={profile.username}
              style={styles.input}
              mode="outlined"
              editable={false}
              right={<TextInput.Icon icon="lock" />}
            />
            
            <TextInput
              label="Phòng ban"
              value={profile.department}
              onChangeText={(text) => updateProfile('department', text)}
              style={styles.input}
              mode="outlined"
            />
            
            <TextInput
              label="Số điện thoại"
              value={profile.phone}
              onChangeText={(text) => updateProfile('phone', text)}
              style={styles.input}
              mode="outlined"
              keyboardType="phone-pad"
            />
            
            <TextInput
              label="Ghi chú"
              value={profile.bio}
              onChangeText={(text) => updateProfile('bio', text)}
              style={styles.input}
              mode="outlined"
              multiline
              numberOfLines={3}
              placeholder="Thông tin thêm về bạn..."
            />
          </Card.Content>
        </Card>

        {/* Password Section */}
        <Card style={styles.settingCard}>
          <Card.Content>
            <TouchableOpacity
              style={styles.sectionToggle}
              onPress={() => setShowPasswordSection(!showPasswordSection)}
            >
              <Text style={styles.settingTitle}>Đổi mật khẩu</Text>
              <Text style={styles.toggleIcon}>{showPasswordSection ? '−' : '+'}</Text>
            </TouchableOpacity>
            
            {showPasswordSection && (
              <>
                <Text style={styles.passwordHint}>
                  Để trống nếu không muốn đổi mật khẩu
                </Text>
                
                <TextInput
                  label="Mật khẩu mới"
                  value={profile.newPassword}
                  onChangeText={(text) => updateProfile('newPassword', text)}
                  style={styles.input}
                  mode="outlined"
                  secureTextEntry
                  placeholder="Ít nhất 6 ký tự"
                />
                
                <TextInput
                  label="Xác nhận mật khẩu mới"
                  value={profile.confirmPassword}
                  onChangeText={(text) => updateProfile('confirmPassword', text)}
                  style={styles.input}
                  mode="outlined"
                  secureTextEntry
                  error={profile.newPassword && profile.confirmPassword && profile.newPassword !== profile.confirmPassword}
                />
              </>
            )}
          </Card.Content>
        </Card>

        {/* Notification Preferences */}
        <Card style={styles.settingCard}>
          <Card.Content>
            <Text style={styles.settingTitle}>Tùy chọn thông báo</Text>
            
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Email thông báo</Text>
              <Switch
                value={profile.emailNotifications}
                onValueChange={(value) => updateProfile('emailNotifications', value)}
              />
            </View>
            <Divider style={styles.divider} />
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Push notifications</Text>
              <Switch
                value={profile.pushNotifications}
                onValueChange={(value) => updateProfile('pushNotifications', value)}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Account Info */}
        <Card style={styles.settingCard}>
          <Card.Content>
            <Text style={styles.settingTitle}>Thông tin tài khoản</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Vai trò:</Text>
              <Text style={styles.infoValue}>
                {currentUser?.role === 'admin' ? 'Quản trị viên' : 
                 currentUser?.role === 'editor' ? 'Biên tập viên' : 'Người xem'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Đăng nhập cuối:</Text>
              <Text style={styles.infoValue}>
                {currentUser?.lastLogin ? new Date(currentUser.lastLogin).toLocaleString() : 'Chưa có'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Save button */}
        <View style={styles.saveSection}>
          <Button
            mode="contained"
            onPress={handleSave}
            loading={saving}
            disabled={saving}
            style={styles.saveButton}
            contentStyle={styles.saveButtonContent}
          >
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  avatarCard: {
    marginVertical: 16,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 16,
  },
  avatarInfo: {
    flex: 1,
  },
  avatarName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  avatarRole: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  settingCard: {
    marginBottom: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  sectionToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  passwordHint: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 12,
    marginTop: 8,
  },
  input: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    marginTop: 8,
  },
  colorPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#333',
    borderWidth: 3,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLabel: {
    fontSize: 14,
    color: '#333',
  },
  divider: {
    marginVertical: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
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
  saveSection: {
    paddingVertical: 24,
  },
  saveButton: {
    marginHorizontal: 20,
  },
  saveButtonContent: {
    paddingVertical: 8,
  },
});

export default ProfileSettings;