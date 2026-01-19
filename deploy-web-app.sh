#!/bin/bash

# Script đơn giản để build và deploy web app vào subfolder /app

echo "🚀 Bắt đầu build và deploy web app..."

# Bước 0: Tạm thời di chuyển landing page để Expo không dùng nó làm template
if [ -f "public/index.html" ]; then
    echo "📦 Tạm thời di chuyển landing page..."
    mv public/index.html public/index.html.backup
fi

# Bước 1: Build web app
echo "🔨 Building web app..."
npx expo export -p web --output-dir web-build

# Khôi phục landing page
if [ -f "public/index.html.backup" ]; then
    echo "📦 Khôi phục landing page..."
    mv public/index.html.backup public/index.html
fi

if [ ! -d "web-build" ]; then
    echo "❌ Build thất bại! Kiểm tra lỗi npm permission."
    echo "   Chạy: sudo chown -R 501:20 /Users/macbookpro/.npm"
    exit 1
fi

# Bước 2: Copy web-build vào public/app
echo "📁 Copying web app vào public/app..."
rm -rf public/app
mkdir -p public/app
cp -r web-build/* public/app/

# Bước 2.5: Sửa script path (từ /_expo thành /app/_expo)
echo "🔧 Fixing script paths..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' 's|src="/_expo|src="/app/_expo|g' public/app/index.html
    sed -i '' 's|href="/_expo|href="/app/_expo|g' public/app/index.html
else
    # Linux
    sed -i 's|src="/_expo|src="/app/_expo|g' public/app/index.html
    sed -i 's|href="/_expo|href="/app/_expo|g' public/app/index.html
fi

# Bước 3: Deploy
echo "🚀 Deploying..."
firebase deploy --only hosting

echo "✅ Hoàn thành!"
echo "   Landing page: https://applichcongtac.web.app/"
echo "   Web app: https://applichcongtac.web.app/app"
