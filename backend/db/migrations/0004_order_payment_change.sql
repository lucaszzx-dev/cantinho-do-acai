ALTER TABLE "orders" ADD COLUMN "needs_change" boolean DEFAULT false NOT NULL;
ALTER TABLE "orders" ADD COLUMN "change_for_cents" integer;
