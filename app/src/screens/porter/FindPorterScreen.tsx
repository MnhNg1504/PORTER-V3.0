import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, radius, space, shadow, type, sizing } from '../../theme';
import { glass, brandPalette } from '../../theme/tokens';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'FindPorter'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

// ---- MOCK cục bộ: mockData chưa có porters. TODO(api): GET /porters?routeId=... ----
export interface PorterLite {
  id: string;
  name: string;
  initials: string; // avatar chữ (tránh phụ thuộc ảnh)
  tag: string; // vai trò / thế mạnh
  langs: string[]; // ngôn ngữ
  slotsLeft: number; // slot trống trong đoàn ghép
  pricePerDayVnd: number; // giá cố định / ngày
  rating: number;
  trips: number;
}

const MOCK_PORTERS: PorterLite[] = [
  {
    id: 'po_acua',
    name: 'A Của',
    initials: 'AC',
    tag: 'Người Mông · thổ địa Tà Xùa',
    langs: ['Mông', 'Việt'],
    slotsLeft: 2,
    pricePerDayVnd: 600000,
    rating: 4.9,
    trips: 214,
  },
  {
    id: 'po_vangado',
    name: 'Vàng A Dơ',
    initials: 'VD',
    tag: 'Gùi nặng · sơ cứu núi',
    langs: ['Mông', 'Việt'],
    slotsLeft: 1,
    pricePerDayVnd: 550000,
    rating: 4.8,
    trips: 176,
  },
  {
    id: 'po_lyasinh',
    name: 'Lý A Sinh',
    initials: 'LS',
    tag: 'Dẫn đoàn · nấu ăn núi',
    langs: ['Việt', 'Anh cơ bản'],
    slotsLeft: 3,
    pricePerDayVnd: 500000,
    rating: 4.7,
    trips: 132,
  },
  {
    id: 'po_giangseo',
    name: 'Giàng Seo Pao',
    initials: 'GP',
    tag: 'Săn mây · cung dài 2 ngày',
    langs: ['Mông', 'Việt'],
    slotsLeft: 4,
    pricePerDayVnd: 650000,
    rating: 4.9,
    trips: 98,
  },
];

function fmtVnd(v: number): string {
  return `${v.toLocaleString('vi-VN')}đ`;
}

/**
 * MÀN "TÌM PORTER" — ghép đoàn chia tiền porter (docs/13 điểm sáng).
 * Banner ghép đoàn nổi bật + list porter (giá cố định, Potter giữ 10%).
 * Bấm porter -> PorterDetail.
 */
