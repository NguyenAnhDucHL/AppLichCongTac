# 📦 So sánh Build Output: Web App vs .NET vs Java

## 🎯 Khái niệm chung

Tất cả đều có quá trình: **Source Code → Build → Output → Deploy**

## 📊 So sánh

### 1. .NET (C#)

```
Source Code (.cs files)
    ↓
Build (dotnet build)
    ↓
Output: .exe hoặc .dll
    ↓
Deploy: Copy .exe lên server → Chạy trực tiếp
```

**Đặc điểm:**
- Output: File `.exe` hoặc `.dll` (binary/executable)
- Chạy: Trực tiếp trên server (Windows)
- Runtime: .NET Runtime đã cài trên server

### 2. Java

```
Source Code (.java files)
    ↓
Build (javac, maven, gradle)
    ↓
Output: .jar hoặc .war
    ↓
Deploy: Copy .jar lên server → Chạy với JVM
```

**Đặc điểm:**
- Output: File `.jar` hoặc `.war` (compiled bytecode)
- Chạy: Với Java Virtual Machine (JVM)
- Runtime: JVM đã cài trên server

### 3. Web App (React Native/Expo)

```
Source Code (.js, .jsx files)
    ↓
Build (expo export -p web)
    ↓
Output: web-build/ folder (static files)
    ↓
Deploy: Copy web-build/* lên web server → Browser load
```

**Đặc điểm:**
- Output: Folder `web-build/` chứa static files (HTML, JS, CSS)
- Chạy: Trên browser (client-side)
- Runtime: Browser (không cần cài gì trên server)

## 🔍 Chi tiết Web App

### Output: `web-build/`

```
web-build/
├── index.html              ← Entry point (giống Main() trong .exe)
├── _expo/static/js/web/
│   └── AppEntry-xxx.js     ← JavaScript bundle (giống .exe/.jar)
└── assets/                 ← Static resources
```

### Quá trình Deploy

```bash
# 1. Build (giống compile trong .NET/Java)
npx expo export -p web --output-dir web-build

# 2. Copy lên server (giống copy .exe/.jar)
cp -r web-build/* public/app/

# 3. Deploy lên web server
firebase deploy --only hosting
```

### Chạy trên Browser

```
Browser truy cập: https://applichcongtac.web.app/app
    ↓
Load index.html
    ↓
Load AppEntry-xxx.js (JavaScript bundle)
    ↓
React app chạy trong browser
```

## 📋 Bảng so sánh

| Khía cạnh | .NET (.exe) | Java (.jar) | Web App (web-build/) |
|-----------|-------------|-------------|---------------------|
| **Output** | File .exe | File .jar | Folder với HTML/JS/CSS |
| **Build tool** | dotnet build | javac/maven | expo export |
| **Deploy** | Copy .exe lên server | Copy .jar lên server | Copy folder lên web server |
| **Chạy ở đâu** | Server (Windows) | Server (JVM) | Browser (client) |
| **Runtime** | .NET Runtime | JVM | Browser JavaScript engine |
| **Cần cài gì** | .NET Runtime | JVM | Không (chỉ cần browser) |
| **Access** | Chạy trực tiếp | java -jar app.jar | Truy cập qua URL |

## ✅ Kết luận

**Đúng rồi!** `web-build/` là output folder giống như:
- `.exe` trong .NET
- `.jar` trong Java
- `.apk` trong Android
- `.ipa` trong iOS

**Khác biệt chính:**
- `.exe/.jar`: Chạy trên server
- `web-build/`: Chạy trên browser (client-side)

## 🚀 Workflow Deploy

### Mỗi lần có thay đổi code:

```bash
# 1. Build (giống compile)
npx expo export -p web --output-dir web-build

# 2. Copy lên server (giống copy .exe/.jar)
cp -r web-build/* public/app/

# 3. Deploy
firebase deploy --only hosting
```

**Giống hệt như:**
- .NET: Build → Copy .exe → Deploy
- Java: Build → Copy .jar → Deploy

## 💡 Lưu ý

- `web-build/` không nên commit vào git (giống như .exe/.jar)
- Cần rebuild mỗi khi có thay đổi source code
- File trong `web-build/` là production-ready (minified, optimized)
