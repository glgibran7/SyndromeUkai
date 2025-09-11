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
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';
import CheckBox from '@react-native-community/checkbox';
import CalculatorModal from './CalculatorModal';
import Api from '../utils/Api';

const ExamScreen = ({ navigation }) => {
  const [showCalc, setShowCalc] = useState(false);
  const [markDoubt, setMarkDoubt] = useState(false);
  const [listVisible, setListVisible] = useState(false);
  const [calcVisible, setCalcVisible] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [userName, setUserName] = useState('Peserta');

  // ✅ Ambil nama user dari API /profile
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

    // auto refresh kalau balik ke screen ini
    const unsubscribe = navigation.addListener('focus', fetchProfile);
    return unsubscribe;
  }, [navigation]);

  const questions = [
    {
      id: 1,
      text: 'Seorang ibu membeli 3 kg apel dan 2 kg jeruk. Harga apel Rp20.000/kg, jeruk Rp15.000/kg. Berapa total biaya?',
      options: ['Rp.90.000', 'Rp.120.000', 'Rp.40.000', 'Rp.30.000'],
      correct: 0,
      explanation:
        'Total biaya = (3 × 20.000) + (2 × 15.000) = 60.000 + 30.000 = Rp90.000.',
    },
    {
      id: 2,
      text: 'Sebuah kereta berangkat pukul 08.30 dan tiba pukul 11.15. Berapa lama perjalanan?',
      options: ['2 jam 45 menit', '3 jam', '2 jam 15 menit', '2 jam 30 menit'],
      correct: 0,
      explanation: '11:15 - 08:30 = 2 jam 45 menit.',
    },
    {
      id: 3,
      text: 'Jika 5x = 25, maka nilai x adalah?',
      options: ['5', '10', '15', '20'],
      correct: 0,
      explanation: '5x = 25 ⇒ x = 25 ÷ 5 = 5.',
    },
    {
      id: 4,
      text: 'Hasil dari 12 × 8 adalah?',
      options: ['96', '88', '108', '86'],
      correct: 0,
      explanation: '12 × 8 = 96.',
    },
    {
      id: 5,
      text: 'Sebuah toko memberi diskon 20% dari harga Rp150.000. Berapa harga setelah diskon?',
      options: ['Rp.120.000', 'Rp.130.000', 'Rp.125.000', 'Rp.140.000'],
      correct: 0,
      explanation:
        'Diskon = 20% × 150.000 = 30.000, harga akhir = 150.000 - 30.000 = Rp120.000.',
    },
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const currentQuestion = questions[currentQuestionIndex];

  const [answersStatus, setAnswersStatus] = useState(
    questions.map(() => ({
      answered: false,
      doubt: false,
      selectedOption: null,
    })),
  );

  const [scoreVisible, setScoreVisible] = useState(false);
  const [score, setScore] = useState(0);

  const [timeLeft, setTimeLeft] = useState(7200);
  useEffect(() => {
    if (timeLeft <= 0 || reviewMode) return;
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
  }, [currentQuestionIndex, reviewMode]);

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

  const selectOption = idx => {
    const newStatus = [...answersStatus];
    newStatus[currentQuestionIndex] = {
      ...newStatus[currentQuestionIndex],
      answered: true,
      selectedOption: idx,
    };
    setAnswersStatus(newStatus);
  };

  const calculateScore = () => {
    let s = 0;
    answersStatus.forEach((status, idx) => {
      if (status.selectedOption === questions[idx].correct) {
        s += 1;
      }
    });
    setScore(s);
    setScoreVisible(true);
  };

  // watermark text
  const watermarkText = `${userName} • ${userName} • ${userName}`;
  const watermarks = Array.from({ length: 48 }, (_, i) => (
    <Text key={i} style={styles.watermarkText}>
      {watermarkText}
    </Text>
  ));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#9D2828' }}>
      <LinearGradient colors={['#9D2828', '#191919']} style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" backgroundColor="#9D2828" />
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {reviewMode ? 'Pembahasan' : 'Try Out 1'}
            </Text>
            {!reviewMode && (
              <View style={styles.timerBox}>
                <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
              </View>
            )}
          </View>

          <ScrollView style={styles.container}>
            {/* ✅ Overlay Watermark */}
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

            <Text style={styles.questionText}>{currentQuestion.text}</Text>

            {currentQuestion.options.map((opt, idx) => {
              const userAnswer =
                answersStatus[currentQuestionIndex].selectedOption;
              const correctAnswer = currentQuestion.correct;
              let optionStyle = styles.optionBox;

              if (reviewMode) {
                if (idx === correctAnswer) {
                  optionStyle = [
                    styles.optionBox,
                    { backgroundColor: '#C8E6C9', borderColor: '#2E7D32' },
                  ];
                }
                if (userAnswer === idx && idx !== correctAnswer) {
                  optionStyle = [
                    styles.optionBox,
                    { backgroundColor: '#FFCDD2', borderColor: '#C62828' },
                  ];
                }
              } else {
                if (userAnswer === idx) {
                  optionStyle = [styles.optionBox, styles.optionSelected];
                }
              }

              return (
                <TouchableOpacity
                  key={idx}
                  disabled={reviewMode}
                  style={optionStyle}
                  onPress={() => selectOption(idx)}
                >
                  <View style={styles.radioCircle}>
                    {userAnswer === idx && <View style={styles.radioDot} />}
                  </View>
                  <Text style={styles.optionText}>{opt}</Text>
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

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setCurrentQuestionIndex(i => Math.max(0, i - 1))}
            >
              <Text style={styles.backText}>Soal Sebelumnya</Text>
            </TouchableOpacity>
            <View style={{ width: 16 }} />{' '}
            {/* Spacer agar tombol tidak bertabrakan */}
            <TouchableOpacity
              style={styles.nextButton}
              onPress={() => {
                if (currentQuestionIndex < questions.length - 1) {
                  setCurrentQuestionIndex(i => i + 1);
                } else if (!reviewMode) {
                  calculateScore();
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
                      bgColor = idx === q.correct ? '#C8E6C9' : '#fff';
                    } else {
                      if (status.doubt) bgColor = '#FFF9C4';
                      else if (status.answered) bgColor = '#C8E6C9';
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

// Styles tetap sama seperti di kode kamu sebelumnya
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
  questionText: {
    paddingHorizontal: 16,
    marginBottom: 12,
    lineHeight: 20,
    textAlign: 'justify',
    fontSize: 14,
  },
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
    marginTop: 8,
  },
  doubtText: { color: '#FFA000', fontWeight: 'bold' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    paddingBottom: 60, // Tambahkan padding bawah agar tidak tertimpa navigation bar
  },
  backButton: {
    backgroundColor: '#9E9E9E',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  backText: { color: '#fff', fontWeight: 'bold' },
  nextButton: {
    backgroundColor: '#9D2828',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  nextText: { color: '#fff', fontWeight: 'bold' },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 5,
  },
  closeButton: {
    backgroundColor: '#B71C1C',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  numberButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 6,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberButtonActive: {
    borderWidth: 2,
    borderColor: '#000',
  },
  numberText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  watermarkOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    // transform: [{ rotate: '-20deg' }],
    opacity: 0.04,
    zIndex: 0,
  },
  watermarkText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textTransform: 'capitalize',
  },
});

export default ExamScreen;
