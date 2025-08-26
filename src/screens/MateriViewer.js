import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Text,
  Image,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Ionicons from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MateriViewer = ({ route, navigation }) => {
  const { url, title } = route.params;
  const [user, setUser] = useState({ name: 'Peserta', paket: 'Premium' });
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setUser({
            name: parsed?.nama || 'Peserta',
            paket: 'Premium',
          });
        }
      } catch (error) {
        console.error('Gagal mengambil data user:', error);
      }
    };
    getUserData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    navigation.replace('Login');
  };

  // ===== JS blok copy dsb =====
  const disableCopyJS = useMemo(
    () => `...`, // biarkan sama seperti sebelumnya
    [],
  );

  const shouldStart = req => {
    const u = req?.url || '';
    if (
      /\b(download|attachment|export=download|content-disposition=attachment)\b/i.test(
        u,
      )
    ) {
      return false;
    }
    return true;
  };

  const onFileDownload = () => {
    Alert.alert('Akses dibatasi', 'Unduhan file tidak diizinkan.');
  };

  const watermarkText = `${user.name}•${user.name}`;
  const watermarks = Array.from({ length: 10 }, (_, i) => (
    <Text key={i} style={styles.watermarkText}>
      {watermarkText}
    </Text>
  ));

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        if (dropdownVisible) setDropdownVisible(false);
        Keyboard.dismiss();
      }}
    >
      <View style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" backgroundColor="#9D2828" />

        {/* Header */}
        <LinearGradient
          colors={['#9D2828', '#191919']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={26} color="#fff" />
          </TouchableOpacity>

          {/* Dropdown user */}
          <View style={styles.userInfo}>
            <TouchableOpacity
              style={styles.avatarInitial}
              onPress={() => setDropdownVisible(!dropdownVisible)}
            >
              <Text style={styles.avatarText}>
                {user.name.split(' ')[0][0]}
              </Text>
            </TouchableOpacity>

            {dropdownVisible && (
              <View style={styles.dropdown}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setDropdownVisible(false);
                    navigation.navigate('Profile');
                  }}
                >
                  <Text style={styles.dropdownText}>Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={handleLogout}
                >
                  <Text style={styles.dropdownText}>Logout</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Title bar */}
        <LinearGradient
          colors={['#9D2828', '#191919']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.titleBar}
        >
          <Text style={styles.titleText} numberOfLines={1}>
            {title}
          </Text>
        </LinearGradient>

        {/* Konten */}
        <View style={{ flex: 1 }}>
          <WebView
            source={{ uri: url }}
            startInLoadingState
            style={{ flex: 1 }}
            javaScriptEnabled
            injectedJavaScriptBeforeContentLoaded={disableCopyJS}
            injectedJavaScript={disableCopyJS}
            onShouldStartLoadWithRequest={shouldStart}
            onFileDownload={onFileDownload}
            setSupportMultipleWindows={false}
            javaScriptCanOpenWindowsAutomatically={false}
            allowFileAccess={false}
            allowsLinkPreview={false}
            mediaPlaybackRequiresUserAction
            originWhitelist={['https://*']}
          />

          {/* Watermark */}
          <View pointerEvents="none" style={styles.watermarkOverlay}>
            {watermarks}
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 40,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarInitial: {
    width: 35,
    height: 35,
    borderRadius: 999,
    backgroundColor: '#0b62e4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  dropdown: {
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
    zIndex: 999,
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
  titleBar: {
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  titleText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'capitalize',
  },
  watermarkOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    transform: [{ rotate: '-20deg' }],
    opacity: 0.1,
  },
  watermarkText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textTransform: 'capitalize',
  },
});

export default MateriViewer;
