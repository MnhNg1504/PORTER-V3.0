#!/usr/bin/env bash
# Backup PostgreSQL/PostGIS (checklist §3-4). Chạy: npm run db:backup
# Dùng pg_dump BÊN TRONG container Docker — không cần cài postgres trên máy.
# Tự động hoá: cron/Task Scheduler gọi script này hằng ngày (GĐ5 — deploy).
set -euo pipefail

CONTAINER="${DB_CONTAINER:-potter-db}"
DB_USER="${DB_USER:-potter}"
DB_NAME="${DB_NAME:-potter}"
OUT_DIR="$(dirname "$0")/../backups"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$OUT_DIR/potter-$STAMP.sql.gz"

mkdir -p "$OUT_DIR"
docker exec "$CONTAINER" pg_dump -U "$DB_USER" --format=plain --no-owner "$DB_NAME" \
  | gzip > "$OUT"

# Giữ 14 bản gần nhất, xoá cũ hơn
ls -1t "$OUT_DIR"/potter-*.sql.gz 2>/dev/null | tail -n +15 | xargs -r rm --

echo "Backup OK: $OUT ($(du -h "$OUT" | cut -f1))"
echo "Khôi phục: gunzip -c $OUT | docker exec -i $CONTAINER psql -U $DB_USER $DB_NAME"
