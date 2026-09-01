import React from 'react';
import { Appearance } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AppTabs from './src/navigation/AppTabs';

Appearance.setColorScheme('light');

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AppTabs />
      </NavigationContainer>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
