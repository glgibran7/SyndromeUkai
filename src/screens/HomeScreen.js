import React, { useEffect, useRef, useState, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { FlatList } from 'react-native';
import MentorList from '../components/MentorList';
import { AuthContext } from '../context/AuthContext'; // 🔥 gunakan context
import Header from '../components/Header';

const { width } = Dimensions.get('window');

const Home = ({ navigation }) => {
  const flatListRef = useRef(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { user } = useContext(AuthContext); // 🔥 ambil langsung dari AuthContext

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % MentorList.length;

      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });

      setCurrentIndex(nextIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const onRefresh = async () => {
    setRefreshing(true);
    // kalau mau sync dari API, bisa panggil ulang di AuthContext
    setRefreshing(false);
  };

  const menus = [
    {
      title: 'Materi',
      desc: 'Kumpulan Materi',
      icon: require('../../src/img/icon_folder.png'),
      backgroundColor: '#FFF8E3',
      wave: require('../../src/img/wave2.png'),
      to: 'Materi',
    },
    {
      title: 'Video',
      desc: 'Kumpulan Materi Video',
      icon: require('../../src/img/icon_video.png'),
      backgroundColor: '#FFF8E3',
      wave: require('../../src/img/wave3.png'),
      to: 'Video',
    },
    {
      title: 'TryOut',
      desc: 'Kumpulan soal-soal',
      icon: require('../../src/img/icon_file.png'),
      backgroundColor: '#FFF8F8',
      wave: require('../../src/img/wave1.png'),
      to: 'TryOut',
    },
    {
      title: 'Hasil Try Out',
      desc: 'Kumpulan Hasil Try Out',
      icon: require('../../src/img/icon_pesan.png'),
      backgroundColor: '#FFEAEA',
      wave: require('../../src/img/wave4.png'),
      to: 'Hasil',
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#9D2828' }}>
      <LinearGradient
        colors={['#9D2828', '#191919']}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Header */}
          <Header navigation={navigation} />

          {/* Greeting */}
          <View style={styles.greetingBox}>
            <Text style={styles.greeting}>Hi, {user?.name}</Text>
            <Text style={styles.subtext}>
              Langkah kecil hari ini, lompatan besar untuk hari esok.
            </Text>
          </View>

          {/* Content */}
          <View style={styles.mainContent}>
            {/* Menu */}
            <Text style={styles.sectionTitle}>Daftar Menu</Text>
            <View style={styles.menuGrid}>
              {menus.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.menuItem,
                    { backgroundColor: item.backgroundColor },
                  ]}
                  onPress={() => navigation.navigate(item.to)}
                >
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuDesc}>{item.desc}</Text>
                  <View style={styles.menuIconContainer}>
                    <Image source={item.icon} style={styles.menuIcon} />
                  </View>
                  <Image source={item.wave} style={styles.waveImage} />
                </TouchableOpacity>
              ))}
            </View>

            {/* Mentor */}
            <Text style={styles.sectionTitle}>Daftar Mentor</Text>
            <FlatList
              ref={flatListRef}
              data={MentorList}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={{ marginRight: 15 }}>
                  <Image
                    source={item.image}
                    style={{
                      width: width * 0.4,
                      height: width * 0.5,
                      resizeMode: 'contain',
                    }}
                  />
                </View>
              )}
            />
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  greetingBox: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  greeting: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  subtext: {
    fontSize: 13,
    color: '#fff',
    marginTop: 5,
    textAlign: 'center',
  },
  mainContent: {
    backgroundColor: 'white',
    paddingVertical: 25,
    paddingHorizontal: 20,
    marginTop: 20,
    height: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: width * 0.42,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  menuTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#700101',
  },
  menuDesc: {
    fontSize: 13,
    color: '#555',
    marginTop: 5,
  },
  menuIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  waveImage: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: 'auto',
    height: 80,
    resizeMode: 'cover',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    zIndex: -1,
  },
});

export default Home;
