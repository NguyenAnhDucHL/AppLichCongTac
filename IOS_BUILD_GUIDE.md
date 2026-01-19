# 📱 Hướng dẫn Build và Tải App iOS

## 🎯 3 Cách để có App iOS

### Cách 1: Dùng Expo Go (Đơn giản nhất - KHÔNG cần đăng App Store)

**Ưu điểm:**
- ✅ Miễn phí
- ✅ Không cần Apple Developer Account ($99/năm)
- ✅ Test nhanh, không cần build

**Nhược điểm:**
- ❌ Phải cài Expo Go app từ App Store
- ❌ Một số native modules có thể không hoạt động
- ❌ Không phải app độc lập

**Cách làm:**
1. Cài **Expo Go** từ App Store (miễn phí)
2. Chạy: `npm start`
3. Scan QR code bằng Expo Go app
4. App sẽ chạy trong Expo Go

---

### Cách 2: Build Development Build (Test trên thiết bị - KHÔNG cần đăng App Store)

**Ưu điểm:**
- ✅ App độc lập (không cần Expo Go)
- ✅ Test trên thiết bị thật
- ✅ Không cần submit lên App Store

**Nhược điểm:**
- ❌ Cần Apple Developer Account ($99/năm)
- ❌ Chỉ cài được trên thiết bị đã đăng ký
- ❌ Không phải app công khai

**Cách làm:**

#### Bước 1: Đăng ký Apple Developer Account
1. Vào [developer.apple.com](https://developer.apple.com/)
2. Đăng ký tài khoản ($99/năm)
3. Đăng nhập

#### Bước 2: Cài EAS CLI
```bash
npm install -g eas-cli
```

#### Bước 3: Login vào Expo
```bash
npx expo login
```

#### Bước 4: Configure EAS Build
```bash
eas build:configure
```

#### Bước 5: Build iOS Development Build
```bash
eas build --platform ios --profile development
```

#### Bước 6: Cài lên iPhone
- Download file `.ipa` từ Expo dashboard
- Cài qua Xcode hoặc TestFlight

---

### Cách 3: Publish lên App Store (Công khai - CẦN đăng App Store)

**Ưu điểm:**
- ✅ App công khai, ai cũng tải được
- ✅ Phân phối qua App Store
- ✅ App độc lập, chuyên nghiệp

**Nhược điểm:**
- ❌ Cần Apple Developer Account ($99/năm)
- ❌ Phải submit và chờ Apple review (1-7 ngày)
- ❌ Phải tuân thủ App Store guidelines

**Cách làm:**

#### Bước 1: Đăng ký Apple Developer Account
- Tương tự như Cách 2

#### Bước 2: Build Production
```bash
eas build --platform ios --profile production
```

#### Bước 3: Submit lên App Store
```bash
eas submit --platform ios
```

Hoặc submit thủ công:
1. Vào [App Store Connect](https://appstoreconnect.apple.com/)
2. Tạo app mới
3. Upload file `.ipa` từ Expo dashboard
4. Điền thông tin app (mô tả, screenshots, etc.)
5. Submit để review

#### Bước 4: Chờ Apple Review
- Thường mất 1-7 ngày
- Apple sẽ kiểm tra app theo guidelines

#### Bước 5: App được phê duyệt
- App sẽ xuất hiện trên App Store
- Người dùng có thể tải về

---

## 📋 So sánh 3 Cách

| Tiêu chí | Expo Go | Development Build | App Store |
|----------|---------|-------------------|-----------|
| **Chi phí** | Miễn phí | $99/năm | $99/năm |
| **Cần đăng App Store?** | ❌ Không | ❌ Không | ✅ Có |
| **Ai có thể tải?** | Ai cũng có thể (qua Expo Go) | Chỉ thiết bị đã đăng ký | Mọi người |
| **App độc lập?** | ❌ Không | ✅ Có | ✅ Có |
| **Thời gian** | Ngay lập tức | 15-30 phút build | 1-7 ngày review |

---

## 🎯 Khuyến nghị

### Nếu chỉ cần test nhanh:
→ Dùng **Expo Go** (Cách 1)

### Nếu muốn test app độc lập:
→ Build **Development Build** (Cách 2)

### Nếu muốn phát hành công khai:
→ Publish lên **App Store** (Cách 3)

---

## 📝 Lưu ý

1. **Apple Developer Account** ($99/năm) chỉ cần cho Cách 2 và 3
2. **App Store Review** chỉ cần cho Cách 3
3. **Expo Go** là cách nhanh nhất để test, nhưng không phải app độc lập
4. **Development Build** phù hợp để test trước khi publish
5. **App Store** là cách duy nhất để app công khai

---

## 🔗 Links hữu ích

- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Apple Developer](https://developer.apple.com/)
- [App Store Connect](https://appstoreconnect.apple.com/)
