import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, Image } from 'react-native';
import { Text, Card, Avatar, Divider, Button, ActivityIndicator, Menu } from 'react-native-paper';
import { useLocation } from 'react-router-dom';
import { logout, getCurrentUser, hasPermission } from '../services/AuthService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import ScheduleManagement from './ScheduleManagement';
import UserManagement from './UserManagement';
import ReportsAnalytics from './ReportsAnalytics';
import SystemSettings from './SystemSettings';
import ProfileSettings from './ProfileSettings';
import CommonModal from '../components/CommonModal';

const AdminDashboard = ({ onLogout, onBack, navigate }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [stats, setStats] = useState({
    todayEvents: 0,
    weekEvents: 0,
    monthEvents: 0,
    totalUsers: 0
  });
  
  // Sử dụng useLocation để detect khi quay lại từ ProfileSettings
  const location = useLocation();

  useEffect(() => {
    loadUserData();
    loadStats();
  }, []);

  // Reload user data khi quay lại từ ProfileSettings
  useEffect(() => {
    // Khi location.pathname là /app/admin và không phải lần đầu mount
    if (location.pathname === '/app/admin' && currentScreen === 'dashboard' && user) {
      loadUserData();
    }
  }, [location.pathname]);

  const loadUserData = async () => {
    try {
      const userData = await getCurrentUser();
      if (userData) {
        // Load full user data từ Firestore để có avatarBase64/avatarUrl mới nhất
        const userDoc = await getDoc(doc(db, 'users', userData.id));
        if (userDoc.exists()) {
          const fullUserData = userDoc.data();
          setUser({
            ...userData,
            ...fullUserData,
            id: userData.id,
            // Ưu tiên Base64, fallback về URL
            avatarUrl: fullUserData.avatarBase64 || fullUserData.avatarUrl || null
          });
        } else {
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    // TODO: Implement thống kê thực tế từ database
    // Tạm thời dùng dữ liệu fake
    setStats({
      todayEvents: 5,
      weekEvents: 23,
      monthEvents: 87,
      totalUsers: 3
    });
  };

  const handleLogout = () => {
    // Hiển thị modal confirmation
    setShowLogoutModal(true);
  };

  const performLogout = async () => {
    try {
      console.log('🔄 Bắt đầu logout...');
      setShowLogoutModal(false);
      await logout();
      console.log('✅ Logout thành công');
      
      // Luôn gọi callback để quay về trang chủ
      if (onLogout) {
        onLogout();
      }
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Vẫn gọi callback để quay về trang chủ dù có lỗi
      if (onLogout) {
        onLogout();
      } else {
        Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
      }
    }
  };

  const MenuItem = ({ title, description, icon, onPress, requirePermission }) => {
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
      const checkPermission = async () => {
        if (!requirePermission) {
          setHasAccess(true);
          return;
        }
        const access = await hasPermission(requirePermission);
        setHasAccess(access);
      };
      checkPermission();
    }, [requirePermission]);

    if (!hasAccess) return null;

    return (
      <TouchableOpacity style={styles.menuItem} onPress={onPress}>
        <View style={styles.menuContent}>
          <Avatar.Icon size={40} icon={icon} style={styles.menuIcon} />
          <View style={styles.menuText}>
            <Text style={styles.menuTitle}>{title}</Text>
            <Text style={styles.menuDescription}>{description}</Text>
          </View>
          <Avatar.Icon size={24} icon="chevron-right" style={styles.chevron} />
        </View>
      </TouchableOpacity>
    );
  };

  // Render different screens
  if (currentScreen === 'schedule') {
    const handleBack = navigate 
      ? () => navigate('/app/admin')
      : () => setCurrentScreen('dashboard');
    return <ScheduleManagement onBack={handleBack} />;
  }

  if (currentScreen === 'users') {
    const handleBack = navigate 
      ? () => navigate('/app/admin')
      : () => setCurrentScreen('dashboard');
    return <UserManagement onBack={handleBack} />;
  }

  if (currentScreen === 'reports') {
    return <ReportsAnalytics onBack={() => setCurrentScreen('dashboard')} />;
  }

  if (currentScreen === 'settings') {
    return <SystemSettings onBack={() => setCurrentScreen('dashboard')} />;
  }

  if (currentScreen === 'profile') {
    return (
      <ProfileSettings 
        onBack={() => {
          setCurrentScreen('dashboard');
          // Reload user data khi quay lại để hiển thị avatar mới
          loadUserData();
        }} 
      />
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header với dropdown menu hiện đại */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>UBND Phường Cẩm Phả</Text>
        </View>
        
        <View style={styles.userMenuContainer}>
          <Menu
            visible={showUserMenu}
            onDismiss={() => setShowUserMenu(false)}
            anchor={
              <TouchableOpacity 
                style={styles.googleUserTrigger}
                onPress={() => setShowUserMenu(true)}
              >
                {user?.avatarUrl ? (
                  <Image
                    source={{ uri: user.avatarUrl }}
                    style={[styles.googleAvatarImage, { backgroundColor: user?.avatarColor || '#1976d2' }]}
                  />
                ) : (
                  <Avatar.Text 
                    size={36} 
                    label={user?.avatarInitials || user?.fullName?.charAt(0) || 'A'}
                    style={[styles.googleAvatar, { backgroundColor: user?.avatarColor || '#1976d2' }]}
                  />
                )}
              </TouchableOpacity>
            }
            contentStyle={styles.googleMenuContent}
          >
            {/* User Info Section */}
            <View style={styles.googleMenuHeader}>
              {user?.avatarUrl ? (
                <Image
                  source={{ uri: user.avatarUrl }}
                  style={[styles.googleMenuAvatarImage, { backgroundColor: user?.avatarColor || '#1976d2' }]}
                />
              ) : (
                <Avatar.Text 
                  size={48} 
                  label={user?.avatarInitials || user?.fullName?.charAt(0) || 'A'}
                  style={[styles.googleMenuAvatar, { backgroundColor: user?.avatarColor || '#1976d2' }]}
                />
              )}
              <View style={styles.googleUserInfo}>
                <Text style={styles.googleUserName}>{user?.fullName || 'Người dùng'}</Text>
                <Text style={styles.googleUserEmail}>{user?.email || 'email@example.com'}</Text>
              </View>
            </View>

            <Divider style={styles.googleDivider} />

            {/* Menu Items */}
            <View style={styles.googleMenuItems}>
              <TouchableOpacity
                style={styles.googleMenuItem}
                onPress={() => {
                  setShowUserMenu(false);
                  setCurrentScreen('profile');
                }}
              >
                <Avatar.Icon size={20} icon="account" style={styles.googleMenuIcon} />
                <Text style={styles.googleMenuText}>Quản lý tài khoản</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.googleMenuItem}
                onPress={() => {
                  setShowUserMenu(false);
                  setCurrentScreen('settings');
                }}
              >
                <Avatar.Icon size={20} icon="cog" style={styles.googleMenuIcon} />
                <Text style={styles.googleMenuText}>Cài đặt hệ thống</Text>
              </TouchableOpacity>
            </View>

            <Divider style={styles.googleDivider} />

            {/* Logout Button */}
            <TouchableOpacity
              style={styles.googleLogoutButton}
              onPress={async () => {
                setShowUserMenu(false);
                // Đợi một chút để menu đóng trước
                setTimeout(() => {
                  handleLogout();
                }, 100);
              }}
            >
              <Text style={styles.googleLogoutText}>Đăng xuất</Text>
            </TouchableOpacity>
          </Menu>
        </View>
      </View>

      {/* Thống kê */}
      <Text style={styles.sectionTitle}>Tổng quan</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>{stats.todayEvents}</Text>
              <Text style={styles.statLabel}>Sự kiện hôm nay</Text>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>{stats.weekEvents}</Text>
              <Text style={styles.statLabel}>Sự kiện tuần này</Text>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>{stats.monthEvents}</Text>
              <Text style={styles.statLabel}>Sự kiện tháng này</Text>
            </Card.Content>
          </Card>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>{stats.totalUsers}</Text>
              <Text style={styles.statLabel}>Người dùng</Text>
            </Card.Content>
          </Card>
        </View>
      </View>

      {/* Menu chức năng */}
      <Text style={styles.sectionTitle}>Chức năng</Text>
      <Card style={styles.menuCard}>
        <Card.Content style={styles.menuCardContent}>
          <MenuItem
            icon="calendar-edit"
            title="Quản lý Lịch Công Tác"
            description="Thêm, sửa, xóa lịch công tác"
            requirePermission="schedule:write"
            onPress={() => {
              if (navigate) {
                navigate('/app/admin/schedule');
              } else {
                setCurrentScreen('schedule');
              }
            }}
          />
          <Divider />
          <MenuItem
            icon="account-group"
            title="Quản lý Người Dùng"
            description="Thêm, sửa, phân quyền người dùng"
            requirePermission="user:write"
            onPress={() => {
              if (navigate) {
                navigate('/app/admin/users');
              } else {
                setCurrentScreen('users');
              }
            }}
          />
          <Divider />
          <MenuItem
            icon="chart-line"
            title="Báo cáo & Thống kê"
            description="Xem báo cáo hoạt động và thống kê"
            requirePermission="audit:read"
            onPress={() => setCurrentScreen('reports')}
          />
          <Divider />
          <MenuItem
            icon="cog"
            title="Cài đặt Hệ thống"
            description="Cấu hình hệ thống và thông số"
            requirePermission="system:manage"
            onPress={() => setCurrentScreen('settings')}
          />
        </Card.Content>
      </Card>

      {/* Quay lại */}
      <View style={styles.backContainer}>
        <Button mode="outlined" onPress={onBack} style={styles.backButton}>
          Quay lại trang chủ
        </Button>
      </View>

      {/* Logout Confirmation Modal */}
      <CommonModal
        visible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất?"
        confirmText="Đăng xuất"
        cancelText="Hủy"
        onConfirm={performLogout}
        showCancel={true}
        confirmButtonStyle="destructive"
      />
    </ScrollView>
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
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#1976d2',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e3f2fd',
    marginTop: 2,
  },
  userMenuContainer: {
    position: 'relative',
  },
  googleUserTrigger: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  googleAvatar: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  googleAvatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  googleMenuContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 8,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
    minWidth: 280,
    maxWidth: 320,
  },
  googleMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  googleMenuAvatar: {
    marginRight: 12,
    backgroundColor: '#4285f4',
  },
  googleMenuAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  googleUserInfo: {
    flex: 1,
  },
  googleUserName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#202124',
    marginBottom: 2,
  },
  googleUserEmail: {
    fontSize: 14,
    color: '#5f6368',
  },
  googleDivider: {
    backgroundColor: '#e8eaed',
  },
  googleMenuItems: {
    paddingVertical: 8,
  },
  googleMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 44,
  },
  googleMenuIcon: {
    backgroundColor: 'transparent',
    marginRight: 12,
    width: 20,
    height: 20,
  },
  googleMenuText: {
    fontSize: 14,
    color: '#3c4043',
    flex: 1,
  },
  googleLogoutButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  googleLogoutText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#d93025',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  statsContainer: {
    paddingHorizontal: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    marginBottom: 12,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  menuCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  menuCardContent: {
    paddingVertical: 8,
  },
  menuItem: {
    paddingVertical: 16,
  },
  menuContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    backgroundColor: '#e3f2fd',
    marginRight: 16,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 12,
    color: '#666',
  },
  chevron: {
    backgroundColor: 'transparent',
  },
  backContainer: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  backButton: {
    borderColor: '#1976d2',
    alignSelf: 'center',
    minWidth: 140,
  },
});

export default AdminDashboard;