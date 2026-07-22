import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, useWindowDimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapLibreGL, {
  MapView,
  Camera,
  type CameraRef,
  ShapeSource,
  LineLayer,
  CircleLayer,
  UserLocation,
} from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';

import { colors, radius, space, shadow, type, sizing } from '../../theme';
import {
  computeStats,
  toLineFeature,
  toEndpointsFC,
  boundsOf,
  GpxPoint,
  TrackStats,
} from '../../lib/gpx';
import { loadBundledTaXua } from '../../lib/gpxAsset';
import {
  styleFor,
  BASE_LABELS,
  BaseLayerId,
  DEM_SOURCE,
} from '../../lib/mapStyles';
import { ElevationProfile } from '../../components/ElevationProfile';

// MapLibre không cần access token (nguồn tile mở) — set null cho chắc.
MapLibreGL.setAccessToken(null);

/**
 * TAB 3 — BẢN ĐỒ (làm KỸ NHẤT).
 * Map THẬT: MapLibre + tile OSM/OpenFreeMap/Topo/Vệ tinh + DEM terrarium (hillshade + 3D).
 * Hiển thị 1 cung GPX THẬT (Tà Xùa, bundle sẵn): vẽ route + điểm đầu/cuối.
 * Nút: định vị GPS thật, toggle lớp (Sạch/Bình độ/Vệ tinh), toggle 3D.
 */
