# 🔨 Quá trình Build Web App

## 📋 Tổng quan

**Source Code (React Native/Expo)** → **Build** → **web-build/** (Static Files)

## 🔄 Quá trình Build

### 1. Source Code (Trước khi build)

```
AppLichCongTac/
├── App.js                    ← React Native code
├── src/
│   ├── screens/
│   │   ├── ScheduleScreen.js
│   │   └── ScheduleScreenWeb.js  ← Component cho web
│   ├── services/
│   │   └── FirebaseService.js
│   └── ...
└── package.json
```

### 2. Lệnh Build

```bash
npx expo export -p web --output-dir web-build
```

### 3. Kết quả: Folder `web-build/`

```
web-build/
├── index.html              ← HTML file chính (React app entry point)
├── _expo/
│   └── static/
│       └── js/
│           └── web/
│               └── AppEntry-xxx.js  ← JavaScript bundle (2.78 MB)
├── assets/
│   └── node_modules/
│       └── @expo/vector-icons/
│           └── Fonts/
│               └── MaterialCommunityIcons.ttf  ← Font files
└── metadata.json           ← Metadata về build
```

## 📦 Các file trong web-build

### 1. `index.html`
- **Mục đích**: Entry point của web app
- **Nội dung**: 
  - HTML structure
  - Link đến JavaScript bundle
  - Root element `<div id="root"></div>` để React render vào

### 2. `_expo/static/js/web/AppEntry-xxx.js`
- **Mục đích**: JavaScript bundle chứa toàn bộ React app
- **Kích thước**: ~2.78 MB
- **Nội dung**: 
  - Tất cả React components (App.js, ScheduleScreenWeb, etc.)
  - Tất cả dependencies (Firebase, React Native Paper, etc.)
  - Đã được minified và optimized

### 3. `assets/`
- **Mục đích**: Static assets (fonts, images, etc.)
- **Ví dụ**: Font files cho icons

### 4. `metadata.json`
- **Mục đích**: Metadata về build (version, timestamp, etc.)

## 🔍 Chi tiết quá trình

### Bước 1: Bundle JavaScript
- Expo/Metro bundler đọc tất cả source code
- Tìm tất cả imports và dependencies
- Bundle thành 1 file JavaScript lớn
- Minify và optimize code

### Bước 2: Tạo HTML
- Tạo `index.html` với:
  - Link đến JavaScript bundle
  - Root element cho React
  - Meta tags

### Bước 3: Copy Assets
- Copy fonts, images, và các static files
- Giữ nguyên cấu trúc thư mục

### Bước 4: Output
- Tất cả file được đặt vào `web-build/`
- Sẵn sàng để deploy lên web server

## 🚀 Sau khi Build

### Deploy lên Firebase Hosting:

```bash
# Copy vào public/app
cp -r web-build/* public/app/

# Deploy
firebase deploy --only hosting
```

### Kết quả:
- `https://applichcongtac.web.app/app/index.html` → Load React app
- Browser load JavaScript bundle
- React app render vào `<div id="root"></div>`
- `App.js` detect `Platform.OS === 'web'`
- Render `ScheduleScreenWeb` component ✅

## 📊 So sánh

| Trước Build | Sau Build |
|-------------|-----------|
| Nhiều file `.js` riêng lẻ | 1 file bundle lớn |
| Source code dễ đọc | Minified code |
| Cần build tools | Static files sẵn sàng |
| Không chạy trực tiếp trên web | Chạy được trên browser |

## ⚠️ Lưu ý

- **web-build/** là output folder, không nên commit vào git
- Mỗi lần build sẽ tạo file mới (hash trong tên file)
- Cần rebuild khi có thay đổi source code
- File trong web-build là production-ready (minified, optimized)
