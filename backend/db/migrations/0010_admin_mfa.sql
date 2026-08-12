ALTER TABLE "admin_users" ADD COLUMN "mfa_secret" text;
ALTER TABLE "admin_users" ADD COLUMN "mfa_enabled" boolean DEFAULT false NOT NULL;
CREATE TABLE "admin_backup_codes" (
  "id" text PRIMARY KEY NOT NULL,
  "admin_id" text NOT NULL REFERENCES "admin_users"("id") ON DELETE CASCADE,
  "code_hash" text NOT NULL,
  "used_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
