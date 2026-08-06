CREATE TABLE "customers" ("id" text PRIMARY KEY NOT NULL, "name" text NOT NULL, "phone" text NOT NULL, "created_at" timestamp with time zone DEFAULT now() NOT NULL, "updated_at" timestamp with time zone DEFAULT now() NOT NULL);
CREATE UNIQUE INDEX "customers_phone_unique" ON "customers" ("phone");
