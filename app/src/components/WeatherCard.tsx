import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Pressable } from 'react-native';
import { brandPalette, colors, radius, space, type } from '../theme';
import {
  RouteWeather, fetchRouteWeather, wmoInfo, assessTrekSafety, TrekSafety,
} from '../lib/weather';

/**
 * Thời tiết THẬT tại điểm xuất phát (Open-Meteo, không key) — checklist §5.
 * Hiện: thời tiết hiện tại + 7 ngày + đánh giá an toàn trekking (docs/04).
 */
export function WeatherCard({
  lat, lon, elevation, label,
}: {
  lat: number;
  lon: number;
  /** Độ cao điểm xuất phát (m, từ GPX) — để nhiệt độ đúng vùng núi */
  elevation?: number;
  label: string;
}) {
  const [state, setState] = useState<
    { s: 'loading' } | { s: 'error' } | { s: 'done'; w: RouteWeather; safety: TrekSafety }
  >({ s: 'loading' });
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let alive = true;
    setState({ s: 'loading' });
    fetchRouteWeather(lat, lon, { days: 7, elevation })
      .then((w) => alive && setState({ s: 'done', w, safety: assessTrekSafety(w.daily) }))
      .catch(() => alive && setState({ s: 'error' }));
    return () => { alive = false; };
  }, [lat, lon, elevation, retry]);

  if (state.s === 'loading') {
    return (
      <View style={[styles.card, styles.center]}>
        <ActivityIndicator color={brandPalette.mist} />
        <Text style={styles.dim}>Đang lấy thời tiết {label}…</Text>
      </View>
    );
  }
  if (state.s === 'error') {
    return (
      <View style={[styles.card, styles.center]}>
        <Text style={styles.dim}>Không lấy được thời tiết (mất mạng?).</Text>
        <Pressable onPress={() => setRetry((r) => r + 1)} hitSlop={8}>
          <Text style={styles.retry}>Thử lại</Text>
        </Pressable>
      </View>
    );
  }

  const { w, safety } = state;
  const cur = wmoInfo(w.current.code);
  const safetyStyle =
    safety.level === 'danger' ? styles.safetyDanger
      : safety.level === 'caution' ? styles.safetyCaution
        : styles.safetyOk;

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.title}>Thời tiết · {label}</Text>
        <Text style={styles.sub}>độ cao ~{Math.round(w.elevation)}m</Text>
      </View>

      <View style={styles.now}>
        <Text style={styles.nowEmoji}>{cur.emoji}</Text>
        <Text style={styles.nowTemp}>{Math.round(w.current.tempC)}°</Text>
        <View>
          <Text style={styles.nowLabel}>{cur.label}</Text>
          <Text style={styles.sub}>gió {Math.round(w.current.windKmh)} km/h</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.days}>
        {w.daily.map((d) => {
          const info = wmoInfo(d.code);
          return (
            <View key={d.date} style={styles.day}>
              <Text style={styles.dayName}>{d.date.slice(5).replace('-', '/')}</Text>
              <Text style={styles.dayEmoji}>{info.emoji}</Text>
              <Text style={styles.dayTemp}>{Math.round(d.tMinC)}–{Math.round(d.tMaxC)}°</Text>
              <Text style={[styles.dayRain, d.precipProbMax > 70 && { color: brandPalette.ember }]}>
                💧{d.precipProbMax}%
              </Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={[styles.safety, safetyStyle]}>
        <Text style={styles.safetyText}>{safety.message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: space[6], gap: space[2] },
  dim: { ...type.meta, color: colors.text.secondary },
  retry: { ...type.meta, color: colors.earth, fontWeight: '700', padding: space[2] },
  head: { flexDirection: 'row', alignItems: 'baseline', gap: space[2], padding: space[4], paddingBottom: 0 },
  title: { ...type.h2, color: colors.text.primary },
  sub: { ...type.caption, color: colors.text.secondary },
  now: { flexDirection: 'row', alignItems: 'center', gap: space[3], padding: space[4], paddingBottom: space[2] },
  nowEmoji: { fontSize: 34 },
  nowTemp: { ...type.display, color: colors.text.primary },
  nowLabel: { ...type.body, color: colors.text.primary, fontWeight: '600' },
  days: { paddingHorizontal: space[3], gap: space[2], paddingBottom: space[3] },
  day: {
    alignItems: 'center',
    backgroundColor: colors.bg.base,
    borderRadius: radius.sm,
    paddingVertical: space[2],
    paddingHorizontal: space[3],
    gap: 2,
  },
  dayName: { ...type.caption, color: colors.text.secondary },
  dayEmoji: { fontSize: 18 },
  dayTemp: { ...type.caption, color: colors.text.primary, fontWeight: '700' },
  dayRain: { ...type.caption, color: brandPalette.mist },
  safety: { padding: space[3] },
  safetyOk: { backgroundColor: '#E4EFDD' },
  safetyCaution: { backgroundColor: '#F4EAD1' },
  safetyDanger: { backgroundColor: '#F9DAD3' },
  safetyText: { ...type.meta, color: colors.text.primary },
});
