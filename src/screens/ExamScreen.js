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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';
import CheckBox from '@react-native-community/checkbox';
import CalculatorModal from './CalculatorModal';
import Api from '../utils/Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RenderHtml from 'react-native-render-html';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ExamScreen = ({ navigation, route }) => {
  const { tryout, attempt } = route.params;

  const [showCalc, setShowCalc] = useState(false);
  const [markDoubt, setMarkDoubt] = useState(false);
  const [listVisible, setListVisible] = useState(false);
  const [calcVisible, setCalcVisible] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [userName, setUserName] = useState('Peserta');

  const [questions, setQuestions] = useState([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);

  const [answersStatus, setAnswersStatus] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

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

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoadingQuestions(true);
      try {
        const response = await Api.get(`/tryout/${tryout.id_tryout}/questions`);
        const fetchedQuestions = response.data.data || [];

        setQuestions(fetchedQuestions);

        // Ambil jawaban user dari attempt.jawaban_user yang sudah ada di params
        const jawabanUser = attempt.jawaban_user || {};

        const newAnswersStatus = fetchedQuestions.map(q => {
          const opsiKeys = Object.keys(q.opsi || {});

          // Format key di jawaban_user adalah "soal_1", "soal_2", ...
          const key = `soal_${q.nomor_urut}`;

          const jawaban = jawabanUser[key]?.jawaban || null;
          const ragu = jawabanUser[key]?.ragu === 1;

          const selectedIndex = opsiKeys.indexOf(jawaban);

          return {
            answered: jawaban !== null && jawaban !== '',
            doubt: ragu,
            selectedOption: selectedIndex >= 0 ? selectedIndex : null,
          };
        });

        setAnswersStatus(newAnswersStatus);
        setCurrentQuestionIndex(0);
      } catch (error) {
        console.error('Gagal mengambil soal:', error);
        setQuestions([]);
        setAnswersStatus([]);
      } finally {
        setIsLoadingQuestions(false);
      }
    };

    fetchQuestions();
  }, [tryout.id_tryout, attempt.attempt_token]);

  // Timer dan lainnya (tetap sama)
  const [scoreVisible, setScoreVisible] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(tryout.durasi * 60 || 0);

  useEffect(() => {
    if (reviewMode) return; // jangan jalankan timer saat review

    if (timeLeft <= 0) {
      // waktu habis, submit otomatis
      const autoSubmit = async () => {
        try {
          await submitAttempt();
        } catch (e) {
          console.error('Gagal submit otomatis:', e);
        }
      };
      autoSubmit();
      return;
    }

    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, reviewMode]);

  const formatTime = sec => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, '0')}:${m
      .toString()
      .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!reviewMode) {
      setMarkDoubt(answersStatus[currentQuestionIndex]?.doubt || false);
    }
  }, [currentQuestionIndex, reviewMode, answersStatus]);

  useEffect(() => {
    if (!reviewMode) {
      const newStatus = [...answersStatus];
      newStatus[currentQuestionIndex] = {
        ...newStatus[currentQuestionIndex],
        doubt: markDoubt,
      };
      setAnswersStatus(newStatus);
    }
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
    if (reviewMode) return;

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
      await Api.post('/tryout/attempts/submit', {
        attempt_token: attempt.attempt_token,
      });
      Alert.alert('Berhasil', 'Jawaban berhasil disubmit.', [
        {
          text: 'OK',
          onPress: () => {
            setReviewMode(true);
            setScoreVisible(false);
            setCurrentQuestionIndex(0);
          },
        },
      ]);
    } catch (error) {
      console.error('Gagal submit jawaban:', error.response || error.message);
      Alert.alert('Error', 'Gagal submit jawaban, coba lagi.');
    }
  };

  const calculateScore = () => {
    let s = 0;
    answersStatus.forEach((status, idx) => {
      const correctKey = questions[idx]?.correct;
      const correctIndex = Object.keys(questions[idx]?.opsi || {}).indexOf(
        correctKey,
      );
      if (status.selectedOption === correctIndex) {
        s += 1;
      }
    });
    setScore(s);
    setScoreVisible(true);
  };

  const watermarkText = `${userName} • ${userName} • ${userName}`;
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
            <Text style={styles.title}>
              {reviewMode ? 'Pembahasan' : tryout.judul || 'Tryout'}
            </Text>
            {!reviewMode && (
              <View style={styles.timerBox}>
                <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
              </View>
            )}
          </View>

          <ScrollView style={styles.container}>
            <View pointerEvents="none" style={styles.watermarkOverlay}>
              {watermarks}
            </View>
            <View style={styles.questionHeader}>
              <Text style={styles.questionTitle}>
                Soal Nomor {currentQuestionIndex + 1}
              </Text>
              <View style={styles.buttonsRow}>
                {!reviewMode && (
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
                )}
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
                    maxWidth: 300,
                    maxHeight: 200,
                    width: '100%',
                    height: 'auto',
                    marginVertical: 8,
                    resizeMode: 'contain',
                  },
                }}
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
                  disabled={reviewMode}
                  style={[
                    styles.optionBox,
                    isSelected && styles.optionSelected,
                  ]}
                  onPress={() => selectOption(idx)}
                >
                  <View style={styles.radioCircle}>
                    {isSelected && <View style={styles.radioDot} />}
                  </View>
                  <Text style={styles.optionText}>{opt.text}</Text>
                </TouchableOpacity>
              );
            })}

            {reviewMode && (
              <View
                style={{
                  backgroundColor: '#FFF9C4',
                  marginHorizontal: 16,
                  padding: 12,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: '#FBC02D',
                  marginTop: 10,
                }}
              >
                <Text style={{ fontWeight: 'bold', marginBottom: 4 }}>
                  Pembahasan:
                </Text>
                <Text style={{ fontSize: 13, lineHeight: 18 }}>
                  {currentQuestion.explanation}
                </Text>
              </View>
            )}

            {!reviewMode && (
              <View style={styles.doubtRow}>
                <CheckBox
                  value={markDoubt}
                  onValueChange={setMarkDoubt}
                  tintColors={{ true: '#FFA000', false: '#FFA000' }}
                />
                <Text style={styles.doubtText}>Tandai Ragu-ragu</Text>
              </View>
            )}
          </ScrollView>

          <SafeAreaView edges={['bottom']} style={styles.footerSafeArea}>
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setCurrentQuestionIndex(i => Math.max(0, i - 1))}
              >
                <Text style={styles.backText}>Soal Sebelumnya</Text>
              </TouchableOpacity>
              <View style={{ width: 16 }} />
              <TouchableOpacity
                style={styles.nextButton}
                onPress={() => {
                  if (currentQuestionIndex < questions.length - 1) {
                    setCurrentQuestionIndex(i => i + 1);
                  } else if (!reviewMode) {
                    submitAttempt();
                  } else {
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'TryOutScreen' }],
                    });
                  }
                }}
              >
                <Text style={styles.nextText}>
                  {currentQuestionIndex < questions.length - 1
                    ? 'Soal Selanjutnya'
                    : reviewMode
                    ? 'Selesai Pembahasan'
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
            animationType="fade"
            onRequestClose={() => setListVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text
                  style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 12 }}
                >
                  Pilih Nomor Soal
                </Text>
                <ScrollView
                  contentContainerStyle={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                  }}
                >
                  {questions.map((q, idx) => {
                    const status = answersStatus[idx];
                    let bgColor = '#fff';
                    if (reviewMode) {
                      const correctKey = q.correct;
                      const correctIndex = Object.keys(q.opsi).indexOf(
                        correctKey,
                      );
                      bgColor = idx === correctIndex ? '#C8E6C9' : '#fff';
                    } else {
                      if (status?.doubt) bgColor = '#FFF9C4';
                      else if (status?.answered) bgColor = '#C8E6C9';
                    }

                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.numberButton,
                          { backgroundColor: bgColor },
                          idx === currentQuestionIndex &&
                            styles.numberButtonActive,
                        ]}
                        onPress={() => {
                          setCurrentQuestionIndex(idx);
                          setListVisible(false);
                        }}
                      >
                        <Text style={styles.numberText}>{idx + 1}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setListVisible(false)}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                    Tutup
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Modal Skor */}
          <Modal
            visible={scoreVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setScoreVisible(false)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text
                  style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}
                >
                  Skor Anda
                </Text>
                <Text style={{ fontSize: 16, marginBottom: 16 }}>
                  Anda mendapatkan {score} / {questions.length} poin
                </Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => {
                    setScoreVisible(false);
                    setReviewMode(true);
                    setCurrentQuestionIndex(0);
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                    Lihat Pembahasan
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.closeButton, { backgroundColor: '#9E9E9E' }]}
                  onPress={() => {
                    setScoreVisible(false);
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'TryOutScreen' }],
                    });
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                    Tutup
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
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
    marginHorizontal: 16,
    marginTop: 8,
  },
  doubtText: { fontSize: 13, marginLeft: 6, color: '#000' },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  backButton: {
    flex: 1,
    minWidth: 120, // supaya tombol tidak terlalu kecil
    backgroundColor: '#E0E0E0',
    paddingVertical: 14, // buat tombol lebih tinggi dan mudah ditekan
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8, // jarak kanan ke tombol selanjutnya
  },
  backText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  nextButton: {
    flex: 1,
    minWidth: 120,
    backgroundColor: '#9D2828',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8, // jarak kiri ke tombol sebelumnya
  },
  nextText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  numberButton: {
    width: 40,
    height: 40,
    margin: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#9D2828',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberButtonActive: {
    backgroundColor: '#9D2828',
  },
  numberText: {
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: '#9D2828',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  watermarkOverlay: {
    position: 'absolute',
    top: 50,
    left: 10,
    right: 10,
    flexWrap: 'wrap',
    flexDirection: 'row',
    opacity: 0.06,
    zIndex: 0,
    justifyContent: 'center',
  },
  watermarkText: {
    fontSize: 14,
    marginHorizontal: 6,
    marginVertical: 2,
    color: '#9D2828',
  },
  footerSafeArea: {
    backgroundColor: '#fff',
    paddingBottom: 16, // ekstra padding supaya aman di semua device
  },
});

export default ExamScreen;
