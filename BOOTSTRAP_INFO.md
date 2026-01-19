# 📦 Về Bootstrap và React Native Web

## ❌ Không thể dùng Bootstrap trực tiếp

**Lý do:**
- React Native dùng **StyleSheet API**, không phải CSS thông thường
- Bootstrap là CSS framework, không tương thích với React Native StyleSheet
- React Native Web convert StyleSheet thành CSS, nhưng không hỗ trợ Bootstrap classes

## ✅ Các giải pháp thay thế:

### 1. **React Native Paper** (Đang dùng) ⭐ Khuyến nghị
- UI component library cho React Native
- Đã có sẵn trong project
- Tương tự Bootstrap về mặt components
- Cross-platform (iOS, Android, Web)

**Ví dụ:**
```javascript
import { Card, Button, TextInput } from 'react-native-paper';
```

### 2. **Styled Components** (Cho Web)
- Cho phép viết CSS như thông thường
- Có thể dùng Bootstrap classes qua CSS-in-JS

**Cài đặt:**
```bash
npm install styled-components
```

**Ví dụ:**
```javascript
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  .col-8 { width: 66.67%; }
  .col-4 { width: 33.33%; }
`;
```

### 3. **NativeBase** (Alternative)
- UI component library tương tự Bootstrap
- Hỗ trợ grid system như Bootstrap

**Cài đặt:**
```bash
npm install native-base
```

### 4. **Tự viết styles** (Hiện tại) ✅
- Dùng React Native StyleSheet
- Hoàn toàn kiểm soát được
- Đã implement layout 8:4

## 🎯 Khuyến nghị:

**Giữ nguyên cách hiện tại** vì:
- ✅ Đã có layout 8:4 hoạt động tốt
- ✅ React Native Paper đã cung cấp components cần thiết
- ✅ Không cần thêm dependencies
- ✅ Cross-platform compatible

## 📝 Nếu muốn dùng Bootstrap-style grid:

Có thể tự tạo utility classes trong StyleSheet:

```javascript
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  col8: {
    flex: 8, // 66.67%
  },
  col4: {
    flex: 4, // 33.33%
  },
});
```

## 🔗 Tài liệu tham khảo:

- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [React Native Web](https://necolas.github.io/react-native-web/)
- [Styled Components](https://styled-components.com/)
