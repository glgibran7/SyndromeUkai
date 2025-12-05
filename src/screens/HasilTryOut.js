import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';
import Header from '../components/Header';
import Api from '../utils/Api';
import moment from 'moment';

const { height } = Dimensions.get('window');

const HasilTryoutScreen = ({ navigation }) => {
  const [hasilList, setHasilList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('Semua');
  const [isLoading, setIsLoading] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Ambil daftar id_tryout unik untuk filter + judul tryout
  const uniqueTryoutIds = [
    { id: 'Semua', title: 'Semua' },
    ...Array.from(new Set(hasilList.map(i => i.id_tryout))).map(id => {
      const firstItem = hasilList.find(item => item.id_tryout === id);
      return { id: id, title: firstItem?.judul_tryout || `Tryout ${id}` };
    }),
  ];

  useEffect(() => {
    fetchHasilTryout();
  }, []);

  useEffect(() => {
    let data = hasilList;

    if (searchQuery) {
      data = data.filter(item =>
        item.judul_tryout.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (filterType !== 'Semua') {
      data = data.filter(item => item.id_tryout === filterType);
    }

    setFilteredList(data);
  }, [searchQuery, filterType, hasilList]);

  const fetchHasilTryout = async () => {
    setIsLoading(true);
    try {
      const response = await Api.get('/hasil-tryout/peserta');
      setHasilList(response.data.data || []);
      setFilteredList(response.data.data || []);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Gagal memuat hasil tryout');
    } finally {
      setIsLoading(false);
    }
  };

  const selectFilter = id => {
    setFilterType(id);
    setFilterModalVisible(false);
  };

  return (
    <LinearGradient
      colors={['#9D2828', '#191919']}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <ScrollView style={{ flex: 1 }} stickyHeaderIndices={[0]}>
        <Header navigation={navigation} />

        <View style={styles.greetingBox}>
          <Text style={styles.sectionTitle}>Hasil Tryout</Text>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Cari judul tryout..."
              placeholderTextColor="#fff"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Ionicons name="search-outline" size={18} color="#fff" />
          </View>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.filterContainer}>
            <Text style={styles.sectionTitle2}>Filter Tryout</Text>

            <TouchableOpacity
              style={[styles.filterButton, styles.filterActive]}
              onPress={() => setFilterModalVisible(true)}
            >
              <Text style={[styles.filterText, styles.filterTextActive]}>
                {filterType === 'Semua'
                  ? 'Semua'
                  : uniqueTryoutIds.find(f => f.id === filterType)?.title ||
                    filterType}
              </Text>
              <Ionicons
                name="chevron-down"
                size={18}
                color="#fff"
                style={{ marginLeft: 5 }}
              />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={{ marginTop: 40 }}>
              <ActivityIndicator size="large" color="#B71C1C" />
              <Text
                style={{ textAlign: 'center', marginTop: 10, color: '#fff' }}
              >
                Memuat hasil tryout...
              </Text>
            </View>
          ) : filteredList.length === 0 ? (
            <Text style={{ textAlign: 'center', marginTop: 40, color: '#fff' }}>
              Tidak ada hasil tryout ditemukan.
            </Text>
          ) : (
            filteredList.map(item => (
              <TouchableOpacity
                key={item.id_hasiltryout}
                activeOpacity={0.8}
                style={styles.card}
                onPress={() =>
                  navigation.navigate('TryoutDetail', { id: item.id_tryout })
                }
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={styles.cardTitle}>{item.judul_tryout}</Text>
                  <Text style={styles.attemptText}>
                    Attempt Ke: {item.attempt_ke}
                  </Text>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 10,
                  }}
                >
                  <Text style={styles.score}>
                    {item.nilai?.toFixed(2) ?? '-'}
                  </Text>
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>
                      {item.status_pengerjaan.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.dateText}>
                  {moment(item.tanggal_pengerjaan).format('DD MMM YYYY, HH:mm')}
                </Text>

                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Benar</Text>
                    <Text style={[styles.detailValue, { color: '#4CAF50' }]}>
                      {item.benar}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Salah</Text>
                    <Text style={[styles.detailValue, { color: '#F44336' }]}>
                      {item.salah}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Kosong</Text>
                    <Text style={[styles.detailValue, { color: '#9E9E9E' }]}>
                      {item.kosong}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
      // ... kode sama seperti sebelumnya, hanya bagian modal dan style yang
      diupdate
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPressOut={() => setFilterModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Tryout</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={uniqueTryoutIds}
              keyExtractor={item => item.id.toString()}
              showsVerticalScrollIndicator={false}
              style={styles.modalList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalItem,
                    filterType === item.id && styles.modalItemSelected,
                  ]}
                  onPress={() => selectFilter(item.id)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      filterType === item.id && styles.modalItemTextSelected,
                    ]}
                  >
                    {item.title}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  greetingBox: {
    paddingHorizontal: 10,
    paddingTop: 10,
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
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginTop: 30,
    minHeight: height - 200,
    height: '100%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
    flexWrap: 'wrap',
  },
  sectionTitle2: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#000000ff',
    marginRight: 8,
    minWidth: 90,
  },

  filterText: {
    color: '#000000ff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 6,
  },

  filterActive: {
    backgroundColor: '#000000ff',
  },
  filterTextActive: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#FAFAFA',
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9D2828',
    flex: 1,
  },
  attemptText: {
    fontSize: 14,
    color: '#777',
    alignSelf: 'center',
  },
  score: {
    fontSize: 46,
    fontWeight: '900',
    color: '#9D2828',
  },
  statusBadge: {
    backgroundColor: '#9D2828',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginLeft: 12,
  },
  statusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  // Modal styles untuk filter dropdown sebagai modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    maxHeight: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#9D2828',
  },
  modalList: {
    // opsional styling jika ingin
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginVertical: 4,
    backgroundColor: '#F7F7F7',
  },
  modalItemSelected: {
    backgroundColor: '#9D2828',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  modalItemTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default HasilTryoutScreen;
