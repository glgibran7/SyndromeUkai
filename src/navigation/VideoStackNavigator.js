import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import VideoScreen from '../screens/VideoScreen';

const Stack = createNativeStackNavigator();

const VideoStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VideoScreen" component={VideoScreen} />
    </Stack.Navigator>
  );
};

export default VideoStackNavigator;