export function FindPorterScreen({ route }: Props) {
  const nav = useNavigation<Nav>();
  const routeId = route.params?.routeId;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: space.screen, paddingBottom: 120 }}>
        {/* Banner ghép đoàn chia tiền — card glass viền lime nổi bật */}
        <View style={styles.banner}>
          <Text style={styles.bannerKicker}>GHÉP ĐOÀN · CHIA TIỀN PORTER</Text>
          <Text style={styles.bannerTitle}>Ghép đoàn chia tiền porter — còn ~90k/người</Text>
          <Text style={styles.bannerBody}>
            Đi ghép với các nhóm khác cùng ngày để chia đều tiền porter. Càng đông, giá mỗi
            người càng rẻ.
          </Text>
          <View style={styles.bannerFoot}>
            <View style={styles.bannerPill}>
              <Text style={styles.bannerPillText}>3 nhóm đang mở</Text>
            </View>
            <Text style={styles.bannerSave}>Tiết kiệm tới 40%</Text>
          </View>
        </View>

        {/* Sub-header: cơ chế giá */}
        <View style={styles.subHeader}>
          <Text style={styles.subHeaderText}>Giá cố định · Potter giữ 10%</Text>
          {routeId ? (
            <Text style={styles.subHeaderHint}>Cho cung bạn đang xem</Text>
          ) : null}
        </View>

        {/* List porter */}
        {MOCK_PORTERS.map((p) => (
          <Pressable
            key={p.id}
            style={styles.card}
            onPress={() => nav.navigate('PorterDetail', { porterId: p.id })}
            accessibilityRole="button"
            accessibilityLabel={`Xem porter ${p.name}`}
          >
            <View style={styles.cardTop}>
              {/* Avatar chữ */}
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{p.initials}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <Text style={styles.name} numberOfLines={1}>{p.name}</Text>
                  <Text style={styles.rating}>★ {p.rating.toFixed(1)}</Text>
                </View>
                <Text style={styles.tag} numberOfLines={1}>{p.tag}</Text>

                {/* Ngôn ngữ */}
                <View style={styles.langRow}>
                  {p.langs.map((l) => (
                    <View key={l} style={styles.langChip}>
                      <Text style={styles.langText}>{l}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            {/* Slot trống + giá + CTA */}
            <View style={styles.cardBottom}>
              <View style={{ flex: 1 }}>
                <Text style={styles.slot}>
                  {p.slotsLeft > 0 ? `Còn ${p.slotsLeft} slot ghép đoàn` : 'Đã đầy đoàn'}
                </Text>
                <Text style={styles.price}>
                  {fmtVnd(p.pricePerDayVnd)}<Text style={styles.priceUnit}> /ngày</Text>
                </Text>
              </View>
              <View style={styles.bookBtn}>
                <Text style={styles.bookText}>Đặt · cọc 30%</Text>
              </View>
            </View>
          </Pressable>
        ))}

        <Text style={styles.footNote}>
          Giá cố định do porter niêm yết. Potter giữ 10% phí nền tảng, phần còn lại chuyển
          trực tiếp cho porter sau chuyến. Cọc 30% giữ trong ví ký quỹ (escrow).
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.base },

  // Banner ghép đoàn — viền lime + quầng sáng
  banner: {
    padding: space[4],
    borderRadius: radius.card,
    backgroundColor: glass.fill,
    borderWidth: 1,
    borderColor: glass.borderStrong,
    marginBottom: space[4],
    ...shadow.limeGlow,
  },
  bannerKicker: { ...type.kicker, color: colors.brand.primary, textTransform: 'uppercase' },
  bannerTitle: { ...type.h1, color: colors.text.primary, marginTop: space[2] },
  bannerBody: { ...type.meta, color: colors.text.secondary, marginTop: space[2] },
  bannerFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    marginTop: space[3],
  },
  bannerPill: {
    paddingHorizontal: space[3],
    paddingVertical: space[1],
    borderRadius: radius.pill,
    backgroundColor: colors.brand.primary,
  },
  bannerPillText: { ...type.caption, color: colors.text.onLime, fontWeight: '700' },
  bannerSave: { ...type.meta, color: brandPalette.sageTeal, fontWeight: '700' },

  subHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: space[3],
  },
  subHeaderText: { ...type.meta, color: colors.text.secondary },
  subHeaderHint: { ...type.caption, color: colors.text.faint },

  // Card porter
  card: {
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: glass.fill,
    borderWidth: 1,
    borderColor: glass.border,
    marginBottom: space.cardGap,
    ...shadow.glassSoft,
  },
  cardTop: { flexDirection: 'row', gap: space[3], alignItems: 'center' },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: glass.fillSunk,
    borderWidth: 1,
    borderColor: glass.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { ...type.h2, color: colors.brand.primary, fontWeight: '700' },
  nameRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[2] },
  name: { ...type.h2, color: colors.text.primary, flex: 1 },
  rating: { ...type.meta, color: colors.warning, fontWeight: '700' },
  tag: { ...type.meta, color: colors.text.secondary, marginTop: 2 },
  langRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2], marginTop: space[2] },
  langChip: {
    paddingHorizontal: space[2],
    paddingVertical: 3,
    borderRadius: radius.sm,
    backgroundColor: glass.fillSunk,
    borderWidth: 1,
    borderColor: glass.border,
  },
  langText: { ...type.caption, color: colors.text.secondary },

  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    marginTop: space[3],
    paddingTop: space[3],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  slot: { ...type.caption, color: brandPalette.sageTeal, fontWeight: '600' },
  price: { ...type.h2, color: colors.text.primary, marginTop: 2 },
  priceUnit: { ...type.meta, color: colors.text.secondary, fontWeight: '400' },
  bookBtn: {
    minHeight: sizing.touchMin,
    paddingHorizontal: space[4],
    borderRadius: radius.md,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.limeGlow,
  },
  bookText: { ...type.meta, color: colors.text.onLime, fontWeight: '700' },

  footNote: { ...type.caption, color: colors.text.faint, marginTop: space[3], lineHeight: 16 },
});
