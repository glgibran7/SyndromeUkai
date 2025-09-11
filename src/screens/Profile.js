import React, { useContext, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  Modal,
  PanResponder,
  Animated,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import ToastMessage from '../components/ToastMessage'; // pakai toast yang sudah kamu buat

const Profile = () => {
  const navigation = useNavigation();
  const { user, handleLogout } = useContext(AuthContext);
  const [profileImage, setProfileImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  // Animasi drag untuk preview
  const translateY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 10,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) {
          translateY.setValue(gesture.dy);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 150) {
          setPreviewVisible(false);
          translateY.setValue(0);
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  const getInitials = name => {
    if (!name) return '-';
    const parts = name.split(' ');
    return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
  };

  const showToast = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  const pickFromCamera = () => {
    launchCamera({ mediaType: 'photo' }, res => {
      if (!res.didCancel && !res.errorCode) {
        setProfileImage(res.assets[0].uri);
        setModalVisible(false);
        showToast();
      }
    });
  };

  const pickFromGallery = () => {
    launchImageLibrary({ mediaType: 'photo' }, res => {
      if (!res.didCancel && !res.errorCode) {
        setProfileImage(res.assets[0].uri);
        setModalVisible(false);
        showToast();
      }
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Avatar + Nama */}
        <View style={styles.profileSection}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => profileImage && setPreviewVisible(true)}
          >
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarInitial}>
                <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.editIcon}
              onPress={() => setModalVisible(true)}
            >
              <Ionicons name="camera" size={16} color="#555" />
            </TouchableOpacity>
          </TouchableOpacity>

          <Text style={styles.name}>{user?.name?.toUpperCase() || 'USER'}</Text>
        </View>

        <View style={styles.menu}>
          {/* Ganti Nama */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('ChangeName')}
          >
            <Ionicons name="person-outline" size={20} color="#444" />
            <Text style={styles.menuText}>Ganti Nama</Text>
            <Ionicons name="chevron-forward" size={20} color="#444" />
          </TouchableOpacity>

          {/* Ganti Password */}
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <Ionicons name="lock-closed-outline" size={20} color="#444" />
            <Text style={styles.menuText}>Ganti Password</Text>
            <Ionicons name="chevron-forward" size={20} color="#444" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('AboutScreen')}
          >
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#444"
            />
            <Text style={styles.menuText}>Tentang Syndrome Ukai</Text>
            <Ionicons name="chevron-forward" size={20} color="#444" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('HelpScreen')}
          >
            <Ionicons name="help-circle-outline" size={20} color="#444" />
            <Text style={styles.menuText}>Bantuan</Text>
            <Ionicons name="chevron-forward" size={20} color="#444" />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Sheet Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
        >
          <View style={styles.bottomSheet}>
            <Text style={styles.sheetTitle}>Pilih Foto Profil</Text>
            <TouchableOpacity style={styles.sheetItem} onPress={pickFromCamera}>
              <Ionicons name="camera-outline" size={20} color="#333" />
              <Text style={styles.sheetText}>Ambil dari Kamera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sheetItem}
              onPress={pickFromGallery}
            >
              <Ionicons name="image-outline" size={20} color="#333" />
              <Text style={styles.sheetText}>Pilih dari Galeri</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.sheetItem,
                { borderTopWidth: 1, borderColor: '#eee' },
              ]}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close-outline" size={20} color="#e74c3c" />
              <Text style={[styles.sheetText, { color: '#e74c3c' }]}>
                Batal
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Fullscreen Preview Modal */}
      <Modal
        visible={previewVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewVisible(false)}
      >
        <View style={styles.previewContainer}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setPreviewVisible(false)}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>

          <Animated.View
            style={{ transform: [{ translateY }] }}
            {...panResponder.panHandlers}
          >
            <Image source={{ uri: profileImage }} style={styles.previewImage} />
          </Animated.View>
        </View>
      </Modal>

      {/* Toast pesan info */}
      <ToastMessage
        message="Fitur ini masih dalam pengembangan, foto belum tersimpan."
        visible={toastVisible}
        type="info"
        onHide={() => setToastVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAEAEA' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    marginTop: 40,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  profileSection: { alignItems: 'center', marginTop: 10 },
  avatarInitial: {
    width: 100,
    height: 100,
    borderRadius: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 60,
    resizeMode: 'cover',
  },
  avatarText: { fontSize: 36, fontWeight: 'bold', color: '#000' },
  editIcon: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    elevation: 3,
  },
  name: { fontSize: 20, fontWeight: 'bold', marginTop: 8, color: '#000' },
  menu: {
    marginTop: 25,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 20,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuText: { flex: 1, marginLeft: 15, fontSize: 15, color: '#000' },
  logoutBtn: {
    marginTop: 30,
    marginHorizontal: 40,
    backgroundColor: '#333',
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  logoutText: { color: '#fff', fontWeight: 'bold' },

  // Bottom sheet styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 30,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  sheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  sheetText: {
    fontSize: 15,
    marginLeft: 12,
    color: '#333',
  },

  // Fullscreen preview
  previewContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '90%',
    height: '70%',
    resizeMode: 'contain',
    borderRadius: 12,
  },
  closeBtn: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 2,
  },
});

export default Profile;
