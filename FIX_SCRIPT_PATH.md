# 🔧 Sửa Script Path trong Web App

## ❌ Vấn đề

Khi vào `https://applichcongtac.web.app/app`, web app không load vì:

**Script path sai:**
- HTML có: `/_expo/static/js/web/AppEntry-xxx.js`
- File thực tế ở: `/app/_expo/static/js/web/AppEntry-xxx.js`

Khi load từ `/app/index.html`, path `/_expo/...` sẽ tìm ở root (`/`), không tìm thấy file.

## ✅ Giải pháp

Sửa script path trong `public/app/index.html`:

**Từ:**
```html
<script src="/_expo/static/js/web/AppEntry-xxx.js" defer></script>
```

**Thành:**
```html
<script src="/app/_expo/static/js/web/AppEntry-xxx.js" defer></script>
```

## 🔄 Cách sửa tự động

Sau mỗi lần build, cần sửa script path:

```bash
# 1. Build
npx expo export -p web --output-dir web-build

# 2. Copy
rm -rf public/app
mkdir -p public/app
cp -r web-build/* public/app/

# 3. Sửa script path
sed -i '' 's|src="/_expo|src="/app/_expo|g' public/app/index.html

# 4. Deploy
firebase deploy --only hosting
```

## 🎯 Hoặc cập nhật script deploy

Cập nhật `deploy-web-app.sh` để tự động sửa path.
