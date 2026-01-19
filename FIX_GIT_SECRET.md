# 🔒 Sửa lỗi GitHub Push Protection - Secret trong Git History

## ❌ Vấn đề:

GitHub đã phát hiện **Google Cloud Service Account Credentials** trong file `scripts/serviceAccountKey.json` và chặn push để bảo vệ bảo mật.

## ⚠️ QUAN TRỌNG:

**KHÔNG BAO GIỜ commit file chứa credentials lên GitHub!**

## ✅ Giải pháp:

### Bước 1: Xóa file khỏi Git History

File đã được commit vào history, cần xóa hoàn toàn:

```bash
# Cách 1: Dùng git filter-branch (khuyến nghị)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch scripts/serviceAccountKey.json" \
  --prune-empty --tag-name-filter cat -- --all

# Cách 2: Dùng git-filter-repo (nhanh hơn, cần cài)
# git filter-repo --path scripts/serviceAccountKey.json --invert-paths
```

### Bước 2: Force push (CẨN THẬN!)

```bash
# ⚠️ CẢNH BÁO: Force push sẽ ghi đè history trên remote
git push origin --force --all
```

### Bước 3: Đảm bảo file đã được ignore

File `.gitignore` đã được cập nhật để ignore `serviceAccountKey.json`.

### Bước 4: Xóa file khỏi working directory (nếu cần)

```bash
# File vẫn có thể ở local, nhưng không được commit
# Nếu muốn xóa hoàn toàn:
# rm scripts/serviceAccountKey.json
```

## 🔐 Bảo mật:

### Sau khi xóa khỏi Git:

1. **Tạo Service Account mới** trong Firebase Console (khuyến nghị)
   - Vào Firebase Console > Project Settings > Service Accounts
   - Tạo service account mới
   - Download key mới
   - Xóa service account cũ (key đã bị lộ)

2. **Hoặc rotate key** (nếu muốn giữ service account cũ)
   - Vào Google Cloud Console
   - Tạo key mới
   - Xóa key cũ

### Best Practices:

1. ✅ **Luôn** thêm `serviceAccountKey.json` vào `.gitignore`
2. ✅ **Không** commit file chứa credentials
3. ✅ Dùng environment variables cho production
4. ✅ Rotate keys thường xuyên

## 📝 Lưu ý:

- File `serviceAccountKey.json` vẫn cần thiết để chạy script local
- Chỉ giữ file ở local, không commit lên Git
- Team members cần tự download key từ Firebase Console

## 🔗 Tham khảo:

- [GitHub Secret Scanning](https://docs.github.com/code-security/secret-scanning)
- [Firebase Service Accounts](https://firebase.google.com/docs/admin/setup)
