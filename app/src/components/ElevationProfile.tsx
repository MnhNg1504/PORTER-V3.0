import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import { colors, radius, space, type } from '../theme';
import { glass } from '../theme/tokens';
import { GpxPoint, TrackStats, haversine } from '../lib/gpx';
import { gradeColor } from '../lib/nav';

/**
 * Biểu đồ độ cao THẬT — vẽ từ <ele> trong GPX (không phác thảo sóng bịa).
 * Tô màu theo độ dốc: dốc = đỏ, phẳng = xanh (chuyển từ prototype drawElev()).
 * marker (0..1) = vị trí hiện tại dọc tuyến để đồng bộ con trỏ.
 */
export function ElevationProfile({
  points,
  stats,
  width,
  height = 90,
  marker,
}: {
  points: GpxPoint[];
  stats: TrackStats;
  width: number;
  height?: number;
  marker?: number;
}) {
  const hasEle = points.some((p) => p.ele != null);
  if (!hasEle) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.note}>GPX không có dữ liệu độ cao</Text>
      </View>
    );
  }

  const eMin = stats.minEle;
  const eMax = stats.maxEle || eMin + 1;
  const total = stats.distance || 1;
  const pad = 6;
  const x = (d: number) => (d / total) * width;
  const y = (e: number) => height - pad - ((e - eMin) / (eMax - eMin)) * (height - pad * 2);

  const segments: React.ReactNode[] = [];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    if (a.ele == null || b.ele == null) continue;
    const seg = haversine(a, b) || 1;
    segments.push(
      <Line
        key={i}
        x1={x(stats.cum[i - 1])}
        y1={y(a.ele)}
        x2={x(stats.cum[i])}
        y2={y(b.ele)}
        stroke={gradeColor(b.ele - a.ele, seg)}
        strokeWidth={2}
      />
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.lbl}>Biểu đồ độ cao (dốc = đỏ, phẳng = xanh)</Text>
      <Svg width={width} height={height}>
        {segments}
        {marker != null && (
          <Line
            x1={marker * width}
            y1={0}
            x2={marker * width}
            y2={height}
            stroke={colors.map.me}
            strokeWidth={2}
          />
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: glass.fill,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: glass.border,
    padding: space[3],
  },
  lbl: { ...type.caption, color: colors.text.secondary, marginBottom: space[1] },
  note: { ...type.meta, color: colors.rock, paddingVertical: space[4] },
});
