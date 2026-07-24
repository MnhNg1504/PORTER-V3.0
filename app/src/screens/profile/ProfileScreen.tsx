import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, space, shadow, type, sizing } from '../../theme';
import { glass } from '../../theme/tokens';
import { StatCell } from '../../components/StatCell';
import { RootStackParamList } from '../../navigation/types';
import { currentUser, mockBadges } from '../../lib/mockData';

type Nav = NativeStackNavigationProp<RootStackParamList>;

// Menu điều hướng tới các màn v3 bổ sung.
const MENU: { label: string; icon: string; to: keyof RootStackParamList }[] = [
  { label: 'Sửa hồ sơ', icon: '✎', to: 'EditProfile' },
  { label: 'Thông báo', icon: '🔔', to: 'Notifications' },
  { label: 'Nhật ký hành trình', icon: '📖', to: 'TripJournal' },
  { label: 'Tiến độ đoàn', icon: '🥾', to: 'GroupProgress' },
  { label: 'Tìm porter đồng hành', icon: '🎒', to: 'FindPorter' },
  { label: 'Cài đặt', icon: '⚙', to: 'Settings' },
];

// TAB 5 — Hồ sơ / Cột mốc / R&D.
export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<Nav>();
  const u = currentUser;
  const levelName = u.level === 1 ? 'Mới' : u.level === 2 ? 'Có kinh nghiệm' : 'Tổ chức/Tour';

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
      {/* Header hồ sơ (ảnh bìa núi) */}
      <View style={[styles.cover, { paddingTop: insets.top + space[4] }]}>
        <Pressable style={styles.coverAction} onPress={() => nav.navigate('Notifications')} hitSlop={8}>
          <Text style={styles.coverActionIcon}>🔔</Text>
        </Pressable>
        <Pressable onPress={() => nav.navigate('EditProfile')}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>{u.name.trim().charAt(0).toUpperCase()}</Text>
          </View>
        </Pressable>
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

        {/* Menu điều hướng tới các màn v3 */}
        <Text style={styles.section}>QUẢN LÝ</Text>
        <View style={styles.manageList}>
          {MENU.map((m, i, arr) => (
            <Pressable
              key={m.to}
              style={[styles.manageRow, i === arr.length - 1 && styles.manageRowLast]}
              onPress={() => nav.navigate(m.to as never)}
              accessibilityRole="button"
            >
              <Text style={styles.manageIcon}>{m.icon}</Text>
              <Text style={styles.manageLabel}>{m.label}</Text>
              <Text style={styles.manageChev}>›</Text>
            </Pressable>
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
  container: { flex: 1, backgroundColor: colors.bg.base },
  // Hero tối kiểu "Oura": nền glass đặc + viền dưới lime mờ + bóng sâu
  cover: { backgroundColor: colors.bg.surface, alignItems: 'center', paddingBottom: space[5], borderBottomWidth: 1, borderColor: glass.border, ...shadow.glass },
  coverAction: { position: 'absolute', top: space[6], right: space[4], width: sizing.touchMin, height: sizing.touchMin, borderRadius: radius.pill, backgroundColor: glass.fillSunk, borderWidth: 1, borderColor: glass.border, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  coverActionIcon: { fontSize: 18 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.brand.primary, marginBottom: space[3], alignItems: 'center', justifyContent: 'center', ...shadow.limeGlow },
  avatarInitial: { ...type.display, color: colors.text.onLime },
  name: { ...type.h1, color: colors.text.primary },
  level: { ...type.meta, color: colors.brand.primary, marginTop: space[1] },
  // Vòng/thanh uy tín Lime trên rãnh chìm tối
  repBar: { width: 200, height: 8, borderRadius: radius.pill, backgroundColor: colors.bg.baseDark, borderWidth: 1, borderColor: glass.border, marginTop: space[3], overflow: 'hidden' },
  repFill: { height: '100%', backgroundColor: colors.brand.primary, borderRadius: radius.pill },
  repText: { ...type.caption, color: colors.text.secondary, marginTop: space[2] },
  body: { padding: space.screen },
  section: { ...type.h2, color: colors.text.primary, marginTop: space[4], marginBottom: space[3] },
  stats: { flexDirection: 'row', backgroundColor: glass.fill, borderRadius: radius.lg, borderWidth: 1, borderColor: glass.border, paddingVertical: space[4], ...shadow.glass },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  badge: { backgroundColor: glass.fillAlt, borderRadius: radius.pill, borderWidth: 1, borderColor: glass.border, paddingHorizontal: space[3], paddingVertical: space[2], ...shadow.glassSoft },
  badgeText: { ...type.meta, color: colors.earth },
  manageList: { backgroundColor: glass.fill, borderRadius: radius.lg, borderWidth: 1, borderColor: glass.border, ...shadow.glass, overflow: 'hidden' },
  manageRow: { flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: sizing.touchMin, paddingHorizontal: space[4], paddingVertical: space[3], borderBottomWidth: StyleSheet.hairlineWidth, borderColor: colors.border },
  manageRowLast: { borderBottomWidth: 0 },
  manageIcon: { fontSize: 16, width: 22, textAlign: 'center' },
  manageLabel: { ...type.body, color: colors.text.primary, flex: 1 },
  manageChev: { ...type.h2, color: colors.text.faint },
  paragraph: { ...type.body, color: colors.text.secondary, marginBottom: space[2] },
  // Card premium glass + nhãn Lime (thay khối lime chói chữ-lime-trên-lime)
  premium: { backgroundColor: glass.fill, borderRadius: radius.lg, borderWidth: 1, borderColor: glass.borderStrong, padding: space[4], marginTop: space[5], flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', ...shadow.glass },
  premiumText: { ...type.meta, color: colors.brand.primary, fontWeight: '700' },
  premiumHint: { ...type.caption, color: colors.text.secondary, fontWeight: '600' },
});
