/**
 * Script để cập nhật permissions cho admin - đảm bảo admin có TẤT CẢ quyền
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Tất cả permissions có thể có trong hệ thống
const allPermissions = [
  // Schedule permissions
  'schedule:read',
  'schedule:write',
  'schedule:delete',
  'schedule:publish',
  'schedule:manage',
  
  // User management permissions
  'user:read',
  'user:write',
  'user:delete',
  'user:manage',
  
  // System permissions
  'system:manage',
  'system:config',
  'system:backup',
  'system:restore',
  
  // Audit permissions
  'audit:read',
  'audit:write',
  'audit:delete',
  
  // Role permissions
  'role:read',
  'role:write',
  'role:delete',
  'role:manage',
  
  // Wildcard permissions (all permissions)
  '*:read',
  '*:write',
  '*:delete',
  '*:manage'
];

async function updateAdminPermissions() {
  try {
    console.log('🔐 Cập nhật permissions cho admin...\n');
    
    const adminRef = db.collection('users').doc('admin@campha.gov.vn');
    const adminDoc = await adminRef.get();
    
    if (!adminDoc.exists) {
      console.error('❌ Admin user không tồn tại!');
      process.exit(1);
    }
    
    // Update với tất cả permissions
    await adminRef.update({
      permissions: allPermissions,
      role: 'admin',
      isActive: true,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Đã cập nhật permissions cho admin');
    console.log(`📋 Tổng số permissions: ${allPermissions.length}`);
    console.log('\n🔐 Permissions của admin:');
    allPermissions.forEach((perm, index) => {
      console.log(`   ${index + 1}. ${perm}`);
    });
    
    console.log('\n🎉 Hoàn thành!');
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    process.exit(0);
  }
}

updateAdminPermissions();