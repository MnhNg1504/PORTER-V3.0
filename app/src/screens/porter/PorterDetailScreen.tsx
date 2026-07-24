import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, radius, space, shadow, type, sizing } from '../../theme';
import { glass, brandPalette } from '../../theme/tokens';
import { StatCell } from '../../components/StatCell';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PorterDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

// ---- MOCK cục bộ. TODO(api): GET /porters/:id ----
interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
}
interface PorterFull {
  id: string;
  name: string;
  initials: string;
  tag: string;
  rating: number;
  trips: number;
  bio: string;
  langs: string[];
  pricePerDayVnd: number;
  freeDays: string[]; // ngày trống (chip)
  reviews: Review[];
}

const MOCK_PORTERS: Record<string, PorterFull> = {
  po_acua: {
    id: 'po_acua',
    name: 'A Của',
    initials: 'AC',
    tag: 'Người Mông · thổ địa Tà Xùa',
    rating: 4.9,
    trips: 214,
    bio: 'Sinh ra và lớn lên ở bản Tà Xùa, thuộc từng lối mòn sống lưng khủng long. Dẫn đoàn săn mây hơn 8 năm, ưu tiên an toàn và nhịp đi vừa sức khách.',
    langs: ['Mông', 'Việt'],
    pricePerDayVnd: 600000,
    freeDays: ['T7 26/7', 'CN 27/7', 'T7 2/8', 'CN 3/8'],
    reviews: [
      { id: 'rv1', author: 'Minh Trek', rating: 5, text: 'Anh Của dẫn rất chắc tay, biết chỗ săn mây đẹp và luôn để ý sức khoẻ cả đoàn.' },
      { id: 'rv2', author: 'Hương Sơn Cước', rating: 5, text: 'Gùi đồ khoẻ, nấu ăn núi ngon. Sẽ đi lại lần sau!' },
    ],
  },
  po_vangado: {
    id: 'po_vangado',
    name: 'Vàng A Dơ',
    initials: 'VD',
    tag: 'Gùi nặng · sơ cứu núi',
    rating: 4.8,
    trips: 176,
    bio: 'Chuyên các cung dài, gùi nặng. Có chứng chỉ sơ cứu núi, mang theo bộ y tế đầy đủ cho mọi chuyến.',
    langs: ['Mông', 'Việt'],
    pricePerDayVnd: 550000,
    freeDays: ['CN 27/7', 'T6 1/8', 'T7 2/8'],
    reviews: [
      { id: 'rv1', author: 'Nam Phượt', rating: 5, text: 'Yên tâm tuyệt đối, anh Dơ lo hết phần nặng.' },
    ],
  },
  po_lyasinh: {
    id: 'po_lyasinh',
    name: 'Lý A Sinh',
    initials: 'LS',
    tag: 'Dẫn đoàn · nấu ăn núi',
    rating: 4.7,
    trips: 132,
    bio: 'Dẫn đoàn thân thiện, nói được tiếng Anh cơ bản. Nổi tiếng với các bữa ăn nóng giữa rừng.',
    langs: ['Việt', 'Anh cơ bản'],
    pricePerDayVnd: 500000,
    freeDays: ['T7 26/7', 'T5 31/7', 'CN 3/8'],
    reviews: [
      { id: 'rv1', author: 'Lan Anh', rating: 5, text: 'Vui tính, chu đáo, đồ ăn ngon bất ngờ.' },
    ],
  },
  po_giangseo: {
    id: 'po_giangseo',
    name: 'Giàng Seo Pao',
    initials: 'GP',
    tag: 'Săn mây · cung dài 2 ngày',
    rating: 4.9,
    trips: 98,
    bio: 'Chuyên cung 2 ngày 1 đêm, biết đúng khung giờ biển mây đẹp nhất. Kiên nhẫn với người mới.',
    langs: ['Mông', 'Việt'],
    pricePerDayVnd: 650000,
    freeDays: ['T7 2/8', 'CN 3/8', 'T7 9/8'],
    reviews: [
      { id: 'rv1', author: 'Quang Đỗ', rating: 5, text: 'Canh mây chuẩn từng phút, ảnh đẹp mê ly.' },
    ],
  },
};

function fmtVnd(v: number): string {
  return `${v.toLocaleString('vi-VN')}đ`;
}

/**
 * MÀN "CHI TIẾT PORTER" — cover + avatar, rating/số chuyến, mô tả, ngôn ngữ,
 * giá/ngày, lịch trống, review mẫu. CTA "Đặt porter · cọc 30%" (demo -> Alert).
 */
