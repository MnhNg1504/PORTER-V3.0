import React from 'react';
import { View, Text, Pressable, StyleSheet, GestureResponderEvent } from 'react-native';
import { createBottomTabNavigator, BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { colors, space, shadow, type } from '../theme';
import { glass } from '../theme/tokens';
import { TabParamList } from './types';
import { BrandIcon, BrandIconName } from '../components/BrandIcon';

import { CommunityScreen } from '../screens/community/CommunityScreen';
import { RoutesScreen } from '../screens/routes/RoutesScreen';
import { MapScreen } from '../screens/map/MapScreen';
import { MessagesScreen } from '../screens/messages/MessagesScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<TabParamList>();

// Icon tab = bộ icon brand outline (BrandIcon), theo preview đã chốt:
// active = mực + vạch lime phía trên, inactive = sage.
function TabIcon({ icon, label, focused }: { icon: BrandIconName; label: string; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      {focused && <View style={styles.tabIndicator} />}
      <BrandIcon name={icon} size={22} color={focused ? colors.brand.primary : colors.rock} />
      <Text
        style={[
          styles.tabLabel,
          focused && { color: colors.brand.primary, fontWeight: '700' },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

/**
 * Nút GIỮA "Xuất phát": FAB tròn Lime CHỈ chứa logo la bàn,
 * nằm ngang hàng với các tab (không nổi lên trên) — theo preview đã chốt.
 */
function StartFab({ onPress }: { onPress?: (e: GestureResponderEvent) => void }) {
  return (
    <View style={styles.fabWrap} pointerEvents="box-none">
      <Pressable style={styles.fab} onPress={onPress} accessibilityLabel="Xuất phát">
        <BrandIcon name="compass" size={26} color={colors.text.onLime} />
      </Pressable>
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
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="home" label="Cộng đồng" focused={focused} /> }}
      />
      <Tab.Screen
        name="Routes"
        component={RoutesScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="routes" label="Cung đường" focused={focused} /> }}
      />
      <Tab.Screen
        name="MapTab"
        component={MapScreen}
        options={{
          // Nút giữa dùng custom button = FAB la bàn
          tabBarButton: (props: BottomTabBarButtonProps) => <StartFab onPress={props.onPress ?? undefined} />,
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="chat" label="Tin nhắn" focused={focused} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="guide" label="Hồ sơ" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 74 + space[2],
    paddingTop: space[1],
    backgroundColor: colors.bg.base,
    borderTopWidth: 1,
    borderTopColor: glass.border,
  },
  tabItem: { alignItems: 'center', justifyContent: 'center', width: 72, gap: 3 },
  tabIndicator: {
    position: 'absolute',
    top: -space[1],
    width: 18,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.brand.primaryLight,
  },
  tabLabel: { ...type.caption, fontSize: 11, color: colors.rock },
  fabWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  fab: {
    width: 46,
    height: 46,
    borderRadius: 23,
    // CTA thương hiệu v3: Lime Signal + quầng lime, glyph ink tối (onLime)
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.limeGlow,
  },
});
