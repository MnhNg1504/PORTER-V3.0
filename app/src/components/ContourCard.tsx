import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Path, Polyline, Circle, Line, Text as SvgText } from 'react-native-svg';
import { brandPalette, fonts, radius, space, type } from '../theme';
import type { GpxPoint } from '../lib/gpx';
import {
  DemGrid, contourSegments, projectIso, projectTrack, contourColor, toSvgPoints,
} from '../lib/contour';

/**
 * "Route covered" — thẻ núi bình độ isometric (phong cách đã duyệt ở
 * prototype/contour-iso.html, màu thương hiệu PORTER: nền Pine, glow Lime).
 * DỮ LIỆU THẬT: lưới DEM terrarium (sinh bởi scripts/gen-dem-grid.mjs) + route GPX.
 */
export function ContourCard({
  grid, points, title, interval = 60,
}: {
  grid: DemGrid;
  points: GpxPoint[];
  title: string;
  interval?: number;
}) {
  const { width } = useWindowDimensions();
  const W = width - space.screen * 2;
  const H = Math.round(W * 0.78);
  const [azimuth, setAzimuth] = useState((35 * Math.PI) / 180);

  const iso = { width: W, height: H, azimuth };

  // Mỗi mức bình độ = 1 <Path> (gộp đoạn) — nhẹ hơn nghìn <Line> riêng lẻ.
  const levels = useMemo(() => {
    const out: { d: string; color: string; opacity: number }[] = [];
    const start = Math.ceil(grid.min / interval) * interval;
    for (let level = start; level <= grid.max; level += interval) {
      const hN = (level - grid.min) / ((grid.max - grid.min) || 1);
      const segs = contourSegments(grid, level);
      if (!segs.length) continue;
      let d = '';
      for (const s of segs) {
        const A = projectIso(s.ax, s.ay, level, grid, iso);
        const B = projectIso(s.bx, s.by, level, grid, iso);
        d += `M${A.x.toFixed(1)} ${A.y.toFixed(1)}L${B.x.toFixed(1)} ${B.y.toFixed(1)}`;
      }
      out.push({ d, color: contourColor(hN), opacity: 0.22 + hN * 0.72 });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid, interval, azimuth, W, H]);

  // Route GPX thật (giảm mẫu ~300 điểm cho SVG nhẹ) + pin đầu/đỉnh/cuối.
  const { routePts, pins, ring, labels } = useMemo(() => {
    const step = Math.max(1, Math.floor(points.length / 300));
    const sampled = points.filter((_, i) => i % step === 0 || i === points.length - 1);
    const routePts = toSvgPoints(projectTrack(sampled, grid, iso));

    let peakIdx = 0, mxE = -Infinity;
    points.forEach((p, i) => { if (p.ele != null && p.ele > mxE) { mxE = p.ele; peakIdx = i; } });
    const pinAt = (idx: number, color: string, glyph: string) => {
      const [pt] = projectTrack([points[idx]], grid, iso);
      const base = projectIso(
        ((points[idx].lon - grid.bbox.minLon) / (grid.bbox.maxLon - grid.bbox.minLon)) * grid.n,
        ((grid.bbox.maxLat - points[idx].lat) / (grid.bbox.maxLat - grid.bbox.minLat)) * grid.n,
        grid.min, grid, iso,
      );
      return { x: pt.x, y: pt.y, baseX: base.x, baseY: base.y, color, glyph };
    };
    const pins = [
      pinAt(0, '#7FB069', 'S'),
      pinAt(peakIdx, brandPalette.gold, '▲'),
      pinAt(points.length - 1, brandPalette.ember, '⚑'),
    ];

    // Vòng la bàn (chiếu đường tròn quanh chân núi) + nhãn N/E/S/W xoay theo azimuth
    const ringPts: { x: number; y: number }[] = [];
    for (let k = 0; k <= 96; k++) {
      const a = (k / 96) * Math.PI * 2;
      const pr = projectIso((0.5 + Math.cos(a) * 0.48) * grid.n, (0.5 + Math.sin(a) * 0.48) * grid.n, grid.min, grid, iso);
      ringPts.push(pr);
    }
    const compass: [string, number][] = [['N', -Math.PI / 2], ['E', 0], ['S', Math.PI / 2], ['W', Math.PI]];
    const labels = compass.map(([t, a]) => {
      const pr = projectIso((0.5 + Math.cos(a) * 0.56) * grid.n, (0.5 + Math.sin(a) * 0.56) * grid.n, grid.min, grid, iso);
      return { t, x: pr.x, y: pr.y };
    });
    return { routePts, pins, ring: toSvgPoints(ringPts), labels };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, grid, azimuth, W, H]);

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.headTitle}>Route covered</Text>
        <Text style={styles.headSub}>· {title}</Text>
        <View style={{ flex: 1 }} />
        <Pressable hitSlop={8} onPress={() => setAzimuth((a) => a - Math.PI / 8)}>
          <Text style={styles.rotBtn}>⟲</Text>
        </Pressable>
        <Pressable hitSlop={8} onPress={() => setAzimuth((a) => a + Math.PI / 8)}>
          <Text style={styles.rotBtn}>⟳</Text>
        </Pressable>
      </View>

      <Svg width={W} height={H}>
        {/* Vòng la bàn */}
        <Polyline points={ring} fill="none" stroke="rgba(143,160,127,0.4)" strokeWidth={1} />
        {labels.map((l) => (
          <SvgText key={l.t} x={l.x} y={l.y} fill="rgba(234,241,228,0.75)" fontSize={12} textAnchor="middle">
            {l.t}
          </SvgText>
        ))}

        {/* Đường bình độ DEM thật — thấp mờ, cao sáng Lime */}
        {levels.map((lv, i) => (
          <Path key={i} d={lv.d} stroke={lv.color} strokeOpacity={lv.opacity} strokeWidth={1.1} fill="none" />
        ))}

        {/* Route GPX thật — nét đứt trắng */}
        <Polyline
          points={routePts}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={2.2}
          strokeDasharray="5,5"
          strokeLinecap="round"
        />

        {/* Pin: chân nối xuống đáy + đầu tròn */}
        {pins.map((p, i) => (
          <React.Fragment key={i}>
            <Line x1={p.x} y1={p.y} x2={p.baseX} y2={p.baseY} stroke="rgba(255,255,255,0.25)" strokeWidth={1.2} />
            <Circle cx={p.x} cy={p.y - 11} r={11} fill={p.color} />
            <SvgText x={p.x} y={p.y - 7} fill={brandPalette.pine} fontSize={11} fontWeight="bold" textAnchor="middle">
              {p.glyph}
            </SvgText>
          </React.Fragment>
        ))}
      </Svg>

      <View style={styles.legend}>
        <Legend color={brandPalette.lime} label={`Bình độ ${interval}m (DEM thật)`} />
        <Legend color="#FFFFFF" label="Route GPX" />
        <Legend color={brandPalette.ember} label="Waypoint" />
      </View>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.pill}>
      <View style={[styles.swatch, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: brandPalette.pine,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#24331F',
  },
  head: { flexDirection: 'row', alignItems: 'center', padding: space[4], paddingBottom: space[2] },
  headTitle: { ...type.h2, color: brandPalette.cream, fontFamily: fonts.display },
  headSub: { ...type.meta, color: brandPalette.sage, marginLeft: space[1] },
  rotBtn: { color: brandPalette.lime, fontSize: 20, paddingHorizontal: space[2] },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: space[3], padding: space[4], paddingTop: space[2] },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 10, height: 10, borderRadius: 5 },
  legendText: { ...type.caption, color: brandPalette.sage },
});
