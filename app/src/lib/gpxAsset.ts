/**
 * POTTER 3.0 — Nạp GPX THẬT từ assets (bundled).
 * Đọc file .gpx bundle trong app (assets/gpx/ta-xua.gpx) qua expo-asset + expo-file-system.
 * Metro đã cấu hình assetExts += 'gpx' (metro.config.js) để require() được file này.
 */

import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';
import { parseGPX, GpxPoint } from './gpx';

// Cung mẫu bundle sẵn để Tab 3 hoạt động THẬT ngay cả khi chưa nối API.
// TODO(api): thay bằng tải GPX của cung đã mua từ backend (GET /routes/:id/gpx).
const TA_XUA_GPX = require('../../assets/gpx/ta-xua.gpx');

/** Nạp & parse cung Tà Xùa (GPX thật) -> danh sách điểm. */
export async function loadBundledTaXua(): Promise<GpxPoint[]> {
  const asset = Asset.fromModule(TA_XUA_GPX);
  await asset.downloadAsync();
  const uri = asset.localUri ?? asset.uri;
  const text = await FileSystem.readAsStringAsync(uri);
  return parseGPX(text);
}
