import { collection, doc, getDoc, getDocs, query, where, updateDoc, setDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../config/firebase';
import bcrypt from 'bcryptjs';

const USERS_COLLECTION = 'users';
const SESSIONS_COLLECTION = 'sessions';
const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

// Bcrypt salt rounds (cost factor) - 10 là giá trị cân bằng giữa bảo mật và tốc độ
const BCRYPT_SALT_ROUNDS = 10;

/**
 * Hash password với bcrypt (BẢO MẬT CAO NHẤT)
 * bcrypt tự động tạo salt ngẫu nhiên cho mỗi password
 * Tương thích với cả web và mobile
 */
export async function hashPassword(password) {
  if (!password) {
    throw new Error('Password is required');
  }
  
  // bcrypt.hash tự động tạo salt và hash password
  const hashed = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  return hashed;
}

/**
 * So sánh password với hash (dùng bcrypt)
 */
export async function comparePassword(password, hash) {
  if (!password || !hash) {
    return false;
  }
  
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Error comparing password:', error);
    return false;
  }
}

/**
 * Check nếu hash là bcrypt hash (bắt đầu với $2a$, $2b$, hoặc $2y$)
 */
function isBcryptHash(hash) {
  return hash && (hash.startsWith('$2a$') || hash.startsWith('$2b$') || hash.startsWith('$2y$'));
}

/**
 * Generate simple session token
 */
function generateSessionToken() {
  return 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Đăng nhập với username/password
 */
export const login = async (username, password) => {
  try {
    console.log('🔐 Attempting login for:', username);
    
    // Try to get user by document ID first (optimization)
    let userDoc = null;
    let userData = null;
    
    // Try common user IDs as document IDs first
    const commonUserIds = [
      `${username}@campha.gov.vn`,
      username
    ];
    
    for (const userId of commonUserIds) {
      try {
        console.log('🔍 Trying user ID:', userId);
        const userRef = doc(db, USERS_COLLECTION, userId);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          userDoc = userSnap;
          userData = userSnap.data();
          console.log('✅ Found user by ID:', userId);
          // Check if username matches
          if (userData.username === username) {
            console.log('✅ Username matches!');
            break;
          }
        }
      } catch (error) {
        console.error('❌ Error getting user by ID:', userId, error.message);
      }
    }
    
    // If not found, try query collection
    if (!userDoc || !userData || userData.username !== username) {
      console.log('🔍 Trying collection query...');
      try {
        const usersRef = collection(db, USERS_COLLECTION);
        const q = query(usersRef, where('username', '==', username));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          throw new Error('Tên đăng nhập không tồn tại');
        }
        
        userDoc = querySnapshot.docs[0];
        userData = userDoc.data();
        console.log('✅ Found user by query');
      } catch (queryError) {
        console.error('❌ Query error:', queryError);
        throw new Error('Không thể truy cập database. Vui lòng thử lại sau.');
      }
    }
    
    // Kiểm tra password - chỉ hỗ trợ bcrypt
    if (!isBcryptHash(userData.password)) {
      throw new Error('Mật khẩu không hợp lệ. Vui lòng liên hệ quản trị viên để reset mật khẩu.');
    }
    
    // Dùng bcrypt.compare để so sánh password
    const passwordMatch = await comparePassword(password, userData.password);
    
    if (!passwordMatch) {
      throw new Error('Mật khẩu không đúng');
    }
    
    // Kiểm tra account có active không
    if (!userData.isActive) {
      throw new Error('Tài khoản đã bị khóa');
    }
    
    // Tạo session token
    const sessionToken = generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Token expires in 24 hours
    
    // Lưu session vào Firestore
    const sessionData = {
      id: sessionToken,
      userId: userData.id,
      token: sessionToken,
      createdAt: new Date(),
      expiresAt: expiresAt,
      isActive: true
    };
    
    await setDoc(doc(db, SESSIONS_COLLECTION, sessionToken), sessionData);
    
    // Update lastLogin
    await updateDoc(doc(db, USERS_COLLECTION, userDoc.id), {
      lastLogin: new Date()
    });
    
    // Lưu vào AsyncStorage
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, sessionToken);
    await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify({
      id: userData.id,
      username: userData.username,
      email: userData.email,
      fullName: userData.fullName,
      role: userData.role,
      department: userData.department,
      permissions: userData.permissions || [],
      avatarInitials: userData.avatarInitials || userData.fullName?.charAt(0) || 'U',
      avatarColor: userData.avatarColor || '#1976d2',
      phone: userData.phone || '',
      bio: userData.bio || ''
    }));
    
    console.log('✅ Login successful for:', username);
    
    return {
      success: true,
      user: {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        fullName: userData.fullName,
        role: userData.role,
        department: userData.department,
        permissions: userData.permissions || []
      },
      token: sessionToken
    };
    
  } catch (error) {
    console.error('❌ Login error:', error);
    throw error;
  }
};

