import React from 'react';
import {
  View,
  Text,
  StatusBar,
  Image,
  ScrollView,
  FlatList,
  Alert,
  TouchableOpacity,
  ToastAndroid,
} from 'react-native';

const menu = ['user', 'soal', 'materi', 'video', 'pendaftaran'];
const daftarmenu = [
  {
    nama: 'User',
    desc: 'ini menu user',
    gambar:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Flag_of_Indonesia.svg/800px-Flag_of_Indonesia.svg.png',
  },
  { nama: 'User', desc: 'ini menu user', gambar: '' },
  { nama: 'soal', desc: 'ini menu soal' },
  { nama: 'soal', desc: 'ini menu soal' },
  { nama: 'soal', desc: 'ini menu soal' },
  { nama: 'soal', desc: 'ini menu soal' },
  { nama: 'soal', desc: 'ini menu soal' },
  { nama: 'soal', desc: 'ini menu soal' },
  { nama: 'soal', desc: 'ini menu soal' },
  { nama: 'soal', desc: 'ini menu soal' },
  { nama: 'soal', desc: 'ini menu soal' },
  { nama: 'soal', desc: 'ini menu soal' },
];

const App = () => {
  function showAlert() {
    Alert.alert('Data Berhasil di Update', 'berhasil ditambahkan', [
      { text: 'batal', onPress: () => console.log('batal') },
      { text: 'tidak', onPress: () => console.log('batal') },
      { text: 'ya', onPress: () => console.log('batal') },
    ]);

    ToastAndroid.show('halo', ToastAndroid.LONG);
  }
  return (
    <View style={{ flex: 1, backgroundColor: '#d1dbf9' }}>
      <StatusBar barStyle={'dark-content'} />
      <View
        style={{
          backgroundColor: 'white',
          padding: 20,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
        }}
      >
        <Text
          style={{
            color: 'black',
            fontWeight: 'bold',
            paddingTop: 20,
            fontSize: 18,
            fontFamily: 'poppins',
            elevation: 3,
          }}
        >
          SynromeUkai
        </Text>
      </View>

      <View
        style={{
          marginTop: 20,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 20,
        }}
      >
        <Text
          style={{
            fontSize: 40,
            fontWeight: 'bold',
          }}
        >
          SYNDROME UKAI
        </Text>
        <Text
          style={{
            fontSize: 12,
            fontWeight: 'condensed',
            textAlign: 'center',
          }}
        >
          Platform penyedia layanan pendidikan farmasi berbasis teknologi
          terbaik dan ter-murah
        </Text>
      </View>

      <FlatList
        data={daftarmenu}
        style={{ zIndex: 1, marginBottom: 20 }}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={{
              marginHorizontal: 20,
              marginTop: 10,
              paddingTop: 20,
              paddingBottom: 20,
              flex: 1,
              paddingLeft: 20,
              borderRadius: 5,
              elevation: 3,
              backgroundColor: '#082b59',
              flexDirection: 'row',
            }}
            onPress={() => showAlert()}
          >
            <View
              style={{ justifyContent: 'center', paddingLeft: 20, flex: 1 }}
            >
              <Text
                style={{ color: 'white', fontWeight: 'bold', fontSize: 18 }}
              >
                {item.nama}
              </Text>
              <Text style={{ color: 'white' }}>{item.desc}</Text>
            </View>
            <Image
              source={{ uri: item.gambar }}
              style={{
                width: 75,
                height: 50,
                borderRadius: 10,
                marginRight: 20,
              }}
            />
          </TouchableOpacity>
        )}
      ></FlatList>

      <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'left' }}>
        <Image
          source={require('./src/img/hompage_img.png')}
          style={{ width: 200, height: 200, zIndez: 0 }}
        />
      </View>
    </View>
  );
};

export default App;
