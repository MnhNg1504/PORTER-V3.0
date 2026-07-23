import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Path, Polyline, Circle, Line, Text as SvgText } from 'react-native-svg';
import { fonts, radius, space, type } from '../theme';
import type { GpxPoint } from '../lib/gpx';
import { haversine } from '../lib/gpx';
import {
  DemGrid, contourSegments, projectIso, projectTrack, toSvgPoints,
} from '../lib/contour';

/**
 * "Route covered" — ĐẢO NÚI isometric theo style đã chốt ở prototype/app-preview.html:
 * nền giấy trắng #FAFBF8, bình độ MỰC (xám → đen theo độ cao), track GPX VÀNG #E8B400
 * nét đứt, đảo nằm trong vòng la bàn 72 tick + 3 vòng đồng tâm mờ, pill toạ độ thật,
 * sparkline cao độ với chấm vàng tại đỉnh. KHÔNG tự xoay — xoay bằng nút.
 * DỮ LIỆU THẬT: lưới DEM terrarium (scripts/gen-dem-grid.mjs) + route GPX.
 */

const INK = '#121315';
const MUTE = '#5D6368';
const RING = '#B9BDBF';
const PAPER = '#FAFBF8';
const ROUTE_GOLD = '#E8B400';
const PIN_CREAM = '#EAF1E4';

function fmtDMS(v: number, isLat: boolean): string {
  const d = Math.floor(Math.abs(v));
  const m = Math.round((Math.abs(v) - d) * 60);
  return `${d}°${String(m).padStart(2, '0')}′${isLat ? (v >= 0 ? 'N' : 'S') : (v >= 0 ? 'E' : 'W')}`;
}

