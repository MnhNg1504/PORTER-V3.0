/**
 * POTTER 3.0 — Style bản đồ THẬT (MapLibre)
 * Chuyển từ prototype (map-demo.html / nav-demo.html). Tất cả tile là nguồn OSM/OpenFreeMap/DEM THẬT.
 *
 * LƯU Ý CHI PHÍ/BẢN QUYỀN (xem docs/05 §3 & docs/03 §8):
 * - OpenTopoMap & tile.openstreetmap.org có usage policy — CHỈ dùng cho demo/dev.
 *   Sản phẩm thật PHẢI tự host PMTiles (Planetiler từ vietnam-latest.osm.pbf) hoặc dùng MapTiler/Stadia có key.
 *   TODO(api): thay bằng URL tile self-host khi hạ tầng sẵn sàng.
 * - Vệ tinh Esri: chỉ minh hoạ; lớp vệ tinh sản phẩm cần license (Premium).
 */

// DEM terrarium thật (Mapzen/AWS) — dùng cho hillshade + terrain 3D
export const DEM_SOURCE = {
  type: 'raster-dem' as const,
  tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
  encoding: 'terrarium' as const,
  tileSize: 256,
  maxzoom: 14,
};

export type BaseLayerId = 'clean' | 'topo' | 'sat';

// Style "Sạch" (vector OpenFreeMap positron) — tông xanh-sạch giống nav-demo
export const CLEAN_STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';

// Raster style builder cho Bình độ / Vệ tinh (JSON style spec v8)
function rasterStyle(tiles: string[], attribution: string, maxzoom: number) {
  return {
    version: 8,
    sources: {
      base: { type: 'raster', tiles, tileSize: 256, maxzoom, attribution },
      terrain: DEM_SOURCE,
    },
    layers: [
      { id: 'base', type: 'raster', source: 'base' },
      {
        id: 'hills',
        type: 'hillshade',
        source: 'terrain',
        paint: { 'hillshade-exaggeration': 0.45 },
      },
    ],
  };
}

export const TOPO_STYLE = rasterStyle(
  [
    'https://a.tile.opentopomap.org/{z}/{x}/{y}.png',
    'https://b.tile.opentopomap.org/{z}/{x}/{y}.png',
    'https://c.tile.opentopomap.org/{z}/{x}/{y}.png',
  ],
  '© OpenTopoMap (CC-BY-SA), © OpenStreetMap contributors',
  17
);

export const SAT_STYLE = rasterStyle(
  ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
  'Imagery © Esri, Maxar',
  19
);

/** Trả về style (URL string cho vector 'clean', object JSON cho raster). */
export function styleFor(base: BaseLayerId): string | object {
  switch (base) {
    case 'clean':
      return CLEAN_STYLE_URL;
    case 'topo':
      return TOPO_STYLE;
    case 'sat':
      return SAT_STYLE;
  }
}

export const BASE_LABELS: Record<BaseLayerId, string> = {
  clean: 'Sạch',
  topo: 'Bình độ',
  sat: 'Vệ tinh',
};
