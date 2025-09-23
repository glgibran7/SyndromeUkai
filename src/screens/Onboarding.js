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
    images: MentorList,
  },
];

// 👇 Komponen untuk setiap slide
const SlideItem = ({ item, subIndex }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [item, subIndex]);

  return (
    <Animated.View style={[styles.slide, { opacity: fadeAnim }]}>
      {item.images ? (
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
    </Animated.View>
  );
};

const Onboarding = ({ navigation }) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  // auto-slide gambar di dalam slide tertentu
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

  return (
    <LinearGradient
      colors={['#9D2828', '#1a1a1a']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <FlatList
        ref={flatListRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <SlideItem item={item} subIndex={subIndex} />}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false },
        )}
        onMomentumScrollEnd={e => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
          setSubIndex(0);
        }}
      />

      {/* indikator dots */}
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => {
          const scale = scrollX.interpolate({
            inputRange: [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ],
            outputRange: [0.8, 1.4, 0.8],
            extrapolate: 'clamp',
          });
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
            <Animated.View
              key={index}
              style={[styles.dot, { transform: [{ scale }], opacity }]}
            />
          );
        })}
      </View>

      {/* tombol bawah */}
      <View style={styles.buttonRow}>
        {currentIndex < slides.length - 1 ? (
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>Lewati</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}

        <TouchableOpacity onPress={handleNext} activeOpacity={0.8}>
          <LinearGradient
            colors={['#ff6b6b', '#d90429']}
            style={styles.nextBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.nextText}>
              {currentIndex === slides.length - 1 ? 'Mulai' : 'Lanjut'}
            </Text>
          </LinearGradient>
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
    width: width * 0.7,
    height: height * 0.35,
    resizeMode: 'contain',
    marginBottom: 40,
  },
  title: {
    fontSize: 26,
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1,
  },
  desc: {
    fontSize: 16,
    color: '#ddd',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
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
    marginHorizontal: 6,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
    marginBottom: 40,
    alignItems: 'center',
  },
  skipText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  nextBtn: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 25,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  nextText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Onboarding;
