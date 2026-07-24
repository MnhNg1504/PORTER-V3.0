import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, radius, space, shadow, type, sizing, fonts } from '../../theme';
import { glass } from '../../theme/tokens';
import { StatCell } from '../../components/StatCell';
import { BrandIcon, BrandIconName } from '../../components/BrandIcon';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'TripJournal'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

/**
 * MÀN "NHẬT KÝ HÀNH TRÌNH" — tổng kết sau chuyến (bám prototype screen "Nhật ký hành trình").
 * Hero tối + badge "Hoàn thành" lime · 4 stat card glass (tái dùng StatCell) · lưới ảnh 3 cột ·
 * card "Vệt GPX đã ghi" (biểu đồ độ cao đơn giản dựng bằng View) · nút "Chia sẻ" Lime.
 * TODO(api): completionId → GET tổng kết chuyến thật (quãng/độ cao/ảnh/GPX từ track đã ghi).
 */

// Mock cục bộ tổng kết chuyến.
const JOURNEY = {
  title: 'Tà Xùa 2N1Đ',
  subtitle: 'Sống lưng khủng long · cùng đoàn 8 người',
  completedAt: '28/7/2026',
  stats: [
    { icon: 'routes' as BrandIconName, value: '17,2 km', label: 'Quãng đường', tint: colors.brand.primary },
    { icon: 'compass' as BrandIconName, value: '12:04', label: 'Thời gian', tint: colors.earth },
    { icon: 'summit' as BrandIconName, value: '+1.880 m', label: 'Tổng leo', tint: colors.warning },
    { icon: 'water' as BrandIconName, value: '14:32', label: 'Pace TB /km', tint: colors.accent.summit },
  ],
  photoCount: 32,
  // Cao độ chuẩn hoá 0..1 dọc tuyến (mock) — dựng biểu đồ bằng View (không SVG lib).
  elevation: [
    0.12, 0.18, 0.22, 0.3, 0.28, 0.36, 0.44, 0.5, 0.46, 0.55, 0.64, 0.6, 0.72,
    0.8, 0.86, 0.92, 1.0, 0.94, 0.88, 0.9, 0.82, 0.7, 0.6, 0.5, 0.42,
  ],
};

// 6 ô ảnh (khoảnh khắc) — placeholder glass, mỗi ô 1 glyph khác nhau.
const PHOTO_GLYPHS: BrandIconName[] = ['summit', 'camp', 'photo', 'water', 'guide', 'compass'];

