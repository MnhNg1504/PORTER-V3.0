/**
 * Cổng lưu trữ file (checklist §3 — upload ảnh/video).
 *
 * TODO(storage): production thay LocalStorageService bằng adapter S3/R2/GCS.
 * QUYẾT ĐỊNH CHỌN DỊCH VỤ (S3? Cloudflare R2? region? chi phí?) THUỘC VỀ USER —
 * không tự chốt ở đây. Khi user chọn xong: viết class mới implement StoragePort
 * rồi đổi provider trong media.module.ts — controller/service KHÔNG đổi.
 */

export interface StoredFile {
  /** URL công khai để app hiển thị ảnh */
  url: string;
  /** Khoá nội bộ (tên file / object key) — dùng để xoá/di trú sau này */
  key: string;
}

export interface StoragePort {
  /** Lưu buffer với đuôi file AN TOÀN đã validate (vd ".jpg") → {url, key} */
  save(buffer: Buffer, ext: string): Promise<StoredFile>;
}

/** Injection token — media.module bind LocalStorageService (dev) / S3 adapter (prod) */
export const STORAGE_PORT = 'STORAGE_PORT';
