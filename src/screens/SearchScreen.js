import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Image,
  ImageBackground,
  Modal,
  useWindowDimensions,
  TextInput as RNTextInput,
} from 'react-native';

import { Text, ActivityIndicator } from 'react-native-paper';
import { format, parseISO, isValid, parse } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/AuthService';
import { searchSchedules } from '../services/FirebaseService';

const BREAKPOINT_MOBILE = 768;
const ITEMS_PER_PAGE = 10;

// Icon hamburger
const HamburgerIcon = ({ size = 24, color = '#fff', style }) => (
  <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
    <View style={{ width: size * 0.7, height: 2, backgroundColor: color, marginVertical: 2 }} />
    <View style={{ width: size * 0.7, height: 2, backgroundColor: color, marginVertical: 2 }} />
    <View style={{ width: size * 0.7, height: 2, backgroundColor: color, marginVertical: 2 }} />
  </View>
);

// Date input web-native chuẩn
const DateInputWeb = ({ value, onChange, placeholder }) => {
  if (Platform.OS === 'web') {
    return (
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          flex: 1,
          height: 38,
          border: '1px solid #ccc',
          borderRadius: 4,
          paddingLeft: 8,
          paddingRight: 8,
          fontSize: 14,
          color: value ? '#333' : '#999',
          backgroundColor: '#fff',
          outline: 'none',
          boxSizing: 'border-box',
        }}
        placeholder={placeholder}
      />
    );
  }
  // Mobile fallback
  return (
    <RNTextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor="#999"
      style={styles.dateInputMobile}
    />
  );
};