/**
 * Đăng xuất
 */
export const logout = async () => {
  try {
    // Lấy token hiện tại
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    
    if (token) {
      // Vô hiệu hóa session trong Firestore
      try {
        await updateDoc(doc(db, SESSIONS_COLLECTION, token), {
          isActive: false,
          loggedOutAt: new Date()
        });
      } catch (error) {
        console.warn('Could not invalidate session:', error);
      }
    }
    
    // Xóa dữ liệu local
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(USER_DATA_KEY);
    
    console.log('✅ Logout successful');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Logout error:', error);
    throw error;
  }
};

/**
 * Lấy thông tin user hiện tại
 */
export const getCurrentUser = async () => {
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    const userDataStr = await AsyncStorage.getItem(USER_DATA_KEY);
    
    if (!token || !userDataStr) {
      return null;
    }
    
    const userData = JSON.parse(userDataStr);
    
    // Kiểm tra session còn valid không
    const sessionDoc = await getDoc(doc(db, SESSIONS_COLLECTION, token));
    if (!sessionDoc.exists()) {
      await logout(); // Clear invalid session
      return null;
    }
    
    const sessionData = sessionDoc.data();
    if (!sessionData.isActive || new Date() > sessionData.expiresAt.toDate()) {
      await logout(); // Clear expired session
      return null;
    }
    
    return userData;
    
  } catch (error) {
    console.error('❌ Get current user error:', error);
    return null;
  }
};

/**
 * Kiểm tra user có permission không
 * Hỗ trợ wildcard permissions (*:read, *:write, etc.)
 */
export const hasPermission = async (permission) => {
  try {
    const user = await getCurrentUser();
    if (!user) return false;
    
    // Admin có tất cả quyền
    if (user.role === 'admin') {
      return true;
    }
    
    // Check exact permission
    if (user.permissions.includes(permission)) {
      return true;
    }
    
    // Check wildcard permissions
    const [resource, action] = permission.split(':');
    if (user.permissions.includes(`*:${action}`) || 
        user.permissions.includes(`${resource}:*`) ||
        user.permissions.includes('*:*')) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Check permission error:', error);
    return false;
  }
};

/**
 * Kiểm tra user có role không
 */
export const hasRole = async (role) => {
  try {
    const user = await getCurrentUser();
    if (!user) return false;
    
    return user.role === role;
  } catch (error) {
    console.error('❌ Check role error:', error);
    return false;
  }
};

/**
 * Làm mới token
 */
export const refreshToken = async () => {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('No valid session');
    }
    
    // Tạo token mới
    const newToken = generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    // Update session
    const oldToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    if (oldToken) {
      // Vô hiệu hóa token cũ
      await updateDoc(doc(db, SESSIONS_COLLECTION, oldToken), {
        isActive: false
      });
    }
    
    // Tạo session mới
    const sessionData = {
      id: newToken,
      userId: user.id,
      token: newToken,
      createdAt: new Date(),
      expiresAt: expiresAt,
      isActive: true
    };
    
    await setDoc(doc(db, SESSIONS_COLLECTION, newToken), sessionData);
    
    // Update AsyncStorage
    await AsyncStorage.setItem(AUTH_TOKEN_KEY, newToken);
    
    return { success: true, token: newToken };
    
  } catch (error) {
    console.error('❌ Refresh token error:', error);
    throw error;
  }
};