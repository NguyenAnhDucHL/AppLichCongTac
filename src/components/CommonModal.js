import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Platform } from 'react-native';
import { Text, Card, Button, Portal } from 'react-native-paper';

/**
 * CommonModal - Modal component chung cho toàn bộ project
 * 
 * @param {boolean} visible - Hiển thị/ẩn modal
 * @param {function} onClose - Callback khi đóng modal (không confirm)
 * @param {string} title - Tiêu đề modal
 * @param {string} message - Nội dung message
 * @param {string} confirmText - Text của nút confirm (mặc định: "Xác nhận")
 * @param {string} cancelText - Text của nút cancel (mặc định: "Hủy")
 * @param {function} onConfirm - Callback khi confirm
 * @param {boolean} showCancel - Hiển thị nút cancel (mặc định: true)
 * @param {string} confirmButtonColor - Màu nút confirm (mặc định: "#1976d2")
 * @param {string} confirmButtonStyle - Style của nút confirm ("default" | "destructive" | "success")
 * @param {boolean} loading - Hiển thị loading state
 * @param {React.ReactNode} children - Custom content thay vì message
 */
const CommonModal = ({
  visible,
  onClose,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  onConfirm,
  showCancel = true,
  confirmButtonStyle = 'default', // 'default' | 'destructive' | 'success'
  loading = false,
  children
}) => {
  const getConfirmButtonColor = () => {
    switch (confirmButtonStyle) {
      case 'destructive':
        return '#d32f2f';
      case 'success':
        return '#388e3c';
      default:
        return '#1976d2';
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    }
  };

  // Sử dụng Portal cho React Native Paper để modal hiển thị đúng layer
  if (Platform.OS === 'web') {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Card.Content style={styles.modalContent}>
              {title && (
                <Text style={styles.modalTitle}>{title}</Text>
              )}
              
              {children ? (
                <View style={styles.modalBody}>
                  {children}
                </View>
              ) : message ? (
                <Text style={styles.modalMessage}>{message}</Text>
              ) : null}

              <View style={styles.modalActions}>
                {showCancel && (
                  <Button
                    mode="outlined"
                    onPress={handleCancel}
                    style={[styles.modalButton, styles.cancelButton]}
                    contentStyle={styles.modalButtonContent}
                    disabled={loading}
                  >
                    {cancelText}
                  </Button>
                )}
                <Button
                  mode="contained"
                  onPress={handleConfirm}
                  style={[
                    styles.modalButton,
                    { backgroundColor: getConfirmButtonColor() }
                  ]}
                  contentStyle={styles.modalButtonContent}
                  loading={loading}
                  disabled={loading}
                >
                  {confirmText}
                </Button>
              </View>
            </Card.Content>
          </Card>
        </View>
      </Modal>
    );
  }

  // Sử dụng Portal cho mobile
  return (
    <Portal>
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Card.Content style={styles.modalContent}>
              {title && (
                <Text style={styles.modalTitle}>{title}</Text>
              )}
              
              {children ? (
                <View style={styles.modalBody}>
                  {children}
                </View>
              ) : message ? (
                <Text style={styles.modalMessage}>{message}</Text>
              ) : null}

              <View style={styles.modalActions}>
                {showCancel && (
                  <Button
                    mode="outlined"
                    onPress={handleCancel}
                    style={[styles.modalButton, styles.cancelButton]}
                    contentStyle={styles.modalButtonContent}
                    disabled={loading}
                  >
                    {cancelText}
                  </Button>
                )}
                <Button
                  mode="contained"
                  onPress={handleConfirm}
                  style={[
                    styles.modalButton,
                    { backgroundColor: getConfirmButtonColor() }
                  ]}
                  contentStyle={styles.modalButtonContent}
                  loading={loading}
                  disabled={loading}
                >
                  {confirmText}
                </Button>
              </View>
            </Card.Content>
          </Card>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalContent: {
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalBody: {
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    minWidth: 100,
  },
  modalButtonContent: {
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  cancelButton: {
    borderColor: '#ccc',
  },
});

export default CommonModal;