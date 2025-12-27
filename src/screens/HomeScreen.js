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
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import Header from '../components/Header';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

const Home = ({ navigation }) => {
  const flatListRef = useRef(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { theme } = useContext(ThemeContext);

  const { user } = useContext(AuthContext);

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
    setRefreshing(false);
  };

  const menus = [
    {
      title: 'Materi',
      desc: 'Kumpulan Materi',
      icon: require('../../src/img/icon_folder.png'),
      backgroundColor: '#FFF8E3',
      to: 'Materi',
    },
    {
      title: 'Video',
      desc: 'Kumpulan Materi Video',
      icon: require('../../src/img/icon_video.png'),
      backgroundColor: '#FFF8E3',
      to: 'Video',
    },
    {
      title: 'TryOut',
      desc: 'Kumpulan soal-soal',
      icon: require('../../src/img/icon_file.png'),
      backgroundColor: '#FFF8F8',
      to: 'TryOut',
    },
    {
      title: 'Hasil Try Out',
      desc: 'Kumpulan Hasil Try Out',
      icon: require('../../src/img/icon_pesan.png'),
      backgroundColor: '#FFEAEA',
      to: 'Hasil',
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <LinearGradient
        colors={theme.gradient.colors}
        start={theme.gradient.start}
        end={theme.gradient.end}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Header navigation={navigation} />

          {/* Greeting */}
          <View style={styles.greetingBox}>
            <Text style={[styles.greeting, { color: theme.greetingText }]}>
              Hi, {user?.name}
            </Text>

            <Text style={[styles.subtext, { color: theme.greetingText }]}>
              Langkah kecil hari ini menjadi lompatan besar esok hari.
            </Text>
          </View>

          {/* Content */}
          <View style={[styles.mainContent, { backgroundColor: theme.card }]}>
            {/* Menu */}
            <Text style={[styles.sectionTitle, { color: theme.sectionTitle }]}>
              Daftar Menu
            </Text>

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

                  <Image source={item.icon} style={styles.menuIcon} />
                </TouchableOpacity>
              ))}
            </View>

            {/* Mentor */}
            <Text style={[styles.sectionTitle, { color: theme.sectionTitle }]}>
              Daftar Mentor
            </Text>

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
                      width: isTablet ? width * 0.22 : width * 0.45,
                      height: isTablet ? width * 0.28 : width * 0.55,
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
    paddingVertical: isTablet ? 25 : 12,
    paddingHorizontal: 15,
  },
  greeting: {
    fontSize: isTablet ? 34 : 22,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  subtext: {
    fontSize: isTablet ? 18 : 13,
    color: '#fff',
    marginTop: 6,
    textAlign: 'center',
  },
  mainContent: {
    backgroundColor: 'white',
    paddingVertical: isTablet ? 45 : 25,
    paddingHorizontal: isTablet ? 40 : 20,
    marginTop: 20,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  sectionTitle: {
    fontSize: isTablet ? 28 : 18,
    fontWeight: 'bold',
    marginBottom: isTablet ? 28 : 15,
    color: '#000',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: isTablet ? width * 0.28 : width * 0.44,
    borderRadius: 20,
    padding: isTablet ? 25 : 15,
    marginBottom: isTablet ? 30 : 18,
  },
  menuTitle: {
    fontWeight: 'bold',
    fontSize: isTablet ? 22 : 16,
    color: '#700101',
  },
  menuDesc: {
    fontSize: isTablet ? 18 : 13,
    color: '#555',
    marginTop: 5,
  },
  menuIcon: {
    width: isTablet ? 75 : 50,
    height: isTablet ? 75 : 50,
    resizeMode: 'contain',
    alignSelf: 'flex-end',
    marginTop: isTablet ? 15 : 10,
  },
});

export default Home;
