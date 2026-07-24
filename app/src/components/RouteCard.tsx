import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, radius, space, shadow, type } from '../theme';
import { glass } from '../theme/tokens';
import { Route, currentUser } from '../lib/mockData';
import { DifficultyChip } from './DifficultyChip';
import { StatCell } from './StatCell';

/**
 * Route Card — BẮT BUỘC đủ chỉ số (docs 02 Tab 2):
 * độ khó, km, tổng leo (m), thời gian, mùa đẹp, lượt lưu, độ hot.
 * Ảnh hero: dùng placeholder khối màu (TODO(api): ảnh cung thật từ CDN).
 */
export function RouteCard({ route, onPress }: { route: Route; onPress?: () => void }) {
  // Cấp 1 với cung Chuẩn/Khó -> nhãn "cần người hướng dẫn"
  const needGuide = currentUser.level === 1 && route.difficulty !== 'easy';

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {/* Hero placeholder — KHÔNG phải map (map luôn thật, ảnh cung là ảnh) */}
      <View style={styles.hero}>
        <Text style={styles.heroText}>Ảnh cung</Text>
        {route.hot >= 76 && (
          <View style={styles.hotBadge}>
            <Text style={styles.hotBadgeText}>🔥 Hot</Text>
          </View>
        )}
        <View style={styles.chipOnHero}>
          <DifficultyChip difficulty={route.difficulty} />
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{route.name}</Text>
        <Text style={styles.region}>📍 {route.region}</Text>

        <View style={styles.stats}>
          <StatCell value={`${route.distanceKm}`} label="km" />
          <StatCell value={`↑${route.gainM}m`} label="tổng leo" />
          <StatCell value={route.durationText} label="thời gian" />
          <StatCell value={route.bestSeason} label="mùa" />
        </View>

        <View style={styles.footer}>
          <Text style={styles.meta}>🔖 {route.saves.toLocaleString('vi-VN')} lưu</Text>
          <View style={styles.hotRow}>
            <Text style={styles.meta}>🔥 Độ hot </Text>
            <View style={styles.hotBar}>
              <View style={[styles.hotFill, { width: `${route.hot}%` }]} />
            </View>
            <Text style={styles.meta}> {route.hot}</Text>
          </View>
        </View>

        {needGuide && (
          <Text style={styles.warn}>⚠ Cấp 1: cung này cần người hướng dẫn</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: glass.fill,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: glass.border,
    marginBottom: space.cardGap,
    overflow: 'hidden',
    ...shadow.glass,
  },
  hero: {
    height: 140,
    backgroundColor: glass.fillSunk,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: { color: colors.text.secondary, ...type.meta },
  hotBadge: {
    position: 'absolute',
    top: space[3],
    left: space[3],
    backgroundColor: colors.accent.summit,
    borderRadius: radius.sm,
    paddingHorizontal: space[2],
    paddingVertical: space[1],
  },
  hotBadgeText: { color: colors.text.primary, ...type.caption, fontWeight: '700' },
  chipOnHero: { position: 'absolute', top: space[3], right: space[3] },
  body: { padding: space[4] },
  name: { ...type.h2, color: colors.text.primary },
  region: { ...type.meta, color: colors.text.secondary, marginTop: 2, marginBottom: space[3] },
  stats: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingVertical: space[3],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: space[3],
  },
  meta: { ...type.meta, color: colors.text.secondary },
  hotRow: { flexDirection: 'row', alignItems: 'center' },
  hotBar: {
    width: 60,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  hotFill: { height: 6, backgroundColor: colors.accent.summit },
  warn: { ...type.meta, color: colors.danger, marginTop: space[3] },
});
