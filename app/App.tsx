import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, ActivityIndicator } from 'react-native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/theme';

// Điểm gốc app POTTER 3.0 — nạp font thương hiệu Young (bộ nhận diện PORTER).
export default function App() {
  const [fontsLoaded] = useFonts({
    Young: require('./assets/fonts/Young.otf'),
    YoungDisplay: require('./assets/fonts/Young-Bold-Display.otf'),
  });

  // Font chưa sẵn sàng → splash tối giản màu thương hiệu
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg.base }}>
        <ActivityIndicator color={colors.brand.primary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <RootNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
