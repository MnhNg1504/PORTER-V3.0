import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

/**
 * BỘ ICON PORTER cho React Native — port 1:1 từ prototype/brand/icons.js.
 * Quy tắc Porter Brand Guidelines mục "Bảng icon UI": outline, grid 24px,
 * stroke 1.6px, bo tròn đầu nét; pine trên nền sáng, cream/lime trên nền tối.
 */

export type BrandIconName =
  | 'camp' | 'warn' | 'check' | 'water' | 'summit' | 'photo'
  | 'guide' | 'home' | 'routes' | 'chat' | 'compass';

type GlyphProps = { color: string };

const STROKE = {
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  fill: 'none' as const,
};

const GLYPHS: Record<BrandIconName, (p: GlyphProps) => React.ReactElement> = {
  camp: ({ color }) => (
    <>
      <Path d="M12 5.5 L19 18.5 H5 Z" stroke={color} {...STROKE} />
      <Path d="M12 9.5 L14.8 18.5 M12 9.5 L9.2 18.5" stroke={color} {...STROKE} />
    </>
  ),
  warn: ({ color }) => (
    <>
      <Circle cx={12} cy={12} r={2} fill={color} />
      <Path d="M7.8 7.8a6 6 0 0 0 0 8.4 M16.2 7.8a6 6 0 0 1 0 8.4" stroke={color} {...STROKE} />
    </>
  ),
  check: ({ color }) => (
    <Path
      d="M9 12.7V8.9a1 1 0 0 1 2 0v2.6 M11 11.5V7a1 1 0 0 1 2 0v4.5 M13 11.5V7.7a1 1 0 0 1 2 0v4.2 M15 12.1v-2.2a1 1 0 0 1 2 0v4.5c0 2.9-1.8 4.7-4.5 4.7-2.3 0-3.5-1.1-4.7-3l-1.2-2a1 1 0 0 1 1.7-1.1l.9 1.3"
      stroke={color}
      {...STROKE}
    />
  ),
  water: ({ color }) => (
    <Path
      d="M12 5.5c2.8 3.6 4.5 5.9 4.5 8.1a4.5 4.5 0 0 1-9 0c0-2.2 1.7-4.5 4.5-8.1Z"
      stroke={color}
      {...STROKE}
    />
  ),
  summit: ({ color }) => (
    <Path d="M9.5 19V5.8 M9.5 6.2h6.6l-2 2.5 2 2.5H9.5" stroke={color} {...STROKE} />
  ),
  photo: ({ color }) => (
    <>
      <Rect x={5.7} y={8.5} width={12.6} height={9.3} rx={2} stroke={color} {...STROKE} />
      <Path d="M9 8.5l1.4-2.1h3.2L15 8.5" stroke={color} {...STROKE} />
      <Circle cx={12} cy={13} r={2.6} stroke={color} {...STROKE} />
    </>
  ),
  guide: ({ color }) => (
    <>
      <Circle cx={12} cy={9} r={2.8} stroke={color} {...STROKE} />
      <Path d="M6.8 18.5c1-3.1 2.9-4.4 5.2-4.4s4.2 1.3 5.2 4.4" stroke={color} {...STROKE} />
    </>
  ),
  home: ({ color }) => (
    <Path
      d="M5.5 11.5 L12 5.5 L18.5 11.5 M7 10.2V18.5h10V10.2 M10.4 18.5v-4.6h3.2v4.6"
      stroke={color}
      {...STROKE}
    />
  ),
  routes: ({ color }) => (
    <>
      <Path d="M4.5 18.5 L9.5 8.5 L12.8 14.5 L15 10.5 L19.5 18.5 Z" stroke={color} {...STROKE} />
      <Circle cx={15} cy={6.8} r={1.4} stroke={color} {...STROKE} />
    </>
  ),
  chat: ({ color }) => (
    <Path d="M5.5 7.5h13v8.4h-7.6L7.5 19v-3.1h-2Z" stroke={color} {...STROKE} />
  ),
  compass: ({ color }) => (
    <>
      <Circle cx={12} cy={12} r={7.5} stroke={color} {...STROKE} />
      <Path d="M14.8 9.2 L13 13 L9.2 14.8 L11 11 Z" fill={color} />
    </>
  ),
};

export function BrandIcon({
  name,
  size = 22,
  color,
}: {
  name: BrandIconName;
  size?: number;
  color: string;
}) {
  const Glyph = GLYPHS[name];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Glyph color={color} />
    </Svg>
  );
}
