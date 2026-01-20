# 📚 Hướng dẫn sử dụng - Ứng dụng Lịch Công Tác

## 📋 Mục lục

1. [Tổng quan](#tổng-quan)
2. [Cài đặt & Setup](#cài-đặt--setup)
3. [Cấu hình Firebase](#cấu-hình-firebase)
4. [Database Structure](#database-structure)
5. [Hệ thống Admin](#hệ-thống-admin)
6. [Deploy](#deploy)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Tổng quan

Ứng dụng quản lý lịch công tác cho UBND Phường Cẩm Phả với các tính năng:

- ✅ Hiển thị lịch công tác theo ngày
- ✅ Thông báo tự động khi đến giờ
- ✅ Tự động sync data từ Firebase
- ✅ Hệ thống admin với đăng nhập/đăng xuất
- ✅ Phân quyền theo vai trò (Admin, Editor, Viewer)
- ✅ Web app responsive
- ✅ Offline support với cache local

### Công nghệ sử dụng

- **React Native** với **Expo** - Cross-platform framework
- **Firebase Firestore** - Database và realtime sync
- **Firebase Hosting** - Web hosting
- **Expo Notifications** - Local notifications
- **React Native Paper** - UI components

---

## ⚙️ Cài đặt & Setup

### 1. Cài đặt Dependencies

```bash
npm install
```

### 2. Cấu hình Firebase

#### 2.1. Tạo Firebase Project

1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Nhập tên project: `applichcongtac`
4. Chọn location: `asia-southeast1` (Việt Nam)

#### 2.2. Thêm Web App

1. Click icon Web (`</>`)
2. Đăng ký app với nickname: "LichCongTac Web"
3. Copy config object
4. Mở `src/config/firebase.js` và paste config

#### 2.3. Setup Firestore Database

1. Vào Firebase Console > Firestore Database
2. Click "Create database"
3. Chọn "Start in production mode"
4. Chọn location: `asia-southeast1`
5. Click "Enable"

#### 2.4. Setup Database (Users, Roles, Sessions)

```bash
# Chạy script setup database
node scripts/setupDatabase.js
```

Script này sẽ tạo:
- 3 roles: admin, editor, viewer
- 2 users mặc định: admin, editor
- System settings

### 3. Cấu hình Expo

1. Đăng ký tại [expo.dev](https://expo.dev/)
2. Login: `npx expo login`
3. Cập nhật `app.json` với thông tin của bạn

---

## 🗄️ Database Structure

### Collections trong Firestore

#### 1. `schedules` - Lịch công tác

**Document ID**: `yyyy-MM-dd` (ví dụ: `2026-01-16`)

```json
{
  "date": "2026-01-16",
  "events": [
    {
      "id": "event-1",
      "time": "08:00",
      "content": "Nội dung sự kiện..."
    }
  ],
  "updatedAt": "timestamp"
}
```

#### 2. `users` - Người dùng

**Document ID**: Email (ví dụ: `admin@campha.gov.vn`)

```json
{
  "id": "admin@campha.gov.vn",
  "username": "admin",
  "email": "admin@campha.gov.vn",
  "password": "hashed_password",
  "fullName": "Quản trị viên",
  "role": "admin",
  "permissions": ["schedule:read", "schedule:write", ...],
  "isActive": true,
  "lastLogin": "timestamp"
}
```

#### 3. `roles` - Vai trò

**Document ID**: Role name (ví dụ: `admin`)

```json
{
  "id": "admin",
  "name": "Quản trị viên",
  "permissions": ["schedule:read", "schedule:write", ...]
}
```

#### 4. `sessions` - Phiên đăng nhập

**Document ID**: Session token

```json
{
  "id": "session_xxx",
  "userId": "admin@campha.gov.vn",
  "token": "session_token",
  "expiresAt": "timestamp",
  "isActive": true
}
```

#### 5. `system_settings` - Cài đặt hệ thống

**Document ID**: `app_config`

```json
{
  "id": "app_config",
  "siteName": "Lịch Công Tác UBND Phường Cẩm Phả",
  "allowPublicView": true,
  "maxEventsPerDay": 20
}
```

### Thêm dữ liệu lịch công tác

#### Cách 1: Sử dụng Script

```bash
node scripts/addScheduleData.js
```

#### Cách 2: Qua Firebase Console

1. Vào Firestore Database
2. Collection: `schedules`
3. Document ID: `2026-01-16` (format: yyyy-MM-dd)
4. Thêm field `events` (array) với các event objects

---

## 🔐 Hệ thống Admin

### Truy cập

**Web App**: https://applichcongtac.web.app/app

1. Click menu **"QUẢN TRỊ"** trên thanh navigation
2. Nhập thông tin đăng nhập
3. Sau khi đăng nhập thành công → Admin Dashboard

### Tài khoản mặc định

#### Admin (Toàn quyền)
- **Username**: `admin`
- **Password**: `CamPha@2026`
- **Email**: admin@campha.gov.vn
- **Quyền hạn**: Tất cả permissions (24 permissions)

#### Editor (Biên tập viên)
- **Username**: `editor`
- **Password**: `Editor@2026`
- **Email**: editor@campha.gov.vn
- **Quyền hạn**: Quản lý lịch công tác

### Phân quyền

#### Admin Permissions
- `schedule:*` - Tất cả quyền lịch công tác
- `user:*` - Quản lý người dùng
- `system:*` - Quản lý hệ thống
- `audit:*` - Xem nhật ký
- `role:*` - Quản lý vai trò
- `*:*` - Wildcard permissions (tất cả quyền)

#### Editor Permissions
- `schedule:read` - Xem lịch
- `schedule:write` - Tạo/sửa lịch
- `schedule:delete` - Xóa lịch
- `schedule:publish` - Xuất bản lịch

#### Viewer Permissions
- `schedule:read` - Chỉ xem lịch

### Admin Dashboard

**Tính năng hiện có:**
- ✅ Thống kê sự kiện (hôm nay, tuần này, tháng này)
- ✅ Thông tin người dùng
- ✅ Menu chức năng theo quyền hạn
- ✅ Logout

**Tính năng đang phát triển:**
- 🚧 Quản lý lịch công tác (CRUD)
- 🚧 Quản lý người dùng
- 🚧 Báo cáo & Thống kê
- 🚧 Cài đặt hệ thống

### Cập nhật Admin Permissions

```bash
node scripts/updateAdminPermissions.js
```

---

## 🚀 Deploy

### Deploy Web App lên Firebase Hosting

```bash
./deploy-web-app.sh
```

Script này sẽ:
1. Build web app với Expo
2. Copy vào `public/app/`
3. Fix script paths
4. Deploy lên Firebase Hosting

**URL sau khi deploy:**
- Landing page: https://applichcongtac.web.app/
- Web app: https://applichcongtac.web.app/app

### Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### Deploy Firestore Indexes

```bash
firebase deploy --only firestore:indexes
```

---

## 🔧 Scripts

### Setup Database

```bash
node scripts/setupDatabase.js
```

Tạo roles, users mặc định, system settings.

### Thêm lịch công tác

```bash
node scripts/addScheduleData.js
```

### Cập nhật Admin Permissions

```bash
node scripts/updateAdminPermissions.js
```

---

## 🐛 Troubleshooting

### Lỗi "Missing or insufficient permissions"

**Nguyên nhân**: Firestore rules chưa cho phép đọc collection

**Giải pháp**:
1. Kiểm tra `firestore.rules` đã có `allow read: if true`
2. Deploy lại rules: `firebase deploy --only firestore:rules`
3. Đợi 1-2 phút để rules propagate

### Lỗi "Buffer is not defined"

**Nguyên nhân**: Buffer không có sẵn trên web

**Giải pháp**: Đã fix trong `AuthService.js` - sử dụng `btoa()` cho web

### Không đăng nhập được

**Kiểm tra**:
1. Username/password đúng chưa
2. User có `isActive: true` không
3. Firestore rules đã cho phép read `users` collection
4. Xem console logs để debug

### Data không sync

**Kiểm tra**:
1. Firebase config đúng chưa
2. Internet connection
3. Firestore rules cho phép read
4. Console logs

### Notifications không hoạt động

**Kiểm tra**:
1. Permissions đã được grant
2. Test trên thiết bị thật (không phải simulator)
3. Timezone của device
4. Notification channel (Android)

---

## 📁 Cấu trúc Project

```
AppLichCongTac/
├── src/
│   ├── config/
│   │   └── firebase.js          # Firebase config
│   ├── screens/
│   │   ├── ScheduleScreen.js    # Mobile screen
│   │   ├── ScheduleScreenWeb.js # Web screen
│   │   ├── LoginScreen.js       # Login screen
│   │   └── AdminDashboard.js    # Admin dashboard
│   ├── services/
│   │   ├── FirebaseService.js   # Firestore operations
│   │   ├── AuthService.js       # Authentication
│   │   └── NotificationService.js # Notifications
│   ├── hooks/
│   │   ├── useScheduleSync.js
│   │   └── useScheduleMultiDays.js
│   └── utils/
│       └── dateUtils.js
├── scripts/
│   ├── setupDatabase.js         # Setup database
│   ├── addScheduleData.js        # Add schedule data
│   └── updateAdminPermissions.js # Update admin perms
├── public/
│   ├── index.html               # Landing page
│   └── app/                     # Web app (deployed)
├── firestore.rules              # Firestore security rules
├── firestore.indexes.json       # Firestore indexes
├── firebase.json                # Firebase config
├── deploy-web-app.sh            # Deploy script
└── GUIDE.md                     # File này
```

---

## 🔗 Links quan trọng

- **Web App**: https://applichcongtac.web.app/app
- **Firebase Console**: https://console.firebase.google.com/project/applichcongtac
- **Firestore Database**: https://console.firebase.google.com/project/applichcongtac/firestore

---

## 📝 Notes

- **Firestore Rules**: Hiện tại cho phép public read/write (tạm thời). Nên implement Firebase Authentication để có security tốt hơn.
- **Password Hashing**: Hiện tại dùng simple base64. Nên upgrade sang bcrypt cho production.
- **Session Management**: Token expires sau 24 giờ, tự động refresh.

---

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra console logs (F12)
2. Kiểm tra Firebase Console
3. Xem section Troubleshooting ở trên

---

**Last Updated**: 2026-01-16