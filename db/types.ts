/**
 * @deprecated This file contains legacy Supabase-generated types.
 *
 * ⚠️  MIGRATION NOTICE ⚠️
 * These types have been replaced with Drizzle ORM types.
 * Please import from "@/lib/types" instead.
 *
 * Migration guide:
 * - Old: import { Database } from "@/db/types"
 * - New: import type { User, Payment, etc. } from "@/lib/types"
 *
 * This file is kept for backward compatibility and will be removed in a future version.
 */

// Re-export Drizzle types for backward compatibility
export type {
	User,
	NewUser,
	Account,
	NewAccount,
	Session,
	NewSession,
	Verification,
	NewVerification,
	Payment,
	NewPayment,
	PaymentCategory,
	NewPaymentCategory,
	Expense,
	NewExpense,
	ExpenseCategory,
	NewExpenseCategory,
	SocietyFunds,
	NewSocietyFunds,
	UserWithPayments,
	PaymentWithUser,
	ExpenseWithCategory,
	DbResult,
	IntervalType,
} from "@/lib/types";

// Legacy Database type for backward compatibility
// @deprecated Use individual types from @/lib/types instead
export type Database = {
	public: {
		Tables: {
			user: {
				Row: import("@/lib/types").User;
				Insert: import("@/lib/types").NewUser;
				Update: Partial<import("@/lib/types").NewUser>;
			};
			account: {
				Row: import("@/lib/types").Account;
				Insert: import("@/lib/types").NewAccount;
				Update: Partial<import("@/lib/types").NewAccount>;
			};
			session: {
				Row: import("@/lib/types").Session;
				Insert: import("@/lib/types").NewSession;
				Update: Partial<import("@/lib/types").NewSession>;
			};
			verification: {
				Row: import("@/lib/types").Verification;
				Insert: import("@/lib/types").NewVerification;
				Update: Partial<import("@/lib/types").NewVerification>;
			};
			payments: {
				Row: import("@/lib/types").Payment;
				Insert: import("@/lib/types").NewPayment;
				Update: Partial<import("@/lib/types").NewPayment>;
			};
			expenses: {
				Row: import("@/lib/types").Expense;
				Insert: import("@/lib/types").NewExpense;
				Update: Partial<import("@/lib/types").NewExpense>;
			};
			payment_categories: {
				Row: import("@/lib/types").PaymentCategory;
				Insert: import("@/lib/types").NewPaymentCategory;
				Update: Partial<import("@/lib/types").NewPaymentCategory>;
			};
			expense_categories: {
				Row: import("@/lib/types").ExpenseCategory;
				Insert: import("@/lib/types").NewExpenseCategory;
				Update: Partial<import("@/lib/types").NewExpenseCategory>;
			};
			society_funds: {
				Row: import("@/lib/types").SocietyFunds;
				Insert: import("@/lib/types").NewSocietyFunds;
				Update: Partial<import("@/lib/types").NewSocietyFunds>;
			};
		};
	};
};

// Legacy helper types for backward compatibility
// @deprecated Use types from @/lib/types instead
export type Tables<T extends keyof Database["public"]["Tables"]> =
	Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
	Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
	Database["public"]["Tables"][T]["Update"];
