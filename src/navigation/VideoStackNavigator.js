import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import VideoScreen from '../screens/VideoScreen';
import MateriListScreen from '../screens/MateriListScreen';

const Stack = createNativeStackNavigator();

const VideoStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ModulList" component={MateriScreen} />
      <Stack.Screen name="VideoScreen" component={MateriListScreen} />
    </Stack.Navigator>
  );
};

export default VideoStackNavigator;
