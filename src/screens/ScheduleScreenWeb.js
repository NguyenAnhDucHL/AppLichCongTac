import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Platform, Image, ImageBackground, TouchableOpacity, Linking } from 'react-native';
import { Text, Card, ActivityIndicator, Title, Paragraph } from 'react-native-paper';
import { format, isToday, parseISO, addDays as addDaysFns } from 'date-fns';
import { vi } from 'date-fns/locale';
import LoginScreen from './LoginScreen';

const ScheduleScreenWeb = ({ scheduleData, loading, onRefresh, refreshing, allDaysData = {} }) => {
  const today = format(new Date(), "EEEE, 'ngày' dd/MM/yyyy", { locale: vi });
  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const scrollViewRef = React.useRef(null);
  const [showLogin, setShowLogin] = useState(false);

  // Navigation handlers
  const handleHomeClick = () => {
    // Scroll to top
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
  };

  const handleNavClick = (url) => {
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url);
    }
  };

  const handleQuanTriClick = () => {
    setShowLogin(true);
  };

  const handleLogin = (credentials) => {
    // Xử lý đăng nhập ở đây
    console.log('Login attempt:', credentials);
    // Sau khi đăng nhập thành công, có thể đóng login screen hoặc điều hướng
    // setShowLogin(false);
  };

  const handleBackFromLogin = () => {
    setShowLogin(false);
  };

  // Hiển thị login screen nếu showLogin là true
  if (showLogin) {
    return (
      <LoginScreen 
        onLogin={handleLogin}
        onBack={handleBackFromLogin}
      />
    );
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Đang tải lịch công tác...</Text>
      </View>
    );
  }

  // Get all days data (today + next few days)
  const days = Object.keys(allDaysData).sort();
  // If no multi-day data, just show today
  const allDisplayDays = days.length > 0 ? days : (scheduleData && scheduleData.length > 0 ? [todayKey] : []);

  // Tách ngày hôm nay và 2 ngày tiếp theo
  const todayData = allDaysData[todayKey] || (scheduleData || []);
  const nextDays = allDisplayDays
    .filter(dayKey => dayKey !== todayKey)
    .slice(0, 2); // Chỉ lấy 2 ngày tiếp theo

  return (
    <View style={styles.container}>
      {/* Header giống website */}
      <ImageBackground 
        source={require('../../assets/images/bg.png')} 
        style={styles.header}
        resizeMode="cover"
        imageStyle={styles.headerBackgroundImage}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.mainTitle}>LỊCH CÔNG TÁC</Text>
            <Text style={styles.subTitle}>UBND PHƯỜNG CẨM PHẢ</Text>
          </View>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/images/bg.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </ImageBackground>

      {/* Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={handleHomeClick}>
          <Text style={styles.navItem}>HOME</Text>
        </TouchableOpacity>
        <View style={styles.navSeparator} />
        <TouchableOpacity onPress={() => handleNavClick('https://congchuc.quangninh.gov.vn/')}>
          <Text style={styles.navItem}>QUẢN LÝ VĂN BẢN ĐIỀU HÀNH</Text>
        </TouchableOpacity>
        <View style={styles.navSeparator} />
        <TouchableOpacity onPress={() => handleNavClick('https://quangninh.gov.vn/Trang/Default.aspx')}>
          <Text style={styles.navItem}>CỔNG THÔNG TIN</Text>
        </TouchableOpacity>
        <View style={styles.navSeparator} />
        <TouchableOpacity onPress={() => handleNavClick('https://mail.quangninh.gov.vn/owa/#path=/mail')}>
          <Text style={styles.navItem}>THƯ ĐIỆN TỬ</Text>
        </TouchableOpacity>
        <View style={styles.navSeparator} />
        <Text style={styles.navItem}>TÌM KIẾM</Text>
        <View style={styles.navSeparator} />
        <TouchableOpacity onPress={handleQuanTriClick}>
          <Text style={styles.navItem}>QUẢN TRỊ</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content - Layout 2 cột */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          <View style={styles.twoColumnLayout}>
            {/* Cột trái: Hôm nay - Tất cả events */}
            <View style={styles.leftColumn}>
              {todayData && todayData.length > 0 ? (
                <View style={[styles.daySection, styles.todaySection]}>
                  <Text style={styles.dayTitle}>
                    Hôm nay: {format(parseISO(todayKey), "EEEE, 'ngày' dd/MM/yyyy", { locale: vi })}
                  </Text>
                  {todayData.map((event, index) => (
                    <View key={event.id || index} style={styles.eventRow}>
                      <Text style={styles.eventTime}>{event.time}:</Text>
                      <Text style={styles.eventContent}>{event.content}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Không có lịch công tác hôm nay</Text>
                </View>
              )}
            </View>

            {/* Cột phải: 2 ngày tiếp theo - Mỗi ngày chỉ 2 events đầu tiên */}
            <View style={styles.rightColumn}>
              {nextDays.map((dayKey) => {
                const dayData = allDaysData[dayKey] || [];
                const dayDate = parseISO(dayKey);
                const dayFormatted = format(dayDate, "EEEE, 'ngày' dd/MM/yyyy", { locale: vi });
                
                // Chỉ lấy 2 events đầu tiên
                const limitedEvents = dayData.slice(0, 2);

                if (!dayData || dayData.length === 0) return null;

                return (
                  <View key={dayKey} style={styles.daySection}>
                    <Text style={styles.dayTitle}>{dayFormatted}</Text>
                    {limitedEvents.map((event, index) => (
                      <View key={event.id || index} style={styles.eventRow}>
                        <Text style={styles.eventTime}>{event.time}:</Text>
                        <Text style={styles.eventContent}>{event.content}</Text>
                      </View>
                    ))}
                  </View>
                );
              })}
              {nextDays.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Không có lịch công tác</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff', // Nền trắng (fallback)
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    minHeight: 120,
  },
  headerBackgroundImage: {
    opacity: 0.2, // Làm mờ ảnh nền để text nổi bật
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    position: 'relative',
    zIndex: 1, // Đảm bảo text ở trên ảnh nền
  },
  headerText: {
    flex: 1,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 4,
  },
  subTitle: {
    fontSize: 18,
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  logoContainer: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 20,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  navBar: {
    backgroundColor: '#1565c0',
    flexDirection: 'row',
    paddingHorizontal: 40,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 16,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  navItem: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  navSeparator: {
    width: 1,
    height: 20,
    backgroundColor: '#fff',
    opacity: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  twoColumnLayout: {
    flexDirection: 'row', // 'row' để hiển thị 2 cột cạnh nhau
    alignItems: 'flex-start',
    width: '100%',
    flexWrap: 'nowrap', // Không cho phép wrap xuống dòng
  },
  leftColumn: {
    width: '66.67%', // Chiếm 8 phần (8/12 = 66.67%)
    paddingRight: 10,
    flexShrink: 0, // Không cho phép shrink
  },
  rightColumn: {
    width: '33.33%', // Chiếm 4 phần (4/12 = 33.33%)
    paddingLeft: 10,
    flexShrink: 0, // Không cho phép shrink
  },
  daySection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    borderLeftColor: '#1976d2',
  },
  todaySection: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#1976d2',
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 12,
  },
  eventRow: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  eventTime: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
    minWidth: 80,
  },
  eventContent: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    flex: 1,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default ScheduleScreenWeb;
