CREATE TABLE "admin_audit_log" (
  "id" text PRIMARY KEY NOT NULL,
  "admin_id" text NOT NULL REFERENCES "admin_users"("id"),
  "action" text NOT NULL,
  "entity_type" text NOT NULL,
  "entity_id" text,
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
