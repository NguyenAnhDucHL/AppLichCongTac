# 📝 Hướng dẫn thêm dữ liệu vào Firestore

## 🎯 Có 2 cách thêm data

### Cách 1: Sử dụng Firebase Console (Đơn giản nhất) ⭐

#### Bước 1: Vào Firestore Database

1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Chọn project `applichcongtac`
3. Click **Firestore Database** ở sidebar

#### Bước 2: Tạo Collection và Document

1. Click **Start collection** (nếu chưa có)
2. Collection ID: `schedules`
3. Document ID: `2026-01-16` (format: yyyy-MM-dd)
4. Thêm fields:

**Field 1:**
- Field name: `date`
- Type: `string`
- Value: `2026-01-16`

**Field 2:**
- Field name: `events`
- Type: `array`
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

#### Bước 3: Thêm các ngày khác

Lặp lại Bước 2 cho:
- `2026-01-17`
- `2026-01-18`
- Và các ngày khác...

---

### Cách 2: Sử dụng Script (Nhanh hơn cho nhiều ngày)

#### Bước 1: Cài đặt firebase-admin

```bash
npm install firebase-admin
```

#### Bước 2: Download Service Account Key

1. Vào Firebase Console > Project Settings > Service accounts
2. Click **Generate new private key**
3. Download file JSON
4. Đổi tên thành `serviceAccountKey.json`
5. Đặt vào thư mục `scripts/`

#### Bước 3: Chạy script

```bash
node scripts/addScheduleData.js
```

Script sẽ tự động thêm data cho các ngày 16, 17, 18/01/2026.

---

## 📋 Cấu trúc dữ liệu

```json
{
  "date": "2026-01-16",
  "events": [
    {
      "id": "event-1",
      "time": "08:00",
      "content": "Nội dung sự kiện..."
    },
    {
      "id": "event-2",
      "time": "09:00",
      "content": "Nội dung sự kiện khác..."
    }
  ],
  "updatedAt": "2026-01-16T10:00:00Z"
}
```

## ✅ Sau khi thêm data

1. Refresh web app: `https://applichcongtac.web.app/app`
2. Data sẽ tự động hiển thị (auto-sync từ Firestore)
3. Web app sẽ hiển thị lịch công tác như website mẫu

## 🔄 Thêm ngày mới

Mỗi ngày tạo một document mới với ID là ngày (format: `yyyy-MM-dd`):
- `2026-01-16`
- `2026-01-17`
- `2026-01-18`
- `2026-01-19`
- ...

## 💡 Tip

- Có thể thêm nhiều ngày cùng lúc bằng script
- Hoặc thêm từng ngày qua Firebase Console
- Data sẽ tự động sync lên web app và mobile app
