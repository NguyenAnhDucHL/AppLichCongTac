# 🚀 Hướng dẫn Deploy App lên App Store

## 📋 Yêu cầu

- ✅ Tài khoản Apple Developer ($99/năm)
- ✅ Tài khoản Expo (miễn phí)
- ✅ App đã được config trong `app.json`

## 🔧 Bước 1: Cài EAS CLI

```bash
npm install -g eas-cli
```

## 🔐 Bước 2: Login vào Expo

```bash
npx expo login
```

Nhập email và password của Expo account (nếu chưa có, đăng ký tại [expo.dev](https://expo.dev/))

## ⚙️ Bước 3: Configure EAS Build

```bash
eas build:configure
```

Lệnh này sẽ:
- Tạo file `eas.json`
- Hỏi bạn về build profiles (development, preview, production)

## 📱 Bước 4: Build iOS Production App

```bash
eas build --platform ios --profile production
```

Lệnh này sẽ:
- Build app trên cloud (Expo servers)
- Tạo file `.ipa` (iOS app package)
- Mất khoảng 15-30 phút

**Lưu ý:** Lần đầu build sẽ hỏi:
- Apple Developer Account credentials
- Distribution certificate
- Provisioning profile

## 📤 Bước 5: Submit lên App Store

Sau khi build xong, submit app:

```bash
eas submit --platform ios
```

Hoặc submit thủ công qua App Store Connect.

## 📝 Bước 6: Điền thông tin App trong App Store Connect

1. Vào [App Store Connect](https://appstoreconnect.apple.com/)
2. Click **My Apps** > **+** (Tạo app mới)
3. Điền thông tin:
   - **Name**: Lịch Công Tác
   - **Primary Language**: Vietnamese
   - **Bundle ID**: `com.lichcongtac.app` (phải match với app.json)
   - **SKU**: Unique identifier (ví dụ: `lich-cong-tac-001`)
4. Click **Create**

## 🖼️ Bước 7: Upload Screenshots và Metadata

1. **App Information**:
   - Name: Lịch Công Tác
   - Subtitle: (tùy chọn)
   - Category: Productivity hoặc Utilities
   - Privacy Policy URL: (nếu có)

2. **Pricing and Availability**:
   - Price: Free
   - Availability: All countries

3. **App Store Listing**:
   - Description: Mô tả app
   - Keywords: lịch công tác, schedule, calendar
   - Screenshots: Cần screenshots cho iPhone (nhiều kích thước)
   - App Icon: 1024x1024px

4. **Version Information**:
   - Version: 1.0.0
   - Copyright: (tên bạn hoặc công ty)
   - What's New: Mô tả tính năng mới

## ✅ Bước 8: Submit để Review

1. Click **Submit for Review**
2. Điền thông tin:
   - Export Compliance: Chọn "No" (nếu không dùng encryption)
   - Advertising Identifier: Chọn "No" (nếu không dùng ads)
   - Content Rights: Xác nhận bạn có quyền sử dụng content
3. Click **Submit**

## ⏳ Bước 9: Chờ Apple Review

- Thời gian: 1-7 ngày
- Apple sẽ kiểm tra app theo guidelines
- Nếu có vấn đề, Apple sẽ gửi email

## 🎉 Bước 10: App được phê duyệt

- App sẽ xuất hiện trên App Store
- Người dùng có thể tải về
- Cập nhật link trong `public/index.html`:
  ```javascript
  const IOS_APP_URL = 'https://apps.apple.com/app/id/YOUR_APP_ID';
  ```

---

## 📌 Lưu ý quan trọng

1. **Bundle ID** phải unique và match với `app.json`
2. **App Icon** phải là 1024x1024px, không có alpha channel
3. **Screenshots** cần cho nhiều kích thước iPhone
4. **Privacy Policy** có thể cần nếu app thu thập data
5. **TestFlight** có thể dùng để test trước khi publish

---

## 🔗 Links hữu ích

- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [Apple Developer](https://developer.apple.com/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
