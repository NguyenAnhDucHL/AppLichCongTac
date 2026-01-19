# 📝 Hướng dẫn thêm data qua Firebase Console

## Cách nhanh nhất - Thêm trực tiếp qua Firebase Console

### Bước 1: Vào Firestore Database
1. Mở [Firebase Console](https://console.firebase.google.com/)
2. Chọn project **applichcongtac**
3. Click **Firestore Database** ở menu bên trái

### Bước 2: Tạo Collection và Document

#### Ngày 16/01/2026:

1. Click **Start collection** (nếu chưa có collection)
2. **Collection ID:** `schedules`
3. **Document ID:** `2026-01-16`
4. Click **Add field** để thêm các fields:

**Field 1:**
- **Field name:** `date`
- **Type:** `string`
- **Value:** `2026-01-16`

**Field 2:**
- **Field name:** `events`
- **Type:** `array`
- Click **Add item** để thêm từng event:

**Event 1:**
```json
{
  "id": "event-1",
  "time": "08:00",
  "content": "44/GM-UBND (Tập trung tại Trụ sở UBND phường đi kiểm tra hiện trường các dự án, sau đó làm việc tại Phòng họp tầng 3, Trụ sở HĐND - UBND phường) Kiểm tra tiến độ các dự án trong Kế hoạch số 272/KH-UBND ngày 21/10/2025 của UBND tỉnh về xây dựng nâng cao chất lượng đô thị, khu dân cư thực hiện mục tiêu phấn đấu tỉnh Quảng Ninh trở thành thành phố trực thuộc Trung ương trước năm 2030 theo Văn bản số 18/SXD-PTĐT ngày 08/01/2026 của Sở Xây dựng. Dự Đ/c Chủ tịch UBND phường (Chủ trì)./."
}
```

**Event 2:**
```json
{
  "id": "event-2",
  "time": "09:00",
  "content": "(Tại Hội trường A, Trụ sở HĐND-UBND phường, Trụ sở HĐND-UBND phường) Hội Người cao tuổi họp Ban Chấp hành mở rộng."
}
```

**Event 3:**
```json
{
  "id": "event-3",
  "time": "14:00",
  "content": "43/GM-VP (Tại Phòng họp tầng 3 - Trụ sở HĐND và UBND phường) Họp xác minh, làm rõ một số nội dung. Đ/c Nguyễn Công Bằng - PCT UBND phường (Chủ trì)./."
}
```

**Event 4:**
```json
{
  "id": "event-4",
  "time": "14:30",
  "content": "06/KH-SVHTTDL (Tập trung tại Trụ sở UBND phường đi khảo sát thực địa, sau đó làm việc tại Phòng họp tầng 4, Trụ sở HĐND - UBND phường) Rà soát hiện trạng các Trung tâm Văn hóa, Thể thao cấp xã, Nhà Văn hóa - Khu thể thao thôn và điểm vui chơi cộng đồng trên địa bàn tỉnh năm 2026. Dự Đ/c Nguyễn Công Bằng - PCT UBND phường, phòng Văn hóa - Xã hội./."
}
```

**Event 5:**
```json
{
  "id": "event-5",
  "time": "15:00",
  "content": "05/GM-UBND (Tại Hội trường A - Trụ sở HĐND và UBND phường) Hội nghị Công bố quyết định về công tác cán bộ. Dự Đ/c Chủ tịch, các Đ/c Phó Chủ tịch HĐND, UBND phường./."
}
```

5. Click **Save**

#### Ngày 17/01/2026:

Tạo document mới với **Document ID:** `2026-01-17`

**Field 1:** `date` = `2026-01-17` (string)

**Field 2:** `events` (array) với 3 events:

**Event 1:**
```json
{
  "id": "event-1",
  "time": "07:30",
  "content": "11/TB-UBND Lịch trực. Lãnh đạo trực: Đ/c Hoàng Việt Dũng - Chủ tịch UBND phường. Cán bộ văn phòng trực: Đ/c Nguyễn Thị Nơ - Trưởng phòng Văn phòng HĐND và UBND phường. Chuyên viên trực: Đ/c Trương Thị Thu Quỳnh. Người đánh máy trực: Đ/c Trương Thị Thi Hằng."
}
```

**Event 2:**
```json
{
  "id": "event-2",
  "time": "08:00",
  "content": "34/GM-SXD (Tại phòng họp Sở Xây dựng, tầng 9, Trụ sở liên cơ quan số 2, phường Hạ Long) Họp rà soát, đánh giá thực trạng phát triển đô thị để thực hiện phân loại, công nhận đô thị Quảng Ninh đề xuất giải pháp phấn đấu hoàn thành mục tiêu tỉnh Quảng Ninh trở thành thành phố trực thuộc Trung ương trước năm 2030. Dự Lãnh đạo UBND phường./."
}
```

**Event 3:**
```json
{
  "id": "event-3",
  "time": "13:30",
  "content": "06/GM-HVHNT (Tại Hội trường A, Trụ sở HĐND-UBND phường) Đại hội Hội Văn học nghệ thuật phường Cẩm Phả, khóa I, nhiệm kỳ 2026-2030. Dự Lãnh đạo UBND phường./."
}
```

#### Ngày 18/01/2026:

Tạo document mới với **Document ID:** `2026-01-18`

**Field 1:** `date` = `2026-01-18` (string)

**Field 2:** `events` (array) với 1 event:

**Event 1:**
```json
{
  "id": "event-1",
  "time": "07:30",
  "content": "11/TB-UBND Lịch trực. Lãnh đạo trực: Đ/c Hoàng Việt Dũng - Chủ tịch UBND phường. Cán bộ văn phòng trực: Đ/c Nguyễn Thị Nơ - Trưởng phòng Văn phòng HĐND và UBND phường."
}
```

### Bước 3: Kiểm tra

1. Refresh web app: https://applichcongtac.web.app/app
2. Data sẽ tự động hiển thị!

## 📌 Lưu ý

- Document ID phải đúng format: `YYYY-MM-DD` (ví dụ: `2026-01-16`)
- Field `date` phải match với Document ID
- Field `events` phải là array
- Mỗi event phải có `id`, `time`, và `content`
