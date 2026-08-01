-- Email Finder Phase 2 (additive only)
ALTER TABLE "domain_patterns"
  ADD COLUMN IF NOT EXISTS "last_api_verified" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "domain_patterns_last_api_verified_idx"
  ON "domain_patterns"("last_api_verified");

CREATE TABLE IF NOT EXISTS "email_finder_api_logs" (
  "id" TEXT NOT NULL,
  "user_id" TEXT,
  "domain" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "cost_credits" INTEGER NOT NULL DEFAULT 1,
  "raw_json" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "email_finder_api_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "email_finder_api_logs_created_at_idx"
  ON "email_finder_api_logs"("created_at");
CREATE INDEX IF NOT EXISTS "email_finder_api_logs_domain_idx"
  ON "email_finder_api_logs"("domain");
CREATE INDEX IF NOT EXISTS "email_finder_api_logs_user_id_created_at_idx"
  ON "email_finder_api_logs"("user_id", "created_at");
