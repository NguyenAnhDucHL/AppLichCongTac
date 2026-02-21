import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Platform, Image, ImageBackground, TouchableOpacity, Linking, useWindowDimensions, Modal, TextInput } from 'react-native';

import { Text, Card, ActivityIndicator, Title, Paragraph } from 'react-native-paper';
import { format, isToday, parseISO, addDays as addDaysFns } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/AuthService';

const BREAKPOINT_MOBILE = 768;
// Kích thước banner: desktop 200px, mobile 160px (đổi 1 chỗ khi cần chỉnh)
const LARGE_BANNER_HEIGHT_DESKTOP = 200;
const LARGE_BANNER_HEIGHT_MOBILE = 160;
const SMALL_BANNER_ASPECT = 661 / 186; // ảnh banner-n1-cdn.png

// Icon hamburger (3 gạch ngang)
const HamburgerIcon = ({ size = 24, color = '#fff', style }) => (
  <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
    <View style={{ width: size * 0.7, height: 2, backgroundColor: color, marginVertical: 2 }} />
    <View style={{ width: size * 0.7, height: 2, backgroundColor: color, marginVertical: 2 }} />
    <View style={{ width: size * 0.7, height: 2, backgroundColor: color, marginVertical: 2 }} />
  </View>
);

const ScheduleScreenWeb = ({ scheduleData, loading, onRefresh, refreshing, allDaysData = {}, onQuanTriClick, onLogout }) => {
  const { width } = useWindowDimensions();
  const isMobile = width < BREAKPOINT_MOBILE;
  const today = format(new Date(), "EEEE, 'ngày' dd/MM/yyyy", { locale: vi });
  const todayKey = format(new Date(), 'yyyy-MM-dd');
  const scrollViewRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
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

  const isWeb = Platform.OS === 'web';

  return (
    <View style={[styles.container, isMobile && styles.containerMobile, isWeb && !isMobile && styles.containerWeb]}>

      {/* ── BANNER ──────────────────────────────────────── */}
      {isMobile ? (
        <View style={styles.mobileHeaderWrapper}>
          {/* Banner strip */}
          <ImageBackground
            source={require('../../assets/images/noimage4.jpg')}
            style={styles.bannerStrip}
            resizeMode="cover"
          >
            {/* Dim overlay */}
            <View style={styles.bannerDimMobile} />
            {/* Quốc huy — circular crop, absolute left */}
            <View style={styles.bannerSealCircle}>
              <Image
                source={require('../../assets/images/banner-n1-cdn.png')}
                style={styles.bannerSealImg}
                resizeMode="cover"
              />
            </View>
            {/* Text — absolute right */}
            <View style={styles.bannerTextMobile}>
              <Text style={styles.mainTitleMobile} numberOfLines={1}>LỊCH CÔNG TÁC</Text>
              <Text style={styles.subTitleMobile} numberOfLines={2}>UBND PHƯỜNG CẨM PHẢ</Text>
            </View>
          </ImageBackground>
          {/* Top blue bar */}
          <View style={styles.mobileTopBar}>
            <TouchableOpacity onPress={() => setShowDrawer(true)} style={styles.hamburgerButton} activeOpacity={0.7}>
              <HamburgerIcon size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.mobileTopBarTitle} numberOfLines={1}>LỊCH CÔNG TÁC</Text>
            <View style={styles.mobileTopBarSpacer} />
          </View>
        </View>
      ) : (
        /* Desktop banner */
        <ImageBackground
          source={require('../../assets/images/noimage4.jpg')}
          style={styles.bannerDesktop}
          resizeMode="cover"
        >
          {/* Logo — absolute left */}
          <Image
            source={require('../../assets/images/banner-n1-cdn.png')}
            style={styles.bannerLogoDesktop}
            resizeMode="contain"
          />
          {/* Title — absolute right */}
          <View style={styles.bannerTitlePanel}>
            <Text style={styles.mainTitle} numberOfLines={1}>LỊCH CÔNG TÁC</Text>
            <Text style={styles.subTitle} numberOfLines={1}>UBND PHƯỜNG CẨM PHẢ</Text>
          </View>
        </ImageBackground>
      )}



      {/* Drawer menu (mobile) - hiện khi bấm hamburger */}
      <Modal visible={showDrawer} transparent animationType="slide">
        <View style={styles.drawerBackdrop}>
          <View style={styles.drawerPanel}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Menu</Text>
              <TouchableOpacity onPress={() => setShowDrawer(false)} style={styles.drawerCloseBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
                <Text style={styles.drawerCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.drawerMenuItem} onPress={() => { setShowDrawer(false); handleQuanTriClick(); }}>
              <Text style={styles.drawerMenuIcon}>👤</Text>
              <Text style={styles.drawerMenuText}>{currentUser ? `Quản trị (${currentUser.fullName})` : 'Đăng nhập / Quản trị'}</Text>
              <Text style={styles.drawerMenuArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.drawerSectionLabel}>
              <Text style={styles.drawerSectionLabelText}>Chuyên mục</Text>
            </View>
            <TouchableOpacity style={styles.drawerMenuItem} onPress={() => { setShowDrawer(false); handleHomeClick(); }}>
              <Text style={styles.drawerMenuIcon}>🏠</Text>
              <Text style={styles.drawerMenuText}>Trang chủ</Text>
              <Text style={styles.drawerMenuArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.drawerMenuItem} onPress={() => { setShowDrawer(false); handleNavClick('https://congchuc.quangninh.gov.vn/'); }}>
              <Text style={styles.drawerMenuIcon}>📄</Text>
              <Text style={styles.drawerMenuText}>Quản lý văn bản điều hành</Text>
              <Text style={styles.drawerMenuArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.drawerMenuItem} onPress={() => { setShowDrawer(false); handleNavClick('https://quangninh.gov.vn/Trang/Default.aspx'); }}>
              <Text style={styles.drawerMenuIcon}>🌐</Text>
              <Text style={styles.drawerMenuText}>Cổng thông tin</Text>
              <Text style={styles.drawerMenuArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.drawerMenuItem} onPress={() => { setShowDrawer(false); handleNavClick('https://mail.quangninh.gov.vn/owa/#path=/mail'); }}>
              <Text style={styles.drawerMenuIcon}>✉️</Text>
              <Text style={styles.drawerMenuText}>Thư điện tử</Text>
              <Text style={styles.drawerMenuArrow}>›</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.drawerMenuItem} onPress={() => { setShowDrawer(false); navigate('/app/search'); }}>
              <Text style={styles.drawerMenuIcon}>🔍</Text>
              <Text style={styles.drawerMenuText}>Tìm kiếm</Text>
              <Text style={styles.drawerMenuArrow}>›</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.drawerBackdropTouchable} onPress={() => setShowDrawer(false)} activeOpacity={1} />
        </View>
      </Modal>

      {/* Navigation Bar - ẩn trên mobile (dùng drawer thay thế) */}
      {!isMobile && (
        <View style={styles.navBarOuter}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.navBarScroll} contentContainerStyle={styles.navBarScrollContent}>
            <View style={styles.navBar}>
              <TouchableOpacity onPress={handleHomeClick}>
                <Text style={styles.navItem}>HOME</Text>
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
              <TouchableOpacity onPress={() => navigate('/app/search')}>
                <Text style={[styles.navItem, isMobile && styles.navItemMobile]}>TÌM KIẾM</Text>
              </TouchableOpacity>
              <View style={styles.navSeparator} />
              <TouchableOpacity onPress={handleQuanTriClick}>
                <Text style={[styles.navItem, currentUser && styles.navItemAuthenticated]}>
                  {currentUser ? `QUẢN TRỊ (${currentUser.fullName})` : 'QUẢN TRỊ'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Main Content - trên web không flex:1 để tránh khoảng trắng lớn */}
      <ScrollView
        ref={scrollViewRef}
        style={[styles.scrollView, isWeb && !isMobile && styles.scrollViewWeb]}
        contentContainerStyle={styles.scrollViewContent}
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
  containerMobile: {
    paddingTop: 0,
    marginTop: 0,
  },
  containerWeb: {
    flex: 0,
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
  mobileHeaderWrapper: {
    width: '100%',
    flexDirection: 'column',
    flexShrink: 0,
  },

  // ── New clean banner styles ──────────────────────────────────────────────
  // Desktop: full-width container, images absolute
  bannerDesktop: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    height: LARGE_BANNER_HEIGHT_DESKTOP,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f4f8',
  },
  bannerLogoPanel: {
    // unused — kept for mobile
  },
  bannerLogoDesktop: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: LARGE_BANNER_HEIGHT_DESKTOP,
    width: LARGE_BANNER_HEIGHT_DESKTOP * (661 / 186), // correct aspect ratio
  },
  bannerTitlePanel: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 48,
    width: '50%',
  },
  // Mobile banner strip
  bannerStrip: {
    width: '100%',
    height: LARGE_BANNER_HEIGHT_MOBILE,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#e8f4f8',
    position: 'relative',
  },
  bannerDimMobile: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.20)',
    zIndex: 1,
  },
  bannerLogMobile: { display: 'none' }, // replaced by bannerSealCircle
  // Circular seal for mobile — 120px diameter
  bannerSealCircle: {
    position: 'absolute',
    left: 12,
    top: (LARGE_BANNER_HEIGHT_MOBILE - 120) / 2,
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    zIndex: 2,
  },
  bannerSealImg: {
    // 661x186 image, seal at horizontal center (x≈330)
    // Scaled to height=120: scale=120/186=0.645, width=661*0.645=426px
    // Seal center at 330*0.645=213px; circle center at 60px
    // marginLeft = -(213-60) = -153px
    width: 426,
    height: 120,
    marginLeft: -153,
  },
  bannerTextMobile: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    left: 12 + 120 + 8,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 10,
    zIndex: 2,
  },
  // ── Legacy styles kept for reference (no longer used in banner) ──────────
  headerContainer: {
    width: '100%',
    position: 'relative',
  },
  headerContainerMobile: {
    flexShrink: 0,
    height: LARGE_BANNER_HEIGHT_MOBILE,
    minHeight: LARGE_BANNER_HEIGHT_MOBILE,
    zIndex: 9999,
    marginTop: 0,
    paddingTop: 0,
    elevation: 9999,
  },
  largeBannerContainer: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    maxWidth: 1200,
    alignSelf: 'center',
    minHeight: LARGE_BANNER_HEIGHT_DESKTOP,
  },
  largeBannerContainerMobile: {
    width: '100%',
    maxWidth: '100%',
    height: LARGE_BANNER_HEIGHT_MOBILE,
    minHeight: LARGE_BANNER_HEIGHT_MOBILE,
    flexShrink: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  largeBanner: {
    width: '100%',
    height: LARGE_BANNER_HEIGHT_DESKTOP,
    backgroundColor: '#e8e8e8',
    resizeMode: 'cover',
  },
  largeBannerMobile: {
    width: '100%',
    height: LARGE_BANNER_HEIGHT_MOBILE,
    resizeMode: 'cover',
  },
  bannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  bannerOverlayMobile: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    zIndex: 10000,
    elevation: 10000,
  },
  bannerOverlayContent: {
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '100%',
    height: '100%',
    maxWidth: 1200,
    paddingHorizontal: 40,
    marginLeft: 'auto',
    marginRight: 'auto',
    overflow: 'hidden',
  },
  bannerOverlayContentMobile: {
    paddingHorizontal: 0,
    overflow: 'hidden',
    height: LARGE_BANNER_HEIGHT_MOBILE,
    minHeight: LARGE_BANNER_HEIGHT_MOBILE,
    alignSelf: 'stretch',
    width: '100%',
    position: 'relative',
  },
  smallBannerWrapper: {
    width: '50%',
    minWidth: LARGE_BANNER_HEIGHT_DESKTOP * SMALL_BANNER_ASPECT,
    height: LARGE_BANNER_HEIGHT_DESKTOP,
    flexShrink: 0,
    alignItems: 'stretch',
    justifyContent: 'center',
    overflow: 'hidden',
    marginLeft: -20,
  },
  smallBannerWrapperMobile: {
    position: 'absolute',
    left: -6,
    top: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    paddingLeft: 0,
    marginLeft: 0,
    alignItems: 'flex-start',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  smallBanner: {
    width: '100%',
    height: '100%',
    flexShrink: 0,
  },
  smallBannerMobile: {
    width: LARGE_BANNER_HEIGHT_MOBILE * SMALL_BANNER_ASPECT,
    height: LARGE_BANNER_HEIGHT_MOBILE,
    flexShrink: 0,
    marginLeft: 0,
  },
  headerTextWrapper: {
    width: '35%',
    flexShrink: 0,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTextWrapperMobile: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '48%',
    paddingRight: 12,
    paddingLeft: 8,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    minWidth: 0,
    marginLeft: 100,
    flexShrink: 1,
  },
  headerTextContainerMobile: {
    marginLeft: 0,
    marginRight: 0,
    alignItems: 'flex-end',
  },
  headerTextMobileBg: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-end',
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
    color: '#fff',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  mainTitleMobile: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    flexShrink: 0,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  subTitle: {
    fontSize: 18,
    color: '#ffe082',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  subTitleMobile: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    flexShrink: 0,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
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
  mobileTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1565c0',
    paddingVertical: 12,
    paddingHorizontal: 12,
    width: '100%',
    flexShrink: 0,
    zIndex: 1,
  },
  hamburgerButton: {
    padding: 8,
    marginRight: 8,
  },
  mobileTopBarTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  mobileTopBarSpacer: {
    width: 40,
  },
  drawerBackdrop: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  drawerBackdropTouchable: {
    flex: 1,
  },
  drawerPanel: {
    width: '85%',
    maxWidth: 320,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'web' ? 24 : 48,
    paddingBottom: 24,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 16,
    zIndex: 1,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  drawerCloseBtn: {
    padding: 4,
  },
  drawerCloseText: {
    fontSize: 22,
    color: '#666',
    fontWeight: '300',
  },
  drawerSearchBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  drawerSearchPlaceholder: {
    fontSize: 14,
    color: '#999',
  },
  drawerSectionLabel: {
    marginTop: 8,
    marginBottom: 4,
  },
  drawerSectionLabelText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  drawerMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  drawerMenuIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  drawerMenuText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },
  drawerMenuArrow: {
    fontSize: 18,
    color: '#999',
    fontWeight: '300',
  },
  navBarOuter: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    flexShrink: 0,
    backgroundColor: '#1565c0',
  },
  navBarScroll: {
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    flexShrink: 0,
    minHeight: 48,
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
    minHeight: 48,
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
  scrollViewWeb: {
    flex: 0,
    flexGrow: 0,
  },
  scrollViewContent: {
    paddingBottom: 24,
  },
  content: {
    padding: 20,
    paddingTop: 12,
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
