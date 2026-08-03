# Mailbox credential incident response (internal runbook)

**Scope:** AxenFlowAI Email Warmup `ConnectedMailbox` records and `mailboxCredentialVault.ts`.

## If credential exposure is suspected

1. **Contain**
   - Disable connect API routes via feature flag or emergency deploy if needed.
   - Rotate `MAILBOX_VAULT_MASTER_KEY` only with a planned re-encryption migration (rotation invalidates existing blobs without re-wrap).

2. **Assess**
   - Query `mailbox_audit_logs` for unusual `connect`, `imap_scan`, or decrypt-failure patterns.
   - Check Vercel logs for `[mailbox-vault]` warnings (no raw passwords should appear).
   - Identify affected `user_id` / `mailbox_id` rows in `connected_mailboxes`.

3. **Remediate**
   - Force-disconnect affected mailboxes: `DELETE FROM connected_mailboxes WHERE ...` (same as user Disconnect API).
   - Notify affected users to revoke App Passwords in Google/Microsoft settings.
   - Open provider-side audit if internal misuse is suspected.

4. **Recover**
   - Deploy new master key + re-encryption job if key compromise confirmed.
   - Document timeline and root cause.

5. **Post-incident**
   - Review access to `MAILBOX_VAULT_MASTER_KEY` in Vercel env.
   - Plan migration to cloud KMS (AWS KMS / GCP KMS) for master key wrap.

## Monitoring tripwires (implemented)

- Failed connection rate limits per user/IP on `/api/mailbox/connect`.
- `[mailbox-vault] repeated decrypt failures` console warning + optional `MAILBOX_VAULT_ALERT_WEBHOOK_URL`.
- Weekly cron `POST /api/cron/mailbox-reverify` with `Authorization: Bearer CRON_SECRET`.

## Database encryption at rest

Supabase Postgres provides disk encryption at rest by default. Field-level envelope encryption is an additional layer for App Passwords.
