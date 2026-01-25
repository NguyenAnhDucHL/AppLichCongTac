# 🔧 Hướng dẫn Enable Firebase Storage

## ⚠️ Vấn đề
Firebase Storage yêu cầu upgrade billing plan từ **Spark** (free) lên **Blaze** (pay-as-you-go) để sử dụng.

## ✅ Giải pháp

### Bước 1: Upgrade Billing Plan

1. **Click vào nút "Upgrade project"** (màu cam) trên trang Storage
   - Hoặc vào: https://console.firebase.google.com/project/applichcongtac/usage/details

2. **Chọn Blaze Plan:**
   - Blaze plan là **pay-as-you-go** (trả tiền khi sử dụng)
   - Firebase có **free tier** rất rộng rãi:
     - **Storage:** 5GB free, 1GB/day downloads free
     - **Firestore:** 1GB storage, 50K reads/day, 20K writes/day free
     - **Hosting:** 10GB storage, 360MB/day transfer free
   
3. **Thiết lập billing:**
   - Nhập thông tin thẻ tín dụng (bắt buộc)
   - **Lưu ý:** Bạn chỉ bị tính phí khi vượt quá free tier
   - Với project nhỏ như này, hầu như sẽ không tốn phí

4. **Sau khi upgrade xong:**
   - Quay lại trang Storage: https://console.firebase.google.com/project/applichcongtac/storage
   - Click **"Get Started"**
   - Chọn location: `asia-southeast1` (Singapore) - gần Việt Nam nhất
   - Chọn **"Start in production mode"** hoặc **"Start in test mode"**

### Bước 2: Deploy Storage Rules

Sau khi enable Storage, chạy lệnh:

```bash
firebase deploy --only storage
```

### Bước 3: Cấu hình CORS

**Cách đơn giản nhất - Qua Google Cloud Console:**

1. Vào: https://console.cloud.google.com/storage/browser?project=applichcongtac
2. Tìm và click vào bucket: `applichcongtac.firebasestorage.app`
3. Click tab **"Configuration"** ở trên cùng
4. Scroll xuống phần **"CORS"**
5. Click **"Edit CORS configuration"**
6. Paste nội dung sau:

```json
[
  {
    "origin": [
      "https://applichcongtac.web.app",
      "https://applichcongtac.firebaseapp.com",
      "http://localhost:19006",
      "http://localhost:8081"
    ],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization", "x-goog-resumable"]
  }
]
```

7. Click **"Save"**

### Bước 4: Kiểm tra

1. Clear browser cache
2. Hard refresh (Cmd+Shift+R hoặc Ctrl+Shift+R)
3. Thử upload ảnh lại

## 💰 Chi phí

Với project này, bạn sẽ sử dụng trong **free tier** và **không tốn phí**:
- Storage: 5GB free (đủ cho hàng nghìn ảnh)
- Bandwidth: 1GB/day free (đủ cho hàng trăm lượt xem/ngày)

Chỉ khi nào project lớn và vượt quá free tier thì mới bị tính phí.

## 📝 Lưu ý

- Sau khi upgrade, có thể mất vài phút để Storage được enable
- CORS configuration có thể mất vài phút để có hiệu lực
- Nếu vẫn lỗi, đợi 5-10 phút rồi thử lại
