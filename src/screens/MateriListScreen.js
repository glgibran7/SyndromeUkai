import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Api from '../utils/Api';
import Ionicons from '@react-native-vector-icons/ionicons';

const { height } = Dimensions.get('window');

const { width } = Dimensions.get('window');

const MateriListScreen = ({ route, navigation }) => {
  const { id_modul } = route.params;
  const [materiList, setMateriList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('Semua');
  const [user, setUser] = useState({
    name: 'Peserta',
    paket: 'Premium',
  });

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

    const getMateri = async () => {
      try {
        const res = await Api.get('/materi/peserta');
        if (res.data.status === 'success') {
          const filtered = res.data.data.filter(
            m => m.id_modul === id_modul && m.tipe_materi === 'document',
          );
          setMateriList(filtered);
          setFilteredList(filtered);
        }
      } catch (error) {
        console.error('Gagal mengambil data materi:', error);
      }
    };

    getUserData();
    getMateri();
  }, [id_modul]);

  // Search & filter
  useEffect(() => {
    let data = materiList;

    if (searchQuery) {
      data = data.filter(item =>
        item.judul.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (filterType === 'Baru') {
      data = data.filter(item => !item.viewer_only);
    }

    setFilteredList(data);
  }, [searchQuery, filterType, materiList]);

  return (
    <LinearGradient
      colors={['#9D2828', '#191919']}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" backgroundColor="#a10505" />
      <ScrollView style={{ flex: 1 }}>
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
              <Text style={styles.avatarText}>
                {user.name.split(' ')[0][0]}
              </Text>
            </View>
          </View>
        </View>

        {/* Title & Search */}
        <View style={styles.greetingBox}>
          <Text style={styles.sectionTitle}>Materi</Text>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor="#fff"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Ionicons name="search-outline" size={18} color="#fff" />
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Filter */}
          <View style={styles.filterContainer}>
            <Text style={styles.sectionTitle2}>Daftar Materi</Text>

            <TouchableOpacity
              style={[
                styles.filterButton,
                filterType === 'Semua' && styles.filterActive,
              ]}
              onPress={() => setFilterType('Semua')}
            >
              <Text
                style={[
                  styles.filterText,
                  filterType === 'Semua' && styles.filterTextActive,
                ]}
              >
                Semua
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterButton,
                filterType === 'Baru' && styles.filterActive,
              ]}
              onPress={() => setFilterType('Baru')}
            >
              <Text
                style={[
                  styles.filterText,
                  filterType === 'Baru' && styles.filterTextActive,
                ]}
              >
                Baru Dibaca
              </Text>
            </TouchableOpacity>
          </View>

          {/* List Card */}
          <View style={styles.menuGrid}>
            {filteredList.map(item => (
              <LinearGradient
                key={item.id_materi}
                colors={['#B71C1C', '#7B0D0D']}
                style={styles.menuItem}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons
                    name="document-text-outline"
                    size={28}
                    color="#fff"
                    style={{ marginRight: 10 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.menuTitle}>{item.judul}</Text>
                    <Text style={styles.menuDesc}>{item.tipe_materi}</Text>
                  </View>
                </View>
              </LinearGradient>
            ))}
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    width: width * 0.25,
    height: width * 0.25,
    resizeMode: 'contain',
    marginLeft: -80,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  greetingBox: {
    marginTop: -5,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0b1',
    borderRadius: 15,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#000',
  },
  mainContent: {
    backgroundColor: 'white',
    paddingVertical: 25,
    paddingHorizontal: 20,
    marginTop: 30,
    minHeight: height - 200,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  sectionTitle2: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 10, // jarak ke tombol filter
  },

  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#000000ff',
  },
  filterText: {
    color: '#000000ff',
    fontSize: 12,
  },
  filterActive: {
    backgroundColor: '#000000ff',
  },
  filterTextActive: {
    color: '#fff',
  },
  menuGrid: {
    flexDirection: 'column',
    gap: 10,
  },
  menuItem: {
    borderRadius: 15,
    padding: 15,
  },
  menuTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
    textTransform: 'capitalize',
  },
  menuDesc: {
    fontSize: 12,
    color: '#fff',
    marginTop: 2,
    textTransform: 'capitalize',
  },
});

export default MateriListScreen;
