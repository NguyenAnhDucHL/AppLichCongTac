# Hướng dẫn Setup chi tiết

## Bước 1: Cài đặt dependencies

```bash
npm install
```

## Bước 2: Cấu hình Firebase

### 2.1. Tạo Firebase Project

1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Nhập tên project (ví dụ: "lich-cong-tac")
4. Chọn hoặc tắt Google Analytics (tùy chọn)
5. Click "Create project"

### 2.2. Thêm Web App vào Firebase

1. Trong Firebase Console, click icon Web (`</>`)
2. Đăng ký app với nickname (ví dụ: "LichCongTac Web")
3. Copy config object
4. Mở file `src/config/firebase.js`
5. Paste config vào `firebaseConfig`

### 2.3. Setup Firestore Database

1. Vào Firebase Console > Firestore Database
2. Click "Create database"
3. Chọn "Start in test mode" (hoặc production mode với rules)
4. Chọn location (ví dụ: asia-southeast1 cho Việt Nam)
5. Click "Enable"

### 2.4. Tạo dữ liệu mẫu

1. Vào Firestore Database
2. Click "Start collection"
3. Collection ID: `schedules`
4. Document ID: `2026-01-15` (hoặc ngày hiện tại)
5. Thêm field:
   - Field name: `events`, Type: `array`
   - Click "Add item" để thêm các event:

```json
[
  {
    "id": "event-1",
    "time": "08:00",
    "content": "Lịch Tiếp công dân định kỳ. Dự Đ/c Chủ tịch UBND phường./."
  },
  {
    "id": "event-2",
    "time": "14:00",
    "content": "Lễ ra mắt Trung tâm thông tin chỉ huy kết nối hệ thống truyền tin, báo sự cố PCCC, ứng dụng \"Báo cháy 114\" và triển khai Kế hoạch quản lý, vận hành, cập nhật cơ sở dữ liệu về PCCC, CNCH. Dự Đ/c Nguyễn Công Bằng - PCT UBND phường./."
  },
  {
    "id": "event-3",
    "time": "15:00",
    "content": "Hội nghị triển khai nhiệm vụ công tác năm 2026 của Liên minh hợp tác xã tỉnh. Dự Đ/c Nguyễn Thạch Long - PCT UBND phường./."
  }
]
```

6. Click "Save"

## Bước 3: Cấu hình Expo

### 3.1. Tạo Expo account (nếu chưa có)

1. Vào [expo.dev](https://expo.dev/)
2. Đăng ký tài khoản miễn phí

### 3.2. Login vào Expo

```bash
npx expo login
```

### 3.3. Cập nhật app.json

Mở `app.json` và cập nhật:
- `slug`: tên unique cho app của bạn
- `name`: tên hiển thị
- `bundleIdentifier` (iOS): phải unique
- `package` (Android): phải unique

### 3.4. Cập nhật NotificationService

Mở `src/services/NotificationService.js` và tìm dòng:
```javascript
projectId: 'YOUR_EXPO_PROJECT_ID',
```

Lấy Project ID từ [expo.dev](https://expo.dev/) > Settings > Project ID

## Bước 4: Test trên thiết bị

### 4.1. Chạy development server

```bash
npm start
```

### 4.2. Chạy trên thiết bị

- **iOS**: Cài Expo Go app từ App Store, scan QR code
- **Android**: Cài Expo Go app từ Play Store, scan QR code

## Bước 5: Build production app

### 5.1. Cài EAS CLI

```bash
npm install -g eas-cli
```

### 5.2. Login

```bash
eas login
```

### 5.3. Configure project

```bash
eas build:configure
```

### 5.4. Build iOS

```bash
eas build --platform ios
```

### 5.5. Build Android

```bash
eas build --platform android
```

Sau khi build xong, bạn sẽ có file `.ipa` (iOS) và `.apk` (Android) để upload lên App Store/Play Store.

## Bước 6: Deploy Landing Page

### 6.1. Cài Firebase CLI

```bash
npm install -g firebase-tools
```

### 6.2. Login

```bash
firebase login
```

### 6.3. Initialize hosting

```bash
firebase init hosting
```

Chọn:
- Use an existing project: chọn project của bạn
- Public directory: `public`
- Single-page app: Yes
- Set up automatic builds: No

### 6.4. Cập nhật links trong public/index.html

Mở `public/index.html` và cập nhật:
- `IOS_APP_URL`: Link App Store của bạn
- `ANDROID_APP_URL`: Link Play Store của bạn
- `WEB_APP_URL`: Link web app (nếu có)

### 6.5. Deploy

```bash
firebase deploy --only hosting
```

Sau khi deploy, bạn sẽ có URL như: `https://your-project-id.web.app`

## Bước 7: Cấu hình Deep Linking

### 7.1. iOS - Universal Links

1. Tạo file `apple-app-site-association` (không có extension)
2. Upload lên root domain của bạn
3. Cấu hình trong `app.json`:

```json
"ios": {
  "associatedDomains": ["applinks:your-domain.com"]
}
```

### 7.2. Android - App Links

1. Tạo file `.well-known/assetlinks.json`
2. Upload lên `https://your-domain.com/.well-known/assetlinks.json`
3. Cấu hình trong `app.json`:

```json
"android": {
  "intentFilters": [
    {
      "action": "VIEW",
      "data": [
        {
          "scheme": "https",
          "host": "your-domain.com"
        }
      ],
      "category": ["BROWSABLE", "DEFAULT"]
    }
  ]
}
```

## Troubleshooting

### Lỗi Firebase connection
- Kiểm tra config trong `src/config/firebase.js`
- Đảm bảo Firestore đã được enable
- Kiểm tra Firestore rules cho phép read

### Notifications không hoạt động
- Kiểm tra permissions đã được grant
- Với iOS, test trên thiết bị thật (không phải simulator)
- Kiểm tra timezone của device

### Build errors
- Đảm bảo đã login vào Expo
- Kiểm tra `app.json` có đúng format
- Xem logs chi tiết trong terminal

## Next Steps

1. Customize UI theo ý bạn
2. Thêm tính năng filter/search
3. Thêm dark mode
4. Thêm tính năng sync nhiều ngày
5. Thêm push notifications từ server
