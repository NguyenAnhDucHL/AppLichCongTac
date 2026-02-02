import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Text, Card, ActivityIndicator, Chip, Button } from 'react-native-paper';
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { vi } from 'date-fns/locale';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';
import { hasPermission } from '../services/AuthService';
import { CheckboxIcon } from '../components/PlatformIcon';

const BREAKPOINT_MOBILE = 768;

const ReportsAnalytics = ({ onBack }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < BREAKPOINT_MOBILE;
  const [loading, setLoading] = useState(true);
  const [scheduleStats, setScheduleStats] = useState({});
  const [userStats, setUserStats] = useState({});
  const [activityLogs, setActivityLogs] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('week'); // week, month, quarter
  const [canViewAudit, setCanViewAudit] = useState(false);

  useEffect(() => {
    checkPermissions();
    loadReportsData();
  }, [selectedPeriod]);

  const checkPermissions = async () => {
    const auditPermission = await hasPermission('audit:read');
    setCanViewAudit(auditPermission);
  };

  const loadReportsData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadScheduleStats(),
        loadUserStats(),
        canViewAudit && loadActivityLogs()
      ]);
    } catch (error) {
      console.error('Error loading reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadScheduleStats = async () => {
    try {
      const schedulesSnapshot = await getDocs(collection(db, 'schedules'));
      const now = new Date();
      const startDate = getStartDate(selectedPeriod, now);
      
      let totalEvents = 0;
      let totalDays = 0;
      let eventsByDay = {};
      let eventsByTime = {};
      
      schedulesSnapshot.forEach(doc => {
        const data = doc.data();
        const scheduleDate = new Date(data.date);
        
        if (isWithinInterval(scheduleDate, { start: startDate, end: now })) {
          totalDays++;
          const events = data.events || [];
          totalEvents += events.length;
          
          // Events by day
          const dayName = format(scheduleDate, 'EEEE', { locale: vi });
          eventsByDay[dayName] = (eventsByDay[dayName] || 0) + events.length;
          
          // Events by time
          events.forEach(event => {
            const hour = event.time.split(':')[0];
            eventsByTime[hour] = (eventsByTime[hour] || 0) + 1;
          });
        }
      });

      setScheduleStats({
        totalEvents,
        totalDays,
        avgEventsPerDay: totalDays > 0 ? Math.round(totalEvents / totalDays * 10) / 10 : 0,
        eventsByDay,
        eventsByTime,
        busyDays: Object.entries(eventsByDay)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3),
        busyHours: Object.entries(eventsByTime)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
      });
    } catch (error) {
      console.error('Error loading schedule stats:', error);
    }
  };

  const loadUserStats = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      let totalUsers = 0;
      let activeUsers = 0;
      let usersByRole = {};
      let recentLogins = 0;
      
      const sevenDaysAgo = subDays(new Date(), 7);
      
      usersSnapshot.forEach(doc => {
        const userData = doc.data();
        totalUsers++;
        
        if (userData.isActive) activeUsers++;
        
        usersByRole[userData.role] = (usersByRole[userData.role] || 0) + 1;
        
        if (userData.lastLogin && new Date(userData.lastLogin.seconds * 1000) > sevenDaysAgo) {
          recentLogins++;
        }
      });

      setUserStats({
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        usersByRole,
        recentLogins,
        loginRate: totalUsers > 0 ? Math.round(recentLogins / totalUsers * 100) : 0
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const loadActivityLogs = async () => {
    try {
      // Tạm thời dùng dữ liệu fake vì chưa implement audit logs
      const fakeLogs = [
        {
          id: '1',
          action: 'Đăng nhập hệ thống',
          user: 'Quản trị viên',
          timestamp: new Date(),
          details: 'Đăng nhập thành công từ IP 192.168.1.100'
        },
        {
          id: '2',
          action: 'Thêm sự kiện lịch',
          user: 'Biên tập viên',
          timestamp: subDays(new Date(), 1),
          details: 'Thêm sự kiện lúc 14:00 ngày 16/01/2026'
        },
        {
          id: '3',
          action: 'Cập nhật thông tin người dùng',
          user: 'Quản trị viên',
          timestamp: subDays(new Date(), 2),
          details: 'Cập nhật quyền hạn cho editor@campha.gov.vn'
        },
        {
          id: '4',
          action: 'Xóa sự kiện lịch',
          user: 'Quản trị viên',
          timestamp: subDays(new Date(), 3),
          details: 'Xóa sự kiện lúc 10:00 ngày 15/01/2026'
        }
      ];
      
      setActivityLogs(fakeLogs);
    } catch (error) {
      console.error('Error loading activity logs:', error);
    }
  };

  const getStartDate = (period, now) => {
    switch (period) {
      case 'week':
        return subDays(now, 7);
      case 'month':
        return startOfMonth(now);
      case 'quarter':
        return subDays(now, 90);
      default:
        return subDays(now, 7);
    }
  };

  const getPeriodLabel = (period) => {
    switch (period) {
      case 'week':
        return '7 ngày qua';
      case 'month':
        return 'Tháng này';
      case 'quarter':
        return '3 tháng qua';
      default:
        return '7 ngày qua';
    }
  };

  const renderBarChart = (data, title, color = '#1976d2') => {
    const maxValue = Math.max(...Object.values(data));
    
    return (
      <Card style={styles.chartCard}>
        <Card.Content>
          <Text style={styles.chartTitle}>{title}</Text>
          <View style={styles.chartContainer}>
            {Object.entries(data).map(([key, value]) => (
              <View key={key} style={styles.barContainer}>
                <View style={styles.bar}>
                  <View 
                    style={[
                      styles.barFill, 
                      { 
                        height: `${maxValue > 0 ? (value / maxValue) * 100 : 0}%`,
                        backgroundColor: color
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.barLabel}>{key}</Text>
                <Text style={styles.barValue}>{value}</Text>
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Đang tải báo cáo...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, isMobile && styles.headerMobile]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backButtonText, isMobile && styles.backButtonTextMobile]}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={[styles.title, isMobile && styles.titleMobile]}>Báo cáo & Thống kê</Text>
        <View style={[styles.headerSpacer, isMobile && styles.headerSpacerMobile]} />
      </View>

      <View style={[styles.periodSelector, isMobile && styles.periodSelectorMobile]}>
        {['week', 'month', 'quarter'].map(period => (
          <Chip
            key={period}
            selected={selectedPeriod === period}
            onPress={() => setSelectedPeriod(period)}
            style={styles.periodChip}
            icon={() => <CheckboxIcon size={18} color="#666" checked={selectedPeriod === period} />}
          >
            {getPeriodLabel(period)}
          </Chip>
        ))}
      </View>

      <ScrollView style={[styles.content, isMobile && styles.contentMobile]}>
        <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>Thống kê Lịch Công Tác</Text>
        
        <View style={[styles.statsGrid, isMobile && styles.statsGridMobile]}>
          <Card style={[styles.statCard, isMobile && styles.statCardMobile]}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>{scheduleStats.totalEvents || 0}</Text>
              <Text style={styles.statLabel}>Tổng sự kiện</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.statCard, isMobile && styles.statCardMobile]}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>{scheduleStats.totalDays || 0}</Text>
              <Text style={styles.statLabel}>Ngày có lịch</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.statCard, isMobile && styles.statCardMobile]}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>{scheduleStats.avgEventsPerDay || 0}</Text>
              <Text style={styles.statLabel}>TB sự kiện/ngày</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Charts */}
        {scheduleStats.eventsByDay && Object.keys(scheduleStats.eventsByDay).length > 0 && 
          renderBarChart(scheduleStats.eventsByDay, 'Sự kiện theo thứ trong tuần')
        }

        {scheduleStats.eventsByTime && Object.keys(scheduleStats.eventsByTime).length > 0 && 
          renderBarChart(scheduleStats.eventsByTime, 'Sự kiện theo giờ trong ngày', '#4caf50')
        }

        {/* Busy times */}
        <Card style={styles.insightCard}>
          <Card.Content>
            <Text style={styles.insightTitle}>Thời gian bận nhất</Text>
            <Text style={styles.insightSubtitle}>Ngày trong tuần:</Text>
            {scheduleStats.busyDays?.map(([day, count], index) => (
              <Text key={day} style={styles.insightItem}>
                {index + 1}. {day}: {count} sự kiện
              </Text>
            ))}
            
            <Text style={styles.insightSubtitle}>Giờ trong ngày:</Text>
            {scheduleStats.busyHours?.map(([hour, count], index) => (
              <Text key={hour} style={styles.insightItem}>
                {index + 1}. {hour}:00: {count} sự kiện
              </Text>
            ))}
          </Card.Content>
        </Card>

        <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>Thống kê Người Dùng</Text>
        
        <View style={[styles.statsGrid, isMobile && styles.statsGridMobile]}>
          <Card style={[styles.statCard, isMobile && styles.statCardMobile]}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>{userStats.totalUsers || 0}</Text>
              <Text style={styles.statLabel}>Tổng số</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.statCard, isMobile && styles.statCardMobile]}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>{userStats.activeUsers || 0}</Text>
              <Text style={styles.statLabel}>Đang hoạt động</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.statCard, isMobile && styles.statCardMobile]}>
            <Card.Content style={styles.statContent}>
              <Text style={styles.statNumber}>{userStats.loginRate || 0}%</Text>
              <Text style={styles.statLabel}>Tỷ lệ truy cập</Text>
            </Card.Content>
          </Card>
        </View>

        {/* User roles */}
        {userStats.usersByRole && renderBarChart(userStats.usersByRole, 'Người dùng theo vai trò', '#ff9800')}

        {/* Activity Logs */}
        {canViewAudit && (
          <>
            <Text style={styles.sectionTitle}>Nhật ký Hoạt động</Text>
            {activityLogs.map(log => (
              <Card key={log.id} style={styles.logCard}>
                <Card.Content>
                  <View style={styles.logHeader}>
                    <Text style={styles.logAction}>{log.action}</Text>
                    <Text style={styles.logTime}>
                      {format(log.timestamp, 'HH:mm dd/MM/yyyy')}
                    </Text>
                  </View>
                  <Text style={styles.logUser}>Người thực hiện: {log.user}</Text>
                  <Text style={styles.logDetails}>{log.details}</Text>
                </Card.Content>
              </Card>
            ))}
          </>
        )}

        <View style={[styles.exportSection, isMobile && styles.exportSectionMobile]}>
          <Text style={[styles.sectionTitle, isMobile && styles.sectionTitleMobile]}>Xuất báo cáo</Text>
          <View style={[styles.exportButtons, isMobile && styles.exportButtonsMobile]}>
            <Button 
              mode="outlined" 
              onPress={() => alert('Tính năng xuất PDF đang phát triển')}
              style={[styles.exportButton, isMobile && styles.exportButtonMobile]}
            >
              Xuất PDF
            </Button>
            <Button 
              mode="outlined" 
              onPress={() => alert('Tính năng xuất Excel đang phát triển')}
              style={[styles.exportButton, isMobile && styles.exportButtonMobile]}
            >
              Xuất Excel
            </Button>
          </View>
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
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  periodSelectorMobile: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  periodChip: {
    marginHorizontal: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  contentMobile: {
    paddingHorizontal: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitleMobile: {
    fontSize: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statsGridMobile: {
    marginBottom: 12,
  },
  statCard: {
    width: '31%',
    marginBottom: 8,
  },
  statCardMobile: {
    width: '48%',
    minWidth: '48%',
    marginBottom: 8,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  chartCard: {
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 20,
    height: 80,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    justifyContent: 'flex-end',
  },
  barFill: {
    borderRadius: 2,
    minHeight: 2,
  },
  barLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  barValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  insightCard: {
    marginBottom: 16,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  insightSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  insightItem: {
    fontSize: 13,
    color: '#333',
    marginLeft: 8,
    marginBottom: 2,
  },
  logCard: {
    marginBottom: 8,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  logAction: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  logTime: {
    fontSize: 11,
    color: '#666',
  },
  logUser: {
    fontSize: 12,
    color: '#1976d2',
    marginBottom: 4,
  },
  logDetails: {
    fontSize: 12,
    color: '#666',
  },
  exportSection: {
    marginTop: 16,
    marginBottom: 32,
  },
  exportSectionMobile: {
    marginTop: 12,
    marginBottom: 24,
  },
  exportButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  exportButtonsMobile: {
    flexDirection: 'column',
    gap: 8,
  },
  exportButton: {
    minWidth: 120,
  },
  exportButtonMobile: {
    width: '100%',
  },
});

export default ReportsAnalytics;