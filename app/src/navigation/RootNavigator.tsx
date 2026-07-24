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
import { BookingScreen } from '../screens/booking/BookingScreen';
import { OrderStatusScreen } from '../screens/booking/OrderStatusScreen';
import { WaiverScreen } from '../screens/booking/WaiverScreen';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { LoginScreen } from '../screens/onboarding/LoginScreen';
import { NotificationsScreen } from '../screens/settings/NotificationsScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { EditProfileScreen } from '../screens/settings/EditProfileScreen';
import { GroupProgressScreen } from '../screens/trek/GroupProgressScreen';
import { TripJournalScreen } from '../screens/trek/TripJournalScreen';
import { FindPorterScreen } from '../screens/porter/FindPorterScreen';
import { PorterDetailScreen } from '../screens/porter/PorterDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

// Root stack: bọc bottom tabs + các màn con điều hướng chéo giữa các tab.
export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Onboarding"
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg.base },
          headerTintColor: colors.brand.primary,
          headerTitleStyle: { color: colors.text.primary, fontFamily: 'YoungDisplay' },
        }}
      >
        {/* Luồng vào: Onboarding → Login → Tabs (màn có header nội bộ ẩn header navigator) */}
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Tabs" component={BottomTabs} options={{ headerShown: false }} />
        <Stack.Screen name="RouteDetail" component={RouteDetailScreen} options={{ title: 'Chi tiết cung' }} />
        <Stack.Screen name="StartPoint" component={StartPointScreen} options={{ title: 'Tới điểm xuất phát' }} />
        <Stack.Screen name="RouteNavigate" component={RouteNavigateScreen} options={{ title: 'Điều hướng cung' }} />
        <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Nhắn tin' }} />
        <Stack.Screen name="Search" component={SearchScreen} options={{ title: 'Tìm kiếm' }} />
        <Stack.Screen name="Booking" component={BookingScreen} options={{ title: 'Đặt cung' }} />
        <Stack.Screen name="OrderStatus" component={OrderStatusScreen} options={{ title: 'Đơn của bạn' }} />
        <Stack.Screen name="Waiver" component={WaiverScreen} options={{ title: 'Cam kết an toàn' }} />

        {/* Màn v3 bổ sung — có header nội bộ (trừ porter dùng header navigator) */}
        <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
        <Stack.Screen name="GroupProgress" component={GroupProgressScreen} options={{ headerShown: false }} />
        <Stack.Screen name="TripJournal" component={TripJournalScreen} options={{ headerShown: false }} />
        <Stack.Screen name="FindPorter" component={FindPorterScreen} options={{ title: 'Tìm porter' }} />
        <Stack.Screen name="PorterDetail" component={PorterDetailScreen} options={{ title: 'Porter' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
