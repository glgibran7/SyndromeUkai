import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  ActivityIndicator,
  Text,
  ScrollView,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import LinearGradient from 'react-native-linear-gradient';
import Header from '../components/Header';
import { NativeModules } from 'react-native';
import Api from '../utils/Api';

const { height } = Dimensions.get('window');

const MateriViewer = ({ route, navigation }) => {
  const { FlagSecure, ScreenRecord } = NativeModules;
  const { url, title } = route.params;
  const [user, setUser] = useState({ name: 'Peserta', paket: 'Premium' });
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [webKey, setWebKey] = useState(0);

  // 🔧 helper untuk convert link drive
  const formatUrl = rawUrl => {
    if (!rawUrl) return rawUrl;

    // Google Drive direct download → ubah jadi preview
    if (rawUrl.includes('drive.google.com')) {
      if (rawUrl.includes('uc?export=download')) {
        const fileId = rawUrl.match(/id=([^&]+)/)?.[1];
        if (fileId) {
          return `https://drive.google.com/file/d/${fileId}/preview`;
        }
      }
      if (rawUrl.includes('/view')) {
        return rawUrl.replace('/view', '/preview');
      }
    }

    return rawUrl; // selain itu, biarkan
  };

  // ✅ Proteksi screen capture
  useEffect(() => {
    FlagSecure.enable();
    return () => {
      FlagSecure.disable();
    };
  }, []);

  // ✅ Cek recording tiap 2 detik
  useEffect(() => {
    let interval = setInterval(async () => {
      try {
        const rec = await ScreenRecord.isRecording();
        if (rec) {
          // bisa tambahin aksi kalau ketahuan record
        }
      } catch (e) {
        console.log('check record err', e);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Ambil data user dari API /profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await Api.get('/profile');
        const profile = res.data.data;
        setUser({
          name: profile.nama || 'Peserta',
          paket: 'Premium',
        });
      } catch (err) {
        console.error('Gagal fetch profile:', err);
      }
    };
    fetchProfile();
  }, []);

  const disableCopyJS = useMemo(
    () => `document.addEventListener('contextmenu', e => e.preventDefault());`,
    [],
  );
  const disableUIJS = useMemo(
    () => `
    document.addEventListener('contextmenu', e => e.preventDefault());
    window.open = function() { return null };

    const observer = new MutationObserver(() => {
      const btn = document.querySelector('.ndfHFb-c4YZDc-Wrql6b'); 
      if (btn && !document.querySelector('#overlay-block')) {
        const rect = btn.getBoundingClientRect();
        const overlay = document.createElement('div');
        overlay.id = 'overlay-block';
        overlay.style.position = 'fixed';
        overlay.style.left = (rect.left - 20) + 'px';
        overlay.style.top = (rect.top - 20) + 'px';
        overlay.style.width = (rect.width + 40) + 'px';
        overlay.style.height = (rect.height + 40) + 'px';
        overlay.style.background = 'transparent'; // ✅ transparan
        overlay.style.zIndex = '999999';
        overlay.style.pointerEvents = 'auto'; // tetap blok klik di bawahnya
        document.body.appendChild(overlay);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Pastikan overlay ikut bergeser saat scroll
    window.addEventListener('scroll', () => {
      const btn = document.querySelector('.ndfHFb-c4YZDc-Wrql6b');
      const overlay = document.querySelector('#overlay-block');
      if (btn && overlay) {
        const rect = btn.getBoundingClientRect();
        overlay.style.left = (rect.left - 20) + 'px';
        overlay.style.top = (rect.top - 20) + 'px';
      }
    });
  `,
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

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setWebKey(prev => prev + 1);
      setRefreshing(false);
    }, 800);
  };

  // ✅ watermark langsung pakai nama dari API
  const watermarkText = `${user.name}•${user.name}`;
  const watermarks = Array.from({ length: 10 }, (_, i) => (
    <Text key={i} style={styles.watermarkText}>
      {watermarkText}
    </Text>
  ));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#9D2828' }}>
      <TouchableWithoutFeedback
        onPress={() => {
          if (dropdownVisible) setDropdownVisible(false);
          Keyboard.dismiss();
        }}
      >
        <View style={{ flex: 1 }}>
          <StatusBar barStyle="light-content" backgroundColor="#9D2828" />

          <Header navigation={navigation} showBack={true} />

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

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          >
            {url ? (
              <View style={{ flex: 1, minHeight: height - 150 }}>
                <WebView
                  key={webKey}
                  source={{ uri: formatUrl(url) }}
                  startInLoadingState
                  style={{ flex: 1 }}
                  javaScriptEnabled
                  //injectedJavaScriptBeforeContentLoaded={disableCopyJS}
                  //injectedJavaScript={disableCopyJS}
                  injectedJavaScript={disableUIJS}
                  injectedJavaScriptBeforeContentLoaded={disableUIJS}
                  onShouldStartLoadWithRequest={shouldStart}
                  onFileDownload={onFileDownload}
                  setSupportMultipleWindows={false}
                  javaScriptCanOpenWindowsAutomatically={false}
                  allowFileAccess={false}
                  allowsLinkPreview={false}
                  mediaPlaybackRequiresUserAction
                  originWhitelist={['https://*']}
                  nestedScrollEnabled
                  onLoadStart={() => setLoading(true)}
                  onLoadEnd={() => setLoading(false)}
                />

                {loading && (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#9D2828" />
                  </View>
                )}

                <View pointerEvents="none" style={styles.watermarkOverlay}>
                  {watermarks}
                </View>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Tidak ada materi tersedia</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  titleBar: { paddingHorizontal: 20 },
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  emptyContainer: {
    flex: 1,
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: { fontSize: 14, color: '#555' },
});

export default MateriViewer;