export function TripJournalScreen({ route }: Props) {
  const nav = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  void route.params; // completionId?: dùng khi nối API

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + space[8] }}>
        {/* HERO tối (nền glass đặc, không dùng ảnh/gradient lib) */}
        <View style={styles.hero}>
          <Pressable
            onPress={() => nav.goBack()}
            style={[styles.backBtn, { top: insets.top + space[2] }]}
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
          >
            <Text style={styles.chev}>‹</Text>
          </Pressable>

          <BrandIcon name="summit" size={48} color={glass.borderStrong} />

          <View style={styles.heroFoot}>
            <View style={styles.completeBadge}>
              <BrandIcon name="check" size={13} color={colors.text.onLime} />
              <Text style={styles.completeText}>Hoàn thành · {JOURNEY.completedAt}</Text>
            </View>
            <Text style={styles.heroTitle}>{JOURNEY.title}</Text>
            <Text style={styles.heroSub}>{JOURNEY.subtitle}</Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* 4 STAT CARD glass — tái dùng StatCell */}
          <View style={styles.statGrid}>
            {JOURNEY.stats.map((s) => (
              <View key={s.label} style={styles.statCard}>
                <BrandIcon name={s.icon} size={16} color={s.tint} />
                <View style={styles.statCellWrap}>
                  <StatCell value={s.value} label={s.label} />
                </View>
              </View>
            ))}
          </View>

          {/* KHOẢNH KHẮC — lưới ảnh 3 cột */}
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Khoảnh khắc</Text>
            <Text style={styles.sectionMeta}>{JOURNEY.photoCount} ảnh</Text>
          </View>
          <View style={styles.photoGrid}>
            {PHOTO_GLYPHS.map((g, i) => (
              <View key={i} style={styles.photoCell}>
                <BrandIcon name={g} size={26} color={colors.text.faint} />
              </View>
            ))}
          </View>

          {/* VỆT GPX ĐÃ GHI — biểu đồ độ cao đơn giản dựng bằng View */}
          <View style={styles.gpxCard}>
            <View style={styles.gpxHead}>
              <Text style={styles.gpxTitle}>Vệt GPX đã ghi</Text>
              <Text style={styles.gpxMeta}>10:02 – đỉnh</Text>
            </View>
            <View style={styles.chart}>
              {JOURNEY.elevation.map((h, i) => (
                <View key={i} style={styles.barSlot}>
                  <View style={[styles.bar, { height: `${Math.max(6, h * 100)}%` }]} />
                </View>
              ))}
            </View>
            <View style={styles.gpxAxis}>
              <Text style={styles.axisLabel}>Xuất phát</Text>
              <Text style={styles.axisLabel}>Đỉnh</Text>
            </View>
          </View>

          {/* CHIA SẺ — nút Lime */}
          <Pressable
            style={styles.shareBtn}
            onPress={() => {}}
            accessibilityRole="button"
            accessibilityLabel="Chia sẻ hành trình"
          >
            <BrandIcon name="compass" size={16} color={colors.text.onLime} />
            <Text style={styles.shareText}>Chia sẻ hành trình · đánh dấu GPX</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.base },

  hero: {
    height: 300,
    backgroundColor: colors.bg.surfaceDark,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  backBtn: {
    position: 'absolute',
    left: space[3],
    width: sizing.touchMin,
    height: sizing.touchMin,
    borderRadius: radius.pill,
    backgroundColor: glass.fill,
    borderWidth: 1,
    borderColor: glass.border,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  chev: { color: colors.text.primary, fontSize: 30, lineHeight: 32, marginTop: -2 },
  heroFoot: { position: 'absolute', left: space[5], right: space[5], bottom: space[4] },
  completeBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1],
    backgroundColor: colors.brand.primary,
    borderRadius: radius.pill,
    paddingHorizontal: space[3],
    paddingVertical: 4,
  },
  completeText: { ...type.caption, color: colors.text.onLime, fontWeight: '800', textTransform: 'uppercase' },
  heroTitle: { ...type.display, fontFamily: fonts.display, color: colors.text.primary, marginTop: space[2] },
  heroSub: { ...type.meta, color: colors.text.secondary, marginTop: 2 },

  body: { padding: space.screen },

  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  statCard: {
    width: '48%',
    flexGrow: 1,
    padding: space[3],
    borderRadius: radius.md,
    backgroundColor: glass.fill,
    borderWidth: 1,
    borderColor: glass.border,
    ...shadow.glassSoft,
  },
  statCellWrap: { marginTop: space[2], alignItems: 'flex-start' },

  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: space[6],
  },
  sectionTitle: { ...type.kicker, fontFamily: fonts.display, color: colors.text.primary, textTransform: 'uppercase' },
  sectionMeta: { ...type.meta, color: colors.text.secondary },

  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2], marginTop: space[3] },
  photoCell: {
    width: '31.8%',
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: glass.fillSunk,
    borderWidth: 1,
    borderColor: glass.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  gpxCard: {
    marginTop: space[5],
    padding: space[4],
    borderRadius: radius.lg,
    backgroundColor: glass.fill,
    borderWidth: 1,
    borderColor: glass.border,
    ...shadow.glassSoft,
  },
  gpxHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  gpxTitle: { ...type.kicker, color: colors.text.secondary, textTransform: 'uppercase', fontWeight: '800' },
  gpxMeta: { ...type.caption, color: colors.text.secondary },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 84,
    marginTop: space[3],
    gap: 2,
  },
  barSlot: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: 2, backgroundColor: colors.brand.primary },
  gpxAxis: { flexDirection: 'row', justifyContent: 'space-between', marginTop: space[2] },
  axisLabel: { ...type.caption, color: colors.text.faint },

  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space[2],
    marginTop: space[5],
    height: sizing.buttonHeight,
    borderRadius: radius.pill,
    backgroundColor: colors.brand.primary,
    ...shadow.limeGlow,
  },
  shareText: { ...type.h2, color: colors.text.onLime, fontWeight: '800' },
});
