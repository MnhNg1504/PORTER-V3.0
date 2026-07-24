import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Modal, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { colors, radius, space, shadow, type, fonts } from '../../theme';
import { glass } from '../../theme/tokens';
import { mockRoutes } from '../../lib/mockData';
import { haversine } from '../../lib/gpx';
import { RootStackParamList } from '../../navigation/types';
import { BrandIcon } from '../../components/BrandIcon';

type Props = NativeStackScreenProps<RootStackParamList, 'StartPoint'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

/** Ngưỡng "đã tới nơi" (docs/08 P1_NEAR): GPS khớp ≤ 50 m mới hiện sheet xác nhận. */
const ARRIVE_M = 50;

function fmtDist(m: number): string {
  if (m >= 1000) return `${(m / 1000).toFixed(1).replace('.', ',')} km · ~${Math.ceil(m / 370)} phút xe máy`;
  return `${Math.round(m)} m`;
}

/**
 * Màn "DẪN TỚI ĐIỂM XUẤT PHÁT" (BƯỚC 1) — luồng GPS-snap đã chốt ở preview:
 * 1. Nút "SNAP GPS — DẪN TỚI ĐIỂM XUẤT PHÁT" bật theo dõi GPS thật (expo-location).
 * 2. Khoảng cách đếm lùi + progress bar theo vị trí thật.
 * 3. Sheet xác nhận CHỈ hiện khi đã tới ≤ 50 m — xác nhận xong mới sang BƯỚC 2.
 */
