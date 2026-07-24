import { MigrationInterface, QueryRunner } from 'typeorm';

/** H9 (docs/14): người mở cung định giá ngay khi nộp GPX — thêm cột priceVnd. */
export class GpxSubmissionPrice1753260000000 implements MigrationInterface {
  name = 'GpxSubmissionPrice1753260000000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(
      `ALTER TABLE "gpx_submissions" ADD COLUMN IF NOT EXISTS "priceVnd" bigint NOT NULL DEFAULT 0`,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE "gpx_submissions" DROP COLUMN IF EXISTS "priceVnd"`);
  }
}
