# 🔧 Hướng dẫn cấu hình CORS cho Firebase Storage

## Vấn đề
Khi upload ảnh lên Firebase Storage từ web app, bạn có thể gặp lỗi CORS:
```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...' from origin '...' has been blocked by CORS policy
```

## Giải pháp

### Cách 1: Sử dụng Google Cloud SDK (gsutil) - Khuyến nghị

1. **Cài đặt Google Cloud SDK:**
   ```bash
   # macOS
   brew install --cask google-cloud-sdk
   
   # Hoặc tải từ: https://cloud.google.com/sdk/docs/install
   ```

2. **Khởi tạo gcloud:**
   ```bash
   gcloud init
   ```

3. **Chạy script cấu hình CORS:**
   ```bash
   ./scripts/setup-storage-cors.sh
   ```

### Cách 2: Cấu hình qua Firebase Console

1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Chọn project: `applichcongtac`
3. Vào **Storage** > **Rules**
4. Đảm bảo Storage Rules cho phép upload:
   ```javascript
   rules_version = '2';
   service firebase.storage {
     match /b/{bucket}/o {
       match /avatars/{userId}/{fileName} {
         allow read: if true;
         allow write: if true;
       }
     }
   }
   ```

5. Vào **Storage** > **Files**
6. Click vào **Settings** (⚙️) > **CORS**
7. Thêm CORS configuration:
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

### Cách 3: Sử dụng Firebase CLI

```bash
# Cài đặt Firebase CLI (nếu chưa có)
npm install -g firebase-tools

# Login
firebase login

# Deploy Storage Rules
firebase deploy --only storage
```

## Kiểm tra

Sau khi cấu hình, thử upload ảnh lại. Nếu vẫn lỗi:

1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R hoặc Cmd+Shift+R)
3. Kiểm tra lại CORS rules trong Firebase Console

## Lưu ý

- CORS rules chỉ áp dụng cho web browser
- Mobile apps không bị ảnh hưởng bởi CORS
- Nếu vẫn lỗi, có thể cần đợi vài phút để CORS rules được áp dụng
