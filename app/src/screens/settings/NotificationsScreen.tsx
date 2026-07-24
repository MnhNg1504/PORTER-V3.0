import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { colors, radius, space, shadow, type, sizing } from '../../theme';
import { glass } from '../../theme/tokens';
import { BrandIcon, BrandIconName } from '../../components/BrandIcon';

// Màn "Thông báo" (v3) — list thông báo trên card glass, chấm chưa đọc lime.
// Bám prototype/potter-app-v3-standalone.html (data-screen-label="Thông báo").
type Props = NativeStackScreenProps<RootStackParamList, 'Notifications'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

interface NotifItem {
  id: string;
  icon: BrandIconName;
  iconColor: string;
  iconBg: string;
  name: string;
  text: string;
  when: string;
  unread: boolean;
}

// Mock cục bộ (TODO(api): GET /notifications). Bám mock trong standalone.
const NOTIFS: NotifItem[] = [
  { id: 'n1', icon: 'summit', iconColor: colors.accent.summit, iconBg: 'rgba(255,82,51,0.14)', name: 'Minh Tuấn', text: 'đã thích ảnh check-in của bạn', when: '2 phút', unread: true },
  { id: 'n2', icon: 'chat', iconColor: colors.earth, iconBg: 'rgba(159,203,181,0.14)', name: 'Thu Hà', text: 'bình luận: "Đỉnh quá, cho mình xin cung với!"', when: '15 phút', unread: true },
  { id: 'n3', icon: 'guide', iconColor: colors.brand.primary, iconBg: 'rgba(201,226,101,0.14)', name: 'Đoàn Tà Xùa', text: 'A Sùng đã xác nhận dẫn đoàn thứ 7 này', when: '1 giờ', unread: true },
  { id: 'n4', icon: 'check', iconColor: colors.brand.primary, iconBg: 'rgba(201,226,101,0.14)', name: 'Đơn mới', text: 'Cung Lảo Thẩn của bạn có 1 lượt đặt cọc', when: '2 giờ', unread: false },
  { id: 'n5', icon: 'compass', iconColor: colors.warning, iconBg: 'rgba(232,200,119,0.14)', name: 'Cung được duyệt', text: 'Cung "Tà Xùa – Sống lưng khủng long" đã lên sàn', when: '3 giờ', unread: false },
  { id: 'n6', icon: 'photo', iconColor: colors.earth, iconBg: 'rgba(159,203,181,0.14)', name: 'Nhắc săn mây', text: 'Lảo Thẩn tỷ lệ biển mây 82% sáng mai', when: 'Hôm qua', unread: false },
];

export function NotificationsScreen(_props: Props) {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      {/* Header có nút back + "Đọc hết" */}
      <View style={[styles.header, { paddingTop: insets.top + space[2] }]}>
        <View style={styles.headerLeft}>
          <Pressable
            onPress={() => nav.goBack()}
            style={styles.backBtn}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
          >
            <Text style={styles.backChevron}>‹</Text>
          </Pressable>
          <Text style={styles.title}>Thông báo</Text>
        </View>
        <Pressable hitSlop={8} style={styles.readAllBtn} accessibilityRole="button">
          <Text style={styles.readAll}>Đọc hết</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: space.screen, paddingBottom: insets.bottom + 120 }}>
        <View style={styles.list}>
          {NOTIFS.map((n) => (
            <Pressable
              key={n.id}
              style={[styles.row, n.unread && styles.rowUnread]}
              accessibilityRole="button"
            >
              <View style={[styles.iconWrap, { backgroundColor: n.iconBg }]}>
                <BrandIcon name={n.icon} size={20} color={n.iconColor} />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowText} numberOfLines={2}>
                  <Text style={styles.rowName}>{n.name} </Text>
                  {n.text}
                </Text>
                <Text style={styles.rowWhen}>{n.when} trước</Text>
              </View>
              {n.unread && <View style={styles.dot} />}
            </Pressable>
          ))}
        </View>
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
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
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
  readAllBtn: { minHeight: sizing.touchMin, justifyContent: 'center' },
  readAll: { ...type.meta, color: colors.brand.primary, fontWeight: '700' },
  list: {
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
    minHeight: 64,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  rowUnread: { backgroundColor: 'rgba(201,226,101,0.06)' },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: { flex: 1 },
  rowText: { ...type.meta, color: colors.text.secondary },
  rowName: { color: colors.text.primary, fontWeight: '700' },
  rowWhen: { ...type.caption, color: colors.text.faint, marginTop: space[1] },
  dot: {
    width: 9,
    height: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.brand.primary,
    ...shadow.limeGlow,
  },
});
