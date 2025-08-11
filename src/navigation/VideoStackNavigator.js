import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import VideoScreen from '../screens/VideoScreen';
import VideoListScreen from '../screens/VideoListScreen';
import VideoViewer from '../screens/VideoViewer';

const Stack = createNativeStackNavigator();

const VideoStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VideoScreen" component={VideoScreen} />
      <Stack.Screen name="VideoListScreen" component={VideoListScreen} />
      <Stack.Screen name="VideoViewer" component={VideoViewer} />
    </Stack.Navigator>
  );
};

export default VideoStackNavigator;
