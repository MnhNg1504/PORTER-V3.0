import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import MapLibreGL, {
  MapView,
  Camera,
  type CameraRef,
  ShapeSource,
  LineLayer,
  CircleLayer,
} from '@maplibre/maplibre-react-native';

import { colors, radius, space, shadow, type } from '../../theme';
import { RootStackParamList } from '../../navigation/types';
import {
  computeStats,
  toLineFeature,
  toEndpointsFC,
  positionAt,
  boundsOf,
  formatDistance,
  GpxPoint,
  TrackStats,
  LngLat,
} from '../../lib/gpx';
import { generateTurns, nextTurn, meFeature, estimateEta, Turn } from '../../lib/nav';
import { loadBundledTaXua } from '../../lib/gpxAsset';
import { CLEAN_STYLE_URL } from '../../lib/mapStyles';
import { SosSheet } from '../../components/SosSheet';
import { currentUser, mockRoutes } from '../../lib/mockData';
import { brandPalette } from '../../theme';

MapLibreGL.setAccessToken(null);

type Props = NativeStackScreenProps<RootStackParamList, 'RouteNavigate'>;

/**
 * BƯỚC 2 — Điều hướng cung theo GPX track mẫu THẬT (docs 03 §4.2).
 * Snap hiển thị track mẫu, card turn-by-turn sinh từ hình học thật (generateTurns),
 * nút mô phỏng chạy dọc tuyến (chuyển từ nav-demo.html).
 * TODO(api): thay mô phỏng bằng vị trí GPS thật + off-route detection realtime (checkOffRoute).
 */
