import { Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MediaService, MAX_UPLOAD_BYTES } from './media.service';

/** Upload ảnh (checklist §3) — cần JWT như mọi module khác */
@ApiTags('media')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('media')
export class MediaController {
  constructor(private media: MediaService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload ảnh jpeg/png/webp ≤10MB → {url, key}' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  // Multer memory storage (mặc định @nestjs/platform-express) — limits chặn sớm >10MB
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_UPLOAD_BYTES } }))
  upload(@UploadedFile() file?: Express.Multer.File) {
    return this.media.upload(file);
  }
}
