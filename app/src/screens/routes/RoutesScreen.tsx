import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenHeader } from '../../components/ScreenHeader';
import { RouteCard } from '../../components/RouteCard';
import { colors, radius, space, type } from '../../theme';
import { mockRoutes, hotDestinations, currentUser, Difficulty } from '../../lib/mockData';
import { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// TAB 2 — Danh sách cung + bộ lọc + "Điểm đến hot" + Route Card đủ chỉ số.
export function RoutesScreen() {
  const nav = useNavigation<Nav>();
  const [filter, setFilter] = useState<Difficulty | 'all'>('all');

  const filtered = filter === 'all' ? mockRoutes : mockRoutes.filter((r) => r.difficulty === filter);
  const filters: { key: Difficulty | 'all'; label: string }[] = [
    { key: 'all', label: 'Tất cả' },
    { key: 'easy', label: 'Dễ' },
    { key: 'standard', label: 'Chuẩn' },
    { key: 'hard', label: 'Khó' },
  ];

  return (
    <View style={styles.container}>
      <ScreenHeader
        title="Cung đường"
        right={
          <Pressable hitSlop={8} onPress={() => nav.navigate('Search')}>
            <Text style={styles.filterIcon}>🔍 Tìm kiếm</Text>
          </Pressable>
        }
      />

      {/* Filter chips */}
      <View style={styles.chips}>
        {filters.map((f) => (
          <Pressable
            key={f.key}
            style={[styles.chip, filter === f.key && styles.chipOn]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.chipText, filter === f.key && styles.chipTextOn]}>{f.label}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ padding: space.screen, paddingBottom: 120 }}
        ListHeaderComponent={
          <View style={{ marginBottom: space[4] }}>
            <Text style={styles.sectionTitle}>🔥 Điểm đến hot</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {hotDestinations.map((r) => (
                <Pressable
                  key={r.id}
                  style={styles.hotCard}
                  onPress={() => nav.navigate('RouteDetail', { routeId: r.id })}
                >
                  <View style={styles.hotThumb}>
                    <Text style={styles.hotThumbText}>Ảnh</Text>
                  </View>
                  <Text style={styles.hotName} numberOfLines={1}>{r.name}</Text>
                  <Text style={styles.hotMeta}>🔥 {r.hot}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        }
        renderItem={({ item }) => (
          <RouteCard route={item} onPress={() => nav.navigate('RouteDetail', { routeId: item.id })} />
        )}
        ListEmptyComponent={<Text style={styles.empty}>Chưa có cung khớp bộ lọc</Text>}
      />

      {/* Nút "Mở cung mới" chỉ cho Cấp 2+ (docs 02) */}
      {currentUser.level >= 2 && (
        <Pressable style={styles.openBtn}>
          {/* TODO(api): mở màn "Mở cung mới" (upload GPX + ảnh điểm XP + gửi kiểm duyệt) */}
          <Text style={styles.openBtnText}>＋ Mở cung</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.surface },
  filterIcon: { ...type.meta, color: colors.brand.primary },
  chips: {
    flexDirection: 'row',
    gap: space[2],
    paddingHorizontal: space.screen,
    paddingVertical: space[3],
    backgroundColor: colors.bg.base,
  },
  chip: {
    paddingHorizontal: space[4],
    paddingVertical: space[2],
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: { backgroundColor: colors.brand.primary, borderColor: colors.brand.primary },
  chipText: { ...type.meta, color: colors.text.secondary },
  chipTextOn: { color: '#fff', fontWeight: '700' },
  sectionTitle: { ...type.h2, color: colors.text.primary, marginBottom: space[3] },
  hotCard: { width: 130, marginRight: space[3] },
  hotThumb: {
    height: 90,
    borderRadius: radius.md,
    backgroundColor: colors.brand.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hotThumbText: { color: colors.brand.primaryDark, ...type.caption },
  hotName: { ...type.meta, color: colors.text.primary, marginTop: space[1] },
  hotMeta: { ...type.caption, color: colors.accent.summit },
  empty: { ...type.body, color: colors.text.secondary, textAlign: 'center', marginTop: space[8] },
  openBtn: {
    position: 'absolute',
    right: space[4],
    bottom: 90,
    backgroundColor: colors.accent.summit,
    borderRadius: radius.pill,
    paddingHorizontal: space[5],
    paddingVertical: space[3],
  },
  openBtnText: { color: '#fff', ...type.meta, fontWeight: '700' },
});
