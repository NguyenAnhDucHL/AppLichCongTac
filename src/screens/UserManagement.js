import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { Text, Card, Button, TextInput, ActivityIndicator, FAB, IconButton, Switch, Chip } from 'react-native-paper';
import { collection, doc, getDoc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { hasPermission, getCurrentUser } from '../services/AuthService';

const UserManagement = ({ onBack }) => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    role: 'viewer',
    department: 'UBND Phường Cẩm Phả',
    isActive: true
  });
  const [canWrite, setCanWrite] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadUsers();
    loadRoles();
    checkPermissions();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    const user = await getCurrentUser();
    setCurrentUser(user);
  };

  const checkPermissions = async () => {
    const writePermission = await hasPermission('user:write');
    const deletePermission = await hasPermission('user:delete');
    setCanWrite(writePermission);
    setCanDelete(deletePermission);
  };

  const loadUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = [];
      usersSnapshot.forEach(doc => {
        usersData.push({ id: doc.id, ...doc.data() });
      });
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách người dùng');
    }
  };

  const loadRoles = async () => {
    try {
      const rolesSnapshot = await getDocs(collection(db, 'roles'));
      const rolesData = [];
      rolesSnapshot.forEach(doc => {
        rolesData.push({ id: doc.id, ...doc.data() });
      });
      setRoles(rolesData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading roles:', error);
      setLoading(false);
    }
  };

  const simpleHash = (password) => {
    // Simple base64 hash - trong production nên dùng bcrypt
    return btoa(unescape(encodeURIComponent(password)));
  };

  const handleAddUserWithData = async (userData) => {
    if (!userData.username || !userData.email || !userData.fullName || !userData.password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }

    try {
      const selectedRole = roles.find(role => role.id === userData.role);
      const userDoc = {
        id: userData.email,
        username: userData.username,
        email: userData.email,
        fullName: userData.fullName,
        password: simpleHash(userData.password),
        role: userData.role,
        department: userData.department,
        isActive: userData.isActive,
        permissions: selectedRole?.permissions || [],
        createdAt: new Date(),
        createdBy: currentUser?.id || 'admin',
        lastLogin: null
      };

      await setDoc(doc(db, 'users', userData.email), userDoc);
      
      setUsers(prev => [...prev, userDoc]);
      setNewUser({
        username: '',
        email: '',
        fullName: '',
        password: '',
        role: 'viewer',
        department: 'UBND Phường Cẩm Phả',
        isActive: true
      });
      setShowAddModal(false);
      Alert.alert('Thành công', 'Đã thêm người dùng mới');
    } catch (error) {
      console.error('Error adding user:', error);
      Alert.alert('Lỗi', 'Không thể thêm người dùng');
    }
  };

  const handleEditUserWithData = async (userData) => {
    if (!userData.username || !userData.email || !userData.fullName) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      const selectedRole = roles.find(role => role.id === userData.role);
      const updatedUser = {
        ...userData,
        id: userData.id || userData.email,
        permissions: selectedRole?.permissions || [],
        updatedAt: new Date(),
        updatedBy: currentUser?.id || 'admin'
      };

      // Nếu có password mới thì hash, không thì giữ nguyên
      if (userData.newPassword && userData.newPassword.trim() !== '') {
        updatedUser.password = simpleHash(userData.newPassword);
        delete updatedUser.newPassword;
      } else {
        // Giữ nguyên password cũ (không update)
        delete updatedUser.password;
        delete updatedUser.newPassword;
      }

      await setDoc(doc(db, 'users', updatedUser.id), updatedUser, { merge: true });
      
      setUsers(prev => prev.map(user => 
        user.id === updatedUser.id ? { ...user, ...updatedUser } : user
      ));
      
      setEditingUser(null);
      setShowEditModal(false);
      Alert.alert('Thành công', 'Đã cập nhật thông tin người dùng');
    } catch (error) {
      console.error('Error updating user:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật người dùng');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser?.id) {
      Alert.alert('Lỗi', 'Không thể xóa chính mình');
      return;
    }

    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa người dùng này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'users', userId));
              setUsers(prev => prev.filter(user => user.id !== userId));
              Alert.alert('Thành công', 'Đã xóa người dùng');
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Lỗi', 'Không thể xóa người dùng');
            }
          }
        }
      ]
    );
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    if (userId === currentUser?.id) {
      Alert.alert('Lỗi', 'Không thể thay đổi trạng thái của chính mình');
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const updatedUser = {
          ...userDoc.data(),
          isActive: !currentStatus,
          updatedAt: new Date(),
          updatedBy: currentUser?.id || 'admin'
        };
        
        await setDoc(doc(db, 'users', userId), updatedUser);
        
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, isActive: !currentStatus } : user
        ));
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      Alert.alert('Lỗi', 'Không thể thay đổi trạng thái');
    }
  };

  const getRoleName = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : roleId;
  };

  const UserModal = ({ visible, onDismiss, title, user, onSave, onUserChange, isEditing = false }) => {
    // Local state để tránh re-render modal
    const [localUser, setLocalUser] = useState(() => user || {});
    const prevVisibleRef = useRef(false);
    const prevUserIdRef = useRef(null);

    // CHỈ sync với prop user khi modal mở lần đầu (visible chuyển từ false -> true)
    useEffect(() => {
      const wasVisible = prevVisibleRef.current;
      const isNowVisible = visible;
      
      // Khi modal mở lần đầu (false -> true)
      if (!wasVisible && isNowVisible && user) {
        setLocalUser({ ...user });
        prevUserIdRef.current = user?.id || null;
      }
      
      // Khi modal đóng (true -> false)
      if (wasVisible && !isNowVisible) {
        // Reset để sẵn sàng cho lần mở tiếp theo
        prevUserIdRef.current = null;
      }
      
      // Khi user ID thay đổi (chọn user khác) và modal đang mở
      if (isNowVisible && user?.id && prevUserIdRef.current !== user?.id) {
        setLocalUser({ ...user });
        prevUserIdRef.current = user?.id;
      }
      
      prevVisibleRef.current = isNowVisible;
    }, [visible, user?.id]); // Chỉ sync khi visible hoặc user ID thay đổi

    // Handle local changes - CHỈ update local state, KHÔNG gọi onUserChange
    const handleLocalChange = (field, value) => {
      setLocalUser(prev => {
        const updated = { ...prev, [field]: value };
        return updated;
      });
      // KHÔNG gọi onUserChange ở đây để tránh re-render parent
    };

    // Handle save - truyền localUser lên parent
    const handleSave = () => {
      if (onSave) {
        onSave(localUser);
      }
    };

    return (
      <Modal 
        visible={visible} 
        transparent 
        animationType="slide" 
        onRequestClose={onDismiss}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{title}</Text>
              
              <TextInput
                label="Tên đăng nhập *"
                value={localUser.username || ''}
                onChangeText={(text) => handleLocalChange('username', text)}
                style={styles.input}
                mode="outlined"
                editable={!isEditing}
              />
              
              <TextInput
                label="Email *"
                value={localUser.email || ''}
                onChangeText={(text) => handleLocalChange('email', text)}
                style={styles.input}
                mode="outlined"
                keyboardType="email-address"
                editable={!isEditing}
              />
              
              <TextInput
                label="Họ và tên *"
                value={localUser.fullName || ''}
                onChangeText={(text) => handleLocalChange('fullName', text)}
                style={styles.input}
                mode="outlined"
              />
              
              <TextInput
                label={isEditing ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu *"}
                value={isEditing ? (localUser.newPassword || '') : (localUser.password || '')}
                onChangeText={(text) => handleLocalChange(isEditing ? 'newPassword' : 'password', text)}
                style={styles.input}
                mode="outlined"
                secureTextEntry
              />
              
              <TextInput
                label="Phòng ban"
                value={localUser.department || ''}
                onChangeText={(text) => handleLocalChange('department', text)}
                style={styles.input}
                mode="outlined"
              />
              
              {/* Role selector */}
              <Text style={styles.label}>Vai trò:</Text>
              <View style={styles.chipContainer}>
                {roles.map(role => (
                  <Chip
                    key={role.id}
                    selected={localUser.role === role.id}
                    onPress={() => handleLocalChange('role', role.id)}
                    style={styles.chip}
                  >
                    {role.name}
                  </Chip>
                ))}
              </View>
              
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Kích hoạt tài khoản</Text>
                <Switch
                  value={localUser.isActive || false}
                  onValueChange={(value) => handleLocalChange('isActive', value)}
                />
              </View>
              
              <View style={styles.modalButtons}>
                <Button onPress={onDismiss} style={styles.modalButton}>Hủy</Button>
                <Button mode="contained" onPress={handleSave} style={styles.modalButton}>Lưu</Button>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Đang tải danh sách người dùng...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Quản lý Người Dùng</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Stats */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{users.length}</Text>
              <Text style={styles.statLabel}>Tổng số</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{users.filter(u => u.isActive).length}</Text>
              <Text style={styles.statLabel}>Đang hoạt động</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{users.filter(u => u.role === 'admin').length}</Text>
              <Text style={styles.statLabel}>Admin</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Users list */}
      <ScrollView style={styles.usersList}>
        {users.map((user) => (
          <Card key={user.id} style={styles.userCard}>
            <Card.Content>
              <View style={styles.userHeader}>
                <View style={styles.userInfo}>
                  <Text style={styles.userFullName}>{user.fullName}</Text>
                  <Text style={styles.userDetail}>@{user.username} • {user.email}</Text>
                  <Text style={styles.userDetail}>{user.department}</Text>
                </View>
                <View style={styles.userActions}>
                  <Chip
                    mode={user.isActive ? 'flat' : 'outlined'}
                    textStyle={[
                      styles.statusChip,
                      { color: user.isActive ? '#4caf50' : '#f44336' }
                    ]}
                    style={{
                      backgroundColor: user.isActive ? '#e8f5e8' : '#ffebee'
                    }}
                  >
                    {user.isActive ? 'Hoạt động' : 'Tạm khóa'}
                  </Chip>
                </View>
              </View>
              
              <View style={styles.userMeta}>
                <Chip mode="outlined" style={styles.roleChip}>
                  {getRoleName(user.role)}
                </Chip>
                <Text style={styles.userLastLogin}>
                  {user.lastLogin ? `Đăng nhập: ${new Date(user.lastLogin.seconds * 1000).toLocaleDateString()}` : 'Chưa đăng nhập'}
                </Text>
              </View>
              
              {canWrite && (
                <View style={styles.userButtons}>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      setEditingUser(user);
                      setShowEditModal(true);
                    }}
                    style={styles.actionButton}
                  >
                    Sửa
                  </Button>
                  <Button
                    mode="outlined"
                    onPress={() => toggleUserStatus(user.id, user.isActive)}
                    style={styles.actionButton}
                    disabled={user.id === currentUser?.id}
                  >
                    {user.isActive ? 'Khóa' : 'Mở khóa'}
                  </Button>
                  {canDelete && (
                    <Button
                      mode="outlined"
                      onPress={() => handleDeleteUser(user.id)}
                      style={[styles.actionButton, styles.deleteButton]}
                      disabled={user.id === currentUser?.id}
                    >
                      Xóa
                    </Button>
                  )}
                </View>
              )}
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      {/* Add button */}
      {canWrite && (
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => setShowAddModal(true)}
          label="Thêm người dùng"
        />
      )}

      {/* Add User Modal */}
      <UserModal
        visible={showAddModal}
        onDismiss={() => {
          setShowAddModal(false);
          // Reset newUser khi đóng modal
          setNewUser({
            username: '',
            email: '',
            fullName: '',
            password: '',
            role: 'viewer',
            department: 'UBND Phường Cẩm Phả',
            isActive: true
          });
        }}
        title="Thêm người dùng mới"
        user={newUser}
        onSave={(userData) => {
          // Update newUser với data từ modal
          setNewUser(userData);
          // Gọi handleAddUser với userData mới
          handleAddUserWithData(userData);
        }}
        isEditing={false}
      />

      {/* Edit User Modal */}
      <UserModal
        visible={showEditModal}
        onDismiss={() => setShowEditModal(false)}
        title="Sửa thông tin người dùng"
        user={editingUser || {}}
        onSave={(userData) => {
          // Update editingUser với data từ modal
          setEditingUser(userData);
          // Gọi handleEditUser với userData mới
          handleEditUserWithData(userData);
        }}
        isEditing={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1976d2',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSpacer: {
    width: 40,
  },
  statsCard: {
    margin: 16,
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  usersList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  userCard: {
    marginBottom: 12,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  userInfo: {
    flex: 1,
  },
  userFullName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userDetail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  userActions: {
    marginLeft: 8,
  },
  statusChip: {
    fontSize: 10,
  },
  userMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  roleChip: {
    marginRight: 8,
  },
  userLastLogin: {
    fontSize: 11,
    color: '#666',
  },
  userButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  actionButton: {
    minWidth: 80,
  },
  deleteButton: {
    borderColor: '#f44336',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 8,
    minWidth: 320,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    marginTop: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    marginRight: 8,
    marginBottom: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 14,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    minWidth: 100,
  },
});

export default UserManagement;