import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MateriScreen from '../screens/MateriScreen';
import MateriListScreen from '../screens/MateriListScreen';

const Stack = createNativeStackNavigator();

const MateriStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ModulList" component={MateriScreen} />
      <Stack.Screen name="MateriList" component={MateriListScreen} />
    </Stack.Navigator>
  );
};

export default MateriStackNavigator;
