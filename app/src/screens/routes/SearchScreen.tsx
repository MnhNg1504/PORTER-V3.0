import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { colors, radius, space, type } from '../../theme';
import { RouteCard } from '../../components/RouteCard';
import { mockRoutes } from '../../lib/mockData';

/** Bỏ dấu tiếng Việt để tìm không dấu ("ta xua" khớp "Tà Xùa") */
function fold(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[đĐ]/g, 'd').toLowerCase();
}

/**
 * Tìm kiếm cung đường (checklist §1). Hiện lọc mockRoutes theo tên/vùng.
 * TODO(api): GET /routes?q= — full-text server + gợi ý điểm đến hot.
 */
export function SearchScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [q, setQ] = useState('');

  const results = useMemo(() => {
    const f = fold(q.trim());
    if (!f) return mockRoutes;
    return mockRoutes.filter((r) => fold(`${r.name} ${r.region}`).includes(f));
  }, [q]);

  return (
    <View style={[styles.container, { paddingTop: insets.top ? 0 : space[2] }]}>
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder="Tìm cung, đỉnh, khu vực…"
          placeholderTextColor={colors.text.secondary}
          value={q}
          onChangeText={setQ}
          autoFocus
          returnKeyType="search"
        />
      </View>
      <FlatList
        data={results}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ padding: space.screen, gap: space.cardGap }}
        renderItem={({ item }) => (
          <RouteCard route={item} onPress={() => nav.navigate('RouteDetail', { routeId: item.id })} />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Không thấy cung nào khớp "{q}".{'\n'}Thử từ khoá khác (không cần dấu).</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.base },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: space.screen,
    marginBottom: 0,
    paddingHorizontal: space[3],
    backgroundColor: colors.bg.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: { fontSize: 16, marginRight: space[2] },
  input: { flex: 1, height: 46, ...type.body, color: colors.text.primary },
  empty: { ...type.body, color: colors.text.secondary, textAlign: 'center', marginTop: space[8] },
});
