# 🔄 Luồng hoạt động: Landing Page → Web App

## 📋 Tổng quan luồng

```
User click "Mở trên Web"
    ↓
Redirect đến /app
    ↓
Load /app/index.html
    ↓
Load JavaScript bundle
    ↓
React app khởi động
    ↓
App.js detect Platform.OS === 'web'
    ↓
Render ScheduleScreenWeb component ✅
```

## 🔍 Chi tiết từng bước

### Bước 1: User click "Mở trên Web"

**File:** `public/index.html` (dòng 117-119)

```html
<a href="#" class="btn btn-web" id="webBtn" style="display: none;">
    🌐 Mở trên Web
</a>
```

**JavaScript:** (dòng 176)
```javascript
webBtn.href = WEB_APP_URL; // = 'https://applichcongtac.web.app/app'
webBtn.style.display = 'block';
```

**Khi click:** Browser redirect đến `https://applichcongtac.web.app/app`

---

### Bước 2: Browser load `/app/index.html`

**File:** `public/app/index.html`

Browser request: `GET https://applichcongtac.web.app/app/index.html`

**Firebase Hosting:**
- Rewrite rule: `/app/**` → `/app/index.html`
- Trả về file `public/app/index.html`

**Nội dung HTML:**
```html
<!DOCTYPE html>
<html>
  <head>
    <title>Lịch Công Tác</title>
  </head>
  <body>
    <div id="root"></div>  ← React sẽ render vào đây
    <script src="/app/_expo/static/js/web/AppEntry-xxx.js"></script>
  </body>
</html>
```

---

### Bước 3: Browser load JavaScript bundle

**Request:** `GET https://applichcongtac.web.app/app/_expo/static/js/web/AppEntry-xxx.js`

**Firebase Hosting:**
- Rewrite rule: `/app/_expo/**` → `/app/_expo/**` (giữ nguyên, không redirect)
- Trả về file JavaScript thực tế

**Nội dung:** JavaScript bundle (2.7 MB) chứa:
- React
- React Native Web
- App.js
- ScheduleScreenWeb.js
- Firebase
- Tất cả dependencies

---

### Bước 4: JavaScript chạy và khởi tạo React app

**File:** `App.js`

```javascript
import React from 'react';
import { Platform } from 'react-native';
import ScheduleScreenWeb from './src/screens/ScheduleScreenWeb';

export default function App() {
  const isWeb = Platform.OS === 'web';  // ← Detect platform
  
  return (
    {isWeb ? (
      <ScheduleScreenWeb />  // ← Render web component
    ) : (
      <ScheduleScreen />     // ← Render mobile component
    )}
  );
}
```

**Luồng:**
1. JavaScript bundle load xong
2. React khởi tạo
3. `App.js` được import và chạy
4. `Platform.OS === 'web'` → `true` (vì chạy trên browser)
5. Render `ScheduleScreenWeb` component
6. Component render vào `<div id="root"></div>`

---

### Bước 5: ScheduleScreenWeb render

**File:** `src/screens/ScheduleScreenWeb.js`

Component này:
- Hiển thị header màu xanh "LỊCH CÔNG TÁC"
- Hiển thị navigation bar
- Load data từ Firestore
- Hiển thị lịch công tác nhiều ngày

---

## ❌ Vấn đề hiện tại

### Lỗi: "Unexpected token '<'"

**Nguyên nhân:**
Firebase rewrite rules đang redirect TẤT CẢ `/app/**` về `/app/index.html`, kể cả file JS:

```
Request: /app/_expo/static/js/web/AppEntry-xxx.js
    ↓
Rewrite rule: /app/** → /app/index.html
    ↓
Trả về: HTML (index.html) thay vì JavaScript
    ↓
Browser cố parse HTML như JavaScript
    ↓
Lỗi: "Unexpected token '<'"
```

### ✅ Giải pháp

Sửa `firebase.json` để exclude file JS và assets khỏi rewrite:

```json
{
  "rewrites": [
    {
      "source": "/app/_expo/**",    // ← Giữ nguyên file JS
      "destination": "/app/_expo/**"
    },
    {
      "source": "/app/assets/**",    // ← Giữ nguyên assets
      "destination": "/app/assets/**"
    },
    {
      "source": "/app/**",           // ← Chỉ redirect HTML routes
      "destination": "/app/index.html"
    },
    {
      "source": "**",
      "destination": "/index.html"
    }
  ]
}
```

---

## 🔄 Luồng sau khi sửa

```
1. User click "Mở trên Web"
   ↓
2. Redirect: /app
   ↓
3. Load: /app/index.html
   ↓
4. HTML có: <script src="/app/_expo/...js">
   ↓
5. Load: /app/_expo/static/js/web/AppEntry-xxx.js
   ✅ Trả về JavaScript (không bị redirect)
   ↓
6. JavaScript chạy
   ↓
7. React khởi tạo
   ↓
8. App.js detect Platform.OS === 'web'
   ↓
9. Render ScheduleScreenWeb ✅
```

---

## 🧪 Test

Sau khi sửa và deploy:

1. Clear browser cache
2. Truy cập: `https://applichcongtac.web.app/app`
3. Mở Console (F12)
4. Kiểm tra:
   - ✅ Không có lỗi "Unexpected token"
   - ✅ File JS load thành công (Network tab)
   - ✅ Thấy giao diện ScheduleScreenWeb
