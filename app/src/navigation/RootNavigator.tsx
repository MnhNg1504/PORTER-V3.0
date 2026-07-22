import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme';
import { RootStackParamList } from './types';
import { BottomTabs } from './BottomTabs';

import { RouteDetailScreen } from '../screens/routes/RouteDetailScreen';
import { StartPointScreen } from '../screens/routes/StartPointScreen';
import { RouteNavigateScreen } from '../screens/map/RouteNavigateScreen';
import { ChatScreen } from '../screens/messages/ChatScreen';
import { SearchScreen } from '../screens/routes/SearchScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Root stack: bọc bottom tabs + các màn con điều hướng chéo giữa các tab.
export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg.base },
          headerTintColor: colors.brand.primary,
          headerTitleStyle: { color: colors.text.primary, fontFamily: 'YoungDisplay' },
        }}
      >
        <Stack.Screen name="Tabs" component={BottomTabs} options={{ headerShown: false }} />
        <Stack.Screen name="RouteDetail" component={RouteDetailScreen} options={{ title: 'Chi tiết cung' }} />
        <Stack.Screen name="StartPoint" component={StartPointScreen} options={{ title: 'Tới điểm xuất phát' }} />
        <Stack.Screen name="RouteNavigate" component={RouteNavigateScreen} options={{ title: 'Điều hướng cung' }} />
        <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Nhắn tin' }} />
        <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Tìm kiếm' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
