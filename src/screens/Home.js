import React from 'react';
import {
  View,
  Text,
  StatusBar,
  Image,
  ScrollView,
  FlatList,
  Button,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';

const Home = () => {
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
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            style={{
              marginTop: 10,
              borderRadius: 10,
              backgroundColor: 'blue',
              padding: 20,
              marginHorizontal: 10,
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'left',
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: 'white',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 10,
              }}
            >
              <Icon name="user" size={18} color="blue" />
            </View>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>User</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              marginTop: 10,
              borderRadius: 10,
              backgroundColor: 'blue',
              padding: 20,
              marginHorizontal: 10,
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'left',
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: 'white',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 10,
              }}
            >
              <Icon name="list" size={18} color="blue" />
            </View>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>
              Pendaftaran
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            style={{
              marginTop: 10,
              borderRadius: 10,
              backgroundColor: 'blue',
              padding: 20,
              marginHorizontal: 10,
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'left',
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: 'white',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 10,
              }}
            >
              <Icon name="pen-to-square" size={18} color="blue" />
            </View>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Soal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              marginTop: 10,
              borderRadius: 10,
              backgroundColor: 'blue',
              padding: 20,
              marginHorizontal: 10,
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'left',
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: 'white',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 10,
              }}
            >
              <Icon name="book" size={18} color="blue" />
            </View>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Materi</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            style={{
              marginTop: 10,
              borderRadius: 10,
              backgroundColor: 'blue',
              padding: 20,
              marginHorizontal: 10,
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'left',
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: 'white',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 10,
              }}
            >
              <Icon name="video" size={18} color="blue" />
            </View>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Video</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              marginTop: 10,
              borderRadius: 10,
              backgroundColor: 'blue',
              padding: 20,
              marginHorizontal: 10,
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'left',
            }}
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: 'white',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 10,
              }}
            >
              <Icon name="suitcase" size={18} color="blue" />
            </View>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Paket</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'left' }}>
        <Image
          source={require('../img/hompage_img.png')}
          style={{ width: 200, height: 200, zIndez: 0 }}
        />
      </View>
    </View>
  );
};

export default Home;
