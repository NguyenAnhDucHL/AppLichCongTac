import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, ActivityIndicator, TextInput } from 'react-native-paper';
import { Svg, Path } from 'react-native-svg';
import { login } from '../services/AuthService';

// Custom Eye Icon Component
const EyeIcon = ({ size = 24, color = '#666' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
      fill={color}
    />
  </Svg>
);

// Custom Eye Off Icon Component
const EyeOffIcon = ({ size = 24, color = '#666' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"
      fill={color}
    />
  </Svg>
);

const LoginScreen = ({ onLogin, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await login(username.trim(), password);
      
      if (result.success) {
        // Đăng nhập thành công
        if (onLogin) {
          onLogin(result.user);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
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
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              setError(''); // Clear error khi user nhập
            }}
            placeholder="Nhập tên đăng nhập"
            mode="flat"
            autoCapitalize="none"
            editable={!loading}
            underlineColor="#999"
            activeUnderlineColor="#1976d2"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Mật khẩu</Text>
          <View style={styles.passwordInputWrapper}>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setError(''); // Clear error khi user nhập
              }}
              placeholder="Nhập mật khẩu"
              mode="flat"
              secureTextEntry={!showPassword}
              editable={!loading}
              underlineColor="#999"
              activeUnderlineColor="#1976d2"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
              activeOpacity={0.7}
            >
              {showPassword ? (
                <EyeOffIcon size={24} color="#666" />
              ) : (
                <EyeIcon size={24} color="#666" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        <TouchableOpacity 
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          )}
        </TouchableOpacity>

        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>Thông tin đăng nhập mặc định:</Text>
          <Text style={styles.helpText}>Admin: admin / CamPha@2026</Text>
          <Text style={styles.helpText}>Editor: editor / Editor@2026</Text>
        </View>

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
  input: {
    backgroundColor: 'transparent',
    fontSize: 16,
    paddingRight: 50, // Space for icon
  },
  passwordInputWrapper: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 8,
    top: 8,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
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
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 8,
    backgroundColor: '#ffebee',
    padding: 8,
    borderRadius: 4,
  },
  loginButtonDisabled: {
    backgroundColor: '#999',
  },
  helpContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#2196f3',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
});

export default LoginScreen;