export function PorterDetailScreen({ route }: Props) {
  const nav = useNavigation<Nav>();
  const porterId = route.params.porterId;
  const p = MOCK_PORTERS[porterId] ?? MOCK_PORTERS.po_acua;

  function onBook() {
    // DEMO: chưa nối luồng tiền porter. TODO(api): tạo đơn porter + cọc 30% escrow.
    Alert.alert(
      'Đặt porter',
      `Bạn sắp đặt ${p.name} với cọc 30% (${fmtVnd(Math.round(p.pricePerDayVnd * 0.3))}). Bản demo chưa nối thanh toán.`,
      [{ text: 'Đóng', style: 'cancel' }],
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Cover + avatar nổi */}
        <View style={styles.cover}>
          <Text style={styles.coverGlyph}>⛰</Text>
          <View style={styles.coverScrim} />
        </View>

        <View style={styles.headBlock}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{p.initials}</Text>
          </View>
          <Text style={styles.name}>{p.name}</Text>
          <Text style={styles.tag}>{p.tag}</Text>

          {/* Rating + số chuyến */}
          <View style={styles.stats}>
            <StatCell value={`★${p.rating.toFixed(1)}`} label="đánh giá" />
            <StatCell value={`${p.trips}`} label="chuyến dẫn" />
            <StatCell value={fmtVnd(p.pricePerDayVnd)} label="mỗi ngày" />
          </View>
        </View>

        <View style={styles.body}>
          {/* Mô tả */}
          <Text style={styles.section}>Giới thiệu</Text>
          <Text style={styles.paragraph}>{p.bio}</Text>

          {/* Ngôn ngữ */}
          <Text style={styles.section}>Ngôn ngữ</Text>
          <View style={styles.chipRow}>
            {p.langs.map((l) => (
              <View key={l} style={styles.langChip}>
                <Text style={styles.langText}>{l}</Text>
              </View>
            ))}
          </View>

          {/* Lịch trống */}
          <Text style={styles.section}>Lịch trống</Text>
          <View style={styles.chipRow}>
            {p.freeDays.map((d) => (
              <View key={d} style={styles.dayChip}>
                <Text style={styles.dayText}>{d}</Text>
              </View>
            ))}
          </View>

          {/* Review mẫu */}
          <Text style={styles.section}>Đánh giá từ khách</Text>
          {p.reviews.map((rv) => (
            <View key={rv.id} style={styles.reviewCard}>
              <View style={styles.reviewHead}>
                <Text style={styles.reviewAuthor}>{rv.author}</Text>
                <Text style={styles.reviewStars}>{'★'.repeat(rv.rating)}</Text>
              </View>
              <Text style={styles.reviewText}>{rv.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* CTA sticky */}
      <View style={styles.ctaBar}>
        <View style={styles.ctaSummary}>
          <Text style={styles.ctaSummaryLabel}>Cọc 30%</Text>
          <Text style={styles.ctaSummaryValue}>{fmtVnd(Math.round(p.pricePerDayVnd * 0.3))}</Text>
        </View>
        <Pressable
          style={styles.cta}
          onPress={onBook}
          accessibilityRole="button"
          accessibilityLabel={`Đặt porter ${p.name}, cọc 30%`}
        >
          <Text style={styles.ctaText}>ĐẶT PORTER · CỌC 30%</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.base },

  cover: {
    height: 140,
    backgroundColor: brandPalette.pine,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  coverGlyph: {
    position: 'absolute',
    top: -20,
    right: 10,
    fontSize: 150,
    color: colors.brand.primary,
    opacity: 0.2,
  },
  coverScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(8,11,8,0.35)' },

  headBlock: {
    alignItems: 'center',
    paddingHorizontal: space.screen,
    marginTop: -40,
    marginBottom: space[4],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    backgroundColor: glass.fill,
    borderWidth: 2,
    borderColor: glass.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.glass,
  },
  avatarText: { ...type.display, color: colors.brand.primary, fontWeight: '700' },
  name: { ...type.h1, color: colors.text.primary, marginTop: space[3] },
  tag: { ...type.meta, color: colors.text.secondary, marginTop: 2, textAlign: 'center' },
  stats: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    marginTop: space[4],
    paddingVertical: space[3],
    borderRadius: radius.lg,
    backgroundColor: glass.fill,
    borderWidth: 1,
    borderColor: glass.border,
  },

  body: { paddingHorizontal: space.screen },
  section: { ...type.h2, color: colors.text.primary, marginTop: space[4], marginBottom: space[2] },
  paragraph: { ...type.body, color: colors.text.secondary },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  langChip: {
    paddingHorizontal: space[3],
    paddingVertical: space[1],
    borderRadius: radius.sm,
    backgroundColor: glass.fillSunk,
    borderWidth: 1,
    borderColor: glass.border,
  },
  langText: { ...type.meta, color: colors.text.primary },
  dayChip: {
    minHeight: sizing.touchMin,
    justifyContent: 'center',
    paddingHorizontal: space[3],
    borderRadius: radius.md,
    backgroundColor: glass.fillSunk,
    borderWidth: 1,
    borderColor: glass.borderStrong,
  },
  dayText: { ...type.meta, color: colors.brand.primary, fontWeight: '600' },

  reviewCard: {
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: glass.fill,
    borderWidth: 1,
    borderColor: glass.border,
    marginBottom: space.cardGap,
    ...shadow.glassSoft,
  },
  reviewHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space[1],
  },
  reviewAuthor: { ...type.meta, color: colors.text.primary, fontWeight: '700' },
  reviewStars: { ...type.meta, color: colors.warning },
  reviewText: { ...type.body, color: colors.text.secondary },

  ctaBar: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    flexDirection: 'row', alignItems: 'center', gap: space[3],
    padding: space.screen,
    backgroundColor: colors.bg.base,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...shadow.glass,
  },
  ctaSummary: { justifyContent: 'center' },
  ctaSummaryLabel: { ...type.caption, color: colors.text.secondary },
  ctaSummaryValue: { ...type.h2, color: colors.text.primary },
  cta: {
    flex: 1,
    backgroundColor: colors.brand.primary,
    borderRadius: radius.md,
    height: sizing.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.limeGlow,
  },
  ctaText: { ...type.h2, color: colors.text.onLime, fontWeight: '700' },
});
