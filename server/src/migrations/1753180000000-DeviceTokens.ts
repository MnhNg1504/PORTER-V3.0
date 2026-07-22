import { MigrationInterface, QueryRunner } from 'typeorm';

/** Bảng token thiết bị cho push notification (checklist §1) */
export class DeviceTokens1753180000000 implements MigrationInterface {
  name = 'DeviceTokens1753180000000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE TABLE "device_tokens" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "token" varchar NOT NULL,
      "platform" varchar NOT NULL DEFAULT 'android',
      "createdAt" timestamptz NOT NULL DEFAULT now()
    )`);
    await q.query(`CREATE UNIQUE INDEX "idx_device_tokens_token" ON "device_tokens" ("token")`);
    await q.query(`CREATE INDEX "idx_device_tokens_user" ON "device_tokens" ("user_id")`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS "device_tokens" CASCADE`);
  }
}