const SearchScreen = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < BREAKPOINT_MOBILE;
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);

  // Form state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [keyword, setKeyword] = useState('');

  // Search results state
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(results.length / ITEMS_PER_PAGE));
  const pagedResults = results.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (_) { }
  };

  const handleNavClick = (url) => {
    if (Platform.OS === 'web') {
      window.open(url, '_blank');
    }
  };

  const handleQuanTriClick = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        navigate('/app/admin');
      } else {
        navigate('/app/login', { state: { from: { pathname: '/app/admin' } } });
      }
    } catch (_) {
      navigate('/app/login', { state: { from: { pathname: '/app/admin' } } });
    }
  };

  const handleSearch = async () => {
    setSearchError('');

    if (!startDate && !endDate && !keyword.trim()) {
      setSearchError('Vui lòng nhập ít nhất một tiêu chí tìm kiếm.');
      return;
    }

    if (startDate && endDate && startDate > endDate) {
      setSearchError('Thời gian bắt đầu phải trước thời gian kết thúc.');
      return;
    }

    setSearching(true);
    setHasSearched(false);

    try {
      // Nếu không có ngày, dùng khoảng rộng (1 năm tính từ hôm nay)
      const today = format(new Date(), 'yyyy-MM-dd');
      const effectiveStart = startDate || format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd');
      const effectiveEnd = endDate || format(new Date(new Date().getFullYear(), 11, 31), 'yyyy-MM-dd');

      const data = await searchSchedules(effectiveStart, effectiveEnd, keyword.trim());
      setResults(data);
      setCurrentPage(1);
      setHasSearched(true);
    } catch (err) {
      console.error('Search error:', err);
      setSearchError('Không thể thực hiện tìm kiếm. Vui lòng thử lại.');
    } finally {
      setSearching(false);
    }
  };

  // Format ngày hiển thị trong bảng kết quả
  const formatResultDate = (dateStr) => {
    try {
      const parsed = parseISO(dateStr);
      if (!isValid(parsed)) return dateStr;
      const thu = format(parsed, 'EEEE', { locale: vi });
      const thuCap = thu.charAt(0).toUpperCase() + thu.slice(1);
      const ngay = format(parsed, 'dd/MM/yyyy');
      return { thu: thuCap, ngay };
    } catch (_) {
      return { thu: '', ngay: dateStr };
    }
  };

  // ─── Header (banner) chung ───────────────────────────────────────────────
  const renderBanner = () => {
    if (isMobile) {
      return (
        <View style={styles.mobileHeaderWrapper}>
          <ImageBackground
            source={require('../../assets/images/noimage4.jpg')}
            style={styles.bannerStrip}
            resizeMode="cover"
          >
            <View style={styles.bannerDimMobile} />
            <View style={styles.bannerSealCircle}>
              <Image
                source={require('../../assets/images/banner-n1-cdn.png')}
                style={styles.bannerSealImg}
                resizeMode="cover"
              />
            </View>
            <View style={styles.bannerTextMobile}>
              <Text style={styles.mainTitleMobile} numberOfLines={1}>LỊCH CÔNG TÁC</Text>
              <Text style={styles.subTitleMobile} numberOfLines={2}>UBND PHƯỜNG CẨM PHẢ</Text>
            </View>
          </ImageBackground>
          <View style={styles.mobileTopBar}>
            <TouchableOpacity onPress={() => setShowDrawer(true)} style={styles.hamburgerButton} activeOpacity={0.7}>
              <HamburgerIcon size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.mobileTopBarTitle} numberOfLines={1}>LỊCH CÔNG TÁC</Text>
            <View style={styles.mobileTopBarSpacer} />
          </View>
        </View>
      );
    }
    return (
      <ImageBackground
        source={require('../../assets/images/noimage4.jpg')}
        style={styles.bannerDesktop}
        resizeMode="cover"
      >
        <Image
          source={require('../../assets/images/banner-n1-cdn.png')}
          style={styles.bannerLogoDesktop}
          resizeMode="contain"
        />
        <View style={styles.bannerTitlePanel}>
          <Text style={styles.mainTitle} numberOfLines={1}>LỊCH CÔNG TÁC</Text>
          <Text style={styles.subTitle} numberOfLines={1}>UBND PHƯỜNG CẨM PHẢ</Text>
        </View>
      </ImageBackground>
    );
  };



  // ─── Nav bar desktop ────────────────────────────────────────────────────
  const renderNavBar = () => (
    <View style={styles.navBarOuter}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.navBarScroll} contentContainerStyle={styles.navBarScrollContent}>
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => navigate('/app/')}>
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
          {/* TÌM KIẾM active */}
          <Text style={[styles.navItem, styles.navItemActive]}>TÌM KIẾM</Text>
          <View style={styles.navSeparator} />
          <TouchableOpacity onPress={handleQuanTriClick}>
            <Text style={[styles.navItem, currentUser && styles.navItemAuthenticated]}>
              {currentUser ? `QUẢN TRỊ (${currentUser.fullName})` : 'QUẢN TRỊ'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );

  // ─── Mobile drawer ───────────────────────────────────────────────────────
  const renderDrawer = () => (
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
          <TouchableOpacity style={styles.drawerMenuItem} onPress={() => { setShowDrawer(false); navigate('/app/'); }}>
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
          {/* TÌM KIẾM active trong drawer */}
          <TouchableOpacity style={[styles.drawerMenuItem, styles.drawerMenuItemActive]} onPress={() => setShowDrawer(false)}>
            <Text style={styles.drawerMenuIcon}>🔍</Text>
            <Text style={[styles.drawerMenuText, styles.drawerMenuTextActive]}>Tìm kiếm</Text>
            <Text style={styles.drawerMenuArrow}>›</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.drawerBackdropTouchable} onPress={() => setShowDrawer(false)} activeOpacity={1} />
      </View>
    </Modal>
  );

  // ─── Search form ─────────────────────────────────────────────────────────
  const renderForm = () => (
    <View style={[styles.formCard, isMobile && styles.formCardMobile]}>
      <Text style={styles.pageTitle}>Tìm kiếm</Text>

      {/* Thời gian bắt đầu */}
      <View style={[styles.formRow, isMobile && styles.formRowMobile]}>
        <Text style={styles.formLabel}>Thời gian bắt đầu</Text>
        <View style={styles.dateInputWrapper}>
          <DateInputWeb
            value={startDate}
            onChange={setStartDate}
            placeholder="Tháng/Ngày/Năm"
          />
        </View>
      </View>

      {/* Thời gian kết thúc */}
      <View style={[styles.formRow, isMobile && styles.formRowMobile]}>
        <Text style={styles.formLabel}>Thời gian kết thúc</Text>
        <View style={styles.dateInputWrapper}>
          <DateInputWeb
            value={endDate}
            onChange={setEndDate}
            placeholder="Tháng/Ngày/Năm"
          />
        </View>
      </View>

      {/* Nội dung */}
      <View style={[styles.formRow, isMobile && styles.formRowMobile]}>
        <Text style={styles.formLabel}>Nội dung</Text>
        <View style={styles.dateInputWrapper}>
          {Platform.OS === 'web' ? (
            <textarea
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                border: '1px solid #ccc',
                borderRadius: 4,
                padding: '6px 8px',
                fontSize: 14,
                fontFamily: 'inherit',
                resize: 'vertical',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          ) : (
            <RNTextInput
              value={keyword}
              onChangeText={setKeyword}
              multiline
              numberOfLines={3}
              style={styles.textareaMobile}
            />
          )}
        </View>
      </View>

      {searchError ? (
        <Text style={styles.errorText}>{searchError}</Text>
      ) : null}

      <View style={[styles.formRow, isMobile && styles.formRowMobile]}>
        <View style={isMobile ? styles.formLabelMobileEmpty : styles.formLabel} />
        <TouchableOpacity
          style={[styles.searchButton, searching && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={searching}
          activeOpacity={0.8}
        >
          {searching ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.searchButtonText}>Tìm kiếm</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  // ─── Results table ───────────────────────────────────────────────────────
  const renderResults = () => {
    if (!hasSearched) return null;

    return (
      <View style={[styles.resultsSection, isMobile && styles.resultsSectionMobile]}>
        <Text style={styles.resultsLabel}>Danh sách lịch làm việc</Text>

        {results.length === 0 ? (
          <Text style={styles.noResultText}>Không tìm thấy kết quả nào.</Text>
        ) : (
          <>
            {/* Table header */}
            {Platform.OS === 'web' ? (
              <div style={{ overflowX: 'auto', width: '100%' }}>
                <table style={tableStyles.table}>
                  <thead>
                    <tr style={tableStyles.headerRow}>
                      <th style={{ ...tableStyles.th, width: 50 }}>STT</th>
                      <th style={{ ...tableStyles.th, width: 130 }}>Ngày</th>
                      <th style={{ ...tableStyles.th }}>Nội dung</th>
                      <th style={{ ...tableStyles.th, width: 120 }}>Phòng, ban</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedResults.map((item, idx) => {
                      const { thu, ngay } = formatResultDate(item.date);
                      const globalIdx = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                      return (
                        <tr key={item._id || `${item.date}-${idx}`} style={idx % 2 === 0 ? tableStyles.rowEven : tableStyles.rowOdd}>
                          <td style={tableStyles.tdCenter}>{globalIdx}</td>
                          <td style={tableStyles.tdCenter}>
                            <span style={tableStyles.dayName}>{thu}</span>
                            <br />
                            <span style={tableStyles.dayDate}>{ngay}</span>
                          </td>
                          <td style={tableStyles.tdContent}>
                            {item.time && (
                              <span style={tableStyles.timeText}>{item.time}</span>
                            )}
                            <br />
                            {item.content}
                          </td>
                          <td style={tableStyles.tdCenter}>{item.department || 'Văn phòng'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Mobile — card list */
              pagedResults.map((item, idx) => {
                const { thu, ngay } = formatResultDate(item.date);
                const globalIdx = (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                return (
                  <View key={item._id || `${item.date}-${idx}`} style={styles.resultCard}>
                    <View style={styles.resultCardHeader}>
                      <Text style={styles.resultCardStt}>#{globalIdx}</Text>
                      <Text style={styles.resultCardDate}>{thu} {ngay}</Text>
                    </View>
                    {item.time && <Text style={styles.resultCardTime}>{item.time}</Text>}
                    <Text style={styles.resultCardContent}>{item.content}</Text>
                    <Text style={styles.resultCardDept}>{item.department || 'Văn phòng'}</Text>
                  </View>
                );
              })
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <View style={styles.pagination}>
                <TouchableOpacity
                  style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
                  onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <Text style={styles.pageBtnText}>‹ Trước</Text>
                </TouchableOpacity>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                  .reduce((acc, p, i, arr) => {
                    if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === '...' ? (
                      <Text key={`ellipsis-${i}`} style={styles.pageEllipsis}>…</Text>
                    ) : (
                      <TouchableOpacity
                        key={p}
                        style={[styles.pageBtn, p === currentPage && styles.pageBtnActive]}
                        onPress={() => setCurrentPage(p)}
                      >
                        <Text style={[styles.pageBtnText, p === currentPage && styles.pageBtnTextActive]}>{p}</Text>
                      </TouchableOpacity>
                    )
                  )}

                <TouchableOpacity
                  style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
                  onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <Text style={styles.pageBtnText}>Sau ›</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.resultCount}>
              Tổng {results.length} kết quả — Trang {currentPage}/{totalPages}
            </Text>
          </>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderBanner()}
      {renderDrawer()}
      {!isMobile && renderNavBar()}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {renderForm()}
        {renderResults()}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Bản quyền thuộc về LichCongTac.Com</Text>
      </View>
    </View>
  );
};

// Inline CSS for HTML table (web only)
const tableStyles = {
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 14,
    marginTop: 8,
  },
  headerRow: {
    backgroundColor: '#d9d9d9',
  },
  th: {
    border: '1px solid #ccc',
    padding: '8px 10px',
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#333',
  },
  rowEven: {
    backgroundColor: '#fff',
  },
  rowOdd: {
    backgroundColor: '#f9f9f9',
  },
  tdCenter: {
    border: '1px solid #ddd',
    padding: '8px 10px',
    textAlign: 'center',
    verticalAlign: 'middle',
    color: '#333',
  },
  tdContent: {
    border: '1px solid #ddd',
    padding: '8px 12px',
    verticalAlign: 'top',
    color: '#333',
    lineHeight: '1.6',
  },
  dayName: {
    display: 'block',
    fontWeight: '600',
  },
  dayDate: {
    color: '#cc0000',
    fontWeight: '600',
  },
  timeText: {
    color: '#cc0000',
    fontWeight: 'bold',
    fontSize: 13,
  },
};

const LARGE_BANNER_HEIGHT_DESKTOP = 200;
const LARGE_BANNER_HEIGHT_MOBILE = 160;
const SMALL_BANNER_ASPECT = 661 / 186;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  // Banner/header
  mobileHeaderWrapper: { width: '100%', flexDirection: 'column', flexShrink: 0 },
  headerContainer: { width: '100%', position: 'relative' },
  headerContainerMobile: { flexShrink: 0, height: LARGE_BANNER_HEIGHT_MOBILE, minHeight: LARGE_BANNER_HEIGHT_MOBILE, zIndex: 9999 },
  largeBannerContainer: { width: '100%', position: 'relative', overflow: 'hidden', maxWidth: 1200, alignSelf: 'center', minHeight: LARGE_BANNER_HEIGHT_DESKTOP },
  largeBannerContainerMobile: { width: '100%', maxWidth: '100%', height: LARGE_BANNER_HEIGHT_MOBILE, minHeight: LARGE_BANNER_HEIGHT_MOBILE, flexShrink: 0 },
  largeBanner: { width: '100%', height: LARGE_BANNER_HEIGHT_DESKTOP, backgroundColor: '#e8e8e8', resizeMode: 'cover' },
  largeBannerMobile: { width: '100%', height: LARGE_BANNER_HEIGHT_MOBILE, resizeMode: 'cover' },
  bannerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  bannerOverlayMobile: { justifyContent: 'flex-start', alignItems: 'flex-start', zIndex: 10000, elevation: 10000 },
  bannerOverlayContent: { flexDirection: 'row', alignItems: 'stretch', width: '100%', height: '100%', maxWidth: 1200, paddingHorizontal: 40, marginLeft: 'auto', marginRight: 'auto', overflow: 'hidden' },
  bannerOverlayContentMobile: { paddingHorizontal: 0, overflow: 'hidden', height: LARGE_BANNER_HEIGHT_MOBILE, minHeight: LARGE_BANNER_HEIGHT_MOBILE, alignSelf: 'stretch', width: '100%', position: 'relative' },
  smallBannerWrapper: { width: '50%', minWidth: LARGE_BANNER_HEIGHT_DESKTOP * SMALL_BANNER_ASPECT, height: LARGE_BANNER_HEIGHT_DESKTOP, flexShrink: 0, alignItems: 'stretch', justifyContent: 'center', overflow: 'hidden', marginLeft: -20 },
  smallBannerWrapperMobile: { position: 'absolute', left: -6, top: 0, bottom: 0, width: '100%', height: '100%', paddingLeft: 0, marginLeft: 0, alignItems: 'flex-start', justifyContent: 'center', overflow: 'hidden' },
  smallBanner: { width: '100%', height: '100%', flexShrink: 0 },
  smallBannerMobile: { width: LARGE_BANNER_HEIGHT_MOBILE * SMALL_BANNER_ASPECT, height: LARGE_BANNER_HEIGHT_MOBILE, flexShrink: 0, marginLeft: 0 },
  headerTextWrapper: { width: '35%', flexShrink: 0, alignItems: 'flex-start', justifyContent: 'center' },
  headerTextWrapperMobile: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '48%', paddingRight: 12, paddingLeft: 8, alignItems: 'flex-end', justifyContent: 'center' },
  headerTextContainer: { flex: 1, alignItems: 'flex-start', justifyContent: 'center', minWidth: 0, marginLeft: 100, flexShrink: 1 },
  headerTextContainerMobile: { marginLeft: 0, marginRight: 0, alignItems: 'flex-end' },
  headerTextMobileBg: { backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, alignSelf: 'flex-end' },
  mainTitle: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 4, textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 4 },
  mainTitleMobile: { fontSize: 15, fontWeight: 'bold', color: '#fff', flexShrink: 0, textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  subTitle: { fontSize: 18, color: '#ffe082', fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 4 },
  subTitleMobile: { fontSize: 12, fontWeight: 'bold', color: '#fff', flexShrink: 0, textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },

  // New clean banner styles (shared with ScheduleScreenWeb)
  bannerDesktop: { width: '100%', maxWidth: 1200, alignSelf: 'center', height: LARGE_BANNER_HEIGHT_DESKTOP, overflow: 'hidden', backgroundColor: '#e8f4f8' },
  bannerLogoPanel: {},
  bannerLogoDesktop: { position: 'absolute', left: 0, top: 0, height: LARGE_BANNER_HEIGHT_DESKTOP, width: LARGE_BANNER_HEIGHT_DESKTOP * (661 / 186) },
  bannerTitlePanel: { position: 'absolute', right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'flex-end', paddingRight: 48, width: '50%' },
  bannerStrip: { width: '100%', height: LARGE_BANNER_HEIGHT_MOBILE, overflow: 'hidden', backgroundColor: '#e8f4f8', position: 'relative' },
  bannerDimMobile: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.20)', zIndex: 1 },
  bannerLogMobile: { display: 'none' },
  bannerSealCircle: { position: 'absolute', left: 12, top: (LARGE_BANNER_HEIGHT_MOBILE - 120) / 2, width: 120, height: 120, borderRadius: 60, overflow: 'hidden', zIndex: 2 },
  bannerSealImg: { width: 426, height: 120, marginLeft: -153 },
  bannerTextMobile: { position: 'absolute', right: 0, top: 0, bottom: 0, left: 140, justifyContent: 'center', alignItems: 'flex-end', paddingRight: 10, zIndex: 2 },

  // Mobile top bar
  mobileTopBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1565c0', paddingVertical: 12, paddingHorizontal: 12, width: '100%', flexShrink: 0, zIndex: 1 },
  hamburgerButton: { padding: 8, marginRight: 8 },
  mobileTopBarTitle: { flex: 1, fontSize: 16, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  mobileTopBarSpacer: { width: 40 },

  // Drawer
  drawerBackdrop: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.4)' },
  drawerBackdropTouchable: { flex: 1 },
  drawerPanel: { width: '85%', maxWidth: 320, backgroundColor: '#fff', paddingTop: Platform.OS === 'web' ? 24 : 48, paddingBottom: 24, paddingHorizontal: 16, shadowColor: '#000', shadowOffset: { width: 2, height: 0 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 16 },
  drawerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  drawerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1976d2' },
  drawerCloseBtn: { padding: 4 },
  drawerCloseText: { fontSize: 22, color: '#666', fontWeight: '300' },
  drawerSectionLabel: { marginTop: 8, marginBottom: 4 },
  drawerSectionLabelText: { fontSize: 12, color: '#999', fontWeight: '600', textTransform: 'uppercase' },
  drawerMenuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 4, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee' },
  drawerMenuItemActive: { backgroundColor: '#e3f2fd' },
  drawerMenuIcon: { fontSize: 18, marginRight: 12, width: 24, textAlign: 'center' },
  drawerMenuText: { flex: 1, fontSize: 15, color: '#333' },
  drawerMenuTextActive: { color: '#1565c0', fontWeight: 'bold' },
  drawerMenuArrow: { fontSize: 18, color: '#999', fontWeight: '300' },

  // Nav bar desktop
  navBarOuter: { width: '100%', maxWidth: 1200, alignSelf: 'center', flexShrink: 0, backgroundColor: '#1565c0' },
  navBarScroll: { width: '100%', maxWidth: 1200, alignSelf: 'center', flexShrink: 0, minHeight: 48 },
  navBarScrollContent: { flexGrow: 1, minWidth: '100%' },
  navBar: { backgroundColor: '#1565c0', flexDirection: 'row', paddingHorizontal: 40, paddingVertical: 12, alignItems: 'center', gap: 16, maxWidth: 1200, width: '100%', alignSelf: 'center', minHeight: 48 },
  navItem: { color: '#fff', fontSize: 14, fontWeight: 'normal', paddingVertical: 4, paddingHorizontal: 4 },
  navItemActive: { fontWeight: 'bold', textDecorationLine: 'underline' },
  navItemAuthenticated: { fontWeight: 'bold' },
  navSeparator: { width: 1, height: 20, backgroundColor: '#fff', opacity: 0.5 },

  // Scroll + content
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 0 },

  // Form
  formCard: { backgroundColor: '#edf4fb', margin: 16, padding: 20, borderRadius: 4, maxWidth: 900, alignSelf: 'center', width: '100%' },
  formCardMobile: { margin: 10, padding: 14 },
  pageTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  formRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  formRowMobile: { flexDirection: 'column', alignItems: 'stretch' },
  formLabel: { width: 160, fontSize: 14, color: '#333', paddingTop: 8, flexShrink: 0 },
  formLabelMobileEmpty: { height: 0 },
  dateInputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  dateInputMobile: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 6, fontSize: 14, color: '#333', backgroundColor: '#fff', width: '100%' },
  textareaMobile: { borderWidth: 1, borderColor: '#ccc', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 6, fontSize: 14, color: '#333', backgroundColor: '#fff', width: '100%', height: 80, textAlignVertical: 'top' },
  searchButton: { backgroundColor: '#4caf50', paddingVertical: 10, paddingHorizontal: 24, borderRadius: 4, alignItems: 'center', justifyContent: 'center', minWidth: 120 },
  searchButtonDisabled: { backgroundColor: '#a5d6a7' },
  searchButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  errorText: { color: '#c62828', fontSize: 13, marginBottom: 8, marginLeft: 160 },

  // Results
  resultsSection: { margin: 16, marginTop: 0, maxWidth: 900, alignSelf: 'center', width: '100%' },
  resultsSectionMobile: { margin: 10, marginTop: 0 },
  resultsLabel: { fontSize: 14, color: '#555', marginBottom: 8, fontStyle: 'italic' },
  noResultText: { fontSize: 15, color: '#666', textAlign: 'center', paddingVertical: 20 },

  // Mobile result cards
  resultCard: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 12, marginBottom: 10 },
  resultCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  resultCardStt: { fontSize: 12, color: '#999', width: 28 },
  resultCardDate: { fontSize: 13, color: '#cc0000', fontWeight: 'bold' },
  resultCardTime: { fontSize: 13, color: '#cc0000', fontWeight: 'bold', marginBottom: 2 },
  resultCardContent: { fontSize: 14, color: '#333', lineHeight: 20 },
  resultCardDept: { fontSize: 12, color: '#666', marginTop: 4, fontStyle: 'italic' },

  // Pagination
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', marginTop: 16, gap: 6 },
  pageBtn: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#ccc', borderRadius: 4, backgroundColor: '#fff' },
  pageBtnActive: { backgroundColor: '#1976d2', borderColor: '#1976d2' },
  pageBtnDisabled: { backgroundColor: '#f5f5f5', borderColor: '#eee', opacity: 0.6 },
  pageBtnText: { fontSize: 14, color: '#333' },
  pageBtnTextActive: { color: '#fff', fontWeight: 'bold' },
  pageEllipsis: { fontSize: 16, color: '#999', paddingHorizontal: 4, paddingVertical: 6 },
  resultCount: { textAlign: 'center', fontSize: 12, color: '#888', marginTop: 10 },

  // Footer
  footer: { backgroundColor: '#2196f3', paddingVertical: 14, alignItems: 'center' },
  footerText: { color: '#fff', fontSize: 13 },
});

export default SearchScreen;
