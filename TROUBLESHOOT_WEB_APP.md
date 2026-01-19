# 🔧 Troubleshoot: Web App không load

## ❌ Vấn đề: Click "Mở trên Web" vẫn quay lại landing page

## ✅ Các bước kiểm tra và sửa:

### 1. Clear Browser Cache

**Chrome/Edge:**
- Nhấn `Ctrl+Shift+Delete` (Windows) hoặc `Cmd+Shift+Delete` (Mac)
- Chọn "Cached images and files"
- Chọn "All time"
- Click "Clear data"

**Hoặc Hard Refresh:**
- `Ctrl+Shift+R` (Windows) hoặc `Cmd+Shift+R` (Mac)

### 2. Kiểm tra URL

URL phải là: `https://applichcongtac.web.app/app`

**Không phải:**
- ❌ `https://applichcongtac.web.app/` (landing page)
- ❌ `https://applichcongtac.web.app/app/` (có thể redirect)

### 3. Kiểm tra Console (F12)

Mở Developer Tools (F12) và kiểm tra:
- **Console tab**: Có lỗi JavaScript không?
- **Network tab**: File JS có load được không?

**Lỗi thường gặp:**
- `404 Not Found` → File JS không tìm thấy
- `Unexpected token '<'` → File JS bị redirect về HTML

### 4. Kiểm tra file đã deploy

```bash
# Kiểm tra file index.html
curl https://applichcongtac.web.app/app | grep "root"

# Phải thấy: <div id="root"></div>
```

### 5. Deploy lại nếu cần

```bash
bash deploy-web-app.sh
```

### 6. Kiểm tra Firebase Console

1. Vào [Firebase Console](https://console.firebase.google.com/project/applichcongtac/hosting)
2. Kiểm tra xem file `public/app/index.html` có trong hosting không
3. Kiểm tra version mới nhất đã được deploy chưa

## 🔍 Debug Steps:

1. **Mở URL trực tiếp:**
   ```
   https://applichcongtac.web.app/app
   ```

2. **Kiểm tra Network tab:**
   - File `AppEntry-xxx.js` có load được không?
   - Status code là gì? (phải là 200)

3. **Kiểm tra Console:**
   - Có lỗi gì không?
   - React app có khởi động không?

## ✅ Nếu vẫn không được:

1. **Deploy lại:**
   ```bash
   bash deploy-web-app.sh
   ```

2. **Kiểm tra script path:**
   File `public/app/index.html` phải có:
   ```html
   <script src="/app/_expo/static/js/web/AppEntry-xxx.js" defer></script>
   ```
   (Không phải `/_expo/...`)

3. **Clear Firebase cache:**
   - Vào Firebase Console > Hosting
   - Click "..." > "Clear cache" (nếu có)