export function MapScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const cameraRef = useRef<CameraRef>(null);

  const [base, setBase] = useState<BaseLayerId>('topo');
  const [is3D, setIs3D] = useState(false);
  const [showElev, setShowElev] = useState(true);
  const [followUser, setFollowUser] = useState(false);

  const [points, setPoints] = useState<GpxPoint[] | null>(null);
  const [stats, setStats] = useState<TrackStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Nạp GPX THẬT (Tà Xùa) 1 lần khi mở màn.
  useEffect(() => {
    let alive = true;
    loadBundledTaXua()
      .then((pts) => {
        if (!alive) return;
        if (pts.length < 2) {
          setError('GPX rỗng');
          return;
        }
        setPoints(pts);
        setStats(computeStats(pts));
      })
      .catch((e) => alive && setError(String(e?.message ?? e)));
    return () => {
      alive = false;
    };
  }, []);

  // GeoJSON cho các lớp map (memo hoá để không tính lại mỗi render).
  const lineFC = useMemo(() => (points ? toLineFeature(points) : null), [points]);
  const endsFC = useMemo(() => (points ? toEndpointsFC(points) : null), [points]);
  const bounds = useMemo(() => (points ? boundsOf(points) : null), [points]);

  // Fit khung theo track khi có dữ liệu / khi đổi 3D.
  useEffect(() => {
    if (bounds && cameraRef.current) {
      cameraRef.current.fitBounds(
        [bounds[0], bounds[1]],
        [bounds[2], bounds[3]],
        [120, 60, 200, 60],
        800
      );
      cameraRef.current.setCamera({ pitch: is3D ? 60 : 0, animationDuration: 600 });
    }
  }, [bounds, is3D]);

  // Xin quyền + định vị GPS THẬT của thiết bị.
  const onLocate = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setError('Cần cấp quyền vị trí để định vị.');
      return;
    }
    setFollowUser(true);
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    cameraRef.current?.setCamera({
      centerCoordinate: [pos.coords.longitude, pos.coords.latitude],
      zoomLevel: 14,
      animationDuration: 700,
    });
  };

  const mapStyle = styleFor(base);
  // MapLibre RN nhận style URL (string) hoặc JSON string.
  const styleProp = typeof mapStyle === 'string' ? mapStyle : JSON.stringify(mapStyle);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        mapStyle={styleProp}
        compassEnabled
        pitchEnabled
        rotateEnabled
        logoEnabled={false}
        attributionPosition={{ bottom: 8, right: 8 }}
      >
        <Camera ref={cameraRef} maxZoomLevel={18} />

        {/* Vị trí người dùng = GPS THẬT (mũi tên hướng + vòng độ chính xác) */}
        <UserLocation visible showsUserHeadingIndicator renderMode="native" />

        {/* 3D: nghiêng camera (pitch). TODO(native): terrain raster-dem chưa có
            trong @maplibre/maplibre-react-native v10 — cần theo dõi upstream
            hoặc viết native module; KHÔNG giả lập bằng ảnh tĩnh (map thật). */}

        {/* Track cung mẫu THẬT: casing trắng + line xanh */}
        {lineFC && (
          <ShapeSource id="track" shape={lineFC as any}>
            <LineLayer
              id="track-casing"
              style={{ lineColor: colors.map.casing, lineWidth: 7, lineCap: 'round', lineJoin: 'round' }}
            />
            <LineLayer
              id="track-line"
              style={{ lineColor: colors.map.trackSample, lineWidth: 4, lineCap: 'round', lineJoin: 'round' }}
            />
          </ShapeSource>
        )}

        {/* Điểm đầu (xanh) & cuối (đỏ) */}
        {endsFC && (
          <ShapeSource id="ends" shape={endsFC as any}>
            <CircleLayer
              id="ends-circle"
              style={{
                circleRadius: 7,
                circleColor: ['match', ['get', 'role'], 'start', colors.map.start, colors.map.end] as any,
                circleStrokeWidth: 2,
                circleStrokeColor: '#fff',
              }}
            />
          </ShapeSource>
        )}
      </MapView>

      {/* ===== Overlay UI (nổi trên map) ===== */}

      {/* Cụm nút phải: định vị, 3D */}
      <View style={[styles.tools, { top: insets.top + space[3] }]}>
        <ToolButton label="📍" active={followUser} onPress={onLocate} />
        <ToolButton label="⛰️" active={is3D} onPress={() => setIs3D((v) => !v)} />
        <ToolButton label="▲▲" active={showElev} onPress={() => setShowElev((v) => !v)} />
      </View>

      {/* Chọn lớp nền (Sạch / Bình độ / Vệ tinh) */}
      <View style={[styles.baseSeg, { top: insets.top + space[3] }]}>
        {(['clean', 'topo', 'sat'] as BaseLayerId[]).map((b) => (
          <Pressable
            key={b}
            style={[styles.segBtn, base === b && styles.segBtnOn]}
            onPress={() => setBase(b)}
          >
            <Text style={[styles.segText, base === b && styles.segTextOn]}>{BASE_LABELS[b]}</Text>
          </Pressable>
        ))}
      </View>

      {/* Panel thống kê + elevation (đáy) */}
      {stats && (
        <View style={[styles.bottomPanel, { paddingBottom: insets.bottom + space[3] }]}>
          <View style={styles.statRow}>
            <Text style={styles.statBig}>{(stats.distance / 1000).toFixed(1)} km</Text>
            <Text style={styles.statMeta}>↑{Math.round(stats.gain)}m</Text>
            <Text style={styles.statMeta}>Đỉnh {Math.round(stats.maxEle)}m</Text>
            <Text style={styles.statName}>Tà Xùa</Text>
          </View>
          {showElev && points && (
            <ElevationProfile points={points} stats={stats} width={width - space.screen * 2 - space[3] * 2} />
          )}
        </View>
      )}

      {/* Loading / lỗi */}
      {!points && !error && (
        <View style={styles.center}>
          <ActivityIndicator color={colors.brand.primary} />
          <Text style={styles.loadingText}>Đang tải cung Tà Xùa (GPX thật)…</Text>
        </View>
      )}
      {error && (
        <View style={[styles.banner, { top: insets.top + 80 }]}>
          <Text style={styles.bannerText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

function ToolButton({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.tool, active && styles.toolOn]} onPress={onPress}>
      <Text style={[styles.toolIcon, active && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.surface },
  map: { flex: 1 },
  tools: { position: 'absolute', right: space[3], gap: space[2] },
  tool: {
    width: sizing.touchMin,
    height: sizing.touchMin,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  toolOn: { backgroundColor: colors.brand.primary },
  toolIcon: { fontSize: 18 },
  baseSeg: {
    position: 'absolute',
    left: space[3],
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
    ...shadow.card,
  },
  segBtn: { paddingHorizontal: space[3], paddingVertical: space[2], borderRadius: radius.sm },
  segBtnOn: { backgroundColor: colors.brand.primary },
  segText: { ...type.meta, color: colors.text.secondary },
  segTextOn: { color: '#fff', fontWeight: '700' },
  bottomPanel: {
    position: 'absolute',
    left: space.screen,
    right: space.screen,
    bottom: space[4],
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: radius.lg,
    padding: space[3],
    ...shadow.card,
  },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: space[3], marginBottom: space[2] },
  statBig: { ...type.stat, color: colors.brand.primary },
  statMeta: { ...type.meta, color: colors.text.secondary },
  statName: { ...type.meta, color: colors.text.primary, fontWeight: '700', marginLeft: 'auto' },
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  loadingText: { ...type.meta, color: colors.text.secondary, marginTop: space[2] },
  banner: {
    position: 'absolute',
    left: space.screen,
    right: space.screen,
    backgroundColor: colors.warning,
    borderRadius: radius.md,
    padding: space[3],
  },
  bannerText: { ...type.meta, color: colors.text.primary },
});
