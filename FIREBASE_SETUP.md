# Hướng dẫn Setup Firebase cho Expo

## ⚠️ QUAN TRỌNG: Với Expo, bạn KHÔNG cần làm bước "Add Firebase SDK" trong Xcode!

Expo sử dụng **Firebase JS SDK** (web SDK), không phải native iOS SDK. Bạn chỉ cần:

## Bước 1: Lấy Firebase Config cho Web App

1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Chọn project của bạn (applichcongtac)
3. Click vào icon **Web** (`</>`) ở góc trên bên trái
4. Nếu chưa có Web App, click "Add app" > chọn Web
5. Đăng ký app với nickname (ví dụ: "LichCongTac Web")
6. **Copy config object** có dạng:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "applichcongtac.firebaseapp.com",
  projectId: "applichcongtac",
  storageBucket: "applichcongtac.firebasestorage.app",
  messagingSenderId: "994548367594",
  appId: "1:994548367594:web:xxxxx"
};
```

## Bước 2: Cập nhật file `src/config/firebase.js`

Paste config vừa copy vào file `src/config/firebase.js`, thay thế phần `YOUR_API_KEY`, etc.

## Bước 3: Kiểm tra Firestore đã được enable

1. Vào Firebase Console > Firestore Database
2. Nếu chưa có, click "Create database"
3. Chọn "Start in test mode" (hoặc production với rules)
4. Chọn location (ví dụ: asia-southeast1)

## Bước 4: Test kết nối

Chạy app và kiểm tra console xem có lỗi kết nối Firebase không:

```bash
npm start
```

## Tại sao không cần bước "Add Firebase SDK" trong Xcode?

- **Expo managed workflow** tự động handle native dependencies
- Chúng ta dùng **Firebase JS SDK** (npm package `firebase`), không phải native SDK
- Expo sẽ tự động bundle JS SDK vào app khi build
- File `GoogleService-Info.plist` chỉ cần khi build native iOS (bare workflow), không cần cho Expo managed

## Nếu bạn muốn dùng native Firebase SDK

Nếu bạn muốn dùng native Firebase SDK (không khuyến nghị với Expo), bạn cần:
1. Eject khỏi Expo (bare workflow)
2. Làm theo hướng dẫn trong hình ảnh bạn đang xem
3. Nhưng điều này sẽ phức tạp hơn và mất nhiều tính năng của Expo

**Khuyến nghị**: Tiếp tục dùng Firebase JS SDK với Expo như hiện tại.
