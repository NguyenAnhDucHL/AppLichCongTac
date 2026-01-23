/**
 * Script để setup database với users, roles mặc định
 * 
 * Cách sử dụng:
 * node scripts/setupDatabase.js
 */

const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Bcrypt salt rounds (cost factor)
const BCRYPT_SALT_ROUNDS = 10;

// Helper function để hash password với bcrypt (BẢO MẬT CAO NHẤT)
async function hashPassword(password) {
  return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

// Default roles
const defaultRoles = [
  {
    id: 'admin',
    name: 'Quản trị viên',
    description: 'Toàn quyền quản lý hệ thống',
    permissions: [
      'schedule:read',
      'schedule:write', 
      'schedule:delete',
      'schedule:publish',
      'user:read',
      'user:write',
      'user:delete',
      'system:manage',
      'audit:read'
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'editor',
    name: 'Biên tập viên',
    description: 'Quản lý lịch công tác',
    permissions: [
      'schedule:read',
      'schedule:write',
      'schedule:delete',
      'schedule:publish'
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  },
  {
    id: 'viewer',
    name: 'Người xem',
    description: 'Chỉ xem lịch công tác',
    permissions: [
      'schedule:read'
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }
];

// Default users (password sẽ được hash trong setupDatabase function)
const defaultUsers = [
  {
    id: 'admin@campha.gov.vn',
    email: 'admin@campha.gov.vn',
    username: 'admin',
    plainPassword: 'CamPha@2026', // Sẽ được hash
    fullName: 'Quản trị viên',
    role: 'admin',
    department: 'UBND Phường Cẩm Phả',
    phone: '',
    bio: 'Quản trị hệ thống lịch công tác',
    avatarInitials: 'QT',
    avatarColor: '#1976d2',
    emailNotifications: true,
    pushNotifications: true,
    isActive: true,
    permissions: [
      'schedule:read', 'schedule:write', 'schedule:delete', 'schedule:publish',
      'user:read', 'user:write', 'user:delete', 'system:manage', 'audit:read'
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastLogin: null
  },
  {
    id: 'editor@campha.gov.vn',
    email: 'editor@campha.gov.vn', 
    username: 'editor',
    plainPassword: 'Editor@2026', // Sẽ được hash
    fullName: 'Biên tập viên',
    role: 'editor',
    department: 'UBND Phường Cẩm Phả',
    phone: '',
    bio: 'Biên tập lịch công tác',
    avatarInitials: 'BT',
    avatarColor: '#388e3c',
    emailNotifications: true,
    pushNotifications: true,
    isActive: true,
    permissions: [
      'schedule:read', 'schedule:write', 'schedule:delete', 'schedule:publish'
    ],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastLogin: null
  }
];

// System settings
const systemSettings = {
  id: 'app_config',
  siteName: 'Lịch Công Tác UBND Phường Cẩm Phả',
  allowPublicView: true,
  maxEventsPerDay: 20,
  defaultEventDuration: 60,
  notificationEnabled: true,
  maintenanceMode: false,
  updatedBy: 'system',
  updatedAt: admin.firestore.FieldValue.serverTimestamp()
};

async function deleteAllDocuments(collectionName) {
  const collectionRef = db.collection(collectionName);
  const snapshot = await collectionRef.get();
  
  if (snapshot.empty) {
    console.log(`   ℹ️  Collection '${collectionName}' đã trống`);
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  console.log(`   ✅ Đã xóa ${snapshot.size} documents từ '${collectionName}'`);
}

async function setupDatabase() {
  try {
    console.log('🚀 Bắt đầu setup database...\n');

    // 0. Xóa tất cả dữ liệu cũ
    console.log('🗑️  Xóa dữ liệu cũ...');
    await deleteAllDocuments('users');
    await deleteAllDocuments('roles');
    await deleteAllDocuments('schedules');
    await deleteAllDocuments('system_settings');
    await deleteAllDocuments('sessions');
    console.log('✅ Đã xóa hết dữ liệu cũ\n');

    // 1. Setup roles
    console.log('📝 Tạo roles...');
    for (const role of defaultRoles) {
      await db.collection('roles').doc(role.id).set(role);
      console.log(`✅ Tạo role: ${role.name}`);
    }

    // 2. Setup users  
    console.log('\n👤 Tạo users...');
    for (const user of defaultUsers) {
      // Hash password với bcrypt
      const hashedPassword = await hashPassword(user.plainPassword);
      
      // Tạo user object với password đã hash
      const userDoc = {
        ...user,
        password: hashedPassword
      };
      delete userDoc.plainPassword; // Xóa plainPassword
      
      await db.collection('users').doc(user.id).set(userDoc);
      console.log(`✅ Tạo user: ${user.fullName} (${user.username})`);
    }

    // 3. Setup system settings
    console.log('\n⚙️ Tạo system settings...');
    await db.collection('system_settings').doc(systemSettings.id).set(systemSettings);
    console.log(`✅ Tạo system settings`);

    console.log('\n🎉 Setup database hoàn thành!');
    console.log('\n📋 Thông tin đăng nhập:');
    console.log('Admin:');
    console.log('  - Username: admin');
    console.log('  - Password: CamPha@2026');
    console.log('  - Email: admin@campha.gov.vn');
    console.log('\nEditor:');
    console.log('  - Username: editor');
    console.log('  - Password: Editor@2026'); 
    console.log('  - Email: editor@campha.gov.vn');

    console.log('\n🔗 Kiểm tra tại: https://console.firebase.google.com/project/applichcongtac/firestore');

  } catch (error) {
    console.error('❌ Lỗi khi setup database:', error);
  } finally {
    process.exit(0);
  }
}

setupDatabase();