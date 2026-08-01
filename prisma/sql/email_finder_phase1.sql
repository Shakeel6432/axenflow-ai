-- Email Finder Phase 1 tables (additive only)
CREATE TABLE IF NOT EXISTS "domain_patterns" (
  "id" TEXT NOT NULL,
  "domain" TEXT NOT NULL,
  "confirmed_pattern" TEXT,
  "confidence_count" INTEGER NOT NULL DEFAULT 0,
  "is_catch_all" BOOLEAN,
  "last_checked" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "domain_patterns_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "domain_patterns_domain_key" ON "domain_patterns"("domain");
CREATE INDEX IF NOT EXISTS "domain_patterns_domain_idx" ON "domain_patterns"("domain");
CREATE INDEX IF NOT EXISTS "domain_patterns_last_checked_idx" ON "domain_patterns"("last_checked");

CREATE TABLE IF NOT EXISTS "email_finder_usage" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "month_key" TEXT NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "email_finder_usage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "email_finder_usage_user_id_month_key_key" ON "email_finder_usage"("user_id", "month_key");
CREATE INDEX IF NOT EXISTS "email_finder_usage_user_id_idx" ON "email_finder_usage"("user_id");
