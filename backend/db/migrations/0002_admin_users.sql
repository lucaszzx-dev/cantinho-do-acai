CREATE TABLE "admin_users" ("id" text PRIMARY KEY NOT NULL, "name" text NOT NULL, "email" text NOT NULL, "password_hash" text NOT NULL, "active" boolean DEFAULT true NOT NULL, "created_at" timestamp with time zone DEFAULT now() NOT NULL, "updated_at" timestamp with time zone DEFAULT now() NOT NULL);
CREATE UNIQUE INDEX "admin_users_email_unique" ON "admin_users" ("email");
