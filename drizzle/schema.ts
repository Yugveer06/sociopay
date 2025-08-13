import { pgTable, index, unique, serial, text, uuid, numeric, timestamp, boolean, foreignKey, integer, date, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const intervalType = pgEnum("interval_type", ['monthly', 'quarterly', 'half_yearly', 'annually'])


export const paymentCategories = pgTable("payment_categories", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
}, (table) => [
	index("idx_payment_categories_name").using("btree", table.name.asc().nullsLast().op("text_ops")),
	unique("payment_categories_name_key").on(table.name),
]);

export const societyFunds = pgTable("society_funds", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	totalFunds: numeric("total_funds", { precision: 14, scale:  2 }).default('0').notNull(),
	lastUpdated: timestamp("last_updated", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean().notNull(),
	image: text(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
	updatedAt: timestamp({ mode: 'string' }).notNull(),
	houseNumber: text().notNull(),
	phone: text().notNull(),
	role: text(),
	banned: boolean(),
	banReason: text(),
	banExpires: timestamp({ mode: 'string' }),
}, (table) => [
	unique("user_email_key").on(table.email),
	unique("user_houseNumber_key").on(table.houseNumber),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
	updatedAt: timestamp({ mode: 'string' }).notNull(),
	ipAddress: text(),
	userAgent: text(),
	userId: text().notNull(),
	impersonatedBy: text(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_userId_fkey"
		}),
	unique("session_token_key").on(table.token),
]);

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text().notNull(),
	providerId: text().notNull(),
	userId: text().notNull(),
	accessToken: text(),
	refreshToken: text(),
	idToken: text(),
	accessTokenExpiresAt: timestamp({ mode: 'string' }),
	refreshTokenExpiresAt: timestamp({ mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
	updatedAt: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_userId_fkey"
		}),
]);

export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	createdAt: timestamp({ mode: 'string' }),
	updatedAt: timestamp({ mode: 'string' }),
});

export const expenseCategories = pgTable("expense_categories", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
}, (table) => [
	index("idx_expense_categories_name").using("btree", table.name.asc().nullsLast().op("text_ops")),
	unique("expense_categories_name_key").on(table.name),
]);

export const expenses = pgTable("expenses", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	categoryId: integer("category_id").notNull(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	expenseDate: date("expense_date").default(sql`CURRENT_DATE`),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_expenses_category_id").using("btree", table.categoryId.asc().nullsLast().op("int4_ops")),
	index("idx_expenses_expense_date").using("btree", table.expenseDate.asc().nullsLast().op("date_ops")),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [expenseCategories.id],
			name: "expenses_category_id_fkey"
		}),
]);

export const payments = pgTable("payments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	categoryId: integer("category_id").notNull(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	paymentDate: date("payment_date").default(sql`CURRENT_DATE`),
	periodStart: date("period_start"),
	periodEnd: date("period_end"),
	intervalType: intervalType("interval_type"),
	notes: text(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_payments_category_id").using("btree", table.categoryId.asc().nullsLast().op("int4_ops")),
	index("idx_payments_payment_date").using("btree", table.paymentDate.asc().nullsLast().op("date_ops")),
	index("idx_payments_period_end").using("btree", table.periodEnd.asc().nullsLast().op("date_ops")),
	index("idx_payments_period_start").using("btree", table.periodStart.asc().nullsLast().op("date_ops")),
	index("idx_payments_user_id").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [paymentCategories.id],
			name: "payments_category_id_fkey"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "payments_user_id_fkey"
		}),
]);
