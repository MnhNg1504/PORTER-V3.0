import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { STORAGE_PORT } from './storage.port';
import { LocalStorageService } from './local-storage.service';

/**
 * Upload ảnh (checklist §3 — GĐ3). Kiến trúc cổng: MediaService chỉ biết
 * StoragePort; dev bind LocalStorageService.
 * TODO(storage): production đổi useClass sang adapter S3/R2 — dịch vụ nào
 * DO USER QUYẾT (chi phí/region/tài khoản), không tự chốt.
 */
@Module({
  controllers: [MediaController],
  providers: [MediaService, { provide: STORAGE_PORT, useClass: LocalStorageService }],
  exports: [MediaService],
})
export class MediaModule {}
