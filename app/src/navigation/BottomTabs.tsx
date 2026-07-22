import React from 'react';
import { View, Text, Pressable, StyleSheet, GestureResponderEvent } from 'react-native';
import { createBottomTabNavigator, BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { colors, sizing, space, shadow, type } from '../theme';
import { TabParamList } from './types';

import { CommunityScreen } from '../screens/community/CommunityScreen';
import { RoutesScreen } from '../screens/routes/RoutesScreen';
import { MapScreen } from '../screens/map/MapScreen';
import { MessagesScreen } from '../screens/messages/MessagesScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<TabParamList>();

// Nhãn icon đơn giản bằng emoji (đủ cho khung; production nên thay bằng icon set vector).
function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      <Text style={{ fontSize: sizing.tabIcon }}>{emoji}</Text>
      <Text style={[styles.tabLabel, focused && { color: colors.brand.primary, fontWeight: '700' }]}>
        {label}
      </Text>
    </View>
  );
}

/**
 * Nút GIỮA "Xuất phát" nổi (FAB kiểu 2bulu).
 * Bấm mở Tab Bản đồ ở chế độ sẵn sàng ghi track.
 * TODO(api): long-press mở menu nhanh (Ghi track / Lập lộ trình / Điều hướng cung đã mua).
 */
function StartFab({ onPress }: { onPress?: (e: GestureResponderEvent) => void }) {
  return (
    <View style={styles.fabWrap} pointerEvents="box-none">
      <Pressable style={styles.fab} onPress={onPress} accessibilityLabel="Xuất phát">
        <Text style={styles.fabIcon}>▶</Text>
      </Pressable>
      <Text style={styles.fabLabel}>Xuất phát</Text>
    </View>
  );
}

export function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏔️" label="Cộng đồng" focused={focused} /> }}
      />
      <Tab.Screen
        name="Routes"
        component={RoutesScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🥾" label="Cung đường" focused={focused} /> }}
      />
      <Tab.Screen
        name="MapTab"
        component={MapScreen}
        options={{
          // Nút giữa dùng custom button = FAB nổi
          tabBarButton: (props: BottomTabBarButtonProps) => <StartFab onPress={props.onPress ?? undefined} />,
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="💬" label="Nhắn tin" focused={focused} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Hồ sơ" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: sizing.bottomNav + 24,
    paddingTop: space[1],
    backgroundColor: colors.bg.base,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  tabItem: { alignItems: 'center', justifyContent: 'center', width: 64 },
  tabLabel: { ...type.caption, color: colors.text.secondary, marginTop: 2 },
  fabWrap: { alignItems: 'center', justifyContent: 'flex-start', width: 72 },
  fab: {
    width: sizing.fabDiameter,
    height: sizing.fabDiameter,
    borderRadius: sizing.fabDiameter / 2,
    // CTA thương hiệu: Lime Signal trên nền, chữ/icon Pine (Porter Brand Guidelines)
    backgroundColor: colors.brand.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -22, // nổi cao hơn thanh nav
    borderWidth: 4,
    borderColor: colors.bg.base,
    ...shadow.fab,
  },
  fabIcon: { color: colors.text.onLime, fontSize: 26 },
  fabLabel: { ...type.caption, color: colors.brand.primary, fontWeight: '700', marginTop: 2 },
});
