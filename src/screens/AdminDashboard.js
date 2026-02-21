import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, Image, useWindowDimensions } from 'react-native';
import { Text, Card, Avatar, Divider, Button, ActivityIndicator, Menu, useTheme } from 'react-native-paper';
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
import {
  CalendarEditIcon,
  AccountGroupIcon,
  ChartLineIcon,
  CogIcon,
  ChevronRightIcon,
  AccountIcon
} from '../components/PlatformIcon';

const BREAKPOINT_MOBILE = 768;

const AdminDashboard = ({ onLogout, onBack, navigate }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < BREAKPOINT_MOBILE;
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

  const theme = useTheme();

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

    // Map icon names to PlatformIcon components
    const iconMap = {
      'calendar-edit': CalendarEditIcon,
      'account-group': AccountGroupIcon,
      'chart-line': ChartLineIcon,
      'cog': CogIcon,
    };

    const IconComponent = iconMap[icon] || CalendarEditIcon;

    return (
      <TouchableOpacity style={[styles.menuItem, isMobile && styles.menuItemMobile]} onPress={onPress}>
        <View style={styles.menuContent}>
          <IconComponent size={isMobile ? 32 : 40} color={theme.colors.primary} style={styles.menuIcon} />
          <View style={styles.menuText}>
            <Text style={[styles.menuTitle, isMobile && styles.menuTitleMobile, { color: theme.colors.onSurface }]}>{title}</Text>
            <Text style={[styles.menuDescription, isMobile && styles.menuDescriptionMobile, { color: theme.colors.onSurfaceVariant }]}>{description}</Text>
          </View>
          <ChevronRightIcon size={24} color={theme.colors.onSurfaceVariant} style={styles.chevron} />
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
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, isMobile && styles.headerMobile, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, isMobile && styles.headerTitleMobile]}>Admin Dashboard</Text>
          <Text style={[styles.headerSubtitle, isMobile && styles.headerSubtitleMobile]}>UBND Phường Cẩm Phả</Text>
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
            contentStyle={[styles.googleMenuContent, { backgroundColor: theme.colors.surface }]}
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
                <Text style={[styles.googleUserName, { color: theme.colors.onSurface }]}>{user?.fullName || 'Người dùng'}</Text>
                <Text style={[styles.googleUserEmail, { color: theme.colors.onSurfaceVariant }]}>{user?.email || 'email@example.com'}</Text>
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
                <AccountIcon size={20} color={theme.colors.onSurfaceVariant} style={styles.googleMenuIcon} />
                <Text style={[styles.googleMenuText, { color: theme.colors.onSurface }]}>Quản lý tài khoản</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.googleMenuItem}
                onPress={() => {
                  setShowUserMenu(false);
                  setCurrentScreen('settings');
                }}
              >
                <CogIcon size={20} color={theme.colors.onSurfaceVariant} style={styles.googleMenuIcon} />
                <Text style={[styles.googleMenuText, { color: theme.colors.onSurface }]}>Cài đặt hệ thống</Text>
              </TouchableOpacity>
            </View>

            <Divider style={styles.googleDivider} />

            {/* Logout Button */}
            <TouchableOpacity
              style={[styles.googleLogoutButton, { backgroundColor: theme.colors.surfaceVariant }]}
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

      <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile, { color: theme.colors.onSurface }]}>Tổng quan</Text>
      <View style={[styles.statsContainer, isMobile && styles.statsContainerMobile]}>
        <View style={[styles.statsGrid, isMobile && styles.statsGridMobile]}>
          <Card style={[styles.statCard, isMobile && styles.statCardMobile, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.statContent}>
              <Text style={[styles.statNumber, { color: theme.colors.primary }]}>{stats.todayEvents}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Sự kiện hôm nay</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.statCard, isMobile && styles.statCardMobile, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.statContent}>
              <Text style={[styles.statNumber, { color: theme.colors.primary }]}>{stats.weekEvents}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Sự kiện tuần này</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.statCard, isMobile && styles.statCardMobile, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.statContent}>
              <Text style={[styles.statNumber, { color: theme.colors.primary }]}>{stats.monthEvents}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Sự kiện tháng này</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.statCard, isMobile && styles.statCardMobile, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.statContent}>
              <Text style={[styles.statNumber, { color: theme.colors.primary }]}>{stats.totalUsers}</Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Người dùng</Text>
            </Card.Content>
          </Card>
        </View>
      </View>

      <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile, { color: theme.colors.onSurface }]}>Chức năng</Text>
      <Card style={[styles.menuCard, isMobile && styles.menuCardMobile, { backgroundColor: theme.colors.surface }]}>
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

      <View style={[styles.backContainer, isMobile && styles.backContainerMobile]}>
        <Button mode="outlined" onPress={onBack} style={[styles.backButton, isMobile && styles.backButtonMobile]}>
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
  headerMobile: {
    padding: 12,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerTitleMobile: {
    fontSize: 18,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e3f2fd',
    marginTop: 2,
  },
  headerSubtitleMobile: {
    fontSize: 12,
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
  sectionTitleMobile: {
    marginHorizontal: 12,
    marginTop: 16,
    marginBottom: 8,
    fontSize: 16,
  },
  statsContainer: {
    paddingHorizontal: 20,
  },
  statsContainerMobile: {
    paddingHorizontal: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statsGridMobile: {
    justifyContent: 'flex-start',
  },
  statCard: {
    width: '48%',
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  statCardMobile: {
    width: '48%',
    minWidth: '48%',
    marginBottom: 8,
    backgroundColor: '#fff',
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
    backgroundColor: '#fff',
  },
  menuCardMobile: {
    marginHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  menuCardContent: {
    paddingVertical: 8,
  },
  menuItem: {
    paddingVertical: 16,
  },
  menuItemMobile: {
    paddingVertical: 12,
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
  menuTitleMobile: {
    fontSize: 14,
  },
  menuDescription: {
    fontSize: 12,
    color: '#666',
  },
  menuDescriptionMobile: {
    fontSize: 11,
  },
  chevron: {
    backgroundColor: 'transparent',
  },
  backContainer: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  backContainerMobile: {
    padding: 12,
    paddingBottom: 24,
  },
  backButton: {
    borderColor: '#1976d2',
    alignSelf: 'center',
    minWidth: 140,
  },
  backButtonMobile: {
    minWidth: 120,
  },
});

export default AdminDashboard;