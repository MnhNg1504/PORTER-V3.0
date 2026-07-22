import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { StoragePort, StoredFile } from './storage.port';

/** Thư mục lưu upload — mặc định server/uploads (đã gitignore). */
export function uploadDir(): string {
  return resolve(process.env.UPLOAD_DIR ?? 'uploads');
}

/**
 * Lưu đĩa local cho dev/MVP — serve tĩnh qua /uploads (main.ts).
 * Tên file = uuid + đuôi an toàn (KHÔNG dùng tên gốc từ client — chống path traversal).
 *
 * TODO(storage): production KHÔNG dùng đĩa local (mất khi redeploy, không scale
 * ngang) — thay bằng S3/R2 adapter cùng interface StoragePort; user chọn dịch vụ.
 */
@Injectable()
export class LocalStorageService implements StoragePort {
  async save(buffer: Buffer, ext: string): Promise<StoredFile> {
    const dir = uploadDir();
    await mkdir(dir, { recursive: true });
    const key = `${randomUUID()}${ext}`;
    await writeFile(join(dir, key), buffer);
    const base = process.env.PUBLIC_UPLOAD_URL ?? 'http://localhost:3000/uploads';
    return { url: `${base.replace(/\/$/, '')}/${key}`, key };
  }
}
