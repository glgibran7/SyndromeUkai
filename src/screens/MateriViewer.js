import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Text,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Ionicons from '@react-native-vector-icons/ionicons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/Header';

const { width, height } = Dimensions.get('window');

const MateriViewer = ({ route, navigation }) => {
  const { url, title } = route.params;
  const [user, setUser] = useState({ name: 'Peserta', paket: 'Premium' });
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [loading, setLoading] = useState(true); // state loading
  const insets = useSafeAreaInsets();

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

  const disableCopyJS = useMemo(() => `...`, []);

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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#9D2828' }}>
      <TouchableWithoutFeedback
        onPress={() => {
          if (dropdownVisible) setDropdownVisible(false);
          Keyboard.dismiss();
        }}
      >
        <View style={{ flex: 1 }}>
          <StatusBar barStyle="light-content" backgroundColor="#9D2828" />

          {/* Header */}
          <Header navigation={navigation} showBack={true} />

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
              nestedScrollEnabled={true}
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
            />

            {/* Loading Spinner */}
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#9D2828" />
              </View>
            )}

            {/* Watermark */}
            <View pointerEvents="none" style={styles.watermarkOverlay}>
              {watermarks}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  titleBar: {
    paddingHorizontal: 20,
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
});

export default MateriViewer;
