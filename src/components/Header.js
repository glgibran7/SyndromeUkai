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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import Ionicons from '@react-native-vector-icons/ionicons';

const { width } = Dimensions.get('window');

const Header = ({ navigation, showBack = false }) => {
  const { user, handleLogout, isLoggingOut } = useContext(AuthContext);
  const [menuVisible, setMenuVisible] = useState(false);
  const insets = useSafeAreaInsets();

  return (
    <View style={{ zIndex: 1000 }}>
      <StatusBar
        translucent={true}
        backgroundColor="transparent"
        barStyle="light-content"
      />

      {menuVisible && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        />
      )}

      <LinearGradient
        colors={['#9d2828', '#191919']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.header, { paddingTop: insets.top }]}
      >
        {/* Back button kalau ada */}
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

        {/* User Info */}
        <View style={styles.userInfo}>
          <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
            <View style={styles.avatarInitial}>
              <Text style={styles.avatarText}>
                {user?.name?.split(' ')[0][0] || 'P'}
              </Text>
            </View>
          </TouchableOpacity>

          {menuVisible && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => {
                  setMenuVisible(false);
                  navigation.navigate('Profile');
                }}
              >
                <Text style={styles.dropdownText}>Profil</Text>
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
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  logoCenter: {
    //alignItems: 'center',
  },
  logo: {
    width: width * 0.3,
    height: width * 0.2,
    resizeMode: 'contain',
  },
  userInfo: {
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
    width: 160,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownText: {
    fontSize: 15,
    color: '#000',
  },
});

export default Header;
