import {
  pgTable,
  text,
  boolean,
  timestamp,
  pgEnum,
  serial,
  uuid,
  numeric,
  date,
  integer,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Define enum for interval types
export const intervalTypeEnum = pgEnum('interval_type', [
  'monthly',
  'quarterly',
  'half_yearly',
  'annually',
])

// Better Auth Tables
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  houseNumber: text('houseNumber').unique().notNull(),
  phone: text('phone').notNull(),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id),
  accessToken: text('accessToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshToken: text('refreshToken'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  idToken: text('idToken'),
  password: text('password'),
  scope: text('scope'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id),
  token: text('token').notNull(),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt'),
  updatedAt: timestamp('updatedAt'),
})
// Application Tables
export const paymentCategories = pgTable('payment_categories', {
  id: serial('id').primaryKey(),
  name: text('name').unique().notNull(),
  description: text('description'),
})

export const expenseCategories = pgTable('expense_categories', {
  id: serial('id').primaryKey(),
  name: text('name').unique().notNull(),
  description: text('description'),
})

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  categoryId: integer('category_id')
    .notNull()
    .references(() => paymentCategories.id),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  paymentDate: date('payment_date').defaultNow(),
  periodStart: date('period_start'),
  periodEnd: date('period_end'),
  intervalType: intervalTypeEnum('interval_type'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const expenses = pgTable('expenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: integer('category_id')
    .notNull()
    .references(() => expenseCategories.id),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  expenseDate: date('expense_date').defaultNow(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const societyFunds = pgTable('society_funds', {
  id: uuid('id').primaryKey().defaultRandom(),
  totalFunds: numeric('total_funds', { precision: 14, scale: 2 })
    .notNull()
    .default('0'),
  lastUpdated: timestamp('last_updated', { withTimezone: true }).defaultNow(),
})
// Table Relations
export const userRelations = relations(user, ({ many }) => ({
  payments: many(payments),
  accounts: many(account),
  sessions: many(session),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const paymentCategoryRelations = relations(
  paymentCategories,
  ({ many }) => ({
    payments: many(payments),
  })
)

export const expenseCategoryRelations = relations(
  expenseCategories,
  ({ many }) => ({
    expenses: many(expenses),
  })
)

export const paymentRelations = relations(payments, ({ one }) => ({
  user: one(user, {
    fields: [payments.userId],
    references: [user.id],
  }),
  category: one(paymentCategories, {
    fields: [payments.categoryId],
    references: [paymentCategories.id],
  }),
}))

export const expenseRelations = relations(expenses, ({ one }) => ({
  category: one(expenseCategories, {
    fields: [expenses.categoryId],
    references: [expenseCategories.id],
  }),
}))
