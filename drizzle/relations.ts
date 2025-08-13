import { relations } from "drizzle-orm/relations";
import { user, session, account, expenseCategories, expenses, paymentCategories, payments } from "./schema";

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	sessions: many(session),
	accounts: many(account),
	payments: many(payments),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const expensesRelations = relations(expenses, ({one}) => ({
	expenseCategory: one(expenseCategories, {
		fields: [expenses.categoryId],
		references: [expenseCategories.id]
	}),
}));

export const expenseCategoriesRelations = relations(expenseCategories, ({many}) => ({
	expenses: many(expenses),
}));

export const paymentsRelations = relations(payments, ({one}) => ({
	paymentCategory: one(paymentCategories, {
		fields: [payments.categoryId],
		references: [paymentCategories.id]
	}),
	user: one(user, {
		fields: [payments.userId],
		references: [user.id]
	}),
}));

export const paymentCategoriesRelations = relations(paymentCategories, ({many}) => ({
	payments: many(payments),
}));