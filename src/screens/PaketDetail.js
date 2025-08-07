import React from 'react';
import {
  View,
  Text,
  StatusBar,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Linking,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from '@react-native-vector-icons/ionicons';

const { width } = Dimensions.get('window');

const PaketDetail = ({ route, navigation }) => {
  const { paketId } = route.params;

  const paketList = [
    {
      id: 1,
      title: 'Paket Premium 70X',
      detail: '12x Intensif, 4–5 jam\n60x Online',
      icon: require('../../src/img/premium.png'),
      features: [
        'Free akses record sampai ukai',
        'Tryout CBT via website',
        'Pemantauan perkembangan oleh walikelas',
        'Modul belajar UKAI CBT fisik',
        'Latian 1000 soal via zoom',
        'Pretest & posttest 1200 soal',
        'Free konsultasi kejiwaan oleh walikelas/psikolog',
        'Networking antar kampus',
        'Kisi-kisi dan Prediksi Soal UKMPPAI',
        '*Garansi Lulus',
      ],
      waLink:
        'https://wa.me/6282130070505?text=Halo%2C%20saya%20tertarik%20dengan%20Paket%20Premium',
    },
    {
      id: 2,
      title: 'Paket Silver 24X',
      detail: '12x Intensif, 4–5 jam\n60x Online',
      icon: require('../../src/img/silver.png'),
      features: [
        'Free akses record sampai ukai',
        'Tryout CBT via website',
        'Pemantauan perkembangan oleh walikelas',
        'Modul belajar UKAI CBT fisik',
        'Latian 600 soal via zoom',
        'Pretest & posttest 600 soal',
        'Free konsultasi kejiwaan oleh walikelas/psikolog',
        'Networking antar kampus',
        'Kisi-kisi dan Prediksi Soal UKMPPAI',
        '*Garansi Lulus',
      ],
      waLink:
        'https://wa.me/6282130070505?text=Halo%2C%20saya%20tertarik%20dengan%20Paket%20Silver',
    },
    {
      id: 3,
      title: 'Paket Gold 73X',
      detail: '12x Intensif, 4–5 jam\n60x Online',
      icon: require('../../src/img/gold.png'),
      features: [
        'Free akses record sampai ukai',
        'Tryout CBT via website',
        'Pemantauan perkembangan oleh walikelas',
        'Modul belajar UKAI CBT fisik',
        'Modul belajar OSCE fisik',
        'Latian 400 soal via zoom',
        'Pretest & posttest 400 soal',
        'Free konsultasi kejiwaan oleh walikelas/psikolog',
        'Networking antar kampus',
        'Kisi-kisi dan Prediksi Soal UKMPPAI',
        '*Garansi Lulus',
      ],
      waLink:
        'https://wa.me/6282130070505?text=Halo%2C%20saya%20tertarik%20dengan%20Paket%20Gold',
    },
    {
      id: 4,
      title: 'Paket Diamond 27X',
      detail: '12x Intensif, 4–5 jam\n60x Online',
      icon: require('../../src/img/diamond.png'),
      features: [
        'Free akses record sampai ukai',
        'Tryout CBT via website',
        'Pemantauan perkembangan oleh walikelas',
        'Modul belajar UKAI CBT fisik',
        'Modul belajar OSCE fisik',
        'Latian 800 soal via zoom',
        'Pretest & posttest 600 soal',
        'Free konsultasi kejiwaan oleh walikelas/psikolog',
        'Networking antar kampus',
        'Kisi-kisi dan Prediksi Soal UKMPPAI',
        '*Garansi Lulus',
      ],
      waLink:
        'https://wa.me/6282130070505?text=Halo%2C%20saya%20tertarik%20dengan%20Paket%20Diamond',
    },
  ];

  const paket = paketList.find(item => item.id === paketId);

  if (!paket) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Paket tidak ditemukan.</Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['#a10505', '#ff00004d']}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" backgroundColor="#a10505" />
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginTop: 50, marginLeft: 20 }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        <Text style={styles.header}>Pilihan Paket</Text>

        <View style={styles.packageCard}>
          <Image source={paket.icon} style={styles.icon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.packageTitle}>{paket.title}</Text>
            <Text style={styles.packageDescription}>{paket.detail}</Text>
          </View>
        </View>

        <View style={styles.featureBox}>
          {paket.features.map((item, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons name="checkmark" size={18} color="green" />
              <Text style={styles.featureText}>{item}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.waButton}
          onPress={() => Linking.openURL(paket.waLink)}
        >
          <Ionicons name="logo-whatsapp" size={20} color="white" />
          <Text style={styles.waButtonText}>Kirim Whats App</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 15,
  },
  packageCard: {
    backgroundColor: '#a10505',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    marginHorizontal: 20,
    padding: 15,
  },
  icon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginRight: 15,
  },
  packageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  packageDescription: {
    fontSize: 13,
    color: 'white',
    lineHeight: 20,
  },
  featureBox: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 15,
    padding: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  featureText: {
    color: '#000',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  waButton: {
    flexDirection: 'row',
    backgroundColor: '#25D366',
    marginHorizontal: 60,
    marginTop: 25,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  waButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default PaketDetail;