export function RouteNavigateScreen({ route }: Props) {
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraRef>(null);

  const [points, setPoints] = useState<GpxPoint[] | null>(null);
  const [stats, setStats] = useState<TrackStats | null>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [progress, setProgress] = useState(0); // quãng đã đi (m)
  const [simRunning, setSimRunning] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const routeMeta = mockRoutes.find((r) => r.id === route.params.routeId);

  useEffect(() => {
    // Hiện chỉ có GPX bundle của Tà Xùa. TODO(api): tải GPX theo route.params.routeId.
    loadBundledTaXua().then((pts) => {
      setPoints(pts);
      const st = computeStats(pts);
      setStats(st);
      setTurns(generateTurns(pts, st.cum));
    });
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [route.params.routeId]);

  const lineFC = useMemo(() => (points ? toLineFeature(points) : null), [points]);
  const endsFC = useMemo(() => (points ? toEndpointsFC(points) : null), [points]);
  const coords = useMemo<LngLat[]>(() => (points ? points.map((p) => [p.lon, p.lat]) : []), [points]);

  useEffect(() => {
    if (points && cameraRef.current) {
      const b = boundsOf(points);
      cameraRef.current.fitBounds([b[0], b[1]], [b[2], b[3]], [200, 60, 220, 60], 800);
    }
  }, [points]);

  const me = useMemo(() => {
    if (!points || !stats) return null;
    return positionAt(points, stats.cum, coords, progress);
  }, [points, stats, coords, progress]);

  const toggleSim = () => {
    if (!stats) return;
    if (simRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      setSimRunning(false);
      return;
    }
    setSimRunning(true);
    const step = Math.max(stats.distance / 600, 8);
    timerRef.current = setInterval(() => {
      setProgress((d) => {
        const nd = d + step;
        if (nd >= stats.distance) {
          if (timerRef.current) clearInterval(timerRef.current);
          setSimRunning(false);
          return stats.distance;
        }
        return nd;
      });
    }, 120);
  };

  const upcoming = stats ? nextTurn(turns, progress) : undefined;
  const remaining = stats ? stats.distance - progress : 0;

  // SOS fallback: vị trí hiện tại trên tuyến (khi GPS máy lỗi) — sheet luôn ưu tiên GPS THẬT.
  const sosFallback = me
    ? { lat: me.lngLat[1], lon: me.lngLat[0], ele: me.ele }
    : null;

  return (
    <View style={styles.container}>
      <MapView style={styles.map} mapStyle={CLEAN_STYLE_URL} logoEnabled={false}>
        <Camera ref={cameraRef} />
        {lineFC && (
          <ShapeSource id="nav-track" shape={lineFC as any}>
            <LineLayer id="nav-casing" style={{ lineColor: '#fff', lineWidth: 10, lineCap: 'round', lineJoin: 'round' }} />
            <LineLayer id="nav-line" style={{ lineColor: colors.map.trackPlanned, lineWidth: 6, lineCap: 'round', lineJoin: 'round' }} />
          </ShapeSource>
        )}
        {endsFC && (
          <ShapeSource id="nav-ends" shape={endsFC as any}>
            <CircleLayer
              id="nav-ends-c"
              style={{
                circleRadius: 8,
                circleColor: ['match', ['get', 'role'], 'start', colors.map.start, colors.map.end] as any,
                circleStrokeWidth: 3,
                circleStrokeColor: '#fff',
              }}
            />
          </ShapeSource>
        )}
        {me && (
          <ShapeSource id="nav-me" shape={meFeature(me.lngLat) as any}>
            <CircleLayer id="nav-me-halo" style={{ circleRadius: 16, circleColor: colors.map.me, circleOpacity: 0.18 }} />
            <CircleLayer id="nav-me-dot" style={{ circleRadius: 8, circleColor: colors.map.me, circleStrokeWidth: 3, circleStrokeColor: '#fff' }} />
          </ShapeSource>
        )}
      </MapView>

      {/* Card điều hướng turn-by-turn (giống nav-demo) */}
      <View style={[styles.navCard, { top: insets.top + space[3] }]}>
        <View style={styles.main}>
          <View style={styles.arrow}>
            <Text style={styles.arrowIcon}>{upcoming ? (upcoming.dir === 'right' ? '➤' : '⬅') : '◎'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.instrMain}>{upcoming ? (upcoming.dir === 'right' ? 'Rẽ phải' : 'Rẽ trái') : 'Tới đỉnh'}</Text>
            <Text style={styles.instrSub}>
              {upcoming ? `sau ${formatDistance(upcoming.at - progress)}` : formatDistance(remaining)}
            </Text>
          </View>
        </View>
        <View style={styles.foot}>
          <Text style={styles.footItem}>Còn lại <Text style={styles.footB}>{formatDistance(remaining)}</Text></Text>
          <Text style={styles.footItem}>ETA <Text style={styles.footB}>{estimateEta(remaining)}</Text></Text>
          <Text style={styles.footItem}>Độ cao <Text style={styles.footB}>{me?.ele != null ? `${Math.round(me.ele)}m` : '—'}</Text></Text>
        </View>
      </View>

      {/* Nút SOS — luôn hiện, nổi bật Ember (docs/05 §5) */}
      <Pressable
        style={[styles.sosBtn, { bottom: insets.bottom + space[8] + 56 }]}
        onPress={() => setSosOpen(true)}
        accessibilityLabel="Mở khẩn cấp SOS"
      >
        <Text style={styles.sosText}>SOS</Text>
      </Pressable>

      {/* Nút mô phỏng + nhắn hướng dẫn */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + space[3] }]}>
        <Pressable style={styles.simBtn} onPress={toggleSim}>
          <Text style={styles.simText}>{simRunning ? '⏸ Dừng mô phỏng' : '▶ Mô phỏng dẫn đường'}</Text>
        </Pressable>
      </View>

      <SosSheet
        visible={sosOpen}
        onClose={() => setSosOpen(false)}
        routeName={routeMeta?.name}
        fallbackPos={sosFallback}
        emergencyContact={currentUser.emergencyContact ?? null}
      />

      {!points && (
        <View style={styles.center}>
          <ActivityIndicator color={colors.brand.primary} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  sosBtn: {
    position: 'absolute',
    right: space[3],
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: brandPalette.ember,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    ...shadow.fab,
  },
  sosText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15, letterSpacing: 1 },
  navCard: {
    position: 'absolute',
    left: space[3],
    right: space[3],
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: radius.lg,
    padding: space[4],
    ...shadow.fab,
  },
  main: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  arrow: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.map.trackPlanned,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowIcon: { color: '#fff', fontSize: 26 },
  instrMain: { fontSize: 22, fontWeight: '800', color: colors.text.primary },
  instrSub: { ...type.meta, color: colors.text.secondary, marginTop: 2 },
  foot: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: space[3],
    paddingTop: space[3],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  footItem: { ...type.meta, color: colors.text.secondary },
  footB: { color: colors.text.primary, fontWeight: '700' },
  bottomBar: { position: 'absolute', left: space.screen, right: space.screen, bottom: space[4] },
  simBtn: {
    backgroundColor: colors.brand.primary,
    borderRadius: radius.md,
    paddingVertical: space[4],
    alignItems: 'center',
    ...shadow.fab,
  },
  simText: { color: '#fff', ...type.h2 },
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
});
