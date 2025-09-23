import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  StatusBar,
  Modal,
  FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { KelasContext } from '../context/KelasContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@react-native-vector-icons/ionicons'; // ✅ perbaiki import
import Api from '../utils/Api';
import { CommonActions } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const Header = ({ navigation, showBack = false }) => {
  const { user, handleLogout, isLoggingOut } = useContext(AuthContext);
  const { kelasAktif, setKelasAktif } = useContext(KelasContext);
  const [daftarKelas, setDaftarKelas] = useState([]);
  const [isWaliKelas, setIsWaliKelas] = useState(false);
  const [loadingKelas, setLoadingKelas] = useState(false);
  const [loadingPindah, setLoadingPindah] = useState(false);

  const [menuVisible, setMenuVisible] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  const [kelasModalVisible, setKelasModalVisible] = useState(false);

  const insets = useSafeAreaInsets();
  const fetchKelas = async (wali = false) => {
    try {
      setLoadingKelas(true);
      const token = await AsyncStorage.getItem('token');
      const endpoint = wali ? '/paket-kelas/wali-kelas' : '/paket-kelas/mentor';

      const res = await Api.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const list = res.data?.data || [];
      setDaftarKelas(list);

      // default pilih kelas pertama kalau belum ada
      if (list.length > 0 && !kelasAktif) {
        setKelasAktif(list[0]);
        await AsyncStorage.setItem('kelas', list[0].id_paketkelas.toString());
        await AsyncStorage.setItem('namaKelas', list[0].nama_kelas);
      }
    } catch (err) {
      console.error('Gagal ambil kelas:', err);
    } finally {
      setLoadingKelas(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'mentor') {
      fetchKelas(isWaliKelas);
    }
  }, [isWaliKelas]);

  const handlePilihKelas = async kelas => {
    try {
      setLoadingPindah(true);
      await AsyncStorage.setItem('kelas', kelas.id_paketkelas.toString());
      await AsyncStorage.setItem('namaKelas', kelas.nama_kelas);
      setKelasAktif(kelas);
      setKelasModalVisible(false);
      setTimeout(() => {
        setLoadingPindah(false);
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Main' }], // pastikan nama route sesuai
          }),
        );
      }, 1000);
    } catch (err) {
      console.error('Gagal menyimpan kelas:', err);
      setLoadingPindah(false);
    }
  };

  const closeMenu = () => {
    setMenuVisible(false);
    setNotifVisible(false);
  };

  return (
    <View style={{ zIndex: 1000 }} onStartShouldSetResponder={closeMenu}>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {(menuVisible || notifVisible) && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={closeMenu}
        />
      )}

      <LinearGradient
        colors={['#9d2828', '#191919']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: insets.top }]}
      >
        {/* Tombol Back */}
        {showBack && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
        )}

        {/* Logo */}
        <View style={[styles.logoContainer, showBack && styles.logoCenter]}>
          <Image
            source={require('../img/logo_putih.png')}
            style={styles.logo}
          />
        </View>

        {/* Nama Kelas Aktif + Notifikasi + Avatar */}
        <View style={styles.rightSection}>
          {/* Nama Kelas Aktif */}
          {user?.role === 'mentor' ? (
            // Mentor → bisa pilih kelas
            <TouchableOpacity
              style={styles.kelasAktifContainer}
              onPress={() => setKelasModalVisible(true)}
            >
              <Ionicons name="school-outline" size={10} color="#fff" />
              <Text style={styles.kelasAktifText}>
                {kelasAktif?.nama_kelas || 'Pilih Kelas'}
              </Text>
            </TouchableOpacity>
          ) : (
            // Peserta → ambil dari user.namaKelas
            <View style={styles.kelasAktifContainer}>
              <Ionicons name="school-outline" size={10} color="#fff" />
              <Text style={styles.kelasAktifText}>
                {user?.nama_kelas || kelasAktif?.nama_kelas || '-'}
              </Text>
            </View>
          )}

          {/* Notifikasi */}
          <TouchableOpacity
            style={{ marginHorizontal: 12 }}
            onPress={() => setNotifVisible(!notifVisible)}
          >
            <Ionicons name="notifications-outline" size={26} color="#fff" />
          </TouchableOpacity>

          {/* Avatar */}
          <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
            <View style={styles.avatarInitial}>
              <Text style={styles.avatarText}>
                {user?.name
                  ? (
                      user?.name.split(' ')[0][0] +
                      (user?.name.split(' ')[1]?.[0] || '')
                    ).toUpperCase()
                  : '-'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Modal Pilih Kelas */}
      <Modal
        visible={kelasModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setKelasModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Pilih Kelas</Text>

            {/* Toggle wali kelas */}
            {user?.role === 'mentor' && (
              <View style={styles.toggleContainer}>
                <Text style={styles.toggleLabel}>Wali Kelas</Text>
                <TouchableOpacity
                  style={[
                    styles.toggle,
                    isWaliKelas ? styles.toggleOn : styles.toggleOff,
                  ]}
                  onPress={() => setIsWaliKelas(prev => !prev)}
                >
                  <View
                    style={[styles.circle, isWaliKelas && styles.circleOn]}
                  />
                </TouchableOpacity>
              </View>
            )}

            {loadingKelas ? (
              <ActivityIndicator
                size="large"
                color="#9d2828"
                style={{ marginTop: 20 }}
              />
            ) : daftarKelas.length === 0 ? (
              <Text
                style={{
                  textAlign: 'center',
                  marginVertical: 20,
                  color: '#555',
                }}
              >
                Tidak ada kelas tersedia
              </Text>
            ) : (
              <FlatList
                data={daftarKelas}
                keyExtractor={item => item.id_paketkelas.toString()}
                renderItem={({ item, index }) => {
                  // dummy notif count kalau API belum ada
                  const notifCount =
                    item.notifCount || (index % 2 === 0 ? 2 : 0);

                  return (
                    <TouchableOpacity
                      style={[
                        styles.kelasItem,
                        kelasAktif?.id_paketkelas === item.id_paketkelas &&
                          styles.kelasItemActive,
                      ]}
                      onPress={() => handlePilihKelas(item)}
                    >
                      {/* Badge notif */}
                      {notifCount > 0 && (
                        <View style={styles.badgeContainer}>
                          <Text style={styles.badgeText}>{notifCount}</Text>
                        </View>
                      )}

                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          flex: 1,
                        }}
                      >
                        <Ionicons
                          name="school-outline"
                          size={20}
                          color="#700101"
                          style={{ marginRight: 10 }}
                        />
                        <Text
                          style={[
                            styles.kelasNama,
                            kelasAktif?.id_paketkelas === item.id_paketkelas &&
                              styles.kelasNamaActive,
                          ]}
                        >
                          {item.nama_kelas}
                        </Text>
                      </View>

                      {/* Checkmark kelas aktif */}
                      {/* {kelasAktif?.id_paketkelas === item.id_paketkelas && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#4caf50"
                        />
                      )} */}
                    </TouchableOpacity>
                  );
                }}
              />
            )}

            <TouchableOpacity
              onPress={() => setKelasModalVisible(false)}
              style={styles.modalCloseBtn}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Menu Profile */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPressOut={() => setMenuVisible(false)}
        >
          <View style={styles.menuBox}>
            <Text style={styles.menuTitle}>{user?.name}</Text>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('Profile'); // 🔥 arahkan ke screen profile
              }}
            >
              <Ionicons name="person-outline" size={20} color="#000" />
              <Text style={styles.menuText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                handleLogout();
              }}
              disabled={isLoggingOut}
            >
              <Ionicons name="log-out-outline" size={20} color="red" />
              <Text style={[styles.menuText, { color: 'red' }]}>
                {isLoggingOut ? 'Keluar...' : 'Keluar'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      {/* 🔄 Modal Loading Logout */}
      <Modal
        visible={isLoggingOut}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.logoutOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.logoutText}>Sedang keluar...</Text>
        </View>
      </Modal>
      {/* 🔄 Modal Loading Pindah Kelas */}
      <Modal
        visible={loadingPindah}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.logoutOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.logoutText}>Mengganti kelas...</Text>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    zIndex: 999,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    zIndex: 1000,
  },
  backButton: { padding: 8, marginRight: 10 },
  logoContainer: { flex: 1, alignItems: 'flex-start' },
  logoCenter: {},
  logo: { width: width * 0.3, height: width * 0.2, resizeMode: 'contain' },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  kelasAktifContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 5,
    paddingVertical: 5,
    borderRadius: 20,
  },
  kelasAktifText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 10,
    fontWeight: '600',
  },
  avatarInitial: {
    width: 35,
    height: 35,
    borderRadius: 999,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#000',
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  kelasItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  kelasNama: { fontSize: 16, color: '#333' },
  modalCloseBtn: {
    marginTop: 15,
    backgroundColor: '#9d2828',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  // 🔥 style untuk menu profile
  menuOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  menuBox: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    padding: 20,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuText: {
    fontSize: 15,
    marginLeft: 10,
    color: '#000',
  },
  logoutOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    marginTop: 12,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  toggleLabel: {
    marginRight: 8,
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  toggle: {
    width: 45,
    height: 24,
    borderRadius: 20,
    justifyContent: 'center',
    padding: 3,
  },
  toggleOff: { backgroundColor: '#ccc' },
  toggleOn: { backgroundColor: '#4caf50' },
  circle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#fff',
  },
  circleOn: {
    alignSelf: 'flex-end',
  },
  modalCard: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  kelasItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    marginBottom: 5,
  },
  kelasItemActive: {
    backgroundColor: 'rgba(157,40,40,0.1)',
  },
  kelasNama: {
    fontSize: 16,
    color: '#333',
    textTransform: 'capitalize',
  },
  kelasNamaActive: {
    color: '#9d2828',
    fontWeight: 'bold',
  },
  kelasItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  kelasItemActive: {
    backgroundColor: '#FFF4F4',
  },
  kelasNama: {
    fontSize: 16,
    color: '#333',
  },
  kelasNamaActive: {
    color: '#9D2828',
    fontWeight: 'bold',
  },
  badgeContainer: {
    position: 'absolute',
    top: 8,
    right: 10,
    backgroundColor: '#E53935',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    zIndex: 1,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export default Header;
