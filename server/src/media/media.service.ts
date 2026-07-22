import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { STORAGE_PORT, StoragePort, StoredFile } from './storage.port';

/** Giới hạn 10MB (checklist §3 — upload ảnh) */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export type AllowedMime = 'image/jpeg' | 'image/png' | 'image/webp';

/** Mime được phép → đuôi file AN TOÀN (không lấy đuôi từ tên file client gửi) */
const EXT_BY_MIME: Record<AllowedMime, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

/**
 * Nhận diện loại ảnh qua MAGIC BYTES — không tin mimetype client khai:
 * jpeg = FF D8, png = 89 50 4E 47, webp = "RIFF"....  "WEBP".
 */
export function sniffImageType(buf: Buffer): AllowedMime | null {
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xd8) return 'image/jpeg';
  if (
    buf.length >= 4 &&
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47
  ) return 'image/png';
  if (
    buf.length >= 12 &&
    buf.toString('ascii', 0, 4) === 'RIFF' &&
    buf.toString('ascii', 8, 12) === 'WEBP'
  ) return 'image/webp';
  return null;
}

/**
 * Validate ảnh upload: mimetype nằm trong whitelist, ≤10MB,
 * VÀ magic bytes khớp mimetype khai báo. Trả về đuôi file an toàn.
 */
export function validateImageUpload(buffer: Buffer, mimetype: string, size: number): string {
  const ext = EXT_BY_MIME[mimetype as AllowedMime];
  if (!ext) {
    throw new BadRequestException('Chỉ nhận ảnh jpeg/png/webp');
  }
  if (size > MAX_UPLOAD_BYTES || buffer.length > MAX_UPLOAD_BYTES) {
    throw new BadRequestException('Ảnh vượt quá 10MB');
  }
  if (sniffImageType(buffer) !== mimetype) {
    throw new BadRequestException('Nội dung file không khớp định dạng ảnh khai báo');
  }
  return ext;
}

@Injectable()
export class MediaService {
  constructor(@Inject(STORAGE_PORT) private storage: StoragePort) {}

  /** Upload ảnh (đã qua multer memory storage) → {url, key} */
  async upload(file?: Express.Multer.File): Promise<StoredFile> {
    if (!file?.buffer) throw new BadRequestException('Thiếu file (field "file", multipart)');
    const ext = validateImageUpload(file.buffer, file.mimetype, file.size);
    return this.storage.save(file.buffer, ext);
  }
}
