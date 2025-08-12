import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Modal,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';
import CheckBox from '@react-native-community/checkbox';
import CalculatorModal from './CalculatorModal';

const ExamScreen = () => {
  const [showCalc, setShowCalc] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [markDoubt, setMarkDoubt] = useState(false);
  // Tambahan state untuk daftar soal
  const [listVisible, setListVisible] = useState(false);

  const questions = [
    {
      id: 1,
      text: 'Seorang ibu membeli 3 kg apel dan 2 kg jeruk. Harga apel Rp20.000/kg, jeruk Rp15.000/kg. Berapa total biaya?',
      options: ['Rp.60.000', 'Rp.120.000', 'Rp.40.000', 'Rp.30.000'],
    },
    {
      id: 2,
      text: 'Sebuah kereta berangkat pukul 08.30 dan tiba pukul 11.15. Berapa lama perjalanan?',
      options: ['2 jam 45 menit', '3 jam', '2 jam 15 menit', '2 jam 30 menit'],
    },
    {
      id: 3,
      text: 'Jika 5x = 25, maka nilai x adalah?',
      options: ['5', '10', '15', '20'],
    },
    {
      id: 4,
      text: 'Hasil dari 12 × 8 adalah?',
      options: ['96', '88', '108', '86'],
    },
    {
      id: 5,
      text: 'Sebuah toko memberi diskon 20% dari harga Rp150.000. Berapa harga setelah diskon?',
      options: ['Rp.120.000', 'Rp.130.000', 'Rp.125.000', 'Rp.140.000'],
    },
  ];

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];

  // Timer
  const [timeLeft, setTimeLeft] = useState(7200); // 2 jam
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = sec => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, '0')}:${m
      .toString()
      .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Kalkulator
  const [calcVisible, setCalcVisible] = useState(false);

  return (
    <LinearGradient colors={['#9D2828', '#191919']} style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" backgroundColor="#9D2828" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Try Out 1</Text>
        <View style={styles.timerBox}>
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        </View>
      </View>

      <ScrollView style={styles.container}>
        {/* Judul Soal */}
        <View style={styles.questionHeader}>
          <Text style={styles.questionTitle}>
            Soal Nomor {currentQuestionIndex + 1}
          </Text>
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={styles.calcButton}
              onPress={() => setCalcVisible(true)}
            >
              <Ionicons name="calculator-outline" size={16} color="#2E7D32" />
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

        {/* Teks Soal */}
        <Text style={styles.questionText}>{currentQuestion.text}</Text>

        {/* Pilihan Jawaban */}
        {currentQuestion.options.map((opt, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.optionBox,
              selectedOption === idx && styles.optionSelected,
            ]}
            onPress={() => setSelectedOption(idx)}
          >
            <View style={styles.radioCircle}>
              {selectedOption === idx && <View style={styles.radioDot} />}
            </View>
            <Text style={styles.optionText}>{opt}</Text>
          </TouchableOpacity>
        ))}

        {/* Tandai Ragu */}
        <View style={styles.doubtRow}>
          <CheckBox
            value={markDoubt}
            onValueChange={setMarkDoubt}
            tintColors={{ true: '#FFA000', false: '#FFA000' }}
          />
          <Text style={styles.doubtText}>Tandai Ragu-ragu</Text>
        </View>

        {/* Info soal */}
        <Text style={styles.questionCount}>
          {currentQuestionIndex + 1} – {questions.length} Soal
        </Text>
      </ScrollView>

      {/* Tombol Navigasi */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentQuestionIndex(i => Math.max(0, i - 1))}
        >
          <Text style={styles.backText}>Sebelumnya</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.nextButton}
          onPress={() =>
            setCurrentQuestionIndex(i => Math.min(questions.length - 1, i + 1))
          }
        >
          <Text style={styles.nextText}>Soal Selanjutnya</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Kalkulator */}
      <CalculatorModal
        visible={calcVisible}
        onClose={() => setCalcVisible(false)}
      ></CalculatorModal>
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
              contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap' }}
            >
              {questions.map((q, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.numberButton,
                    idx === currentQuestionIndex && styles.numberButtonActive,
                  ]}
                  onPress={() => {
                    setCurrentQuestionIndex(idx);
                    setListVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.numberText,
                      idx === currentQuestionIndex && styles.numberTextActive,
                    ]}
                  >
                    {idx + 1}
                  </Text>
                  <View style={styles.emptySpace} />
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setListVisible(false)}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
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
  questionCount: {
    position: 'absolute',
    bottom: 5,
    right: 20,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    backgroundColor: '#9E9E9E',
    paddingVertical: 12,
    paddingHorizontal: 50,
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
  },
  calcBtn: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#B71C1C',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  numberButton: {
    width: 50,
    height: 60,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 6,
    margin: 5,
    backgroundColor: '#fff',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 5,
  },
  numberButtonActive: {
    backgroundColor: '#ecececff',
  },
  numberText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  numberTextActive: {
    color: '#000',
  },
  emptySpace: {
    flex: 1,
    width: '100%',
  },
});

export default ExamScreen;
