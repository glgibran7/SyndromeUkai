import React from 'react';
import {
  View,
  Text,
  StatusBar,
  Image,
  ScrollView,
  FlatList,
} from 'react-native';
import { Button } from 'react-native/types_generated/index';

const menu = ['user', 'soal', 'materi', 'video', 'pendaftaran'];
const daftarmenu = [
  { nama: 'user', desc: 'ini menu user' },
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

      {/* <FlatList
        data={daftarmenu}
        style={{ zIndex: 1, marginBottom: 20 }}
        renderItem={({ item, index }) => (
          <View
            style={{
              marginHorizontal: 20,
              marginTop: 10,
              paddingTop: 80,
              paddingBottom: 80,
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 5,
              elevation: 3,
              backgroundColor: '#000000',
            }}
          >
            <Text style={{ color: 'white' }}>{item.nama}</Text>
            <Text style={{ color: 'white' }}>{item.desc}</Text>
          </View>
        )}
      ></FlatList> */}

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
