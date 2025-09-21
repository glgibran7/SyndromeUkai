import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Image,
  Animated,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { StackActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MentorList from '../components/MentorList';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Selamat Datang',
    desc: 'Belajar dengan mudah dan menyenangkan bersama UKAI',
    image: require('../img/coba.png'),
  },
  {
    id: '2',
    title: 'Materi Lengkap',
    desc: 'Kumpulan materi & video untuk menunjang persiapanmu',
    images: [
      require('../img/modul/modul_industri_sba.png'),
      require('../img/modul/modul_klinis.png'),
      require('../img/modul/modul_osce.png'),
    ],
  },
  {
    id: '3',
    title: 'Mentor',
    desc: 'Belajar langsung dari mentor berpengalaman',
    images: MentorList, // ⬅️ langsung pakai list dari file
  },
];

const Onboarding = ({ navigation }) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  // Auto-slide untuk gambar di slide Materi & Mentor
  const [subIndex, setSubIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      if (slides[currentIndex]?.images) {
        const total = slides[currentIndex].images.length;
        setSubIndex(prev => (prev + 1) % total);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleNext = async () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      await AsyncStorage.setItem('hasOnboarded', 'true');
      navigation.dispatch(StackActions.replace('Login'));
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem('hasOnboarded', 'true');
    navigation.dispatch(StackActions.replace('Login'));
  };

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      {item.images ? (
        // cek kalau array isinya object { image: ... }
        item.images[0]?.image ? (
          <Image source={item.images[subIndex].image} style={styles.image} />
        ) : (
          <Image source={item.images[subIndex]} style={styles.image} />
        )
      ) : (
        <Image source={item.image} style={styles.image} />
      )}
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.desc}>{item.desc}</Text>
    </View>
  );

  return (
    <LinearGradient
      colors={['#9D2828', '#191919']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        onMomentumScrollEnd={e => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
          setSubIndex(0); // reset tiap pindah slide
        }}
      />

      <View style={styles.dotsContainer}>
        {slides.map((_, index) => {
          const opacity = scrollX.interpolate({
            inputRange: [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ],
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View key={index} style={[styles.dot, { opacity }]} />
          );
        })}
      </View>

      <View style={styles.buttonRow}>
        {currentIndex < slides.length - 1 ? (
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>Lewati</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextText}>
            {currentIndex === slides.length - 1 ? 'Mulai' : 'Lanjut'}
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingTop: 40,
  },
  image: {
    width: width * 0.65,
    height: height * 0.32,
    resizeMode: 'contain',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  desc: {
    fontSize: 15,
    color: '#eee',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 15,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 25,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginHorizontal: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    marginBottom: 35,
  },
  skipText: {
    color: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 25,
    fontSize: 16,
    marginBottom: 20,
  },
  nextBtn: {
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 20,
    marginBottom: 20,
  },
  nextText: {
    color: '#9D2828',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Onboarding;
