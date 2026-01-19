# 📸 Hướng dẫn sử dụng Images trong React Native/Expo

## 📁 Cấu trúc folder

```
AppLichCongTac/
├── assets/
│   ├── images/          ← Folder chứa ảnh (vừa tạo)
│   │   ├── logo.png
│   │   ├── banner.jpg
│   │   └── ...
│   ├── icon.png         ← App icon
│   ├── splash.png       ← Splash screen
│   └── favicon.png      ← Web favicon
```

## ✅ Cách sử dụng Images

### 1. Import và sử dụng trong Component

```javascript
import React from 'react';
import { Image, View } from 'react-native';

export default function MyComponent() {
  return (
    <View>
      {/* Cách 1: require (khuyến nghị) */}
      <Image 
        source={require('../assets/images/logo.png')} 
        style={{ width: 100, height: 100 }}
      />
      
      {/* Cách 2: import */}
      <Image 
        source={require('../assets/images/banner.jpg')} 
        style={{ width: '100%', height: 200 }}
        resizeMode="cover"
      />
    </View>
  );
}
```

### 2. Sử dụng trong StyleSheet

```javascript
import { StyleSheet, Image } from 'react-native';

const styles = StyleSheet.create({
  logo: {
    width: 100,
    height: 100,
  },
  banner: {
    width: '100%',
    height: 200,
  },
});

// Sử dụng
<Image 
  source={require('../assets/images/logo.png')} 
  style={styles.logo}
/>
```

### 3. Sử dụng với React Native Paper

```javascript
import { Avatar, Card } from 'react-native-paper';

// Avatar với image
<Avatar.Image 
  size={64} 
  source={require('../assets/images/profile.jpg')} 
/>

// Card với image
<Card>
  <Card.Cover source={require('../assets/images/banner.jpg')} />
  <Card.Content>
    <Text>Nội dung</Text>
  </Card.Content>
</Card>
```

### 4. Sử dụng Image từ URL (Remote)

```javascript
<Image 
  source={{ uri: 'https://example.com/image.jpg' }}
  style={{ width: 100, height: 100 }}
/>
```

## 📝 Lưu ý quan trọng

### ✅ Nên làm:
- Đặt ảnh trong folder `assets/images/`
- Dùng `require()` cho local images
- Đặt tên file rõ ràng (ví dụ: `logo.png`, `banner.jpg`)
- Tối ưu kích thước ảnh (không quá lớn)

### ❌ Không nên:
- Đặt ảnh ngoài folder `assets/` (sẽ không được bundle)
- Dùng đường dẫn tuyệt đối (ví dụ: `/Users/...`)
- Dùng ảnh quá lớn (ảnh hưởng performance)

## 🎨 Các định dạng hỗ trợ

- **PNG** (khuyến nghị cho logo, icon)
- **JPG/JPEG** (khuyến nghị cho ảnh)
- **GIF** (animated)
- **WebP** (hỗ trợ tốt, kích thước nhỏ)

## 📐 Kích thước khuyến nghị

- **Logo/Icon**: 512x512px hoặc 1024x1024px
- **Banner**: 1200x400px hoặc tương tự
- **Avatar**: 200x200px hoặc 400x400px
- **Thumbnail**: 300x300px

## 🔧 Tối ưu ảnh

### Trước khi thêm vào project:
1. **Compress ảnh**: Dùng tools như TinyPNG, ImageOptim
2. **Resize**: Giảm kích thước nếu quá lớn
3. **Format**: Chọn format phù hợp (PNG cho transparent, JPG cho ảnh)

## 📦 Ví dụ sử dụng trong project

### Header với logo:

```javascript
import { Image, View, Text } from 'react-native';

export default function Header() {
  return (
    <View style={styles.header}>
      <Image 
        source={require('../assets/images/logo.png')} 
        style={styles.logo}
      />
      <Text style={styles.title}>Lịch Công Tác</Text>
    </View>
  );
}
```

### Background image:

```javascript
import { ImageBackground, View } from 'react-native';

export default function Screen() {
  return (
    <ImageBackground 
      source={require('../assets/images/background.jpg')}
      style={styles.container}
    >
      <View>
        {/* Nội dung */}
      </View>
    </ImageBackground>
  );
}
```

## 🚀 Tips

1. **Cache images**: Expo tự động cache local images
2. **Lazy loading**: Dùng cho remote images lớn
3. **Placeholder**: Hiển thị placeholder khi load ảnh
4. **Error handling**: Xử lý lỗi khi load ảnh thất bại

## 📚 Tài liệu tham khảo

- [React Native Image](https://reactnative.dev/docs/image)
- [Expo Assets](https://docs.expo.dev/guides/assets/)
- [React Native Paper Image](https://callstack.github.io/react-native-paper/docs/components/Card/)
