import React from 'react';
import { View, Text } from 'react-native';

const App = () => {
  return (
    <View>
      <Text
        style={{
          textAlign: 'left',
          fontSize: 48,
          fontWeight: 'bold',
          color: 'white',
          marginTop: '40',
          marginHorizontal: '20',
        }}
      >
        hello world
      </Text>
      <Text
        style={{ color: 'white', marginHorizontal: '20', textAlign: 'justify' }}
      >
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Temporibus,
        nihil. Provident totam autem consectetur similique modi architecto iste
        nihil, iusto cum laudantium illum, expedita animi itaque earum
        exercitationem rem praesentium!
      </Text>
      <View
        style={{
          marginHorizontal: '20',
          width: 'full',
          height: '200',
          backgroundColor: 'blue',
          borderRadius: 20,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            marginHorizontal: '20',
            color: 'white',
            textAlign: 'justify',
          }}
        >
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Laborum odit
          recusandae molestiae doloremque rerum repellendus totam, ipsum iure
          mollitia.
        </Text>
        <Text>tes</Text>
      </View>
    </View>
  );
};

export default App;
