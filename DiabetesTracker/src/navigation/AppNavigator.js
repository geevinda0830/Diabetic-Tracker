
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import DataEntryScreen from '../screens/DataEntryScreen';
import InsulinScreen from '../screens/InsulinScreen';
import PredictionScreen from '../screens/PredictionScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ReportsScreen from '../screens/ReportsScreen';
import CarbAnalysisScreen from '../screens/CarbAnalysisScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Home"
      screenOptions={{
        headerShown: false, // Hide headers for the modern UI
      }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="DataEntry" component={DataEntryScreen} />
      <Stack.Screen name="Insulin" component={InsulinScreen} />
      <Stack.Screen name="Prediction" component={PredictionScreen} />
      <Stack.Screen name="Reports" component={ReportsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="CarbAnalysis" component={CarbAnalysisScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;