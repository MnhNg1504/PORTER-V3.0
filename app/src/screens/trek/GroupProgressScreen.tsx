import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, radius, space, shadow, type, sizing, fonts } from '../../theme';
import { glass } from '../../theme/tokens';
import { BrandIcon } from '../../components/BrandIcon';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'GroupProgress'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

/**
 * MÀN "TIẾN ĐỘ ĐOÀN" — CHẾ ĐỘ AN TOÀN, KHÔNG PHẢI LEADERBOARD (docs/14 mâu thuẫn #2, mục 6/7).
 * Mục tiêu: trưởng đoàn thấy ai đang tụt lại để CHỜ / hỗ trợ — KHÔNG cổ vũ đua tốc độ, KHÔNG thúc tách tốp.
 * Quy ước: thành viên cách người đi đầu > 500 m được tô ember "cần chú ý".
 * TODO(api): entity `group` chưa có ở backend (docs/14 P2) — mock cục bộ để dựng UI.
 */

interface Member {
  id: string;
  name: string;
  initial: string;
  distanceKm: number; // quãng đã đi dọc cung
  paceText: string; // pace TB /km
  isYou?: boolean;
  isLeader?: boolean; // trưởng đoàn / người dẫn
}

// Tổng chiều dài cung (Tà Xùa – Sống lưng khủng long) để tính % tiến độ.
const ROUTE_TOTAL_KM = 12.4;
const LAG_ALERT_M = 500; // ngưỡng "cần chú ý"

const MEMBERS: Member[] = [
  { id: 'g1', name: 'A Của (trưởng đoàn)', initial: 'C', distanceKm: 8.4, paceText: '12:10', isLeader: true },
  { id: 'g2', name: 'Nao Chi', initial: 'N', distanceKm: 8.1, paceText: '12:40', isYou: true },
  { id: 'g3', name: 'Minh Trek', initial: 'M', distanceKm: 8.0, paceText: '12:55' },
  { id: 'g4', name: 'Hương Sơn Cước', initial: 'H', distanceKm: 7.9, paceText: '13:05' },
  { id: 'g5', name: 'Lan Anh', initial: 'L', distanceKm: 7.4, paceText: '14:20' },
  { id: 'g6', name: 'Bình Còi', initial: 'B', distanceKm: 6.8, paceText: '15:40' },
];

