-- Email Warmup: connected mailboxes + audit logs (additive only)
CREATE TABLE IF NOT EXISTS "connected_mailboxes" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "display_name" TEXT,
  "encrypted_credentials" TEXT NOT NULL,
  "key_id" TEXT NOT NULL DEFAULT 'env-v1',
  "status" TEXT NOT NULL DEFAULT 'connected',
  "last_verified_at" TIMESTAMP(3),
  "last_auth_error" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "connected_mailboxes_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "connected_mailboxes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "connected_mailboxes_user_id_email_key"
  ON "connected_mailboxes"("user_id", "email");
CREATE INDEX IF NOT EXISTS "connected_mailboxes_user_id_idx"
  ON "connected_mailboxes"("user_id");
CREATE INDEX IF NOT EXISTS "connected_mailboxes_status_idx"
  ON "connected_mailboxes"("status");
CREATE INDEX IF NOT EXISTS "connected_mailboxes_last_verified_at_idx"
  ON "connected_mailboxes"("last_verified_at");

CREATE TABLE IF NOT EXISTS "mailbox_audit_logs" (
  "id" TEXT NOT NULL,
  "mailbox_id" TEXT,
  "user_id" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "message_uid" TEXT,
  "detail" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "mailbox_audit_logs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "mailbox_audit_logs_mailbox_id_fkey" FOREIGN KEY ("mailbox_id") REFERENCES "connected_mailboxes"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "mailbox_audit_logs_user_id_created_at_idx"
  ON "mailbox_audit_logs"("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "mailbox_audit_logs_mailbox_id_created_at_idx"
  ON "mailbox_audit_logs"("mailbox_id", "created_at");
CREATE INDEX IF NOT EXISTS "mailbox_audit_logs_action_created_at_idx"
  ON "mailbox_audit_logs"("action", "created_at");
