import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Modal } from 'react-native';
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
import { glass } from '../../theme/tokens';
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
import { BrandIcon } from '../../components/BrandIcon';
import { currentUser, mockRoutes } from '../../lib/mockData';
import { brandPalette, fonts } from '../../theme';

MapLibreGL.setAccessToken(null);

type Props = NativeStackScreenProps<RootStackParamList, 'RouteNavigate'>;

/**
 * Checkpoint xác minh dọc tuyến (docs/08 C1-C3): đặt tại 25/50/75% quãng đường.
 * TODO(api): nạp route_checkpoints thật từ server (7 kind, ảnh mẫu người tạo cung).
 */
const CP_FRACTIONS = [0.25, 0.5, 0.75];
type CpResult = 'ok' | 'skip';

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

  // Checkpoint xác minh + finish sheet (luồng đã chốt ở preview, docs/08)
  const [cpOpen, setCpOpen] = useState<number | null>(null); // index checkpoint đang hỏi
  const [cpResults, setCpResults] = useState<Record<number, CpResult>>({});
  const [finOpen, setFinOpen] = useState(false);
  const cpAsked = useRef<Set<number>>(new Set());
  const finShown = useRef(false);
  const resumeAfterCp = useRef(false);

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

  // Vị trí checkpoint (m) dọc tuyến
  const cpAts = useMemo(
    () => (stats ? CP_FRACTIONS.map((f) => f * stats.distance) : []),
    [stats],
  );

  function pauseSim() {
    if (timerRef.current) clearInterval(timerRef.current);
    setSimRunning(false);
  }

  // Đi qua checkpoint chưa hỏi -> DỪNG dẫn, mở modal xác minh (mỗi checkpoint hỏi 1 lần)
  useEffect(() => {
    if (!stats || cpOpen != null || finOpen) return;
    for (let k = 0; k < cpAts.length; k++) {
      if (progress >= cpAts[k] && !cpAsked.current.has(k)) {
        cpAsked.current.add(k);
        resumeAfterCp.current = simRunning;
        pauseSim();
        setCpOpen(k);
        return;
      }
    }
    // Về đích -> finish sheet (1 lần)
    if (progress >= stats.distance && stats.distance > 0 && !finShown.current) {
      finShown.current = true;
      setTimeout(() => setFinOpen(true), 600);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, stats, cpAts, cpOpen, finOpen]);

  /** Đóng modal checkpoint với kết quả; tiếp tục dẫn nếu trước đó đang chạy. */
  function closeCp(result: CpResult) {
    if (cpOpen == null) return;
    // TODO(api): result 'ok' = mở camera chụp ảnh + POST verify (GPS khớp ≤50m, docs/08 C2)
    setCpResults((r) => ({ ...r, [cpOpen]: result }));
    setCpOpen(null);
    if (resumeAfterCp.current) toggleSim();
  }

  // verify_score docs/08 C3: 0.6 × tỉ lệ checkpoint đạt + 0.4 (liên tục track coi như đạt)
  const finScore = useMemo(() => {
    const ok = cpAts.reduce((n, _, k) => n + (cpResults[k] === 'ok' ? 1 : 0), 0);
    return 0.6 * (cpAts.length ? ok / cpAts.length : 0) + 0.4;
  }, [cpAts, cpResults]);

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

      {/* Checkpoint modal — chụp ảnh xác minh tại điểm (docs/08, preview đã chốt) */}
      <Modal visible={cpOpen != null} transparent animationType="fade" onRequestClose={() => closeCp('skip')}>
        <View style={styles.cpBackdrop}>
          <View style={styles.cpBox}>
            {/* TODO(api): ảnh mẫu thật của người tạo cung (route_checkpoints.photo_url) */}
            <View style={styles.cpImg}>
              <BrandIcon name="photo" size={34} color={colors.rock} />
              <Text style={styles.cpImgText}>Ảnh mẫu checkpoint của người tạo cung</Text>
            </View>
            <View style={styles.cpBody}>
              <View style={styles.cpHead}>
                <View style={styles.cpPin}>
                  <BrandIcon name="check" size={18} color={brandPalette.pine} />
                </View>
                <Text style={styles.cpTitle}>Checkpoint {cpOpen != null ? cpOpen + 1 : ''}</Text>
              </View>
              <Text style={styles.cpDesc}>
                Chụp ảnh tại đây để xác minh — toạ độ GPS phải khớp đường đi ≤ 50 m.
              </Text>
              <Pressable style={styles.cpShot} onPress={() => closeCp('ok')}>
                <BrandIcon name="photo" size={18} color={colors.text.onLime} />
                <Text style={styles.cpShotText}>CHỤP ẢNH XÁC MINH</Text>
              </Pressable>
              <Pressable onPress={() => closeCp('skip')} style={{ alignSelf: 'center', padding: space[2] }}>
                <Text style={styles.cpSkipText}>Bỏ qua (giảm mức xác minh)</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Finish sheet — verify_score + CERTIFIED (docs/08 C3) */}
      <Modal visible={finOpen} transparent animationType="slide" onRequestClose={() => setFinOpen(false)}>
        <Pressable style={styles.finBackdrop} onPress={() => setFinOpen(false)}>
          <View style={styles.finSheet}>
            <Text style={styles.finTitle}>Hoàn thành cung</Text>
            <View
              style={[
                styles.finCert,
                { backgroundColor: finScore >= 0.7 ? brandPalette.lime : brandPalette.gold },
              ]}
            >
              <Text style={styles.finCertText}>
                {finScore >= 0.7
                  ? `CERTIFIED · điểm xác minh ${finScore.toFixed(2)}`
                  : `Chưa đủ xác minh · ${finScore.toFixed(2)}`}
              </Text>
            </View>
            {cpAts.map((_, k) => {
              const ok = cpResults[k] === 'ok';
              return (
                <View key={k} style={styles.finRow}>
                  <View style={[styles.cpPin, !ok && { backgroundColor: brandPalette.cream }]}>
                    <BrandIcon name={ok ? 'check' : 'photo'} size={16} color={brandPalette.pine} />
                  </View>
                  <Text style={styles.finName}>Checkpoint {k + 1}</Text>
                  <Text style={[styles.finState, { color: ok ? colors.success : colors.text.secondary }]}>
                    {ok ? 'Đã xác minh ≤50 m' : 'Bỏ qua'}
                  </Text>
                </View>
              );
            })}
          </View>
        </Pressable>
      </Modal>

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
    ...shadow.sos,
  },
  sosText: { color: colors.text.onLime, fontWeight: '800', fontSize: 15, letterSpacing: 1 },
  navCard: {
    position: 'absolute',
    left: space[3],
    right: space[3],
    backgroundColor: glass.fill,
    borderWidth: 1,
    borderColor: glass.border,
    borderRadius: radius.lg,
    padding: space[4],
    ...shadow.glass,
  },
  main: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  arrow: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.limeGlow,
  },
  arrowIcon: { color: colors.text.onLime, fontSize: 26 },
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
    ...shadow.limeGlow,
  },
  simText: { ...type.h2, color: colors.text.onLime },
  center: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },

  // Checkpoint modal
  cpBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', padding: space[5] },
  cpBox: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.bg.surface,
    borderWidth: 1,
    borderColor: glass.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadow.glass,
  },
  cpImg: { height: 140, backgroundColor: glass.fillSunk, alignItems: 'center', justifyContent: 'center', gap: space[2] },
  cpImgText: { ...type.caption, color: colors.rock },
  cpBody: { padding: space[4] },
  cpHead: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  cpPin: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: brandPalette.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cpTitle: { fontFamily: fonts.display, fontSize: 18, color: colors.text.primary },
  cpDesc: { ...type.meta, color: colors.text.secondary, marginTop: space[2], lineHeight: 19 },
  cpShot: {
    flexDirection: 'row',
    gap: space[2],
    backgroundColor: brandPalette.lime,
    borderRadius: radius.md,
    paddingVertical: space[3],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: space[3],
  },
  cpShotText: { ...type.meta, color: colors.text.onLime, fontWeight: '700' },
  cpSkipText: { ...type.meta, color: colors.text.secondary, textDecorationLine: 'underline' },

  // Finish sheet
  finBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  finSheet: {
    backgroundColor: colors.bg.surface,
    borderTopWidth: 1,
    borderColor: glass.border,
    borderTopLeftRadius: radius.lg + 6,
    borderTopRightRadius: radius.lg + 6,
    padding: space.screen,
    paddingBottom: space[8],
    ...shadow.glass,
  },
  finTitle: { fontFamily: fonts.display, fontSize: 19, color: colors.text.primary },
  finCert: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: space[3],
    paddingVertical: 5,
    marginTop: space[2],
    marginBottom: space[3],
  },
  finCertText: { ...type.caption, color: brandPalette.pine, fontWeight: '700' },
  finRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingVertical: space[2],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  finName: { ...type.meta, color: colors.text.primary, flex: 1 },
  finState: { ...type.caption, fontWeight: '700' },
});
