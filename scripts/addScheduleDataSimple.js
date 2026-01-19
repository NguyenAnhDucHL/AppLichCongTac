/**
 * Script đơn giản để thêm data vào Firestore
 * Sử dụng firebase-admin (cần service account)
 * 
 * Cách sử dụng:
 * 1. Đảm bảo đã cài firebase-admin: npm install firebase-admin
 * 2. Đảm bảo có file serviceAccountKey.json trong thư mục scripts/
 * 3. Chạy: node scripts/addScheduleDataSimple.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

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

// Dữ liệu cho ngày 18/01/2026 (Chủ nhật)
const scheduleData20260118 = {
  date: '2026-01-18',
  events: [
    {
      id: 'event-1',
      time: '07:30',
      content: '11/TB-UBND. Trực Lãnh đạo: Đ/c Hoàng Việt Dũng - Chủ tịch UBND phường; Trực Văn phòng: Đ/c Nguyễn Thị Nơ - Chánh Văn phòng HĐND và UBND phường; Trực chuyên viên: Đ/c Bùi Thị Hiền; Trực văn thư: Đ/c Trương Thị Thu Hằng./.'
    }
  ],
  updatedAt: admin.firestore.FieldValue.serverTimestamp()
};

// Dữ liệu cho ngày 19/01/2026 (Thứ hai)
const scheduleData20260119 = {
  date: '2026-01-19',
  events: [
    {
      id: 'event-1',
      time: '08:00',
      content: '90-GM/ĐU (Tại phòng họp tầng 2, trụ sở Đảng ủy phường) Hội nghị Thường trực Đảng ủy, Ban Thường vụ Đảng ủy nghe và cho ý kiến về một số nội dung theo quy chế làm việc. Dự Lãnh đạo UBND phường./.'
    },
    {
      id: 'event-2',
      time: '10:30',
      content: '01-GM/BCĐ (Tại phòng họp tầng 2, trụ sở Đảng ủy phường) Ban Chỉ đạo bầu cử Đại biểu Quốc hội khóa XVI và bầu cử đại biểu Hội đồng nhân dân các cấp nhiệm kỳ 2026 - 2031 phường Cẩm Phả họp triển khai các nội dung theo thẩm quyền. Dự Lãnh đạo HĐND và UBND phường./.'
    }
  ],
  updatedAt: admin.firestore.FieldValue.serverTimestamp()
};

// Thêm vào Firestore
async function addSchedules() {
  try {
    console.log('🚀 Bắt đầu thêm dữ liệu vào Firestore...\n');
    
    // Thêm ngày 16/01/2026
    await db.collection('schedules').doc('2026-01-16').set(scheduleData20260116);
    console.log('✅ Đã thêm lịch cho ngày 16/01/2026 (' + scheduleData20260116.events.length + ' events)');
    
    // Thêm ngày 17/01/2026
    await db.collection('schedules').doc('2026-01-17').set(scheduleData20260117);
    console.log('✅ Đã thêm lịch cho ngày 17/01/2026 (' + scheduleData20260117.events.length + ' events)');
    
    // Thêm ngày 18/01/2026
    await db.collection('schedules').doc('2026-01-18').set(scheduleData20260118);
    console.log('✅ Đã thêm lịch cho ngày 18/01/2026 (' + scheduleData20260118.events.length + ' events)');
    
    // Thêm ngày 19/01/2026
    await db.collection('schedules').doc('2026-01-19').set(scheduleData20260119);
    console.log('✅ Đã thêm lịch cho ngày 19/01/2026 (' + scheduleData20260119.events.length + ' events)');
    
    console.log('\n✅ Hoàn thành! Đã thêm dữ liệu vào Firestore.');
    console.log('📱 Kiểm tra tại web app: https://applichcongtac.web.app/app');
    console.log('🔍 Kiểm tra tại Firebase Console: https://console.firebase.google.com/project/applichcongtac/firestore');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi thêm dữ liệu:', error);
    process.exit(1);
  }
}

addSchedules();
