// Centralized type exports from Drizzle schema
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'
import type {
  user,
  account,
  session,
  verification,
  payments,
  expenses,
  paymentCategories,
  expenseCategories,
  societyFunds,
} from './schema'

// User types
export type User = InferSelectModel<typeof user>
export type NewUser = InferInsertModel<typeof user>

// Auth types
export type Account = InferSelectModel<typeof account>
export type NewAccount = InferInsertModel<typeof account>
export type Session = InferSelectModel<typeof session>
export type NewSession = InferInsertModel<typeof session>
export type Verification = InferSelectModel<typeof verification>
export type NewVerification = InferInsertModel<typeof verification>

// Payment types
export type Payment = InferSelectModel<typeof payments>
export type NewPayment = InferInsertModel<typeof payments>
export type PaymentCategory = InferSelectModel<typeof paymentCategories>
export type NewPaymentCategory = InferInsertModel<typeof paymentCategories>

// Expense types
export type Expense = InferSelectModel<typeof expenses>
export type NewExpense = InferInsertModel<typeof expenses>
export type ExpenseCategory = InferSelectModel<typeof expenseCategories>
export type NewExpenseCategory = InferInsertModel<typeof expenseCategories>

// Society funds types
export type SocietyFunds = InferSelectModel<typeof societyFunds>
export type NewSocietyFunds = InferInsertModel<typeof societyFunds>

// Utility types for common operations
export type UserWithPayments = User & {
  payments: (Payment & {
    category: PaymentCategory
  })[]
}

export type PaymentWithUser = Payment & {
  user: User
  category: PaymentCategory
}

export type ExpenseWithCategory = Expense & {
  category: ExpenseCategory
}

// Database operation result type
export type DbResult<T> = {
  data: T | null
  error: string | null
}

// Interval type enum
export type IntervalType = 'monthly' | 'quarterly' | 'half_yearly' | 'annually'
