import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, space, shadow, type } from '../../theme';
import { StatCell } from '../../components/StatCell';
import { currentUser, mockBadges } from '../../lib/mockData';

// TAB 5 — Hồ sơ / Cột mốc / R&D.
export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const u = currentUser;
  const levelName = u.level === 1 ? 'Mới' : u.level === 2 ? 'Có kinh nghiệm' : 'Tổ chức/Tour';

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
      {/* Header hồ sơ (ảnh bìa núi) */}
      <View style={[styles.cover, { paddingTop: insets.top + space[4] }]}>
        <View style={styles.avatar} />
        <Text style={styles.name}>{u.name}</Text>
        <Text style={styles.level}>⛰ Cấp {u.level} – {levelName}</Text>
        <View style={styles.repBar}>
          <View style={[styles.repFill, { width: `${(u.reputation / 1000) * 100}%` }]} />
        </View>
        <Text style={styles.repText}>Uy tín {u.reputation}/1000</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.section}>CỘT MỐC</Text>
        <View style={styles.stats}>
          <StatCell value={`${u.stats.routes}`} label="cung" />
          <StatCell value={`${u.stats.km}km`} label="tổng km" />
          <StatCell value={`↑${u.stats.gain}m`} label="tổng leo" />
          <StatCell value={`${u.stats.days}`} label="ngày đi" />
        </View>

        <Text style={styles.section}>🏅 Huy hiệu</Text>
        <View style={styles.badges}>
          {mockBadges.map((b) => (
            <View key={b} style={styles.badge}>
              <Text style={styles.badgeText}>{b}</Text>
            </View>
          ))}
        </View>

        {/* Danh sách quản lý — nhãn tĩnh, chưa mở cho DEMO1 */}
        <Text style={styles.section}>QUẢN LÝ</Text>
        <View style={styles.manageList}>
          {['Cung của tôi', 'Đã mua', 'Track'].map((label, i, arr) => (
            <View key={label} style={[styles.manageRow, i === arr.length - 1 && styles.manageRowLast]}>
              <Text style={styles.manageLabel}>{label}</Text>
              <View style={styles.soonTag}>
                <Text style={styles.soonText}>Sắp có</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.section}>🔬 R&D / Nghiên cứu</Text>
        {/* TODO(api): danh sách thử nghiệm beta + gửi phản hồi. */}
        <Text style={styles.paragraph}>• Thử nghiệm lớp bản đồ 3D (beta)</Text>
        <Text style={styles.paragraph}>• Gửi phản hồi cải thiện</Text>

        <View style={styles.premium}>
          <Text style={styles.premiumText}>⭐ Premium · Đồng bộ · Offline</Text>
          <Text style={styles.premiumHint}>Sắp có</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.surface },
  cover: { backgroundColor: colors.brand.primaryDark, alignItems: 'center', paddingBottom: space[5] },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.brand.primaryLight, marginBottom: space[3] },
  name: { ...type.h1, color: '#fff' },
  level: { ...type.meta, color: colors.brand.primaryLight, marginTop: space[1] },
  repBar: { width: 200, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.25)', marginTop: space[3], overflow: 'hidden' },
  repFill: { height: 6, backgroundColor: colors.accent.summit },
  repText: { ...type.caption, color: '#fff', marginTop: space[2] },
  body: { padding: space.screen },
  section: { ...type.h2, color: colors.text.primary, marginTop: space[4], marginBottom: space[3] },
  stats: { flexDirection: 'row', backgroundColor: colors.bg.base, borderRadius: radius.md, paddingVertical: space[4], ...shadow.card },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  badge: { backgroundColor: colors.bg.base, borderRadius: radius.pill, paddingHorizontal: space[3], paddingVertical: space[2], ...shadow.card },
  badgeText: { ...type.meta, color: colors.earth },
  manageList: { backgroundColor: colors.bg.base, borderRadius: radius.md, ...shadow.card, overflow: 'hidden' },
  manageRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space[4], paddingVertical: space[3], borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  manageRowLast: { borderBottomWidth: 0 },
  manageLabel: { ...type.body, color: colors.text.primary },
  soonTag: { backgroundColor: colors.bg.surface, borderRadius: radius.pill, paddingHorizontal: space[3], paddingVertical: space[1] },
  soonText: { ...type.caption, color: colors.text.faint, fontWeight: '600' },
  paragraph: { ...type.body, color: colors.text.secondary, marginBottom: space[2] },
  premium: { backgroundColor: colors.brand.primaryLight, borderRadius: radius.md, padding: space[4], marginTop: space[5], flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  premiumText: { ...type.meta, color: colors.brand.primaryDark, fontWeight: '700' },
  premiumHint: { ...type.caption, color: colors.brand.primaryDark, fontWeight: '600', opacity: 0.7 },
});
