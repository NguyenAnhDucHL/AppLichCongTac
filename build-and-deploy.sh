#!/bin/bash

# Script để build và deploy web app
# Chạy: bash build-and-deploy.sh

echo "🚀 Bắt đầu build và deploy web app..."

# Bước 1: Sửa lỗi npm permission (nếu cần)
echo "📦 Kiểm tra npm permission..."
if [ ! -w "/Users/macbookpro/.npm" ]; then
    echo "⚠️  Cần sửa npm permission. Chạy lệnh này trước:"
    echo "   sudo chown -R 501:20 /Users/macbookpro/.npm"
    exit 1
fi

# Bước 2: Build web app
echo "🔨 Building web app..."
npx expo export:web --output-dir web-build

if [ ! -d "web-build" ]; then
    echo "❌ Build thất bại!"
    exit 1
fi

echo "✅ Build thành công!"

# Bước 3: Setup Firebase targets (nếu chưa có)
echo "⚙️  Setup Firebase targets..."
firebase target:apply hosting landing applichcongtac
firebase target:apply hosting webapp applichcongtac

# Bước 4: Deploy
echo "🚀 Deploying..."
firebase deploy --only hosting

echo "✅ Hoàn thành! Web app đã được deploy tại: https://applichcongtac.web.app/app"
