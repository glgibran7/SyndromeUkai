import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  StatusBar,
  Picker, // atau gunakan @react-native-picker/picker
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { KelasContext } from '../context/KelasContext'; // tambahkan
import Ionicons from '@react-native-vector-icons/ionicons';

const { width } = Dimensions.get('window');

const Header = ({ navigation, showBack = false }) => {
  const { user, handleLogout, isLoggingOut } = useContext(AuthContext);
  const { kelasList, kelasUser, gantiKelas } = useContext(KelasContext); // ambil data kelas
  const [menuVisible, setMenuVisible] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const closeMenu = () => {
    setMenuVisible(false);
    setNotifVisible(false);
  };

  const toggleMenu = () => {
    if (notifVisible) setNotifVisible(false);
    setMenuVisible(!menuVisible);
  };

  const toggleNotif = () => {
    if (menuVisible) setMenuVisible(false);
    setNotifVisible(!notifVisible);
  };

  const handleChangeKelas = id => {
    const selected = kelasList.find(k => k.id_paketkelas == id);
    if (selected) {
      gantiKelas(selected);
      // reload data halaman
    }
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

        {/* Dropdown Kelas */}
        {kelasList?.length > 0 && (
          <View style={{ marginRight: 15, minWidth: 130 }}>
            <Picker
              selectedValue={kelasUser?.id_paketkelas || ''}
              style={styles.kelasPicker}
              dropdownIconColor="#fff"
              onValueChange={itemValue => handleChangeKelas(itemValue)}
            >
              {kelasList.map(kelas => (
                <Picker.Item
                  key={kelas.id_paketkelas}
                  label={`${kelas.nama_kelas} ${
                    kelas.batch ? `(Batch ${kelas.batch})` : ''
                  }`}
                  value={kelas.id_paketkelas}
                />
              ))}
            </Picker>
          </View>
        )}

        {/* Notifikasi + Avatar */}
        <View style={styles.rightSection}>
          <TouchableOpacity style={{ marginRight: 15 }} onPress={toggleNotif}>
            <Ionicons name="notifications-outline" size={26} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleMenu}>
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

          {/* Menu User */}
          {menuVisible && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate('Profile');
                }}
              >
                <Text style={styles.dropdownText}>Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <ActivityIndicator size="small" color="#700101" />
                    <Text
                      style={[
                        styles.dropdownText,
                        { marginLeft: 8, color: 'gray' },
                      ]}
                    >
                      Logging out...
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.dropdownText}>Logout</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Notifikasi */}
          {notifVisible && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setNotifVisible(false);
                  navigation.navigate('Notifications');
                }}
              >
                <Text style={styles.dropdownText}>Lihat Notifikasi</Text>
              </TouchableOpacity>
              <View style={styles.dropdownItem}>
                <Text style={[styles.dropdownText, { color: 'gray' }]}>
                  (Belum ada notifikasi)
                </Text>
              </View>
            </View>
          )}
        </View>
      </LinearGradient>
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
  dropdownMenu: {
    position: 'absolute',
    top: 45,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    zIndex: 1001,
    width: 180,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownText: { fontSize: 15, color: '#000' },
  kelasPicker: { height: 40, color: '#fff', backgroundColor: 'transparent' },
});

export default Header;
