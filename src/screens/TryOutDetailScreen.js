import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';

const TryOutDetailScreen = ({ route, navigation }) => {
  const { tryout } = route.params; // { nama, waktuMulai, waktuSelesai, mentor, deskripsi }

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
          onPress={() => navigation.navigate('ExamScreen', { tryout })}
        >
          <Text style={styles.startText}>Mulai</Text>
        </TouchableOpacity>
      </View>
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
});

export default TryOutDetailScreen;
