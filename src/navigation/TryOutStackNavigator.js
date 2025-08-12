import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TryoutScreen from '../screens/TryOutScreen';
import TryOutDetailScreen from '../screens/TryOutDetailScreen';
import ExamScreen from '../screens/ExamScreen';

const Stack = createNativeStackNavigator();

const TryOuttackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TryOutScreen" component={TryoutScreen} />
      <Stack.Screen name="TryOutDetailScreen" component={TryOutDetailScreen} />
      <Stack.Screen name="ExamScreen" component={ExamScreen} />
    </Stack.Navigator>
  );
};

export default TryOuttackNavigator;
