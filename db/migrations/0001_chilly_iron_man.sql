ALTER TABLE "account" RENAME COLUMN "accountId" TO "account_id";--> statement-breakpoint
ALTER TABLE "account" RENAME COLUMN "providerId" TO "provider_id";--> statement-breakpoint
ALTER TABLE "account" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "account" RENAME COLUMN "accessToken" TO "access_token";--> statement-breakpoint
ALTER TABLE "account" RENAME COLUMN "refreshToken" TO "refresh_token";--> statement-breakpoint
ALTER TABLE "account" RENAME COLUMN "idToken" TO "id_token";--> statement-breakpoint
ALTER TABLE "account" RENAME COLUMN "accessTokenExpiresAt" TO "access_token_expires_at";--> statement-breakpoint
ALTER TABLE "account" RENAME COLUMN "refreshTokenExpiresAt" TO "refresh_token_expires_at";--> statement-breakpoint
ALTER TABLE "account" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "account" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "session" RENAME COLUMN "expiresAt" TO "expires_at";--> statement-breakpoint
ALTER TABLE "session" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "session" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "session" RENAME COLUMN "ipAddress" TO "ip_address";--> statement-breakpoint
ALTER TABLE "session" RENAME COLUMN "userAgent" TO "user_agent";--> statement-breakpoint
ALTER TABLE "session" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "session" RENAME COLUMN "impersonatedBy" TO "impersonated_by";--> statement-breakpoint
ALTER TABLE "user" RENAME COLUMN "emailVerified" TO "email_verified";--> statement-breakpoint
ALTER TABLE "user" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "user" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "user" RENAME COLUMN "banReason" TO "ban_reason";--> statement-breakpoint
ALTER TABLE "user" RENAME COLUMN "banExpires" TO "ban_expires";--> statement-breakpoint
ALTER TABLE "user" RENAME COLUMN "houseNumber" TO "house_number";--> statement-breakpoint
ALTER TABLE "verification" RENAME COLUMN "expiresAt" TO "expires_at";--> statement-breakpoint
ALTER TABLE "verification" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "verification" RENAME COLUMN "updatedAt" TO "updated_at";--> statement-breakpoint
ALTER TABLE "expense_categories" DROP CONSTRAINT "expense_categories_name_key";--> statement-breakpoint
ALTER TABLE "payment_categories" DROP CONSTRAINT "payment_categories_name_key";--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT "session_token_key";--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_email_key";--> statement-breakpoint
ALTER TABLE "user" DROP CONSTRAINT "user_houseNumber_key";--> statement-breakpoint
ALTER TABLE "account" DROP CONSTRAINT "account_userId_fkey";
--> statement-breakpoint
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_category_id_fkey";
--> statement-breakpoint
ALTER TABLE "payments" DROP CONSTRAINT "payments_category_id_fkey";
--> statement-breakpoint
ALTER TABLE "payments" DROP CONSTRAINT "payments_user_id_fkey";
--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT "session_userId_fkey";
--> statement-breakpoint
DROP INDEX "idx_expense_categories_name";--> statement-breakpoint
DROP INDEX "idx_expenses_category_id";--> statement-breakpoint
DROP INDEX "idx_expenses_expense_date";--> statement-breakpoint
DROP INDEX "idx_payment_categories_name";--> statement-breakpoint
DROP INDEX "idx_payments_category_id";--> statement-breakpoint
DROP INDEX "idx_payments_payment_date";--> statement-breakpoint
DROP INDEX "idx_payments_period_end";--> statement-breakpoint
DROP INDEX "idx_payments_period_start";--> statement-breakpoint
DROP INDEX "idx_payments_user_id";--> statement-breakpoint
ALTER TABLE "expenses" ALTER COLUMN "expense_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "payment_date" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "role" SET DEFAULT 'user';--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_category_id_expense_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."expense_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_category_id_payment_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."payment_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expense_categories" ADD CONSTRAINT "expense_categories_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "payment_categories" ADD CONSTRAINT "payment_categories_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_token_unique" UNIQUE("token");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_email_unique" UNIQUE("email");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_house_number_unique" UNIQUE("house_number");