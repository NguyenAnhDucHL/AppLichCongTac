# Ứng dụng Lịch Công Tác

Ứng dụng mobile cross-platform (iOS & Android) để quản lý và nhắc nhở lịch công tác.

## Tính năng

- ✅ Hiển thị lịch công tác theo ngày
- ✅ Thông báo tự động khi đến giờ (như báo thức)
- ✅ Tự động sync data từ Firebase mỗi ngày
- ✅ Deep linking để tải app từ web
- ✅ Offline support với cache local

## Công nghệ sử dụng

- **React Native** với **Expo** - Cross-platform mobile framework
- **Firebase Firestore** - Database và realtime sync
- **Expo Notifications** - Local notifications
- **React Native Paper** - UI components
- **Firebase Hosting** - Landing page với deep linking

## Cài đặt

### 1. Cài đặt dependencies

```bash
npm install
```

hoặc

```bash
yarn install
```

### 2. Cấu hình Firebase

1. Tạo project mới trên [Firebase Console](https://console.firebase.google.com/)
2. Thêm iOS và Android apps vào project
3. Download `google-services.json` (Android) và `GoogleService-Info.plist` (iOS)
4. Đặt các file này vào thư mục gốc của project
5. Cập nhật `src/services/FirebaseService.js` với config của bạn:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  // ... các config khác
};
```

### 3. Cấu hình Expo

1. Đăng ký tài khoản tại [Expo](https://expo.dev/)
2. Cập nhật `app.json` với thông tin của bạn
3. Cập nhật `src/services/NotificationService.js` với Expo Project ID

### 4. Cấu hình Deep Linking

1. Cập nhật `public/index.html` với App Store và Play Store links
2. Cấu hình URL scheme trong `app.json` (đã có sẵn: `lichcongtac`)

## Chạy ứng dụng

### Development

```bash
npm start
```

Sau đó chọn:
- `i` để chạy trên iOS simulator
- `a` để chạy trên Android emulator
- Scan QR code để chạy trên thiết bị thật

### Build cho production

#### iOS

```bash
expo build:ios
```

#### Android

```bash
expo build:android
```

Hoặc sử dụng EAS Build (khuyến nghị):

```bash
npm install -g eas-cli
eas login
eas build:ios
eas build:android
```

## Deploy Landing Page lên Firebase Hosting

1. Cài đặt Firebase CLI:

```bash
npm install -g firebase-tools
```

2. Login vào Firebase:

```bash
firebase login
```

3. Initialize project (nếu chưa):

```bash
firebase init hosting
```

4. Deploy:

```bash
firebase deploy --only hosting
```

Sau khi deploy, bạn sẽ có URL như: `https://your-project-id.web.app`

## Cấu trúc dữ liệu Firestore

### Collection: `schedules`

Document ID: `yyyy-MM-dd` (ví dụ: `2026-01-15`)

```json
{
  "date": "2026-01-15",
  "events": [
    {
      "id": "unique-id",
      "time": "08:00",
      "content": "Lịch Tiếp công dân định kỳ. Dự Đ/c Chủ tịch UBND phường./."
    },
    {
      "id": "unique-id-2",
      "time": "14:00",
      "content": "Lễ ra mắt Trung tâm thông tin chỉ huy..."
    }
  ],
  "updatedAt": "2026-01-15T10:00:00Z"
}
```

## Cách thêm dữ liệu vào Firestore

### Option 1: Sử dụng Firebase Console

1. Vào Firebase Console > Firestore Database
2. Tạo collection `schedules`
3. Tạo document với ID là ngày (ví dụ: `2026-01-15`)
4. Thêm field `events` là array với các event objects

### Option 2: Sử dụng script (tạo file `scripts/addSchedule.js`)

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

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
      content: 'Lễ ra mắt Trung tâm thông tin chỉ huy...'
    }
  ],
  updatedAt: new Date()
};

db.collection('schedules').doc('2026-01-15').set(scheduleData)
  .then(() => console.log('Success!'))
  .catch(error => console.error('Error:', error));
```

## Permissions

### iOS
- Notification permissions (tự động request khi app chạy)

### Android
- Notification permissions
- RECEIVE_BOOT_COMPLETED (để notifications hoạt động sau khi restart)

## Troubleshooting

### Notifications không hoạt động
- Kiểm tra permissions đã được grant chưa
- Với Android, đảm bảo notification channel đã được tạo
- Kiểm tra timezone của device

### Data không sync
- Kiểm tra Firebase config
- Kiểm tra internet connection
- Xem logs trong console

### Deep linking không hoạt động
- Đảm bảo URL scheme đã được config trong `app.json`
- Test với Universal Links (iOS) và App Links (Android)
- Kiểm tra `public/index.html` có đúng URL không

## License

MIT

## Hỗ trợ

Nếu có vấn đề, vui lòng tạo issue trên GitHub repository.
