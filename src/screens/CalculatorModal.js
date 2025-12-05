import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  ScrollView,
} from 'react-native';

const CalculatorModal = ({ visible, onClose }) => {
  const [input, setInput] = useState('');

  const { width, height } = Dimensions.get('window');
  const isLandscape = width > height;

  const scale = width / 390; // baseline responsif

  const handlePress = value => {
    if (value === 'C') setInput('');
    else if (value === '⌫') setInput(input.slice(0, -1));
    else if (value === '=') {
      try {
        let exp = input
          .replace(/π/g, Math.PI)
          .replace(/e/g, Math.E)
          .replace(/√/g, 'Math.sqrt')
          .replace(/sin/g, 'Math.sin')
          .replace(/cos/g, 'Math.cos')
          .replace(/tan/g, 'Math.tan')
          .replace(/log/g, 'Math.log10')
          .replace(/ln/g, 'Math.log')
          .replace(/\^/g, '**')
          .replace(/×/g, '*')
          .replace(/÷/g, '/');

        setInput(eval(exp).toString());
      } catch {
        setInput('Error');
      }
    } else setInput(input + value);
  };

  const buttons = [
    ['sin', 'cos', 'tan', 'π'],
    ['log', 'ln', '√', 'e'],
    ['(', ')', '^', '%'],
    ['7', '8', '9', '÷'],
    ['4', '5', '6', '×'],
    ['1', '2', '3', '-'],
    ['0', '.', 'C', '+'],
    ['⌫', '='],
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalBox,
            {
              width: isLandscape ? width * 0.75 : width * 0.9,
              height: isLandscape ? height * 0.8 : height * 0.75,
            },
          ]}
        >
          <Text
            style={[
              styles.display,
              {
                fontSize: isLandscape ? 22 * scale : 30 * scale,
                padding: isLandscape ? 8 * scale : 12 * scale,
              },
            ]}
          >
            {input || '0'}
          </Text>

          <ScrollView>
            {buttons.map((row, index) => (
              <View key={index} style={styles.row}>
                {row.map(btn => (
                  <TouchableOpacity
                    key={btn}
                    style={[
                      styles.button,
                      {
                        paddingVertical: isLandscape ? 8 * scale : 14 * scale,
                      },
                      btn === '=' && styles.equalButton,
                      btn === 'C' && styles.clearButton,
                      btn === '⌫' && styles.backspaceButton,
                    ]}
                    onPress={() => handlePress(btn)}
                  >
                    <Text
                      style={[
                        styles.btnText,
                        { fontSize: isLandscape ? 14 * scale : 18 * scale },
                      ]}
                    >
                      {btn}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text
              style={{
                color: '#fff',
                fontWeight: 'bold',
                fontSize: 16 * scale,
              }}
            >
              Tutup
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#222',
    borderRadius: 16,
    padding: 15,
  },
  display: {
    backgroundColor: '#000',
    color: '#0f0',
    borderRadius: 10,
    textAlign: 'right',
    marginBottom: 10,
    minHeight: 50,
  },
  row: {
    flexDirection: 'row',
  },
  button: {
    flex: 1,
    backgroundColor: '#444',
    margin: 4,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  equalButton: {
    backgroundColor: '#28a745',
  },
  clearButton: {
    backgroundColor: '#dc3545',
  },
  backspaceButton: {
    backgroundColor: '#ff9800',
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#B71C1C',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
});

export default CalculatorModal;
