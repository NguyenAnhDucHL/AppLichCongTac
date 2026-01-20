import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from 'react-native-paper';

const LoginScreen = ({ onLogin, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (username.trim() && password.trim()) {
      // Xử lý đăng nhập ở đây
      // Có thể gọi API hoặc xử lý logic đăng nhập
      if (onLogin) {
        onLogin({ username, password });
      }
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Background với geometric design */}
      <View style={styles.backgroundContainer}>
        <View style={styles.backgroundShape1} />
        <View style={styles.backgroundShape2} />
        <View style={styles.backgroundShape3} />
      </View>

      {/* Login Form */}
      <View style={styles.loginContainer}>
        <Text style={styles.title}>Quản trị</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Tên đăng nhập</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Nhập tên đăng nhập"
              placeholderTextColor="#999"
              autoCapitalize="none"
            />
            <View style={styles.underline} />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mật khẩu</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Nhập mật khẩu"
              placeholderTextColor="#999"
              secureTextEntry
            />
            <View style={styles.underline} />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.loginButton}
          onPress={handleLogin}
          activeOpacity={0.8}
        >
          <Text style={styles.loginButtonText}>Đăng nhập</Text>
        </TouchableOpacity>

        {onBack && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={onBack}
          >
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  backgroundContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  backgroundShape1: {
    position: 'absolute',
    top: -100,
    left: -50,
    width: 400,
    height: 400,
    backgroundColor: '#e3f2fd', // Light blue
    borderRadius: 200,
    opacity: 0.6,
    transform: [{ rotate: '45deg' }],
  },
  backgroundShape2: {
    position: 'absolute',
    top: 200,
    right: -100,
    width: 350,
    height: 350,
    backgroundColor: '#fce4ec', // Light pink
    borderRadius: 175,
    opacity: 0.5,
    transform: [{ rotate: '-30deg' }],
  },
  backgroundShape3: {
    position: 'absolute',
    bottom: -150,
    left: 100,
    width: 300,
    height: 300,
    backgroundColor: '#fff',
    borderRadius: 150,
    opacity: 0.7,
    transform: [{ rotate: '60deg' }],
  },
  loginContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#e3f2fd', // Light blue background
    borderRadius: 12,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#d32f2f', // Red color
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  underline: {
    height: 1,
    backgroundColor: '#999',
    marginTop: 4,
  },
  loginButton: {
    backgroundColor: '#4caf50', // Green color
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#666',
    fontSize: 14,
  },
});

export default LoginScreen;
