import { MigrationInterface, QueryRunner } from 'typeorm';

/** Giai đoạn 1: đặt cung có người dẫn + escrow (docs/14 vá H1–H4, docs/16 §C). */
export class Payments1753270000000 implements MigrationInterface {
  name = 'Payments1753270000000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE TABLE "orders" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "buyer_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "route_id" uuid NOT NULL REFERENCES "trek_routes"("id") ON DELETE CASCADE,
      "seller_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
      "tripDate" date NOT NULL,
      "headcount" int NOT NULL DEFAULT 1,
      "unitVnd" bigint NOT NULL,
      "subtotalVnd" bigint NOT NULL,
      "buyerTotalVnd" bigint NOT NULL,
      "sellerPayoutVnd" bigint NOT NULL,
      "potterFeeVnd" bigint NOT NULL,
      "depositVnd" bigint NOT NULL,
      "status" varchar NOT NULL DEFAULT 'pending',
      "pspRef" varchar,
      "createdAt" timestamptz NOT NULL DEFAULT now(),
      "updatedAt" timestamptz NOT NULL DEFAULT now()
    )`);
    await q.query(`CREATE INDEX "idx_orders_buyer_route" ON "orders" ("buyer_id","route_id")`);
    await q.query(`CREATE INDEX "idx_orders_status" ON "orders" ("status")`);

    await q.query(`CREATE TABLE "escrow_entries" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      "order_id" uuid NOT NULL REFERENCES "orders"("id") ON DELETE CASCADE,
      "kind" varchar NOT NULL,
      "amountVnd" bigint NOT NULL,
      "note" varchar,
      "createdAt" timestamptz NOT NULL DEFAULT now()
    )`);
    await q.query(`CREATE INDEX "idx_escrow_order" ON "escrow_entries" ("order_id")`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`DROP TABLE IF EXISTS "escrow_entries"`);
    await q.query(`DROP TABLE IF EXISTS "orders"`);
  }
}
