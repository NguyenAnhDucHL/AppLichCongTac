#!/bin/bash

# Script để cấu hình CORS cho Firebase Storage
# Yêu cầu: Cài đặt gsutil (Google Cloud SDK)

echo "🔧 Cấu hình CORS cho Firebase Storage..."

# Tạo file CORS config
cat > cors.json << EOF
[
  {
    "origin": [
      "https://applichcongtac.web.app",
      "https://applichcongtac.firebaseapp.com",
      "http://localhost:19006",
      "http://localhost:8081",
      "http://localhost:3000"
    ],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["Content-Type", "Authorization", "x-goog-resumable"]
  }
]
EOF

echo "📝 File cors.json đã được tạo"

# Kiểm tra xem gsutil có sẵn không
if ! command -v gsutil &> /dev/null; then
    echo "❌ gsutil không được tìm thấy"
    echo ""
    echo "📋 Hướng dẫn cài đặt Google Cloud SDK:"
    echo "1. Tải Google Cloud SDK: https://cloud.google.com/sdk/docs/install"
    echo "2. Chạy: gcloud init"
    echo "3. Chạy lại script này"
    echo ""
    echo "📋 Hoặc cấu hình CORS qua Firebase Console:"
    echo "1. Vào Firebase Console > Storage"
    echo "2. Click vào tab 'Rules'"
    echo "3. Thêm CORS rules (xem file cors.json)"
    echo ""
    echo "📋 Hoặc chạy lệnh sau sau khi cài gsutil:"
    echo "gsutil cors set cors.json gs://applichcongtac.firebasestorage.app"
    exit 1
fi

# Cấu hình CORS
echo "🚀 Đang cấu hình CORS..."
gsutil cors set cors.json gs://applichcongtac.firebasestorage.app

if [ $? -eq 0 ]; then
    echo "✅ CORS đã được cấu hình thành công!"
else
    echo "❌ Lỗi khi cấu hình CORS"
    exit 1
fi
