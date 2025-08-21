import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Text,
  Image,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Ionicons from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MateriViewer = ({ route, navigation }) => {
  const { url, title } = route.params;
  const [user, setUser] = useState({ name: 'Peserta', paket: 'Premium' });

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

  // ===== JS yang disuntik ke WebView untuk blok copy/selection/shortcut/klik kanan =====
  const disableCopyJS = useMemo(
    () => `
      (function () {
        try {
          const style = document.createElement('style');
          style.innerHTML = "* { -webkit-user-select: none !important; user-select: none !important; -webkit-touch-callout: none !important; } img, a, video { -webkit-touch-callout: none !important; }";
          document.head.appendChild(style);

          ['contextmenu','copy','cut','dragstart','selectstart'].forEach(evt => {
            document.addEventListener(evt, e => { e.preventDefault(); e.stopPropagation(); }, { capture:true });
          });

          document.addEventListener('keydown', function(e) {
            const k = (e.key || '').toLowerCase();
            if ((e.ctrlKey || e.metaKey) && ['c','x','s','p','u','a'].includes(k)) { e.preventDefault(); e.stopPropagation(); }
            if (k === 'printscreen') { e.preventDefault(); e.stopPropagation(); }
          }, { capture:true });

          const imgs = document.querySelectorAll('img');
          imgs.forEach(img => { img.setAttribute('draggable', 'false'); img.setAttribute('oncontextmenu','return false'); });
        } catch (e) {}
      })();
      true;
    `,
    [],
  );

  // ===== Cegah unduhan & buka jendela baru dari WebView =====
  const shouldStart = req => {
    const u = req?.url || '';

    // Blok pola URL yang umum dipakai untuk unduhan
    if (
      /\b(download|attachment|export=download|content-disposition=attachment)\b/i.test(
        u,
      )
    ) {
      return false;
    }
    // Bolehkan navigasi biasa
    return true;
  };

  const onFileDownload = () => {
    Alert.alert('Akses dibatasi', 'Unduhan file tidak diizinkan.');
  };

  // ===== Watermark teks (tidak menghalangi sentuhan, hanya overlay) =====
  const watermarkText = `${user.name}•${user.name}`;
  const watermarks = Array.from({ length: 10 }, (_, i) => (
    <Text key={i} style={styles.watermarkText}>
      {watermarkText}
    </Text>
  ));

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#9D2828" />

      {/* Header mirip MateriListScreen */}
      <LinearGradient
        colors={['#9D2828', '#191919']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>

        {/* Info user kanan */}
        <View style={styles.userInfo}>
          <View style={styles.paketBadge}>
            <Text style={styles.paketText}>🥇 {user.paket}</Text>
          </View>
          <View style={styles.avatarInitial}>
            <Text style={styles.avatarText}>{user.name.split(' ')[0][0]}</Text>
          </View>
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

        {/* Watermark overlay */}
        <View pointerEvents="none" style={styles.watermarkOverlay}>
          {watermarks}
        </View>
      </View>
    </View>
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
  logo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginLeft: -80,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paketBadge: {
    backgroundColor: '#feb600',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  paketText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
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

  // ===== Watermark =====
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