export function StartPointScreen({ route }: Props) {
  const nav = useNavigation<Nav>();
  const data = mockRoutes.find((r) => r.id === route.params.routeId) ?? mockRoutes[0];
  const sp = data.startPoint;

  const [phase, setPhase] = useState<'idle' | 'guiding' | 'arrived'>('idle');
  const [dist, setDist] = useState<number | null>(null); // m — null khi chưa có fix GPS
  const [gpsDenied, setGpsDenied] = useState(false);
  const [showArrive, setShowArrive] = useState(false);
  const d0 = useRef<number | null>(null); // khoảng cách lúc bắt đầu dẫn (mốc progress)
  const watcher = useRef<Location.LocationSubscription | null>(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  // Fix GPS 1 lần khi mở màn để hiện "Cách bạn ~…"
  useEffect(() => {
    let alive = true;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (!alive) return;
      if (status !== 'granted') { setGpsDenied(true); return; }
      try {
        const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (alive) setDist(haversine({ lat: pos.coords.latitude, lon: pos.coords.longitude }, sp));
      } catch { /* chưa có fix — giữ "—" */ }
    })();
    return () => {
      alive = false;
      watcher.current?.remove();
      watcher.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startSnap() {
    if (phase !== 'idle') return;
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') { setGpsDenied(true); return; }
    setPhase('guiding');
    watcher.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Highest, timeInterval: 2000, distanceInterval: 5 },
      (pos) => {
        const d = haversine({ lat: pos.coords.latitude, lon: pos.coords.longitude }, sp);
        setDist(d);
        if (d0.current == null || d > d0.current) d0.current = d;
        if (d <= ARRIVE_M && phaseRef.current !== 'arrived') {
          setPhase('arrived');
          setShowArrive(true);
        }
      }
    );
  }

  function confirmArrive() {
    watcher.current?.remove();
    watcher.current = null;
    setShowArrive(false);
    nav.navigate('RouteNavigate', { routeId: data.id });
  }

  /** "Chưa phải chỗ này" — đóng sheet, tiếp tục dẫn (watcher vẫn chạy). */
  function dismissArrive() {
    setShowArrive(false);
    setPhase('guiding');
  }

  const distLabel =
    phase === 'arrived' ? 'Đã tới nơi' : phase === 'guiding' ? 'Đang dẫn bạn tới…' : 'Cách bạn';
  const distValue =
    phase === 'arrived' ? '≤ 50 m · GPS khớp' : dist != null ? fmtDist(dist) : gpsDenied ? 'Chưa có GPS' : '—';
  const progress =
    phase === 'idle' || dist == null || d0.current == null || d0.current <= 0
      ? 0
      : Math.min(1, Math.max(0, 1 - dist / d0.current));

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 130 }}>
        <Text style={styles.step}>Bước 1/2 — Tới điểm xuất phát</Text>

        {/* ẢNH THỰC ĐỊA (bắt buộc — mốc nhận diện). TODO(api): ảnh thật từ CDN (sp.photoUrl). */}
        <View style={styles.photo}>
          {sp.photoUrl ? (
            <Image source={{ uri: sp.photoUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <Text style={styles.photoPlaceholder}>ẢNH THỰC ĐỊA ĐIỂM XUẤT PHÁT</Text>
          )}
          <View style={styles.photoCaption}>
            <Text style={styles.photoCaptionK}>Ảnh thực địa thật</Text>
            <Text style={styles.photoCaptionText}>{sp.photoCaption}</Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* Khoảng cách + trạng thái GPS + progress đếm lùi */}
          <View style={styles.distCard}>
            <View style={styles.distRow}>
              <View style={styles.iconRow}>
                <BrandIcon name="routes" size={18} color={colors.text.secondary} />
                <Text style={styles.distK}>{distLabel}</Text>
              </View>
              <Text style={styles.distV}>{distValue}</Text>
            </View>
            {phase !== 'idle' && (
              <View style={styles.bar}>
                <View style={[styles.barFill, { width: `${Math.round(progress * 100)}%` }]} />
              </View>
            )}
          </View>

          {/* Ghi chú mốc nhận diện — icon brand thay emoji (preview đã chốt) */}
          <View style={styles.noteCard}>
            <View style={styles.iconRow}>
              <BrandIcon name="photo" size={18} color={colors.text.secondary} />
              <Text style={styles.noteText}>
                <Text style={{ fontWeight: '700' }}>Mốc nhận diện: </Text>
                {sp.note}
              </Text>
            </View>
            <View style={styles.iconRow}>
              <BrandIcon name="guide" size={18} color={colors.text.secondary} />
              <Text style={styles.noteText}>
                Guide: <Text style={{ fontWeight: '700' }}>{sp.guideName} ★ {sp.guideRating}</Text> — đợi tại điểm xuất phát.
              </Text>
            </View>
          </View>

          <Text style={styles.hint}>Tới gần {ARRIVE_M} m, app tự xác nhận và mở màn bắt đầu Bước 2.</Text>

          <View style={styles.coordRow}>
            <Text style={styles.meta}>Toạ độ {sp.lat.toFixed(5)}, {sp.lon.toFixed(5)}</Text>
            <Pressable
              onPress={() => nav.navigate('Chat', { conversationId: 'c1' })}
              style={styles.msgBtn}
            >
              <Text style={styles.msgBtnText}>Nhắn guide</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* CTA: SNAP GPS — dẫn tự động tới điểm xuất phát */}
      <View style={styles.bottomBar}>
        <Pressable
          style={[styles.primaryBtn, phase !== 'idle' && styles.primaryBtnBusy]}
          onPress={startSnap}
          disabled={phase !== 'idle'}
          accessibilityLabel="Snap GPS dẫn tới điểm xuất phát"
        >
          {phase === 'idle' && <BrandIcon name="compass" size={20} color={colors.text.onLime} />}
          <Text style={styles.primaryText}>
            {phase === 'idle'
              ? 'SNAP GPS — DẪN TỚI ĐIỂM XUẤT PHÁT'
              : phase === 'guiding'
                ? '◉ GPS ĐANG DẪN — bạn đang di chuyển…'
                : '✓ ĐÃ TỚI ĐIỂM XUẤT PHÁT'}
          </Text>
        </Pressable>
        {gpsDenied && (
          <Text style={styles.deniedText}>Không có quyền vị trí — bật GPS trong cài đặt để được dẫn đường.</Text>
        )}
      </View>

      {/* Sheet XÁC NHẬN — CHỈ hiện khi đã tới nơi (≤50m) */}
      <Modal visible={showArrive} transparent animationType="slide" onRequestClose={dismissArrive}>
        <View style={styles.sheetBackdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHead}>
              <View style={styles.pinS}>
                <Text style={styles.pinSText}>S</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sheetTitle}>Đã tới điểm xuất phát</Text>
                <Text style={styles.sheetSub}>GPS khớp ≤ {ARRIVE_M} m · guide {sp.guideName} đang đợi</Text>
              </View>
            </View>
            {/* Đối chiếu ảnh thực địa trước khi xác nhận */}
            <View style={styles.sheetPhoto}>
              {sp.photoUrl ? (
                <Image source={{ uri: sp.photoUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
              ) : (
                <Text style={styles.mapPlaceholderText}>Đối chiếu ảnh thực địa: {sp.photoCaption}</Text>
              )}
            </View>
            <Pressable style={styles.confirmBtn} onPress={confirmArrive}>
              <Text style={styles.confirmText}>XÁC NHẬN — BẮT ĐẦU ĐI CUNG (BƯỚC 2)</Text>
            </Pressable>
            <Pressable onPress={dismissArrive} style={{ alignSelf: 'center', padding: space[2] }}>
              <Text style={styles.skipText}>Chưa phải chỗ này (tiếp tục dẫn)</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.base },
  step: { ...type.meta, color: colors.text.secondary, padding: space.screen, paddingBottom: space[2] },
  photo: {
    height: 240,
    backgroundColor: glass.fillSunk,
    marginHorizontal: space.screen,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: glass.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...shadow.glassSoft,
  },
  photoPlaceholder: { color: '#fff', ...type.h2, opacity: 0.8 },
  photoCaption: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.45)', padding: space[3] },
  photoCaptionK: { color: colors.brand.primaryLight, fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: '700' },
  photoCaptionText: { color: '#fff', ...type.meta, marginTop: 2 },
  body: { padding: space.screen },
  distCard: {
    backgroundColor: glass.fill,
    borderRadius: radius.lg,
    padding: space[4],
    borderWidth: 1,
    borderColor: glass.border,
    ...shadow.glassSoft,
  },
  distRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconRow: { flexDirection: 'row', alignItems: 'center', gap: space[2], flexShrink: 1 },
  distK: { ...type.meta, color: colors.text.secondary },
  distV: { ...type.meta, color: colors.text.primary, fontWeight: '700', fontVariant: ['tabular-nums'] },
  bar: { height: 6, borderRadius: 3, backgroundColor: colors.border, marginTop: space[3], overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3, backgroundColor: colors.brand.primary },
  noteCard: {
    marginTop: space[3],
    gap: space[3],
    backgroundColor: glass.fill,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: glass.border,
    padding: space[4],
    ...shadow.glassSoft,
  },
  noteText: { ...type.body, color: colors.text.secondary, flex: 1 },
  hint: { ...type.caption, color: colors.rock, marginTop: space[3] },
  coordRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: space[4] },
  meta: { ...type.meta, color: colors.text.secondary },
  msgBtn: { backgroundColor: colors.brand.primary, borderRadius: radius.pill, paddingHorizontal: space[4], paddingVertical: space[2], ...shadow.limeGlow },
  msgBtnText: { ...type.meta, color: colors.text.onLime, fontWeight: '700' },
  mapPlaceholderText: { ...type.meta, color: colors.rock, textAlign: 'center', padding: space[2] },
  bottomBar: {
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
  primaryBtn: {
    flexDirection: 'row',
    gap: space[2],
    backgroundColor: colors.brand.primary,
    borderRadius: radius.md,
    paddingVertical: space[4],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.limeGlow,
  },
  primaryBtnBusy: { opacity: 0.85 },
  primaryText: { color: colors.text.onLime, ...type.meta, fontWeight: '700', textAlign: 'center' },
  deniedText: { ...type.caption, color: colors.danger, textAlign: 'center', marginTop: space[2] },
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.bg.base,
    borderTopLeftRadius: radius.lg + 6,
    borderTopRightRadius: radius.lg + 6,
    padding: space.screen,
    paddingBottom: space[6],
  },
  sheetHead: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  pinS: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.brand.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinSText: { color: colors.text.onLime, fontWeight: '700', fontSize: 16 },
  sheetTitle: { fontFamily: fonts.display, fontSize: 19, color: colors.text.primary },
  sheetSub: { ...type.caption, color: colors.text.secondary, marginTop: 2 },
  sheetPhoto: {
    height: 110,
    borderRadius: radius.md,
    backgroundColor: glass.fillSunk,
    borderWidth: 1,
    borderColor: glass.border,
    marginVertical: space[3],
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  confirmBtn: {
    backgroundColor: colors.brand.primary,
    borderRadius: radius.md,
    paddingVertical: space[4],
    alignItems: 'center',
    ...shadow.limeGlow,
  },
  confirmText: { color: colors.text.onLime, ...type.meta, fontWeight: '700' },
  skipText: { ...type.meta, color: colors.text.secondary, textDecorationLine: 'underline' },
});
