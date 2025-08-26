CREATE TYPE "public"."payment_type" AS ENUM('cash', 'cheque', 'upi');--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "payment_type" "payment_type" DEFAULT 'cash' NOT NULL;