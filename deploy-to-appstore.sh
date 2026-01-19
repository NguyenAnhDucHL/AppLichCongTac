#!/bin/bash

# Script để deploy app lên App Store
# Chạy: bash deploy-to-appstore.sh

echo "🚀 Bắt đầu quá trình deploy app lên App Store..."
echo ""

# Bước 1: Kiểm tra EAS CLI
echo "📦 Kiểm tra EAS CLI..."
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI chưa được cài. Chạy: npm install -g eas-cli"
    exit 1
fi
echo "✅ EAS CLI đã được cài"
echo ""

# Bước 2: Login vào Expo (nếu chưa login)
echo "🔐 Kiểm tra Expo login..."
if ! eas whoami &> /dev/null; then
    echo "⚠️  Chưa login vào Expo. Chạy: eas login"
    echo "   Hoặc: npx expo login"
    exit 1
fi
echo "✅ Đã login vào Expo"
echo ""

# Bước 3: Configure EAS Build (nếu chưa có eas.json)
if [ ! -f "eas.json" ]; then
    echo "⚙️  Chưa có eas.json. Chạy: eas build:configure"
    echo "   Lệnh này sẽ tạo file eas.json với cấu hình build"
    exit 1
fi
echo "✅ Đã có eas.json"
echo ""

# Bước 4: Build iOS Production
echo "📱 Bắt đầu build iOS production app..."
echo "   Lệnh: eas build --platform ios --profile production"
echo "   ⏳ Quá trình này mất khoảng 15-30 phút"
echo ""
read -p "Bạn có muốn tiếp tục build ngay bây giờ? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    eas build --platform ios --profile production
else
    echo "⏸️  Bạn có thể chạy lệnh sau khi sẵn sàng:"
    echo "   eas build --platform ios --profile production"
fi

echo ""
echo "📝 Sau khi build xong, tiếp tục với các bước sau:"
echo "   1. Submit app: eas submit --platform ios"
echo "   2. Hoặc submit thủ công qua App Store Connect"
echo "   3. Điền thông tin app trong App Store Connect"
echo "   4. Submit để review"
echo ""
echo "📖 Xem hướng dẫn chi tiết trong file: DEPLOY_TO_APPSTORE.md"
