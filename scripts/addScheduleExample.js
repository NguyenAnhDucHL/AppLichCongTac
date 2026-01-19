/**
 * Script để thêm dữ liệu mẫu vào Firestore
 * 
 * Cách sử dụng:
 * 1. Cài firebase-admin: npm install firebase-admin
 * 2. Download serviceAccountKey.json từ Firebase Console
 * 3. Chạy: node scripts/addScheduleExample.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Download từ Firebase Console

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Dữ liệu mẫu
const scheduleData = {
  date: '2026-01-15',
  events: [
    {
      id: 'event-1',
      time: '08:00',
      content: 'Lịch Tiếp công dân định kỳ. Dự Đ/c Chủ tịch UBND phường./.'
    },
    {
      id: 'event-2',
      time: '14:00',
      content: '05/GM-CAT-PCCC (Tại Hội trường Trụ sở Công an phường Cẩm Phả) (Trực tuyến) Lễ ra mắt Trung tâm thông tin chỉ huy kết nối hệ thống truyền tin, báo sự cố PCCC, ứng dụng "Báo cháy 114" và triển khai Kế hoạch quản lý, vận hành, cập nhật cơ sở dữ liệu về PCCC, CNCH. Dự Đ/c Nguyễn Công Bằng - PCT UBND phường./.'
    },
    {
      id: 'event-3',
      time: '17:30',
      content: '04/GM-LM (Tại Hội trường Nhà khách tỉnh cơ sở 2) Hội nghị triển khai nhiệm vụ công tác năm 2026 của Liên minh hợp tác xã tỉnh. Dự Đ/c Nguyễn Thạch Long - PCT UBND phường./.'
    }
  ],
  updatedAt: admin.firestore.FieldValue.serverTimestamp()
};

// Thêm vào Firestore
async function addSchedule() {
  try {
    await db.collection('schedules').doc('2026-01-15').set(scheduleData);
    console.log('✅ Successfully added schedule data!');
    console.log('Document ID: 2026-01-15');
    console.log('Events:', scheduleData.events.length);
  } catch (error) {
    console.error('❌ Error adding schedule:', error);
  }
}

addSchedule();
