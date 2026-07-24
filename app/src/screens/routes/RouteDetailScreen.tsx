import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors, radius, space, shadow, type } from '../../theme';
import { glass, brandPalette } from '../../theme/tokens';
import { DifficultyChip } from '../../components/DifficultyChip';
import { StatCell } from '../../components/StatCell';
import { ContourCard } from '../../components/ContourCard';
import { WeatherCard } from '../../components/WeatherCard';
import { mockRoutes, currentUser } from '../../lib/mockData';
import { loadBundledTaXua } from '../../lib/gpxAsset';
import type { GpxPoint } from '../../lib/gpx';
import type { DemGrid } from '../../lib/contour';
import { RootStackParamList } from '../../navigation/types';

// Lưới DEM THẬT (terrarium) sinh offline bằng scripts/gen-dem-grid.mjs — bundle theo app.
// TODO(api): các cung khác tải grid từ backend (GET /routes/:slug/dem-grid).
const TA_XUA_GRID = require('../../../assets/dem/ta-xua-grid.json') as DemGrid;

type Props = NativeStackScreenProps<RootStackParamList, 'RouteDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

// TAB 2 — Chi tiết cung + CTA mua. Elevation profile thật hiển thị ở màn điều hướng/map.
export function RouteDetailScreen({ route }: Props) {
  const nav = useNavigation<Nav>();
  const data = mockRoutes.find((r) => r.id === route.params.routeId) ?? mockRoutes[0];
  const needGuide = currentUser.level === 1 && data.difficulty !== 'easy';

  // Cung Tà Xùa có GPX bundle thật -> hiện thẻ "Route covered" (contour isometric).
  const [taXuaPts, setTaXuaPts] = useState<GpxPoint[] | null>(null);
  useEffect(() => {
    if (data.id !== 'r_taxua') return;
    let alive = true;
    loadBundledTaXua()
      .then((pts) => alive && setTaXuaPts(pts))
      .catch(() => alive && setTaXuaPts(null));
    return () => { alive = false; };
  }, [data.id]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hero brand (ảnh thực địa từ CDN gắn sau — TODO(api)) */}
        <View style={styles.hero}>
          <Text style={styles.heroGlyph}>⛰</Text>
          <View style={styles.heroScrim} />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroName} numberOfLines={2}>{data.name}</Text>
            <Text style={styles.heroRegion}>{data.region}</Text>
          </View>
          <View style={styles.heroChip}>
            <DifficultyChip difficulty={data.difficulty} />
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.name}>{data.name}</Text>
          <Text style={styles.sub}>
            {data.distanceKm}km · ↑{data.gainM}m · {data.durationText} · {data.bestSeason} đẹp nhất
          </Text>

          <View style={styles.stats}>
            <StatCell value={`${data.distanceKm}`} label="km" />
            <StatCell value={`↑${data.gainM}m`} label="tổng leo" />
            <StatCell value={data.durationText} label="thời gian" />
            <StatCell value={`★${data.rating}`} label={`${data.reviewCount} review`} />
          </View>

          {/* "Route covered" — contour isometric từ DEM + GPX THẬT (cung Tà Xùa).
              TODO(api): cung khác nạp GPX + DEM grid từ backend rồi render y hệt. */}
          {data.id === 'r_taxua' && taXuaPts ? (
            <View style={{ marginBottom: space[4] }}>
              <ContourCard grid={TA_XUA_GRID} points={taXuaPts} title={data.name} />
            </View>
          ) : (
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapPlaceholderText}>
                Mini map + track mẫu (MapLibre thật){'\n'}Xem đầy đủ ở màn Điều hướng
              </Text>
            </View>
          )}

          {/* Thời tiết THẬT tại điểm xuất phát (Open-Meteo) + đánh giá an toàn */}
          <View style={{ marginBottom: space[4] }}>
            <WeatherCard
              lat={data.startPoint.lat}
              lon={data.startPoint.lon}
              label={data.startPoint.label}
            />
          </View>

          <Text style={styles.section}>Mô tả</Text>
          <Text style={styles.paragraph}>
            Cung {data.region}. Điểm nước, điểm cắm trại và mô tả chi tiết sẽ nạp từ backend.
          </Text>

          {needGuide && <Text style={styles.warn}>⚠ Cung khó — Cấp 1 cần đi cùng người hướng dẫn.</Text>}
        </View>
      </ScrollView>

      {/* CTA sticky */}
      <View style={styles.ctaBar}>
        <Pressable
          style={styles.buyBtn}
          onPress={() => nav.navigate('Booking', { routeId: data.id })}
        >
          {/* Luồng tiền (docs/16): Booking → cọc 30% → đi cung. StartPoint mở sau khi đặt. */}
          <Text style={styles.buyText}>MUA CUNG HƯỚNG DẪN — {data.priceVnd.toLocaleString('vi-VN')}đ</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.base },
  hero: { height: 220, backgroundColor: brandPalette.pine, justifyContent: 'flex-end', overflow: 'hidden' },
  heroGlyph: { position: 'absolute', top: -10, right: 8, fontSize: 168, color: colors.brand.primary, opacity: 0.22 },
  heroScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(8,11,8,0.45)' },
  heroOverlay: { padding: space[4] },
  heroName: { ...type.h1, color: colors.text.primary },
  heroRegion: { ...type.meta, color: colors.text.primary, opacity: 0.85, marginTop: space[1] },
  heroChip: { position: 'absolute', top: space[4], right: space[4] },
  body: { padding: space.screen },
  name: { ...type.display, color: colors.text.primary },
  sub: { ...type.meta, color: colors.text.secondary, marginTop: space[2] },
  stats: {
    flexDirection: 'row',
    marginVertical: space[4],
    paddingVertical: space[4],
    paddingHorizontal: space[2],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: glass.border,
    backgroundColor: glass.fill,
    ...shadow.glassSoft,
  },
  mapPlaceholder: {
    height: 140,
    borderRadius: radius.lg,
    backgroundColor: glass.fill,
    borderWidth: 1,
    borderColor: glass.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space[4],
    ...shadow.glassSoft,
  },
  mapPlaceholderText: { ...type.meta, color: colors.rock, textAlign: 'center' },
  section: { ...type.h2, color: colors.text.primary, marginTop: space[2], marginBottom: space[2] },
  paragraph: { ...type.body, color: colors.text.secondary },
  warn: {
    ...type.meta,
    color: brandPalette.emberSoft,
    marginTop: space[4],
    padding: space[3],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,82,51,0.35)',
    backgroundColor: 'rgba(255,82,51,0.08)',
  },
  ctaBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: space.screen,
    backgroundColor: colors.bg.base,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...shadow.card,
  },
  buyBtn: {
    backgroundColor: colors.brand.primary,
    borderRadius: radius.md,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.limeGlow,
  },
  buyText: { color: colors.text.onLime, ...type.h2 },
});
