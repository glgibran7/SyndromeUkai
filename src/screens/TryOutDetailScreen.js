import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';
import Api from '../utils/Api'; // pastikan pathnya sesuai

const TryOutDetailScreen = ({ route, navigation }) => {
  const { tryout } = route.params; // harus ada id_tryout di sini
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingStart, setLoadingStart] = useState(false);

  const handleStartPress = () => {
    setModalVisible(true);
  };

  const confirmStart = async () => {
    setLoadingStart(true);
    try {
      // Panggil API mulai attempt
      const startRes = await Api.post(`/tryout/${tryout.id}/attempts/start`);
      const attempt_token = startRes.data.data.attempt_token;

      // Ambil detail attempt
      const detailRes = await Api.get(
        `/tryout/${tryout.id}/attempts/${attempt_token}`,
      );
      const attemptData = detailRes.data.data;

      setModalVisible(false);
      setLoadingStart(false);

      // Navigasi ke ExamScreen dengan data tryout + attempt
      navigation.navigate('ExamScreen', {
        tryout: { ...tryout, attempt: attemptData },
      });
    } catch (error) {
      setLoadingStart(false);
      Alert.alert('Error', 'Gagal memulai tryout. Silakan coba lagi.');
      console.error('Gagal memulai tryout:', error);
    }
  };

  return (
    <LinearGradient colors={['#9D2828', '#191919']} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#9D2828" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pilihan Try Out</Text>
        <View style={{ width: 26 }} /> {/* Spacer */}
      </View>

      {/* Card Tryout */}
      <LinearGradient
        colors={['#B71C1C', '#7B0D0D']}
        style={styles.cardTryout}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons
          name="document-text-outline"
          size={40}
          color="#fff"
          style={{ marginRight: 12 }}
        />
        <View>
          <Text style={styles.tryoutTitle}>{tryout.nama}</Text>
          <Text style={styles.tryoutTime}>
            {tryout.waktuMulai} - {tryout.waktuSelesai}
          </Text>
          <Text style={styles.tryoutMentor}>{tryout.mentor}</Text>
        </View>
      </LinearGradient>

      {/* Deskripsi */}
      <View style={styles.descBox}>
        <Text style={styles.descTitle}>Deskripsi</Text>
        <Text style={styles.descText}>{tryout.deskripsi}</Text>
      </View>

      {/* Tombol Mulai */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartPress}
          disabled={loadingStart}
        >
          {loadingStart ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.startText}>Mulai</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Modal Konfirmasi */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !loadingStart && setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Konfirmasi</Text>
            <Text style={styles.modalMessage}>
              Setelah menekan Mulai, waktu pengerjaan akan berjalan dan mode
              fullscreen aktif. Pastikan Anda siap.
            </Text>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                onPress={() => !loadingStart && setModalVisible(false)}
                disabled={loadingStart}
              >
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirm]}
                onPress={confirmStart}
                disabled={loadingStart}
              >
                {loadingStart ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmText}>Mulai</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardTryout: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
  },
  tryoutTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tryoutTime: {
    color: '#fff',
    fontSize: 14,
    marginTop: 2,
  },
  tryoutMentor: {
    color: '#fff',
    fontSize: 12,
    marginTop: 2,
  },
  descBox: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    borderRadius: 12,
  },
  descTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  descText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    textAlign: 'justify',
  },
  footer: {
    marginTop: 'auto',
    marginBottom: 30,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#B71C1C',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 20,
    elevation: 4,
  },
  startText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#B71C1C',
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  modalCancel: {
    backgroundColor: '#ccc',
  },
  modalCancelText: {
    color: '#555',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalConfirm: {
    backgroundColor: '#B71C1C',
  },
  modalConfirmText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default TryOutDetailScreen;
