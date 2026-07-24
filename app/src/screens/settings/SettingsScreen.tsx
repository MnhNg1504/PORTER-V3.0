import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { colors, radius, space, shadow, type, sizing } from '../../theme';
import { glass } from '../../theme/tokens';
import { BrandIcon, BrandIconName } from '../../components/BrandIcon';
import { currentUser } from '../../lib/mockData';

// Màn "Cài đặt" (v3) — nhóm mục dạng hàng card glass + chevron, toggle dark-mode,
// nút Đăng xuất ember. Bám prototype (data-screen-label="Cài đặt").
type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

type Row =
  | { kind: 'nav'; name: string; sub: string; icon: BrandIconName; iconColor: string; iconBg: string; onPress?: () => void }
  | { kind: 'value'; name: string; sub: string; icon: BrandIconName; iconColor: string; iconBg: string; value: string; onPress?: () => void }
  | { kind: 'toggle'; name: string; sub: string; icon: BrandIconName; iconColor: string; iconBg: string; on: boolean; onToggle: () => void };

interface Group {
  title: string;
  rows: Row[];
}

// Toggle nội bộ (không thêm dependency — dựng bằng View/Pressable + token).
function Switch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <Pressable
      onPress={onToggle}
      hitSlop={10}
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      style={[styles.switchTrack, on ? styles.switchOn : styles.switchOff]}
    >
      <View style={[styles.switchKnob, on ? styles.knobOn : styles.knobOff]} />
    </Pressable>
  );
}

