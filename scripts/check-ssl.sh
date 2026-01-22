#!/bin/bash

# Script kiểm tra SSL certificate của Firebase Hosting

echo "🔍 Kiểm tra SSL certificate cho applichcongtac.web.app..."
echo ""

# Kiểm tra SSL certificate
echo "📋 Thông tin SSL certificate:"
openssl s_client -connect applichcongtac.web.app:443 -servername applichcongtac.web.app </dev/null 2>/dev/null | \
  grep -A 2 "Certificate chain" || echo "⚠️  Không thể kiểm tra SSL certificate"

echo ""
echo "🌐 Kiểm tra kết nối HTTPS:"
curl -I https://applichcongtac.web.app 2>&1 | head -5

echo ""
echo "✅ Nếu thấy HTTP/2 200, website đang hoạt động bình thường"
echo "⚠️  Nếu thấy lỗi SSL, đợi thêm 5-10 phút rồi thử lại"
