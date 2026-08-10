ALTER TABLE "customers" ADD COLUMN "email" text;
ALTER TABLE "customers" ADD COLUMN "password_hash" text;
CREATE UNIQUE INDEX "customers_email_unique" ON "customers" ("email");
