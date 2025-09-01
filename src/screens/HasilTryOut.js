// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
//   StatusBar,
// } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const { width } = Dimensions.get('window');

// const videoList = [
//   {
//     title: 'Bahan Bakar',
//     desc: 'dan Kimfar',
//     icon: require('../../src/img/icon_folder.png'),
//     backgroundColor: '#FFF8E3',
//     wave: require('../../src/img/wave1.png'),
//   },
//   {
//     title: 'CPOB',
//     desc: '',
//     icon: require('../../src/img/icon_folder.png'),
//     backgroundColor: '#FFF8E3',
//     wave: require('../../src/img/wave2.png'),
//   },
//   {
//     title: 'Ilmu Resep',
//     desc: '',
//     icon: require('../../src/img/icon_folder.png'),
//     backgroundColor: '#FFF8E3',
//     wave: require('../../src/img/wave3.png'),
//   },
//   {
//     title: 'Infeksi',
//     desc: '',
//     icon: require('../../src/img/icon_folder.png'),
//     backgroundColor: '#FFF8E3',
//     wave: require('../../src/img/wave4.png'),
//   },
// ];

// const HasilTryOut = () => {
//   const [user, setUser] = useState({
//     name: 'Peserta',
//     paket: 'Premium',
//   });

//   useEffect(() => {
//     const getUserData = async () => {
//       try {
//         const storedUser = await AsyncStorage.getItem('user');
//         if (storedUser) {
//           const parsedUser = JSON.parse(storedUser);
//           setUser({
//             name: parsedUser.nama || 'Peserta',
//             paket: 'Premium',
//           });
//         }
//       } catch (error) {
//         console.error('Gagal mengambil data user:', error);
//       }
//     };

//     getUserData();
//   }, []);

//   return (
//     <LinearGradient
//       colors={['#9D2828', '#191919']}
//       style={{ flex: 1 }}
//       start={{ x: 0, y: 0 }}
//       end={{ x: 1, y: 1 }}
//     >
//       <StatusBar barStyle="light-content" backgroundColor="#a10505" />
//       <ScrollView style={{ flex: 1 }}>
//         {/* Header */}
//         <View style={styles.header}>
//           <View style={{ flex: 1 }}>
//             <Image
//               source={require('../../src/img/logo_putih.png')}
//               style={styles.logo}
//             />
//           </View>

//           <View style={styles.userInfo}>
//             <View style={styles.paketBadge}>
//               <Text style={styles.paketText}>🥇 {user.paket}</Text>
//             </View>
//             <View style={styles.avatarInitial}>
//               <Text style={styles.avatarText}>
//                 {user.name.split(' ')[0][0]}
//               </Text>
//             </View>
//           </View>
//         </View>

//         {/* Title */}
//         <View style={styles.greetingBox}>
//           <Text style={styles.greeting}>Ini Hasil TryOut</Text>
//           <Text style={styles.subtext}>Kumpulan materi berupa video</Text>
//         </View>

//         {/* Grid */}
//         <View style={styles.mainContent}>
//           <Text style={styles.sectionTitle}>Daftar Video</Text>
//           <View style={styles.menuGrid}>
//             {videoList.map((item, index) => (
//               <TouchableOpacity
//                 key={index}
//                 style={[
//                   styles.menuItem,
//                   { backgroundColor: item.backgroundColor },
//                 ]}
//               >
//                 <Text style={styles.menuTitle}>{item.title}</Text>
//                 <Text style={styles.menuDesc}>{item.desc}</Text>

//                 <View style={styles.menuIconContainer}>
//                   <Image source={item.icon} style={styles.menuIcon} />
//                 </View>
//                 <Image source={item.wave} style={styles.waveImage} />
//               </TouchableOpacity>
//             ))}
//           </View>
//         </View>
//       </ScrollView>
//     </LinearGradient>
//   );
// };

// const styles = StyleSheet.create({
//   header: {
//     flexDirection: 'row',
//     paddingHorizontal: 10,
//     paddingTop: 20,
//     alignItems: 'center',
//   },
//   logo: {
//     width: width * 0.3,
//     height: width * 0.3,
//     resizeMode: 'contain',
//   },
//   userInfo: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   avatarInitial: {
//     width: 35,
//     height: 35,
//     borderRadius: 999,
//     backgroundColor: '#0b62e4ff',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   avatarText: {
//     color: '#fff',
//     fontWeight: 'bold',
//     textTransform: 'capitalize',
//   },
//   paketBadge: {
//     backgroundColor: '#feb600',
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: 12,
//   },
//   paketText: {
//     fontSize: 12,
//     color: '#fff',
//     fontWeight: 'bold',
//   },
//   greetingBox: {
//     marginTop: -5,
//     paddingHorizontal: 20,
//   },
//   greeting: {
//     fontSize: 22,
//     color: '#fff',
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
//   subtext: {
//     fontSize: 13,
//     color: '#fff',
//     marginTop: 5,
//     textAlign: 'center',
//   },
//   mainContent: {
//     backgroundColor: 'white',
//     paddingVertical: 25,
//     paddingHorizontal: 20,
//     marginTop: 30,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 15,
//     color: '#000',
//   },
//   menuGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     justifyContent: 'space-between',
//   },
//   menuItem: {
//     width: width * 0.42,
//     borderRadius: 15,
//     padding: 15,
//     marginBottom: 20,
//     overflow: 'hidden',
//     position: 'relative',
//   },
//   menuTitle: {
//     fontWeight: 'bold',
//     fontSize: 16,
//     color: '#700101',
//   },
//   menuDesc: {
//     fontSize: 13,
//     color: '#555',
//     marginTop: 5,
//   },
//   menuIcon: {
//     width: 50,
//     height: 50,
//     resizeMode: 'contain',
//     alignSelf: 'flex-end',
//     marginTop: 10,
//   },
//   waveImage: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     width: 'auto',
//     height: 80,
//     resizeMode: 'cover',
//     borderBottomLeftRadius: 15,
//     borderBottomRightRadius: 15,
//     zIndex: -1,
//   },
// });

// export default HasilTryOut;
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation } from '@react-navigation/native';

const HasilTryOut = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#9D2828' }}>
      {/* <StatusBar barStyle={'dark-content'} backgroundColor="#000" /> */}

      <View style={styles.container}>
        {/* Tombol Back */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <Image
          source={require('../img/dokter_mobile.png')}
          style={styles.image}
        />
        <Text style={styles.title}>Sedang Dalam Pengembangan</Text>
        <Text style={styles.subtitle}>
          Fitur Hasil akan segera hadir di update berikutnya
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9D2828',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20, // ujung kanan
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 3, // biar ada shadow di Android
  },
  image: {
    width: 250,
    height: 250,
    marginBottom: 10,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default HasilTryOut;