export function SettingsScreen(_props: Props) {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<Nav>();

  const [darkMode, setDarkMode] = useState(true); // mặc định BẬT
  const [offline, setOffline] = useState(true);
  const [sos, setSos] = useState(true);
  const [push, setPush] = useState(true);

  const groups: Group[] = [
    {
      title: 'Tài khoản',
      rows: [
        { kind: 'nav', name: 'Hồ sơ & ảnh đại diện', sub: 'Tên, tiểu sử, avatar', icon: 'guide', iconColor: colors.brand.primary, iconBg: 'rgba(201,226,101,0.14)', onPress: () => nav.navigate('EditProfile') },
        { kind: 'value', name: 'Số điện thoại', sub: 'Đăng nhập & khôi phục', icon: 'chat', iconColor: colors.earth, iconBg: 'rgba(159,203,181,0.14)', value: 'Đã xác thực' },
      ],
    },
    {
      title: 'Quyền riêng tư',
      rows: [
        { kind: 'value', name: 'Hồ sơ công khai', sub: 'Ai xem được cột mốc của bạn', icon: 'compass', iconColor: colors.earth, iconBg: 'rgba(159,203,181,0.14)', value: 'Mọi người' },
        { kind: 'nav', name: 'Tài khoản đã chặn', sub: 'Quản lý danh sách chặn', icon: 'warn', iconColor: colors.warning, iconBg: 'rgba(232,200,119,0.14)' },
      ],
    },
    {
      title: 'An toàn & GPS',
      rows: [
        { kind: 'toggle', name: 'Cảnh báo lệch tuyến (SOS)', sub: 'Rung + chuông khi rời cung', icon: 'warn', iconColor: colors.accent.summit, iconBg: 'rgba(255,82,51,0.14)', on: sos, onToggle: () => setSos((v) => !v) },
        { kind: 'value', name: 'Liên hệ khẩn cấp', sub: 'Người thân + trạm cứu hộ gần nhất', icon: 'guide', iconColor: colors.earth, iconBg: 'rgba(159,203,181,0.14)', value: '2 số' },
      ],
    },
    {
      title: 'Bản đồ / Offline',
      rows: [
        { kind: 'toggle', name: 'Tự tải bản đồ ngoại tuyến', sub: 'Tải trước khi vào vùng không sóng', icon: 'routes', iconColor: colors.earth, iconBg: 'rgba(159,203,181,0.16)', on: offline, onToggle: () => setOffline((v) => !v) },
        { kind: 'value', name: 'Đơn vị đo', sub: 'Khoảng cách & độ cao', icon: 'summit', iconColor: colors.text.primary, iconBg: 'rgba(234,241,228,0.08)', value: 'km · m' },
        { kind: 'value', name: 'Bộ nhớ bản đồ đã tải', sub: '3 cung · 7,2 MB', icon: 'camp', iconColor: colors.text.primary, iconBg: 'rgba(234,241,228,0.08)', value: 'Xoá' },
      ],
    },
    {
      title: 'Thông báo',
      rows: [
        { kind: 'toggle', name: 'Thông báo đẩy', sub: 'Tin đoàn, bình luận, nhắc săn mây', icon: 'compass', iconColor: colors.brand.primary, iconBg: 'rgba(201,226,101,0.14)', on: push, onToggle: () => setPush((v) => !v) },
        { kind: 'value', name: 'Ngôn ngữ', sub: 'Ngôn ngữ ứng dụng', icon: 'chat', iconColor: colors.text.primary, iconBg: 'rgba(234,241,228,0.08)', value: 'Tiếng Việt' },
      ],
    },
    {
      title: 'Giao diện',
      rows: [
        { kind: 'toggle', name: 'Chế độ tối', sub: 'Nền tối, dễ đọc ban đêm', icon: 'summit', iconColor: colors.brand.primary, iconBg: 'rgba(201,226,101,0.14)', on: darkMode, onToggle: () => setDarkMode((v) => !v) },
      ],
    },
    {
      title: 'Về Potter',
      rows: [
        { kind: 'value', name: 'Phiên bản', sub: 'POTTER 3.0', icon: 'home', iconColor: colors.text.primary, iconBg: 'rgba(234,241,228,0.08)', value: '3.0.0' },
        { kind: 'nav', name: 'Điều khoản & Quyền riêng tư', sub: 'Chính sách sử dụng', icon: 'check', iconColor: colors.earth, iconBg: 'rgba(159,203,181,0.14)' },
        { kind: 'nav', name: 'Đánh giá ứng dụng', sub: 'Góp ý giúp POTTER tốt hơn', icon: 'photo', iconColor: colors.warning, iconBg: 'rgba(232,200,119,0.14)' },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + space[2] }]}>
        <Pressable
          onPress={() => nav.goBack()}
          style={styles.backBtn}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
        >
          <Text style={styles.backChevron}>‹</Text>
        </Pressable>
        <Text style={styles.title}>Cài đặt</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: space.screen, paddingBottom: insets.bottom + 120 }}>
        {/* Thẻ hồ sơ nhanh → mở EditProfile */}
        <Pressable
          onPress={() => nav.navigate('EditProfile')}
          style={styles.profileCard}
          accessibilityRole="button"
        >
          <View style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{currentUser.name}</Text>
            <Text style={styles.profileSub}>Sửa hồ sơ & ảnh đại diện</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>

        {groups.map((g) => (
          <View key={g.title} style={styles.group}>
            <Text style={styles.groupTitle}>{g.title}</Text>
            <View style={styles.card}>
              {g.rows.map((r, i) => {
                const last = i === g.rows.length - 1;
                const content = (
                  <View style={[styles.row, last && styles.rowLast]}>
                    <View style={[styles.iconWrap, { backgroundColor: r.iconBg }]}>
                      <BrandIcon name={r.icon} size={20} color={r.iconColor} />
                    </View>
                    <View style={styles.rowBody}>
                      <Text style={styles.rowName}>{r.name}</Text>
                      <Text style={styles.rowSub} numberOfLines={1}>{r.sub}</Text>
                    </View>
                    {r.kind === 'toggle' && <Switch on={r.on} onToggle={r.onToggle} />}
                    {r.kind === 'value' && <Text style={styles.rowValue}>{r.value}</Text>}
                    {(r.kind === 'nav' || r.kind === 'value') && <Text style={styles.chevron}>›</Text>}
                  </View>
                );
                if (r.kind === 'toggle') {
                  return <View key={r.name}>{content}</View>;
                }
                return (
                  <Pressable key={r.name} onPress={r.onPress} accessibilityRole="button">
                    {content}
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        {/* Nút Đăng xuất — ember */}
        <Pressable style={styles.logoutBtn} accessibilityRole="button">
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </Pressable>
        <Text style={styles.footer}>POTTER · phiên bản 3.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.base },
  header: {
    paddingHorizontal: space.screen,
    paddingBottom: space[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  backBtn: {
    width: sizing.touchMin,
    height: sizing.touchMin,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: glass.border,
    backgroundColor: glass.fill,
  },
  backChevron: { color: colors.text.primary, fontSize: 26, lineHeight: 28, marginTop: -2 },
  title: { ...type.h1, color: colors.text.primary },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    backgroundColor: glass.fill,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: glass.borderStrong,
    padding: space[3],
    minHeight: 64,
    ...shadow.glass,
  },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.brand.primary },
  profileName: { ...type.h2, color: colors.text.primary },
  profileSub: { ...type.caption, color: colors.text.secondary, marginTop: 2 },

  group: { marginTop: space[5] },
  groupTitle: { ...type.kicker, color: colors.text.secondary, textTransform: 'uppercase', marginBottom: space[2], marginLeft: space[1] },
  card: {
    backgroundColor: glass.fill,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: glass.border,
    overflow: 'hidden',
    ...shadow.glass,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingHorizontal: space[3],
    paddingVertical: space[3],
    minHeight: sizing.touchMin + 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  rowLast: { borderBottomWidth: 0 },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: { flex: 1 },
  rowName: { ...type.body, color: colors.text.primary, fontWeight: '600' },
  rowSub: { ...type.caption, color: colors.text.secondary, marginTop: 2 },
  rowValue: { ...type.meta, color: colors.text.secondary },
  chevron: { color: colors.text.faint, fontSize: 22, lineHeight: 24, marginLeft: space[1] },

  // Toggle
  switchTrack: {
    width: 46,
    height: 28,
    borderRadius: radius.pill,
    padding: 3,
    justifyContent: 'center',
    borderWidth: 1,
  },
  switchOn: { backgroundColor: colors.brand.primary, borderColor: colors.brand.primaryDark, alignItems: 'flex-end' },
  switchOff: { backgroundColor: glass.fillSunk, borderColor: glass.border, alignItems: 'flex-start' },
  switchKnob: { width: 20, height: 20, borderRadius: 10 },
  knobOn: { backgroundColor: colors.text.onLime },
  knobOff: { backgroundColor: colors.text.secondary },

  logoutBtn: {
    marginTop: space[6],
    minHeight: sizing.buttonHeight,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: space[2],
    backgroundColor: 'rgba(255,82,51,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,82,51,0.35)',
    ...shadow.sos,
  },
  logoutText: { ...type.body, color: colors.accent.summit, fontWeight: '700' },
  footer: { ...type.caption, color: colors.text.faint, textAlign: 'center', marginTop: space[4] },
});
