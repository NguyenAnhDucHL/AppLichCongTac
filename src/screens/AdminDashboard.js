import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Card, Avatar, Divider, Button, ActivityIndicator } from 'react-native-paper';
import { logout, getCurrentUser, hasPermission } from '../services/AuthService';

const AdminDashboard = ({ onLogout, onBack }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayEvents: 0,
    weekEvents: 0,
    monthEvents: 0,
    totalUsers: 0
  });

  useEffect(() => {
    loadUserData();
    loadStats();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await getCurrentUser();
      setUser(userData);
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

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              if (onLogout) {
                onLogout();
              }
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Lỗi', 'Không thể đăng xuất');
            }
          }
        }
      ]
    );
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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Avatar.Text 
            size={60} 
            label={user?.fullName?.charAt(0) || 'A'}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.fullName || 'Người dùng'}</Text>
            <Text style={styles.userRole}>{user?.role === 'admin' ? 'Quản trị viên' : user?.role === 'editor' ? 'Biên tập viên' : 'Người xem'}</Text>
            <Text style={styles.userDepartment}>{user?.department}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Avatar.Icon size={32} icon="logout" style={styles.logoutIcon} />
        </TouchableOpacity>
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
            onPress={() => Alert.alert('Thông báo', 'Tính năng đang phát triển')}
          />
          <Divider />
          <MenuItem
            icon="account-group"
            title="Quản lý Người Dùng"
            description="Thêm, sửa, phân quyền người dùng"
            requirePermission="user:write"
            onPress={() => Alert.alert('Thông báo', 'Tính năng đang phát triển')}
          />
          <Divider />
          <MenuItem
            icon="chart-line"
            title="Báo cáo & Thống kê"
            description="Xem báo cáo hoạt động và thống kê"
            requirePermission="audit:read"
            onPress={() => Alert.alert('Thông báo', 'Tính năng đang phát triển')}
          />
          <Divider />
          <MenuItem
            icon="cog"
            title="Cài đặt Hệ thống"
            description="Cấu hình hệ thống và thông số"
            requirePermission="system:manage"
            onPress={() => Alert.alert('Thông báo', 'Tính năng đang phát triển')}
          />
        </Card.Content>
      </Card>

      {/* Quay lại */}
      <View style={styles.backContainer}>
        <Button mode="outlined" onPress={onBack} style={styles.backButton}>
          Quay lại trang chủ
        </Button>
      </View>
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
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    backgroundColor: '#fff',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#e3f2fd',
    marginBottom: 2,
  },
  userDepartment: {
    fontSize: 12,
    color: '#bbdefb',
  },
  logoutButton: {
    padding: 4,
  },
  logoutIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
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
  },
  backButton: {
    borderColor: '#1976d2',
  },
});

export default AdminDashboard;