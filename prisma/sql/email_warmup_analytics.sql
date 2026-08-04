-- Email Warmup analytics (additive)
ALTER TABLE "connected_mailboxes" ADD COLUMN IF NOT EXISTS "warmup_status" TEXT NOT NULL DEFAULT 'active';
ALTER TABLE "connected_mailboxes" ADD COLUMN IF NOT EXISTS "ramp_day" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "connected_mailboxes" ADD COLUMN IF NOT EXISTS "total_ramp_days" INTEGER NOT NULL DEFAULT 28;
ALTER TABLE "connected_mailboxes" ADD COLUMN IF NOT EXISTS "warmup_started_at" TIMESTAMP(3);
ALTER TABLE "connected_mailboxes" ADD COLUMN IF NOT EXISTS "paused_at" TIMESTAMP(3);
ALTER TABLE "connected_mailboxes" ADD COLUMN IF NOT EXISTS "pause_reason" TEXT;
ALTER TABLE "connected_mailboxes" ADD COLUMN IF NOT EXISTS "daily_send_limit" INTEGER NOT NULL DEFAULT 5;
ALTER TABLE "connected_mailboxes" ADD COLUMN IF NOT EXISTS "sends_today" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "connected_mailboxes" ADD COLUMN IF NOT EXISTS "sends_today_date" TEXT;

CREATE INDEX IF NOT EXISTS "connected_mailboxes_warmup_status_idx"
  ON "connected_mailboxes"("warmup_status");

CREATE TABLE IF NOT EXISTS "warmup_events" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "mailbox_id" TEXT NOT NULL,
  "event_type" TEXT NOT NULL,
  "message_id" TEXT,
  "counterpart_mailbox_id" TEXT,
  "counterpart_email" TEXT,
  "detail" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "warmup_events_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "warmup_events_mailbox_id_fkey" FOREIGN KEY ("mailbox_id") REFERENCES "connected_mailboxes"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "warmup_events_user_id_created_at_idx" ON "warmup_events"("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "warmup_events_mailbox_id_created_at_idx" ON "warmup_events"("mailbox_id", "created_at");
CREATE INDEX IF NOT EXISTS "warmup_events_event_type_created_at_idx" ON "warmup_events"("event_type", "created_at");
CREATE INDEX IF NOT EXISTS "warmup_events_mailbox_id_event_type_created_at_idx" ON "warmup_events"("mailbox_id", "event_type", "created_at");

CREATE TABLE IF NOT EXISTS "warmup_pending_rescues" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "mailbox_id" TEXT NOT NULL,
  "message_uid" TEXT NOT NULL,
  "spam_folder" TEXT NOT NULL,
  "message_id" TEXT,
  "execute_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "warmup_pending_rescues_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "warmup_pending_rescues_mailbox_id_fkey" FOREIGN KEY ("mailbox_id") REFERENCES "connected_mailboxes"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "warmup_pending_rescues_mailbox_id_message_uid_spam_folder_key"
  ON "warmup_pending_rescues"("mailbox_id", "message_uid", "spam_folder");
CREATE INDEX IF NOT EXISTS "warmup_pending_rescues_execute_at_idx" ON "warmup_pending_rescues"("execute_at");
CREATE INDEX IF NOT EXISTS "warmup_pending_rescues_mailbox_id_idx" ON "warmup_pending_rescues"("mailbox_id");