/** Màu bình độ theo style đảo: thấp = xám nhạt, cao = mực đen (như preview đã chốt). */
function inkContourColor(hN: number): string {
  const r = Math.round(165 - hN * 140);
  const g = Math.round(167 - hN * 140);
  const b = Math.round(165 - hN * 140);
  return `rgb(${r},${g},${b})`;
}

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
  const H = Math.round(W * 0.82);
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
      out.push({ d, color: inkContourColor(hN), opacity: 0.8 + hN * 0.2 });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid, interval, azimuth, W, H]);

  // Route GPX thật (giảm mẫu ~300 điểm cho SVG nhẹ) + pin đầu/đỉnh/cuối.
  const { routePts, pins, ring, ticks, halo, labels } = useMemo(() => {
    const step = Math.max(1, Math.floor(points.length / 300));
    const sampled = points.filter((_, i) => i % step === 0 || i === points.length - 1);
    const routePts = toSvgPoints(projectTrack(sampled, grid, iso));

    let peakIdx = 0, mxE = -Infinity;
    points.forEach((p, i) => { if (p.ele != null && p.ele > mxE) { mxE = p.ele; peakIdx = i; } });
    const pinAt = (idx: number, glyph: string) => {
      const [pt] = projectTrack([points[idx]], grid, iso);
      const base = projectIso(
        ((points[idx].lon - grid.bbox.minLon) / (grid.bbox.maxLon - grid.bbox.minLon)) * grid.n,
        ((grid.bbox.maxLat - points[idx].lat) / (grid.bbox.maxLat - grid.bbox.minLat)) * grid.n,
        grid.min, grid, iso,
      );
      return { x: pt.x, y: pt.y, baseX: base.x, baseY: base.y, glyph };
    };
    const pins = [
      pinAt(0, 'S'),
      pinAt(peakIdx, '▲'),
      pinAt(points.length - 1, 'F'),
    ];

    // Vòng la bàn NGOÀI đảo (r=1.12 bán kính đảo) + 72 tick + 3 vòng đồng tâm mờ
    const at = (f: number, a: number) =>
      projectIso((0.5 + Math.cos(a) * f) * grid.n, (0.5 + Math.sin(a) * f) * grid.n, grid.min, grid, iso);
    const circleAt = (f: number) => {
      const pts: { x: number; y: number }[] = [];
      for (let k = 0; k <= 96; k++) pts.push(at(f, (k / 96) * Math.PI * 2));
      return toSvgPoints(pts);
    };
    const ring = circleAt(0.56); // 0.56 grid-uv = 1.12 bán kính đảo (0.5)
    let ticks = '';
    for (let k = 0; k < 72; k++) {
      const a = (k / 72) * Math.PI * 2;
      const p1 = at(0.565, a);
      const p2 = at(k % 6 === 0 ? 0.5925 : 0.58, a);
      ticks += `M${p1.x.toFixed(1)} ${p1.y.toFixed(1)}L${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    const halo = [0.62, 0.68, 0.74].map((f, i) => ({ pts: circleAt(f), opacity: 0.28 - i * 0.08 }));
    const compass: [string, number][] = [['N', -Math.PI / 2], ['E', 0], ['S', Math.PI / 2], ['W', Math.PI]];
    const labels = compass.map(([t, a]) => {
      const pr = at(0.63, a);
      return { t, x: pr.x, y: pr.y };
    });
    return { routePts, pins, ring, ticks, halo, labels };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, grid, azimuth, W, H]);

  // Sparkline cao độ thật + chấm vàng tại đỉnh (texture guidelines đã chốt)
  const spark = useMemo(() => {
    const SW = W - space[4] * 2;
    const SH = 34;
    const eles = points.map((p) => p.ele ?? grid.min);
    const mn = Math.min(...eles);
    const mx = Math.max(...eles);
    const step = Math.max(1, Math.floor(eles.length / 80));
    let pts = '';
    let peakX = 0, peakY = SH;
    for (let i = 0; i < eles.length; i += step) {
      const x = (i / (eles.length - 1)) * SW;
      const y = SH - 3 - ((eles[i] - mn) / ((mx - mn) || 1)) * (SH - 8);
      pts += `${x.toFixed(1)},${y.toFixed(1)} `;
      if (y < peakY) { peakY = y; peakX = x; }
    }
    return { SW, SH, pts: pts.trim(), peakX, peakY };
  }, [points, grid.min, W]);

  // Stats: đỉnh/chân núi từ DEM, vùng từ bbox, track km từ GPX thật
  const stats = useMemo(() => {
    let km = 0;
    for (let i = 1; i < points.length; i++) km += haversine(points[i - 1], points[i]);
    const spanKm = haversine(
      { lat: grid.bbox.minLat, lon: grid.bbox.minLon },
      { lat: grid.bbox.minLat, lon: grid.bbox.maxLon },
    ) / 1000;
    return {
      peak: `${Math.round(grid.max).toLocaleString('vi-VN')} m`,
      base: `${Math.round(grid.min).toLocaleString('vi-VN')} m`,
      span: `~${Math.round(spanKm)} km`,
      track: `${(km / 1000).toFixed(1).replace('.', ',')} km`,
    };
  }, [points, grid]);

  const coordPill = points.length
    ? `${fmtDMS(points[0].lat, true)} · ${fmtDMS(points[0].lon, false)}`
    : '';

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Text style={styles.headTitle}>Route covered</Text>
        <Text style={styles.headSub}>· {title} · DEM thật</Text>
        <View style={{ flex: 1 }} />
        <Pressable hitSlop={8} onPress={() => setAzimuth((a) => a - Math.PI / 8)}>
          <Text style={styles.rotBtn}>⟲</Text>
        </Pressable>
        <Pressable hitSlop={8} onPress={() => setAzimuth((a) => a + Math.PI / 8)}>
          <Text style={styles.rotBtn}>⟳</Text>
        </Pressable>
      </View>

      <View>
        <Svg width={W} height={H}>
          {/* 3 vòng đồng tâm mờ lan quanh đảo (texture guidelines) */}
          {halo.map((h, i) => (
            <Polyline key={i} points={h.pts} fill="none" stroke={RING} strokeOpacity={h.opacity} strokeWidth={1} />
          ))}
          {/* Vòng la bàn + 72 tick (mỗi tick thứ 6 dài hơn) */}
          <Polyline points={ring} fill="none" stroke={RING} strokeOpacity={0.8} strokeWidth={1.2} />
          <Path d={ticks} stroke={RING} strokeOpacity={0.9} strokeWidth={1} fill="none" />
          {labels.map((l) => (
            <SvgText key={l.t} x={l.x} y={l.y + 4} fill="rgba(18,19,21,0.8)" fontSize={12} fontWeight="bold" textAnchor="middle">
              {l.t}
            </SvgText>
          ))}

          {/* Bình độ DEM thật — MỰC: thấp xám nhạt, cao đen đậm (đảo trắng đã chốt) */}
          {levels.map((lv, i) => (
            <Path key={i} d={lv.d} stroke={lv.color} strokeOpacity={lv.opacity} strokeWidth={1.15} fill="none" />
          ))}

          {/* Route GPX thật — VÀNG nét đứt (E8B400 đã chốt) */}
          <Polyline
            points={routePts}
            fill="none"
            stroke={ROUTE_GOLD}
            strokeWidth={2.2}
            strokeDasharray="6,4.5"
            strokeLinecap="round"
            strokeOpacity={0.95}
          />

          {/* Pin: chấm chân + thân mảnh + đầu tròn cream, glyph mực (như preview) */}
          {pins.map((p, i) => (
            <React.Fragment key={i}>
              <Line x1={p.x} y1={p.y} x2={p.baseX} y2={p.baseY} stroke="#43494D" strokeOpacity={0.5} strokeWidth={1.2} />
              <Circle cx={p.baseX} cy={p.baseY} r={1.7} fill={RING} />
              <Circle cx={p.x} cy={p.y - 12} r={11} fill={PIN_CREAM} stroke="#D8DDD4" strokeWidth={1} />
              <SvgText x={p.x} y={p.y - 8} fill={INK} fontSize={11} fontWeight="bold" textAnchor="middle">
                {p.glyph}
              </SvgText>
            </React.Fragment>
          ))}
        </Svg>

        {/* Pill toạ độ thật (texture guidelines) */}
        {!!coordPill && (
          <View style={styles.coordPill}>
            <Text style={styles.coordText}>{coordPill}</Text>
          </View>
        )}
      </View>

      {/* Sparkline cao độ thật + chấm vàng tại đỉnh */}
      <View style={{ paddingHorizontal: space[4] }}>
        <Svg width={spark.SW} height={spark.SH}>
          <Polyline points={spark.pts} fill="none" stroke={INK} strokeWidth={1.6} strokeLinejoin="round" />
          <Circle cx={spark.peakX} cy={spark.peakY} r={3} fill={ROUTE_GOLD} />
        </Svg>
      </View>

      <View style={styles.statsRow}>
        <Stat k="Đỉnh" v={stats.peak} />
        <Stat k="Chân núi" v={stats.base} />
        <Stat k="Vùng" v={stats.span} />
        <Stat k="Track" v={stats.track} />
      </View>
    </View>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statK}>{k}</Text>
      <Text style={styles.statV}>{v}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: PAPER,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E4E7E2',
  },
  head: { flexDirection: 'row', alignItems: 'center', padding: space[4], paddingBottom: space[2] },
  headTitle: { ...type.h2, color: INK, fontFamily: fonts.display },
  headSub: { ...type.meta, color: MUTE, marginLeft: space[1] },
  rotBtn: { color: INK, fontSize: 20, paddingHorizontal: space[2] },
  coordPill: {
    position: 'absolute',
    top: 4,
    right: space[3],
    backgroundColor: INK,
    borderRadius: radius.pill,
    paddingHorizontal: space[3],
    paddingVertical: 5,
  },
  coordText: { color: PIN_CREAM, fontSize: 10.5, fontVariant: ['tabular-nums'], letterSpacing: 0.3 },
  statsRow: { flexDirection: 'row', padding: space[4], paddingTop: space[2] },
  stat: { flex: 1, alignItems: 'center' },
  statK: { fontSize: 10, letterSpacing: 1.2, textTransform: 'uppercase', color: MUTE, fontWeight: '600' },
  statV: { fontSize: 15, color: INK, fontFamily: fonts.display, marginTop: 3, fontVariant: ['tabular-nums'] },
});