export function GroupProgressScreen({ route }: Props) {
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  void route.params; // routeId?: dùng khi nối API đoàn thật

  // Người đi đầu làm mốc — tính khoảng tụt của từng người (mét).
  const frontKm = useMemo(() => Math.max(...MEMBERS.map((m) => m.distanceKm)), []);
  const rows = useMemo(
    () =>
      MEMBERS.map((m) => {
        const lagM = Math.round((frontKm - m.distanceKm) * 1000);
        return { ...m, lagM, needsAttention: lagM > LAG_ALERT_M };
      }),
    [frontKm]
  );

  const attentionCount = rows.filter((r) => r.needsAttention).length;
  const okCount = rows.length - attentionCount;

  return (
    <View style={styles.container}>
      {/* Thanh trên: quay lại + tiêu đề */}
      <View style={[styles.topbar, { paddingTop: insets.top + space[2] }]}>
        <Pressable
          onPress={() => nav.goBack()}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
        >
          <Text style={styles.chev}>‹</Text>
        </Pressable>
        <Text style={styles.topTitle}>Tiến độ đoàn</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={{ padding: space.screen, paddingBottom: insets.bottom + space[8] }}>
        {/* Tóm tắt đoàn — nhấn AN TOÀN, không xếp hạng */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHead}>
            <BrandIcon name="guide" size={18} color={colors.brand.primary} />
            <Text style={styles.summaryTitle}>Đoàn Tà Xùa · {rows.length} người</Text>
          </View>
          <View style={styles.summaryRow}>
            <View style={styles.summaryStat}>
              <Text style={[styles.summaryValue, { color: colors.success }]}>{okCount}</Text>
              <Text style={styles.summaryLabel}>bám nhịp tốt</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryStat}>
              <Text
                style={[
                  styles.summaryValue,
                  { color: attentionCount > 0 ? colors.accent.summit : colors.text.secondary },
                ]}
              >
                {attentionCount}
              </Text>
              <Text style={styles.summaryLabel}>cần chú ý</Text>
            </View>
          </View>
          <Text style={styles.summaryHint}>
            {attentionCount > 0
              ? 'Có người đang tụt lại — trưởng đoàn nên giảm nhịp và chờ nhau. Đường dài, đi cùng nhau vẫn hơn.'
              : 'Cả đoàn đang đi sát nhau. Giữ nhịp thoải mái, không cần vội.'}
          </Text>
        </View>

        {/* Danh sách thành viên */}
        <View style={styles.list}>
          {rows.map((m) => {
            const pct = Math.max(0, Math.min(100, (m.distanceKm / ROUTE_TOTAL_KM) * 100));
            return (
              <View
                key={m.id}
                style={[styles.memberCard, m.needsAttention && styles.memberCardAlert]}
              >
                <View
                  style={[
                    styles.avatar,
                    m.needsAttention && styles.avatarAlert,
                    m.isYou && styles.avatarYou,
                  ]}
                >
                  <Text style={styles.avatarText}>{m.initial}</Text>
                </View>

                <View style={styles.memberBody}>
                  <View style={styles.memberTop}>
                    <Text style={styles.memberName} numberOfLines={1}>
                      {m.name}
                      {m.isYou ? '  · Bạn' : ''}
                    </Text>
                    <Text style={styles.memberKm}>{m.distanceKm.toFixed(1)} km</Text>
                  </View>

                  <View style={styles.barRow}>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          { width: `${pct}%` },
                          m.needsAttention && styles.barFillAlert,
                        ]}
                      />
                    </View>
                    <Text style={styles.pace}>{m.paceText}/km</Text>
                  </View>

                  {/* Trạng thái: cần chú ý (ember) / trưởng đoàn / đang bám nhịp */}
                  {m.needsAttention ? (
                    <View style={styles.tagRow}>
                      <BrandIcon name="warn" size={13} color={colors.accent.summit} />
                      <Text style={styles.tagAlert}>
                        Cần chú ý · tụt {m.lagM >= 1000 ? `${(m.lagM / 1000).toFixed(1)} km` : `${m.lagM} m`}
                      </Text>
                    </View>
                  ) : m.isLeader ? (
                    <Text style={styles.tagLead}>Đi đầu · giữ đoàn</Text>
                  ) : (
                    <Text style={styles.tagOk}>Đang bám nhịp đoàn</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Nhắc trưởng đoàn — chống văn hoá đua tách tốp */}
        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Lời nhắc an toàn</Text>
          <Text style={styles.noteBody}>
            Đây không phải bảng xếp hạng. Nếu ai đó tụt lại, hãy dừng chờ, chia sẻ nước và đồ ăn.
            Cả đoàn về đích cùng nhau mới là chuyến đi trọn vẹn.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.base },

  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.screen,
    paddingBottom: space[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  iconBtn: {
    width: sizing.touchMin,
    height: sizing.touchMin,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: glass.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chev: { color: colors.text.primary, fontSize: 30, lineHeight: 32, marginTop: -2 },
  topTitle: { ...type.h2, fontFamily: fonts.display, color: colors.text.primary },

  summaryCard: {
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: glass.fill,
    borderWidth: 1,
    borderColor: glass.borderStrong,
    ...shadow.glassSoft,
  },
  summaryHead: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  summaryTitle: { ...type.h2, color: colors.text.primary },
  summaryRow: { flexDirection: 'row', alignItems: 'center', marginTop: space[3] },
  summaryStat: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: StyleSheet.hairlineWidth, alignSelf: 'stretch', backgroundColor: colors.border },
  summaryValue: { ...type.display, fontVariant: ['tabular-nums'] },
  summaryLabel: { ...type.kicker, color: colors.text.secondary, textTransform: 'uppercase', marginTop: 2 },
  summaryHint: { ...type.meta, color: colors.text.secondary, marginTop: space[3], textAlign: 'center' },

  list: { marginTop: space[4], gap: space[2] },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    padding: space[3],
    borderRadius: radius.md,
    backgroundColor: glass.fill,
    borderWidth: 1,
    borderColor: glass.border,
  },
  memberCardAlert: {
    borderColor: colors.accent.summit,
    backgroundColor: glass.fillSunk,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.earth,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarAlert: { backgroundColor: colors.accent.summit },
  avatarYou: { borderWidth: 2, borderColor: colors.brand.primary },
  avatarText: { color: colors.text.onLime, fontWeight: '800', fontSize: 15 },

  memberBody: { flex: 1, minWidth: 0 },
  memberTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: space[2] },
  memberName: { ...type.body, fontWeight: '700', color: colors.text.primary, flex: 1 },
  memberKm: { ...type.meta, fontWeight: '700', color: colors.text.primary, fontVariant: ['tabular-nums'] },

  barRow: { flexDirection: 'row', alignItems: 'center', gap: space[2], marginTop: space[2] },
  barTrack: { flex: 1, height: 5, borderRadius: radius.pill, backgroundColor: glass.fillSunk, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: radius.pill, backgroundColor: colors.brand.primary },
  barFillAlert: { backgroundColor: colors.accent.summit },
  pace: { ...type.caption, color: colors.text.secondary, fontVariant: ['tabular-nums'], flexShrink: 0 },

  tagRow: { flexDirection: 'row', alignItems: 'center', gap: space[1], marginTop: space[2] },
  tagAlert: { ...type.caption, color: colors.accent.summit, fontWeight: '700' },
  tagLead: { ...type.caption, color: colors.brand.primary, fontWeight: '700', marginTop: space[2] },
  tagOk: { ...type.caption, color: colors.text.secondary, marginTop: space[2] },

  noteCard: {
    marginTop: space[4],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: glass.fill,
    borderWidth: 1,
    borderColor: glass.border,
  },
  noteTitle: { ...type.kicker, color: colors.brand.primary, textTransform: 'uppercase', marginBottom: space[2] },
  noteBody: { ...type.meta, color: colors.text.secondary },
});
