#!/bin/bash

# Script để xóa serviceAccountKey.json khỏi Git History
# ⚠️ CẢNH BÁO: Script này sẽ rewrite Git history

echo "⚠️  CẢNH BÁO: Script này sẽ xóa file serviceAccountKey.json khỏi toàn bộ Git history"
echo "   Điều này sẽ thay đổi commit history và cần force push"
echo ""
read -p "Bạn có chắc chắn muốn tiếp tục? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Đã hủy"
    exit 1
fi

echo "🔍 Đang xóa file khỏi Git history..."

# Xóa file khỏi Git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch scripts/serviceAccountKey.json" \
  --prune-empty --tag-name-filter cat -- --all

echo ""
echo "✅ Đã xóa file khỏi Git history"
echo ""
echo "📝 Bước tiếp theo:"
echo "   1. Kiểm tra: git log --all --full-history -- scripts/serviceAccountKey.json"
echo "   2. Nếu không còn thấy file, force push:"
echo "      git push origin --force --all"
echo ""
echo "⚠️  LƯU Ý: Force push sẽ ghi đè history trên remote!"
echo "   Chỉ làm nếu bạn chắc chắn và đã backup!"
