ALTER TABLE "tickets" RENAME COLUMN "assigned_to" TO "claimed_by";--> statement-breakpoint
ALTER TABLE "tickets" DROP CONSTRAINT "tickets_assigned_to_user_id_fk";
--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_claimed_by_user_id_fk" FOREIGN KEY ("claimed_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" DROP COLUMN "external_id";