import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Platform, Image, TouchableOpacity, Linking, useWindowDimensions } from 'react-native';
import { Text, Card, ActivityIndicator, Title, Paragraph } from 'react-native-paper';
import { format, isToday, parseISO, addDays as addDaysFns } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/AuthService';

const BREAKPOINT_MOBILE = 768;

const ScheduleScreenWeb = ({ scheduleData, loading, onRefresh, refreshing, allDaysData = {}, onQuanTriClick, onLogout }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < BREAKPOINT_MOBILE;
  const today = format(new Date(), "EEEE, 'ngày' dd/MM/yyyy", { locale: vi });
  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const scrollViewRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  // Kiểm tra session khi component load
  useEffect(() => {
    checkCurrentSession();
  }, []);

  const checkCurrentSession = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error checking session:', error);
    }
  };

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

  const handleQuanTriClick = async () => {
    if (onQuanTriClick) {
      onQuanTriClick();
    } else {
      // Fallback nếu không có prop - tự kiểm tra và navigate
      try {
        const user = await getCurrentUser();
        if (user) {
          navigate('/app/admin');
        } else {
          navigate('/app/login', { state: { from: { pathname: '/app/admin' } } });
        }
      } catch (error) {
        navigate('/app/login', { state: { from: { pathname: '/app/admin' } } });
      }
    }
  };

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
      {/* Header với banner */}
      <View style={styles.headerContainer}>
        {/* Banner lớn với overlay: noimage4.jpg */}
        <View style={styles.largeBannerContainer}>
          <Image 
            source={require('../../assets/images/noimage4.jpg')} 
            style={[styles.largeBanner, isMobile && styles.largeBannerMobile]}
            resizeMode="cover"
          />
          <View style={styles.bannerOverlay}>
            <View style={[styles.bannerOverlayContent, isMobile && styles.bannerOverlayContentMobile]}>
              <View style={[styles.smallBannerWrapper, isMobile && styles.smallBannerWrapperMobile]}>
                <Image 
                  source={require('../../assets/images/banner-n1-cdn.png')} 
                  style={[styles.smallBanner, isMobile && styles.smallBannerMobile]}
                  resizeMode="contain"
                />
              </View>
              <View style={[styles.headerTextWrapper, isMobile && styles.headerTextWrapperMobile]}>
                <View style={[styles.headerTextContainer, isMobile && styles.headerTextContainerMobile]}>
                  <Text style={[styles.mainTitle, isMobile && styles.mainTitleMobile]}>LỊCH CÔNG TÁC</Text>
                  <Text style={[styles.subTitle, isMobile && styles.subTitleMobile]}>UBND PHƯỜNG CẨM PHẢ</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Navigation Bar - cuộn ngang trên mobile */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={isMobile ? styles.navBarScroll : undefined} contentContainerStyle={isMobile ? styles.navBarScrollContent : undefined}>
      <View style={[styles.navBar, isMobile && styles.navBarMobile]}>
        <TouchableOpacity onPress={handleHomeClick}>
          <Text style={[styles.navItem, isMobile && styles.navItemMobile]}>HOME</Text>
        </TouchableOpacity>
        <View style={styles.navSeparator} />
        <TouchableOpacity onPress={() => handleNavClick('https://congchuc.quangninh.gov.vn/')}>
          <Text style={[styles.navItem, isMobile && styles.navItemMobile]}>QUẢN LÝ VĂN BẢN ĐIỀU HÀNH</Text>
        </TouchableOpacity>
        <View style={styles.navSeparator} />
        <TouchableOpacity onPress={() => handleNavClick('https://quangninh.gov.vn/Trang/Default.aspx')}>
          <Text style={[styles.navItem, isMobile && styles.navItemMobile]}>CỔNG THÔNG TIN</Text>
        </TouchableOpacity>
        <View style={styles.navSeparator} />
        <TouchableOpacity onPress={() => handleNavClick('https://mail.quangninh.gov.vn/owa/#path=/mail')}>
          <Text style={[styles.navItem, isMobile && styles.navItemMobile]}>THƯ ĐIỆN TỬ</Text>
        </TouchableOpacity>
        <View style={styles.navSeparator} />
        <Text style={[styles.navItem, isMobile && styles.navItemMobile]}>TÌM KIẾM</Text>
        <View style={styles.navSeparator} />
        <TouchableOpacity onPress={handleQuanTriClick}>
          <Text style={[styles.navItem, isMobile && styles.navItemMobile, currentUser && styles.navItemAuthenticated]}>
            {currentUser ? `QUẢN TRỊ (${currentUser.fullName})` : 'QUẢN TRỊ'}
          </Text>
        </TouchableOpacity>
      </View>
      </ScrollView>

      {/* Main Content - Layout 2 cột (1 cột trên mobile) */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={[styles.content, isMobile && styles.contentMobile]}>
          <View style={[styles.twoColumnLayout, isMobile && styles.twoColumnLayoutMobile]}>
            <View style={[styles.leftColumn, isMobile && styles.leftColumnMobile]}>
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

            <View style={[styles.rightColumn, isMobile && styles.rightColumnMobile]}>
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
  headerContainer: {
    width: '100%',
    position: 'relative',
  },
  largeBannerContainer: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden', // Đảm bảo ảnh không tràn ra ngoài
    maxWidth: 1200, // Giới hạn width giống navBar
    alignSelf: 'center', // Căn giữa
  },
  largeBanner: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f5f5',
    resizeMode: 'cover',
  },
  largeBannerMobile: {
    height: 100,
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
  },
  bannerOverlayContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 1200,
    paddingHorizontal: 40, // Cùng padding với navBar
    marginLeft: 'auto',
    marginRight: 'auto',
    overflow: 'hidden',
    flex: 1,
  },
  bannerOverlayContentMobile: {
    paddingHorizontal: 12,
  },
  smallBannerWrapper: {
    width: '35%', // Chiều rộng từ HOME đến QUẢN LÝ VĂN BẢN ĐIỀU HÀNH (khoảng 35% của navBar)
    flexShrink: 0,
    alignItems: 'flex-start',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  smallBannerWrapperMobile: {
    width: '28%',
  },
  smallBanner: {
    width: 1260,
    height: 540,
    flexShrink: 0,
  },
  smallBannerMobile: {
    width: 180,
    height: 77,
  },
  headerTextWrapper: {
    width: '65%', // Chiều rộng từ CỔNG THÔNG TIN đến QUẢN TRỊ (khoảng 65% của navBar)
    flexShrink: 0,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTextWrapperMobile: {
    width: '72%',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    minWidth: 0,
    marginLeft: 100,
    flexShrink: 1,
    overflow: 'hidden',
  },
  headerTextContainerMobile: {
    marginLeft: 12,
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
  mainTitleMobile: {
    fontSize: 18,
  },
  subTitle: {
    fontSize: 18,
    color: '#d32f2f',
    fontWeight: 'bold',
  },
  subTitleMobile: {
    fontSize: 14,
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
  navBarScroll: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  navBarScrollContent: {
    flexGrow: 1,
    minWidth: '100%',
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
  navBarMobile: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
    flexShrink: 0,
  },
  navItem: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'normal',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  navItemMobile: {
    fontSize: 12,
    paddingHorizontal: 2,
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
  contentMobile: {
    padding: 12,
  },
  twoColumnLayout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    flexWrap: 'nowrap',
  },
  twoColumnLayoutMobile: {
    flexDirection: 'column',
    flexWrap: 'wrap',
  },
  leftColumn: {
    width: '66.67%',
    paddingRight: 10,
    flexShrink: 0,
  },
  leftColumnMobile: {
    width: '100%',
    paddingRight: 0,
    marginBottom: 16,
  },
  rightColumn: {
    width: '33.33%',
    paddingLeft: 10,
    flexShrink: 0,
  },
  rightColumnMobile: {
    width: '100%',
    paddingLeft: 0,
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
  navItemAuthenticated: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
});

export default ScheduleScreenWeb;
