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
  TouchableWithoutFeedback,
  Keyboard,
  SafeAreaView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Api from '../utils/Api';
import Ionicons from '@react-native-vector-icons/ionicons';
import Header from '../components/Header';

const { height, width } = Dimensions.get('window');

const MateriListScreen = ({ route, navigation }) => {
  const { id_modul } = route.params;
  const [materiList, setMateriList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('Semua');
  const [user, setUser] = useState({ name: 'Peserta', paket: 'Premium' });
  const [dropdownVisible, setDropdownVisible] = useState(false);

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
    <TouchableWithoutFeedback
      onPress={() => {
        if (dropdownVisible) setDropdownVisible(false);
        Keyboard.dismiss();
      }}
    >
      <LinearGradient
        colors={['#9D2828', '#191919']}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <ScrollView style={{ flex: 1 }} stickyHeaderIndices={[0]}>
          {/* Header */}
          <Header navigation={navigation} showBack={true} />

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
                <TouchableOpacity
                  key={item.id_materi}
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate('MateriViewer', {
                      url: item.url_file,
                      title: item.judul,
                    })
                  }
                >
                  <LinearGradient
                    colors={['#B71C1C', '#7B0D0D']}
                    style={styles.menuItem}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
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
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  greetingBox: { paddingHorizontal: 10 },
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
  searchInput: { flex: 1, height: 40, color: '#000' },
  mainContent: {
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 10,
    marginTop: 30,
    minHeight: height - 200,
    height: '100%',
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
    marginRight: 10,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#000000ff',
  },
  filterText: { color: '#000000ff', fontSize: 12 },
  filterActive: { backgroundColor: '#000000ff' },
  filterTextActive: { color: '#fff' },
  menuGrid: { flexDirection: 'column', gap: 10 },
  menuItem: { borderRadius: 15, padding: 15 },
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
