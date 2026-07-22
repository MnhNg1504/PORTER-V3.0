import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenHeader } from '../../components/ScreenHeader';
import { colors, radius, space, type } from '../../theme';
import { mockConversations } from '../../lib/mockData';
import { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// TAB 4 — Nhắn tin: danh sách hội thoại (kênh support hướng dẫn viên).
export function MessagesScreen() {
  const nav = useNavigation<Nav>();
  return (
    <View style={styles.container}>
      <ScreenHeader title="Nhắn tin" />
      <FlatList
        data={mockConversations}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={({ item }) => (
          <Pressable style={styles.item} onPress={() => nav.navigate('Chat', { conversationId: item.id })}>
            <View style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <View style={styles.row}>
                <Text style={styles.name}>{item.name}</Text>
                {item.isGuide && <Text style={styles.guideTag}>Hướng dẫn viên</Text>}
                <Text style={styles.time}>{item.time}</Text>
              </View>
              <Text style={styles.last} numberOfLines={1}>{item.lastMessage}</Text>
            </View>
            {item.unread > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.unread}</Text>
              </View>
            )}
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.base },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    padding: space[4],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.brand.primaryLight },
  row: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  name: { ...type.h2, color: colors.text.primary },
  guideTag: {
    ...type.caption,
    color: colors.brand.primaryDark,
    backgroundColor: colors.brand.primaryLight,
    paddingHorizontal: space[2],
    paddingVertical: 1,
    borderRadius: radius.sm,
  },
  time: { ...type.caption, color: colors.text.secondary, marginLeft: 'auto' },
  last: { ...type.meta, color: colors.text.secondary, marginTop: 2 },
  badge: { minWidth: 20, height: 20, borderRadius: 10, backgroundColor: colors.accent.summit, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  badgeText: { color: '#fff', ...type.caption, fontWeight: '700' },
});
