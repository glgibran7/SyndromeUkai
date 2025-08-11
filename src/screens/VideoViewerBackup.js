import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Video from 'react-native-video';
import Ionicons from '@react-native-vector-icons/ionicons';

const { width, height } = Dimensions.get('window');

const VideoViewer = ({ route, navigation }) => {
  const { url, title, views, time, channel, avatar } = route.params;
  const [user, setUser] = useState({ name: 'Peserta', paket: 'Premium' });

  useEffect(() => {
    const getUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser({
            name: parsedUser.nama || 'Peserta',
            paket: 'Premium',
          });
        }
      } catch (error) {
        console.error('Gagal mengambil data user:', error);
      }
    };
    getUserData();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="light-content" backgroundColor="#a10505" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Image
          source={require('../../src/img/logo_putih.png')}
          style={styles.logo}
        />
        <View style={styles.userInfo}>
          <View style={styles.paketBadge}>
            <Text style={styles.paketText}>🥇 {user.paket}</Text>
          </View>
          <View style={styles.avatarInitial}>
            <Text style={styles.avatarText}>{user.name.split(' ')[0][0]}</Text>
          </View>
        </View>
      </View>

      {/* Video Player */}
      <Video
        source={{ uri: url }}
        style={styles.video}
        controls
        resizeMode="contain"
        paused={false}
      />

      {/* Konten Video */}
      <ScrollView style={styles.content}>
        <Text style={styles.videoTitle}>{title}</Text>
        <Text style={styles.meta}>
          {views} views • {time}
        </Text>

        {/* Channel Info */}
        <View style={styles.channelRow}>
          <Image source={{ uri: avatar }} style={styles.channelAvatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.channelName}>{channel}</Text>
            <Text style={styles.subscribers}>120K subscribers</Text>
          </View>
          <TouchableOpacity style={styles.subscribeBtn}>
            <Text style={styles.subscribeText}>Subscribe</Text>
          </TouchableOpacity>
        </View>

        {/* Deskripsi */}
        <Text style={styles.description}>
          Ini adalah deskripsi video. Kamu bisa memuat informasi tambahan di
          sini seperti ringkasan materi, instruksi, atau link penting.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#9D2828',
    paddingBottom: 10,
  },
  logo: {
    width: width * 0.25,
    height: width * 0.25,
    resizeMode: 'contain',
    marginLeft: -80,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
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
  paketBadge: {
    backgroundColor: '#feb600',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  paketText: { fontSize: 12, color: '#fff', fontWeight: 'bold' },
  video: { width: '100%', height: height * 0.3, backgroundColor: '#000' },
  content: { padding: 15 },
  videoTitle: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  meta: { fontSize: 12, color: '#555', marginTop: 2, marginBottom: 10 },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  channelAvatar: {
    width: 45,
    height: 45,
    borderRadius: 50,
    backgroundColor: '#ddd',
    marginRight: 10,
  },
  channelName: { fontSize: 14, fontWeight: 'bold', color: '#000' },
  subscribers: { fontSize: 12, color: '#666' },
  subscribeBtn: {
    backgroundColor: '#cc0000',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
  },
  subscribeText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  description: { fontSize: 13, color: '#333', marginTop: 10, lineHeight: 18 },
});

export default VideoViewer;
