import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Modal,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  Alert,
  RefreshControl,
  BackHandler,
  NativeModules,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';
import CheckBox from '@react-native-community/checkbox';
import CalculatorModal from './CalculatorModal';
import Api from '../utils/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RenderHtml from 'react-native-render-html';
import AppModal from './AppModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ExamScreen = ({ navigation, route }) => {
  const { FlagSecure, ScreenRecord } = NativeModules;

  const [refreshing, setRefreshing] = useState(false);

  const { tryout, attempt } = route.params;
  const [updatedAttemptData, setUpdatedAttemptData] = useState(attempt);

  const [showCalc, setShowCalc] = useState(false);
  const [markDoubt, setMarkDoubt] = useState(false);
  const [listVisible, setListVisible] = useState(false);
  const [calcVisible, setCalcVisible] = useState(false);
  const [userName, setUserName] = useState('Peserta');

  const [questions, setQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

  const [answersStatus, setAnswersStatus] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isPrefilled, setIsPrefilled] = useState(false);
  // Timer dan lainnya (tetap sama)
  const [scoreVisible, setScoreVisible] = useState(false);
  const [score, setScore] = useState(0);
  // Timer State
  const [timeLeft, setTimeLeft] = useState(null);
  const [serverOffset, setServerOffset] = useState(0);
  // State baru untuk modal hasil tryout
  const [result, setResult] = useState(null);
  const [resultModalVisible, setResultModalVisible] = useState(false);

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [emptyCount, setEmptyCount] = useState(0);
  const [doubtCount, setDoubtCount] = useState(0);

  const [confirmExitVisible, setConfirmExitVisible] = useState(false);

  // ✅ Proteksi screen capture
  useEffect(() => {
    FlagSecure.enable();
    return () => {
      FlagSecure.disable();
    };
  }, []);

  // ✅ Cek recording tiap 2 detik
  useEffect(() => {
    let interval = setInterval(async () => {
      try {
        const rec = await ScreenRecord.isRecording();
        if (rec) {
          // bisa tambahin aksi kalau ketahuan record
        }
      } catch (e) {
        console.log('check record err', e);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await Api.get('/profile');
        const profile = res.data.data;
        setUserName(profile?.nama || 'Peserta');
      } catch (err) {
        console.error('Gagal ambil profile:', err);
      }
    };
    fetchProfile();

    const unsubscribe = navigation.addListener('focus', fetchProfile);
    return unsubscribe;
  }, [navigation]);

  // Simpan ke AsyncStorage saat answersStatus berubah
  useEffect(() => {
    const saveProgress = async () => {
      try {
        await AsyncStorage.setItem(
          `@tryout_progress_${attempt.attempt_token}`,
          JSON.stringify(answersStatus),
        );
      } catch (e) {
        console.error('Gagal simpan progress:', e);
      }
    };
    saveProgress();
  }, [answersStatus]);

  const refreshAttempt = async () => {
    try {
      const res = await Api.post(`/tryout/${tryout.id_tryout}/attempts/start`);
      return res.data.data; // balikan attempt fresh dari server
    } catch (err) {
      console.error('Gagal refresh attempt:', err);
      return attempt; // fallback
    }
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoadingQuestions(true);

      try {
        // 🔥 Always fetch latest attempt data
        const updatedAttempt = await refreshAttempt();
        setUpdatedAttemptData(updatedAttempt);

        const response = await Api.get(`/tryout/${tryout.id_tryout}/questions`);
        const fetchedQuestions = response.data.data || [];

        setQuestions(fetchedQuestions);

        const jawabanUser = updatedAttempt.jawaban_user || {};

        const newAnswersStatus = fetchedQuestions.map(q => {
          const opsiKeys = Object.keys(q.opsi || {});
          const key = `soal_${q.nomor_urut}`;

          const jawaban = jawabanUser[key]?.jawaban?.toUpperCase() || null;
          const ragu = jawabanUser[key]?.ragu === 1;

          const selectedIndex = opsiKeys.findIndex(o => o === jawaban);

          return {
            answered: selectedIndex !== -1,
            doubt: ragu,
            selectedOption: selectedIndex !== -1 ? selectedIndex : null,
          };
        });

        setAnswersStatus(newAnswersStatus);

        // ⬇️ Pastikan UI langsung reflect jawaban soal pertama
        setCurrentQuestionIndex(0);
        setMarkDoubt(newAnswersStatus[0]?.doubt || false);
      } catch (error) {
        console.error('Gagal mengambil soal:', error);
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);

    try {
      const updatedAttempt = await refreshAttempt();
      setUpdatedAttemptData(updatedAttempt);

      const response = await Api.get(`/tryout/${tryout.id_tryout}/questions`);
      const fetchedQuestions = response.data.data || [];
      setQuestions(fetchedQuestions);

      const jawabanUser = updatedAttempt.jawaban_user || {};

      const newAnswersStatus = fetchedQuestions.map(q => {
        const opsiKeys = Object.keys(q.opsi || {});
        const key = `soal_${q.nomor_urut}`;

        const jawaban = jawabanUser[key]?.jawaban?.toUpperCase() || null;
        const ragu = jawabanUser[key]?.ragu === 1;

        const selectedIndex = opsiKeys.findIndex(o => o === jawaban);

        return {
          answered: selectedIndex !== -1,
          doubt: ragu,
          selectedOption: selectedIndex !== -1 ? selectedIndex : null,
        };
      });

      setAnswersStatus(newAnswersStatus);
    } catch (err) {
      console.log('Refresh gagal:', err);
    }

    setRefreshing(false);
  };

  useEffect(() => {
    if (!updatedAttemptData) return; // <-- pakai state baru

    const serverNow = new Date(
      updatedAttemptData.updated_at || updatedAttemptData.start_time,
    ).getTime();

    const deviceNow = Date.now();
    setServerOffset(serverNow - deviceNow);

    const endTime = new Date(updatedAttemptData.end_time).getTime();
    const remainSeconds = Math.max(Math.floor((endTime - serverNow) / 1000), 0);

    setTimeLeft(remainSeconds);
  }, [updatedAttemptData]);

  useEffect(() => {
    const backAction = () => {
      setConfirmExitVisible(true);
      return true; // cegah keluar langsung
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      submitAttempt();
      return;
    }

    const interval = setInterval(() => {
      const nowCorrected = Date.now() + serverOffset;
      const endTime = new Date(attempt.end_time).getTime();
      const remain = Math.max(Math.floor((endTime - nowCorrected) / 1000), 0);

      setTimeLeft(remain);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatTime = sec => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;

    return `${h.toString().padStart(2, '0')}:${m
      .toString()
      .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    setMarkDoubt(answersStatus[currentQuestionIndex]?.doubt || false);
  }, [currentQuestionIndex, answersStatus]);

  useEffect(() => {
    const newStatus = [...answersStatus];
    newStatus[currentQuestionIndex] = {
      ...newStatus[currentQuestionIndex],
      doubt: markDoubt,
    };
    setAnswersStatus(newStatus);
  }, [markDoubt]);

  const currentQuestion = questions[currentQuestionIndex] || {};

  // Convert opsi object to array [{key:'A', text:'...'}, ...]
  const optionsArray = currentQuestion.opsi
    ? Object.entries(currentQuestion.opsi).map(([key, value]) => ({
        key,
        text: value,
      }))
    : [];

  // Pilih opsi dan kirim ke API
  const selectOption = async idx => {
    const newStatus = [...answersStatus];
    newStatus[currentQuestionIndex] = {
      ...newStatus[currentQuestionIndex],
      answered: true,
      selectedOption: idx,
      doubt: markDoubt,
    };
    setAnswersStatus(newStatus);

    try {
      await Api.put('/tryout/attempts/answer', {
        attempt_token: attempt.attempt_token,
        nomor: currentQuestion.nomor_urut,
        jawaban: optionsArray[idx]?.key,
        ragu: markDoubt ? 1 : 0,
      });
    } catch (error) {
      console.error('Gagal simpan jawaban:', error.response || error.message);
      Alert.alert('Error', 'Gagal menyimpan jawaban. Silakan coba lagi.');
    }
  };

  const submitAttempt = async () => {
    try {
      const response = await Api.post('/tryout/attempts/submit', {
        attempt_token: attempt.attempt_token,
      });

      if (response.data.status === 'success') {
        setResult(response.data.result);
        setResultModalVisible(true);
      } else {
        Alert.alert('Error', 'Gagal submit jawaban, coba lagi.');
      }
    } catch (error) {
      console.error('Gagal submit jawaban:', error.response || error.message);
      Alert.alert('Error', 'Gagal submit jawaban, coba lagi.');
    }
  };

  const watermarkText = `${userName} • ${userName} • ${userName}• ${userName}• ${userName}`;
  const watermarks = Array.from({ length: 48 }, (_, i) => (
    <Text key={i} style={styles.watermarkText}>
      {watermarkText}
    </Text>
  ));

  if (isLoadingQuestions) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#9D2828',
        }}
      >
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ color: '#fff', marginTop: 10 }}>Memuat soal...</Text>
      </SafeAreaView>
    );
  }

  if (!questions.length) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#9D2828',
        }}
      >
        <Text style={{ color: '#fff' }}>Soal tidak tersedia.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#9D2828' }}>
      <LinearGradient colors={['#9D2828', '#191919']} style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" backgroundColor="#9D2828" />
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            <Text style={styles.title}>{tryout.judul || 'Tryout'}</Text>
            <View style={styles.timerBox}>
              <Text
                style={[
                  styles.timerText,
                  timeLeft < 300 && { color: '#FF3B30' },
                ]}
              >
                {formatTime(timeLeft)}
              </Text>
            </View>
          </View>

          <ScrollView
            style={styles.container}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#fff"
                colors={['#9D2828']}
              />
            }
          >
            <View pointerEvents="none" style={styles.watermarkOverlay}>
              {watermarks}
            </View>
            <View style={styles.questionHeader}>
              <Text style={styles.questionTitle}>
                Soal {currentQuestionIndex + 1} dari {questions.length}
              </Text>

              <View style={styles.buttonsRow}>
                <TouchableOpacity
                  style={styles.calcButton}
                  onPress={() => setCalcVisible(true)}
                >
                  <Ionicons
                    name="calculator-outline"
                    size={16}
                    color="#2E7D32"
                  />
                  <Text style={styles.calcText}>Kalkulator</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.listButton}
                  onPress={() => setListVisible(true)}
                >
                  <Text style={styles.listText}>Daftar Soal</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Render pertanyaan dengan HTML */}
            <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
              <RenderHtml
                contentWidth={SCREEN_WIDTH - 32}
                source={{ html: currentQuestion.pertanyaan || '' }}
                tagsStyles={{
                  p: {
                    fontSize: 14,
                    lineHeight: 20,
                    color: '#000',
                    textAlign: 'justify',
                  },
                  img: {
                    width: '100%', // selalu full width container
                    maxWidth: SCREEN_WIDTH - 32, // batas maksimal lebar
                    maxHeight: 220, // batasi tinggi gambar
                    marginVertical: 10,
                  },
                }}
                enableExperimentalMarginCollapsing={true}
                enableExperimentalBRCollapsing={true}
              />
            </View>

            {optionsArray.map((opt, idx) => {
              const userAnswer =
                answersStatus[currentQuestionIndex]?.selectedOption;
              const isSelected = userAnswer === idx;

              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.optionBox,
                    isSelected && styles.optionSelected,
                  ]}
                  onPress={() => selectOption(idx)}
                >
                  <View style={styles.radioCircle}>
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                  <Text style={styles.optionText}>
                    <Text style={styles.optionLabel}>{opt.key}. </Text>
                    {opt.text}
                  </Text>
                </TouchableOpacity>
              );
            })}

            <View style={styles.doubtRow}>
              <CheckBox
                value={markDoubt}
                onValueChange={setMarkDoubt}
                tintColors={{ true: '#FFA000', false: '#FFA000' }}
              />
              <Text style={styles.doubtText}>Tandai Ragu-ragu</Text>
            </View>
          </ScrollView>

          <SafeAreaView edges={['bottom']} style={styles.footerSafeArea}>
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setCurrentQuestionIndex(i => Math.max(0, i - 1))}
                disabled={currentQuestionIndex === 0}
              >
                <Text style={styles.backText}>Soal Sebelumnya</Text>
              </TouchableOpacity>
              <View style={{ width: 16 }} />
              <TouchableOpacity
                style={styles.nextButton}
                onPress={() => {
                  if (currentQuestionIndex < questions.length - 1) {
                    setCurrentQuestionIndex(i => i + 1);
                  } else {
                    // hitung sisa kosong & ragu
                    const empty = answersStatus.filter(
                      a => !a?.answered,
                    ).length;
                    const doubt = answersStatus.filter(a => a?.doubt).length;

                    setEmptyCount(empty);
                    setDoubtCount(doubt);
                    setConfirmModalVisible(true);
                  }
                }}
              >
                <Text style={styles.nextText}>
                  {currentQuestionIndex < questions.length - 1
                    ? 'Soal Selanjutnya'
                    : 'Selesai'}
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          <CalculatorModal
            visible={calcVisible}
            onClose={() => setCalcVisible(false)}
          />

          {/* Modal Daftar Soal */}
          <Modal
            visible={listVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setListVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.listModal}>
                <Text style={styles.listTitle}>Pilih Nomor Soal</Text>

                <ScrollView contentContainerStyle={styles.gridContainer}>
                  {questions.map((q, idx) => {
                    const status = answersStatus[idx];
                    let bgColor = '#fff';
                    if (status?.doubt) bgColor = '#FFF9C4';
                    else if (status?.answered) bgColor = '#C8E6C9';

                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.gridItem,
                          { backgroundColor: bgColor },
                          idx === currentQuestionIndex && {
                            backgroundColor: '#1565C0', // << WARNA BARU
                            borderWidth: 2,
                            borderColor: '#000',
                          },
                        ]}
                        onPress={() => {
                          setCurrentQuestionIndex(idx);
                          setListVisible(false);
                        }}
                      >
                        <Text
                          style={{
                            fontWeight: 'bold',
                            color:
                              idx === currentQuestionIndex ? '#fff' : '#000', // auto adjust
                          }}
                        >
                          {idx + 1}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                <TouchableOpacity
                  style={styles.closeGridBtn}
                  onPress={() => setListVisible(false)}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                    Tutup
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Modal Konfirmasi Submit */}
          <AppModal
            visible={confirmModalVisible}
            type="submitConfirm"
            title="Selesaikan Tryout?"
            message={`Ada ${emptyCount} soal kosong dan ${doubtCount} ragu - yakin selesai?`}
            onClose={() => setConfirmModalVisible(false)}
            onConfirm={() => {
              setConfirmModalVisible(false);
              submitAttempt();
            }}
          />

          {/* Modal Konfirmasi Keluar */}
          <AppModal
            visible={confirmExitVisible}
            type="exitConfirm"
            title="Keluar dari tryout?"
            message="Tekan Lanjut jika ingin mengakhiri tryout dan mengirim jawaban Anda."
            onClose={() => setConfirmExitVisible(false)}
            onConfirm={() => {
              setConfirmExitVisible(false);
              submitAttempt();
            }}
          />

          {/* Modal Hasil Tryout */}
          <AppModal
            visible={resultModalVisible}
            type="result"
            title="Hasil Tryout"
            onConfirm={() => {
              setResultModalVisible(false);
              navigation.reset({
                index: 0,
                routes: [{ name: 'TryOutScreen' }],
              });
            }}
          >
            <View style={{ marginTop: 12, alignItems: 'center' }}>
              <Text
                style={{ fontSize: 40, fontWeight: 'bold', color: '#9D2828' }}
              >
                {result?.nilai ?? '-'}
              </Text>

              <View style={{ marginTop: 16 }}>
                <Text>Benar: {result?.benar}</Text>
                <Text>Salah: {result?.salah}</Text>
                <Text>Total Soal: {result?.total_soal}</Text>
              </View>
            </View>
          </AppModal>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 50,
    padding: 16,
    alignItems: 'center',
  },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  timerBox: {
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timerText: { color: '#000', fontWeight: 'bold', fontSize: 14 },
  container: { flex: 1, backgroundColor: '#fff' },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  questionTitle: { fontWeight: 'bold', fontSize: 16 },
  buttonsRow: { flexDirection: 'row', gap: 8 },
  calcButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2E7D32',
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#E8F5E9',
  },
  calcText: {
    marginLeft: 4,
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: 'bold',
  },
  listButton: {
    borderWidth: 1,
    borderColor: '#1565C0',
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#E3F2FD',
  },
  listText: { color: '#1565C0', fontSize: 12, fontWeight: 'bold' },
  optionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  optionSelected: { borderColor: '#9D2828', backgroundColor: '#FFEDED' },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#555',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#9D2828',
  },
  optionText: { fontSize: 14, color: '#000' },
  doubtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  doubtText: { marginLeft: 8, fontSize: 14, color: '#333' },
  footerSafeArea: {
    backgroundColor: '#9D2828',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
    backgroundColor: '#9D2828',
  },
  backButton: {
    flex: 1,
    backgroundColor: '#FFC107',
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#9D2828',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fff',
    alignItems: 'center',
  },
  backText: { color: '#000', fontWeight: 'bold' },
  nextText: { color: '#fff', fontWeight: 'bold' },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '100%',
    maxWidth: 320,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#9D2828',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  watermarkOverlay: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    bottom: 0,
    flexWrap: 'wrap',
    flexDirection: 'row',
    opacity: 0.06,
    zIndex: 0,
  },
  watermarkText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#9D2828',
    marginRight: 20,
    marginBottom: 8,
  },
  numberButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    margin: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#555',
  },
  numberButtonActive: {
    backgroundColor: '#9D2828',
  },
  numberText: {
    color: '#000',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  resultModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 28,
    width: '90%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 15,
    alignItems: 'center',
  },
  resultModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#9D2828',
    letterSpacing: 1,
  },
  resultScore: {
    fontSize: 64,
    fontWeight: '900',
    color: '#000', // merah tua tanpa shadow
    marginBottom: 28,
  },
  resultSummaryGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  resultSummaryItem: {
    width: '48%',
    marginBottom: 12,
    backgroundColor: '#F7F1F1',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  resultSummaryLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  resultSummaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#9D2828',
  },
  resultCloseButton: {
    backgroundColor: '#9D2828',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#9D2828',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  resultCloseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.8,
  },
  optionLabel: {
    fontWeight: 'bold',
    marginRight: 6,
    color: '#000',
  },
  confirmModal: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 18,
    width: '85%',
    alignItems: 'center',
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  warningText: {
    fontSize: 14,
    color: '#D32F2F',
    marginBottom: 6,
    textAlign: 'center',
  },
  confirmMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 10,
    color: '#333',
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#555',
    paddingVertical: 12,
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
  },
  submitBtn: {
    flex: 1,
    backgroundColor: '#9D2828',
    paddingVertical: 12,
    borderRadius: 10,
    marginLeft: 10,
    alignItems: 'center',
  },

  warningModalBox: {
    backgroundColor: '#fff',
    padding: 25,
    width: '85%',
    borderRadius: 12,
    alignItems: 'center',
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9D2828',
    marginBottom: 10,
  },
  warningMessage: {
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
    marginBottom: 20,
  },
  warningButtonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  warningBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  listModal: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    width: '92%',
    maxHeight: '80%', // <-- agar aman walaupun 200 soal
  },

  listTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 14,
    textAlign: 'center',
  },

  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingBottom: 10,
  },

  gridItem: {
    width: 45,
    height: 45,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 6,
    borderWidth: 1,
    borderColor: '#999',
  },

  gridNumber: () => ({
    color: '#000',
    fontWeight: 'bold',
  }),

  closeGridBtn: {
    marginTop: 20,
    backgroundColor: '#9D2828',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
});

export default ExamScreen;
