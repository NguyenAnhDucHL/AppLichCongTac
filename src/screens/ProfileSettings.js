import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, Image, Modal } from 'react-native';
import { Text, Card, TextInput, Button, ActivityIndicator, Avatar, Switch, Divider, Portal } from 'react-native-paper';
import { Svg, Path } from 'react-native-svg';
import { CameraIcon } from '../components/PlatformIcon';
import * as ImagePicker from 'expo-image-picker';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getCurrentUser, logout, hashPassword } from '../services/AuthService';
import CommonModal from '../components/CommonModal';

// Custom Eye Icon Component
const EyeIcon = ({ size = 24, color = '#666' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
      fill={color}
    />
  </Svg>
);

// Custom Eye Off Icon Component
const EyeOffIcon = ({ size = 24, color = '#666' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
      fill={color}
    />
  </Svg>
);


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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showViewAvatarModal, setShowViewAvatarModal] = useState(false);

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
          // Ưu tiên Base64, fallback về URL
          setAvatarUrl(userData.avatarBase64 || userData.avatarUrl || null);
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
        avatarBase64: typeof avatarUrl === 'string' && avatarUrl.startsWith('data:') ? avatarUrl : null,
        avatarUrl: typeof avatarUrl === 'string' && !avatarUrl.startsWith('data:') ? avatarUrl : null,
        updatedAt: new Date()
      };

      // Hash password mới với bcrypt nếu có
      if (profile.newPassword) {
        updateData.password = await hashPassword(profile.newPassword);
      }

      await updateDoc(doc(db, 'users', currentUser.id), updateData);
      
      // Hiển thị modal thành công
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

  const handleSuccessModalClose = async () => {
    setShowSuccessModal(false);
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

  // Request permission và chọn ảnh
  const pickImage = async () => {
    try {
      if (Platform.OS === 'web') {
        // Web: Sử dụng input file
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
          const file = e.target.files[0];
          if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
              Alert.alert('Lỗi', 'Kích thước ảnh không được vượt quá 5MB');
              return;
            }
            
            // Validate file type
            if (!file.type.startsWith('image/')) {
              Alert.alert('Lỗi', 'Vui lòng chọn file ảnh');
              return;
            }

            // Create preview URL
            const imageUrl = URL.createObjectURL(file);
            await uploadImageFromFile(file, imageUrl);
          }
        };
        input.click();
      } else {
        // Mobile: Sử dụng expo-image-picker
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Quyền truy cập', 'Cần quyền truy cập thư viện ảnh để chọn ảnh đại diện');
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets[0]) {
          await uploadImage(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  // Convert file to Base64 và resize nếu cần
  const fileToBase64 = (file, maxSizeKB = 500) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const base64 = e.target.result;
        // Kiểm tra kích thước (Base64 lớn hơn file gốc ~33%)
        const sizeInKB = (base64.length * 3) / 4 / 1024;
        
        if (sizeInKB > maxSizeKB) {
          // Resize ảnh nếu quá lớn
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            
            // Tính toán kích thước mới để đạt maxSizeKB
            const ratio = Math.sqrt((maxSizeKB * 1024) / (width * height * 4));
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert về Base64 với quality 0.8
            const resizedBase64 = canvas.toDataURL('image/jpeg', 0.8);
            resolve(resizedBase64);
          };
          img.onerror = reject;
          img.src = base64;
        } else {
          resolve(base64);
        }
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Upload ảnh từ file (cho web) - Lưu dạng Base64 vào Firestore
  const uploadImageFromFile = async (file, previewUrl) => {
    if (!currentUser) return;

    try {
      setUploading(true);

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        Alert.alert('Lỗi', 'Kích thước ảnh không được vượt quá 2MB');
        return;
      }

      // Convert to Base64 và resize nếu cần
      const base64String = await fileToBase64(file, 500); // Max 500KB sau khi resize

      // Revoke preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      // Lưu Base64 vào Firestore
      await updateDoc(doc(db, 'users', currentUser.id), {
        avatarBase64: base64String,
        avatarUrl: null, // Clear old URL if exists
        updatedAt: new Date()
      });

      // Cập nhật state để hiển thị ảnh
      setAvatarUrl(base64String);

      Alert.alert('Thành công', 'Ảnh đại diện đã được cập nhật');
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Lỗi', 'Không thể tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setUploading(false);
    }
  };

  // Upload ảnh (cho mobile) - Lưu dạng Base64 vào Firestore
  const uploadImage = async (imageUri) => {
    if (!currentUser) return;

    try {
      setUploading(true);

      // Fetch ảnh và convert sang Base64
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // Convert blob to Base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        
        // Kiểm tra kích thước
        const sizeInKB = (base64String.length * 3) / 4 / 1024;
        if (sizeInKB > 500) {
          Alert.alert('Lỗi', 'Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn.');
          setUploading(false);
          return;
        }

        // Lưu Base64 vào Firestore
        await updateDoc(doc(db, 'users', currentUser.id), {
          avatarBase64: base64String,
          avatarUrl: null, // Clear old URL if exists
          updatedAt: new Date()
        });

        // Cập nhật state
        setAvatarUrl(base64String);

        Alert.alert('Thành công', 'Ảnh đại diện đã được cập nhật');
        setUploading(false);
      };
      reader.onerror = () => {
        Alert.alert('Lỗi', 'Không thể đọc ảnh');
        setUploading(false);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Lỗi', 'Không thể tải ảnh lên. Vui lòng thử lại.');
      setUploading(false);
    }
  };

  // Xóa ảnh đại diện
  const deleteAvatar = async () => {
    if (!avatarUrl || !currentUser) return;

    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn xóa ảnh đại diện?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              setUploading(true);

              // Xóa Base64 và URL từ Firestore
              await updateDoc(doc(db, 'users', currentUser.id), {
                avatarBase64: null,
                avatarUrl: null,
                updatedAt: new Date()
              });

              setAvatarUrl(null);
              Alert.alert('Thành công', 'Ảnh đại diện đã được xóa');
            } catch (error) {
              console.error('Error deleting avatar:', error);
              Alert.alert('Lỗi', 'Không thể xóa ảnh');
            } finally {
              setUploading(false);
            }
          }
        }
      ]
    );
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
            <View style={styles.avatarContainer}>
              <TouchableOpacity
                onPress={() => setShowAvatarMenu(true)}
                activeOpacity={0.8}
                disabled={uploading}
              >
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    style={[styles.avatarImage, { backgroundColor: profile.avatarColor }]}
                  />
                ) : (
                  <Avatar.Text
                    size={80}
                    label={profile.avatarInitials}
                    style={[styles.avatar, { backgroundColor: profile.avatarColor }]}
                  />
                )}
                {uploading && (
                  <View style={styles.avatarOverlay}>
                    <ActivityIndicator size="small" color="#fff" />
                  </View>
                )}
                {!uploading && (
                  <View style={styles.avatarCameraIcon}>
                    <CameraIcon size={16} color="#fff" style={styles.cameraIcon} />
                  </View>
                )}
              </TouchableOpacity>
            </View>
            
            {/* Avatar Menu (Facebook style) - Positioned near avatar */}
            {showAvatarMenu && (
              <Portal>
                <>
                  <TouchableOpacity
                    style={styles.menuBackdrop}
                    activeOpacity={1}
                    onPress={() => setShowAvatarMenu(false)}
                  />
                  <View style={styles.avatarMenuWrapper}>
                    <View style={styles.avatarMenuContainer}>
                      <View style={styles.menuPointer} />
                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                          setShowAvatarMenu(false);
                          if (avatarUrl) {
                            setShowViewAvatarModal(true);
                          } else {
                            Alert.alert('Thông báo', 'Bạn chưa có ảnh đại diện');
                          }
                        }}
                      >
                        <Avatar.Icon size={20} icon="account" style={styles.menuIcon} />
                        <Text style={styles.menuItemText}>Xem ảnh đại diện</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => {
                          setShowAvatarMenu(false);
                          pickImage();
                        }}
                      >
                        <Avatar.Icon size={20} icon="image" style={styles.menuIcon} />
                        <Text style={styles.menuItemText}>Chọn ảnh đại diện</Text>
                      </TouchableOpacity>
                      {avatarUrl && (
                        <TouchableOpacity
                          style={[styles.menuItem, styles.menuItemDelete]}
                          onPress={() => {
                            setShowAvatarMenu(false);
                            deleteAvatar();
                          }}
                        >
                          <Avatar.Icon size={20} icon="delete" style={styles.menuIconDelete} />
                          <Text style={[styles.menuItemText, styles.menuItemTextDelete]}>Xóa ảnh đại diện</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </>
              </Portal>
            )}
            <View style={styles.avatarInfo}>
              <Text style={styles.avatarName}>{profile.fullName}</Text>
              <Text style={styles.avatarRole}>
                {currentUser?.role === 'admin' ? 'Quản trị viên' : 
                 currentUser?.role === 'editor' ? 'Biên tập viên' : 'Người xem'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* View Avatar Modal */}
        <Modal
          visible={showViewAvatarModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowViewAvatarModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowViewAvatarModal(false)}
          >
            <View style={styles.viewAvatarContainer}>
              {avatarUrl && (
                <Image
                  source={{ uri: avatarUrl }}
                  style={styles.viewAvatarImage}
                  resizeMode="contain"
                />
              )}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowViewAvatarModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Avatar Customization */}
        <Card style={styles.settingCard}>
          <Card.Content>
            <Text style={styles.settingTitle}>Tùy chỉnh Avatar</Text>
            
            <Text style={styles.avatarHint}>
              {avatarUrl 
                ? 'Click vào ảnh đại diện ở trên để xem hoặc thay đổi ảnh'
                : 'Click vào avatar ở trên để chọn ảnh, hoặc tùy chỉnh avatar với initials và màu sắc bên dưới'}
            </Text>
            
            <TextInput
              label="Initials (2 ký tự)"
              value={profile.avatarInitials}
              onChangeText={(text) => updateProfile('avatarInitials', text.toUpperCase().substring(0, 2))}
              style={styles.input}
              mode="outlined"
              maxLength={2}
              disabled={!!avatarUrl}
            />
            
            <Text style={styles.label}>Màu avatar (khi không có ảnh):</Text>
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
                  disabled={!!avatarUrl}
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
                />
                
                <TextInput
                  label="Tên đăng nhập"
                  value={profile.username}
                  style={styles.input}
                  mode="outlined"
                  editable={false}
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
                
                <View style={styles.passwordInputWrapper}>
                  <TextInput
                    label="Mật khẩu mới"
                    value={profile.newPassword}
                    onChangeText={(text) => updateProfile('newPassword', text)}
                    style={styles.input}
                    mode="outlined"
                    secureTextEntry={!showNewPassword}
                    placeholder="Ít nhất 6 ký tự"
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    style={styles.eyeIcon}
                    activeOpacity={0.7}
                  >
                    {showNewPassword ? (
                      <EyeOffIcon size={24} color="#666" />
                    ) : (
                      <EyeIcon size={24} color="#666" />
                    )}
                  </TouchableOpacity>
                </View>
                
                <View style={styles.passwordInputWrapper}>
                  <TextInput
                    label="Xác nhận mật khẩu mới"
                    value={profile.confirmPassword}
                    onChangeText={(text) => updateProfile('confirmPassword', text)}
                    style={styles.input}
                    mode="outlined"
                    secureTextEntry={!showConfirmPassword}
                    error={profile.newPassword && profile.confirmPassword && profile.newPassword !== profile.confirmPassword}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                    activeOpacity={0.7}
                  >
                    {showConfirmPassword ? (
                      <EyeOffIcon size={24} color="#666" />
                    ) : (
                      <EyeIcon size={24} color="#666" />
                    )}
                  </TouchableOpacity>
                </View>
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

      {/* Success Modal */}
      <CommonModal
        visible={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="Thành công"
        message="Đã cập nhật thông tin cá nhân"
        confirmText="Đóng"
        showCancel={false}
        confirmButtonStyle="success"
        onConfirm={handleSuccessModalClose}
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
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    marginRight: 16,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarCameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1976d2',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  cameraIcon: {
    backgroundColor: 'transparent',
  },
  menuBackdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
    backgroundColor: 'transparent',
  },
  avatarMenuWrapper: {
    position: 'fixed',
    top: 100,
    left: 20,
    zIndex: 999,
  },
  avatarMenuContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 200,
    overflow: 'visible',
    position: 'relative',
  },
  menuPointer: {
    position: 'absolute',
    top: -8,
    left: 60,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#fff',
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingHorizontal: 16,
  },
  menuItemDelete: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  menuIcon: {
    backgroundColor: 'transparent',
    marginRight: 12,
  },
  menuIconDelete: {
    backgroundColor: 'transparent',
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 14,
    color: '#333',
  },
  menuItemTextDelete: {
    color: '#d32f2f',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewAvatarContainer: {
    width: '90%',
    maxWidth: 500,
    position: 'relative',
  },
  viewAvatarImage: {
    width: '100%',
    height: '80%',
    maxHeight: 500,
    borderRadius: 8,
  },
  closeButton: {
    position: 'absolute',
    top: -40,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  avatarInfo: {
    flex: 1,
  },
  avatarActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  avatarButton: {
    flex: 1,
  },
  avatarHint: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 16,
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
    paddingRight: 50, // Space for icon
  },
  passwordInputWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  eyeIcon: {
    position: 'absolute',
    right: 8,
    top: 8,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
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
    alignItems: 'center',
  },
  saveButton: {
    alignSelf: 'center',
    minWidth: 120,
  },
  saveButtonContent: {
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
});

export default ProfileSettings;