import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

const CalculatorModal = ({ visible, onClose }) => {
  const [input, setInput] = useState('');

  const handlePress = value => {
    if (value === 'C') {
      setInput('');
    } else if (value === '⌫') {
      setInput(input.slice(0, -1));
    } else if (value === '=') {
      try {
        let expression = input
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
        setInput(eval(expression).toString());
      } catch {
        setInput('Error');
      }
    } else {
      setInput(input + value);
    }
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
        <View style={styles.modalBox}>
          <Text style={styles.display}>{input || '0'}</Text>
          {buttons.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map(btn => (
                <TouchableOpacity
                  key={btn}
                  style={[
                    styles.button,
                    btn === '=' && styles.equalButton,
                    btn === 'C' && styles.clearButton,
                    btn === '⌫' && styles.backspaceButton,
                  ]}
                  onPress={() => handlePress(btn)}
                >
                  <Text style={styles.btnText}>{btn}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Tutup</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#222',
    borderRadius: 15,
    padding: 20,
    width: '90%',
  },
  display: {
    backgroundColor: '#000',
    color: '#0f0',
    fontSize: 28,
    padding: 10,
    textAlign: 'right',
    marginBottom: 10,
    borderRadius: 8,
    minHeight: 50,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  button: {
    flex: 1,
    backgroundColor: '#444',
    margin: 4,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: 18,
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
    borderRadius: 8,
    alignItems: 'center',
  },
});

export default CalculatorModal;
