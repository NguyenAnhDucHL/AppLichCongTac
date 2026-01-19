/**
 * Script để thêm dữ liệu lịch công tác vào Firestore
 * 
 * Cách sử dụng:
 * 1. Cài firebase-admin: npm install firebase-admin
 * 2. Download serviceAccountKey.json từ Firebase Console
 * 3. Chạy: node scripts/addScheduleData.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Download từ Firebase Console

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Dữ liệu cho ngày 16/01/2026
const scheduleData20260116 = {
  date: '2026-01-16',
  events: [
    {
      id: 'event-1',
      time: '08:00',
      content: '44/GM-UBND (Tập trung tại Trụ sở UBND phường đi kiểm tra hiện trường các dự án, sau đó làm việc tại Phòng họp tầng 3, Trụ sở HĐND - UBND phường) Kiểm tra tiến độ các dự án trong Kế hoạch số 272/KH-UBND ngày 21/10/2025 của UBND tỉnh về xây dựng nâng cao chất lượng đô thị, khu dân cư thực hiện mục tiêu phấn đấu tỉnh Quảng Ninh trở thành thành phố trực thuộc Trung ương trước năm 2030 theo Văn bản số 18/SXD-PTĐT ngày 08/01/2026 của Sở Xây dựng. Dự Đ/c Chủ tịch UBND phường (Chủ trì)./.'
    },
    {
      id: 'event-2',
      time: '09:00',
      content: '(Tại Hội trường A, Trụ sở HĐND-UBND phường, Trụ sở HĐND-UBND phường) Hội Người cao tuổi họp Ban Chấp hành mở rộng.'
    },
    {
      id: 'event-3',
      time: '14:00',
      content: '43/GM-VP (Tại Phòng họp tầng 3 - Trụ sở HĐND và UBND phường) Họp xác minh, làm rõ một số nội dung. Đ/c Nguyễn Công Bằng - PCT UBND phường (Chủ trì)./.'
    },
    {
      id: 'event-4',
      time: '14:30',
      content: '06/KH-SVHTTDL (Tập trung tại Trụ sở UBND phường đi khảo sát thực địa, sau đó làm việc tại Phòng họp tầng 4, Trụ sở HĐND - UBND phường) Rà soát hiện trạng các Trung tâm Văn hóa, Thể thao cấp xã, Nhà Văn hóa - Khu thể thao thôn và điểm vui chơi cộng đồng trên địa bàn tỉnh năm 2026. Dự Đ/c Nguyễn Công Bằng - PCT UBND phường, phòng Văn hóa - Xã hội./.'
    },
    {
      id: 'event-5',
      time: '15:00',
      content: '05/GM-UBND (Tại Hội trường A - Trụ sở HĐND và UBND phường) Hội nghị Công bố quyết định về công tác cán bộ. Dự Đ/c Chủ tịch, các Đ/c Phó Chủ tịch HĐND, UBND phường./.'
    }
  ],
  updatedAt: admin.firestore.FieldValue.serverTimestamp()
};

// Dữ liệu cho ngày 17/01/2026
const scheduleData20260117 = {
  date: '2026-01-17',
  events: [
    {
      id: 'event-1',
      time: '07:30',
      content: '11/TB-UBND Lịch trực. Lãnh đạo trực: Đ/c Hoàng Việt Dũng - Chủ tịch UBND phường. Cán bộ văn phòng trực: Đ/c Nguyễn Thị Nơ - Trưởng phòng Văn phòng HĐND và UBND phường. Chuyên viên trực: Đ/c Trương Thị Thu Quỳnh. Người đánh máy trực: Đ/c Trương Thị Thi Hằng.'
    },
    {
      id: 'event-2',
      time: '08:00',
      content: '34/GM-SXD (Tại phòng họp Sở Xây dựng, tầng 9, Trụ sở liên cơ quan số 2, phường Hạ Long) Họp rà soát, đánh giá thực trạng phát triển đô thị để thực hiện phân loại, công nhận đô thị Quảng Ninh đề xuất giải pháp phấn đấu hoàn thành mục tiêu tỉnh Quảng Ninh trở thành thành phố trực thuộc Trung ương trước năm 2030. Dự Lãnh đạo UBND phường./.'
    },
    {
      id: 'event-3',
      time: '13:30',
      content: '06/GM-HVHNT (Tại Hội trường A, Trụ sở HĐND-UBND phường) Đại hội Hội Văn học nghệ thuật phường Cẩm Phả, khóa I, nhiệm kỳ 2026-2030. Dự Lãnh đạo UBND phường./.'
    }
  ],
  updatedAt: admin.firestore.FieldValue.serverTimestamp()
};

// Dữ liệu cho ngày 18/01/2026
const scheduleData20260118 = {
  date: '2026-01-18',
  events: [
    {
      id: 'event-1',
      time: '07:30',
      content: '11/TB-UBND Lịch trực. Lãnh đạo trực: Đ/c Hoàng Việt Dũng - Chủ tịch UBND phường. Cán bộ văn phòng trực: Đ/c Nguyễn Thị Nơ - Trưởng phòng Văn phòng HĐND và UBND phường.'
    }
  ],
  updatedAt: admin.firestore.FieldValue.serverTimestamp()
};

// Thêm vào Firestore
async function addSchedules() {
  try {
    // Thêm ngày 16/01/2026
    await db.collection('schedules').doc('2026-01-16').set(scheduleData20260116);
    console.log('✅ Đã thêm lịch cho ngày 16/01/2026');
    
    // Thêm ngày 17/01/2026
    await db.collection('schedules').doc('2026-01-17').set(scheduleData20260117);
    console.log('✅ Đã thêm lịch cho ngày 17/01/2026');
    
    // Thêm ngày 18/01/2026
    await db.collection('schedules').doc('2026-01-18').set(scheduleData20260118);
    console.log('✅ Đã thêm lịch cho ngày 18/01/2026');
    
    console.log('\n✅ Hoàn thành! Đã thêm dữ liệu vào Firestore.');
    console.log('Kiểm tra tại: https://console.firebase.google.com/project/applichcongtac/firestore');
  } catch (error) {
    console.error('❌ Lỗi khi thêm dữ liệu:', error);
  }
}

addSchedules();
