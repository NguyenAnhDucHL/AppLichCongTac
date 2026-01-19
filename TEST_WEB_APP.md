# 🧪 Test Web App

## ✅ Đã sửa

1. ✅ Script path: Đã sửa từ `/_expo/...` thành `/app/_expo/...`
2. ✅ File JS: Đã có trong `public/app/_expo/static/js/web/`
3. ✅ Deploy: Đã deploy lại

## 🧪 Cách test

### 1. Clear browser cache

**Chrome/Edge:**
- Nhấn `Cmd + Shift + Delete` (Mac) hoặc `Ctrl + Shift + Delete` (Windows)
- Chọn "Cached images and files"
- Clear data

**Hoặc Hard Refresh:**
- `Cmd + Shift + R` (Mac) hoặc `Ctrl + Shift + R` (Windows)

### 2. Truy cập web app

```
https://applichcongtac.web.app/app
```

### 3. Kiểm tra Console (F12)

Mở Developer Tools (F12) và kiểm tra:
- **Console tab**: Xem có lỗi JavaScript không
- **Network tab**: Xem file `AppEntry-xxx.js` có load được không

### 4. Kết quả mong đợi

Nếu thành công, bạn sẽ thấy:
- ✅ Giao diện `ScheduleScreenWeb` (giống website mẫu)
- ✅ Header màu xanh "LỊCH CÔNG TÁC"
- ✅ Navigation bar
- ✅ Hiển thị lịch công tác

Nếu vẫn thấy landing page:
- ❌ Browser cache chưa clear
- ❌ Script không load được (kiểm tra Network tab)
- ❌ Có lỗi JavaScript (kiểm tra Console tab)

## 🔍 Debug

### Kiểm tra file có tồn tại không:

```bash
# Trong browser, mở:
https://applichcongtac.web.app/app/_expo/static/js/web/AppEntry-1e791b283c853ef638b2a875cfea206f.js
```

Nếu thấy code JavaScript → ✅ File tồn tại
Nếu thấy 404 → ❌ File không tồn tại, cần kiểm tra lại

### Kiểm tra HTML:

```bash
# Trong browser, mở:
https://applichcongtac.web.app/app/index.html
```

View source và kiểm tra:
- Có `<div id="root"></div>` không?
- Script path có đúng `/app/_expo/...` không?

## 🚀 Nếu vẫn không hoạt động

1. **Kiểm tra browser console** (F12) xem có lỗi gì
2. **Kiểm tra Network tab** xem file JS có load được không
3. **Thử browser khác** (Chrome, Firefox, Safari)
4. **Thử incognito mode** để tránh cache
