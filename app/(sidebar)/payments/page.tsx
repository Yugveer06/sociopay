import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db";
import { payments, user, paymentCategories } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import {
	IconArrowDownLeft,
	IconArrowUpRight,
	IconCreditCard,
	IconDownload,
	IconFilter,
	IconPlus,
	IconRefresh,
} from "@tabler/icons-react";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { columns, Payment } from "./columns";
import { DataTable } from "./data-table";

export default async function PaymentsPage() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/login");
	}

	// Fetch payments with user and category data using Drizzle
	let paymentsData: Payment[] = [];
	let error: string | null = null;

	try {
		const result = await db
			.select({
				id: payments.id,
				amount: payments.amount,
				created_at: payments.createdAt,
				interval_type: payments.intervalType,
				notes: payments.notes,
				payment_date: payments.paymentDate,
				period_start: payments.periodStart,
				period_end: payments.periodEnd,
				user_id: payments.userId,
				user_name: user.name,
				house_number: user.houseNumber,
				category_name: paymentCategories.name,
			})
			.from(payments)
			.leftJoin(user, eq(payments.userId, user.id))
			.leftJoin(
				paymentCategories,
				eq(payments.categoryId, paymentCategories.id)
			)
			.orderBy(desc(payments.paymentDate));

		// Transform the data to match our Payment type
		paymentsData = result.map(payment => ({
			id: payment.id,
			amount: parseFloat(payment.amount || "0"),
			created_at: payment.created_at?.toISOString() || null,
			interval_type: payment.interval_type,
			notes: payment.notes,
			payment_date: payment.payment_date || null,
			period_start: payment.period_start || null,
			period_end: payment.period_end || null,
			user_id: payment.user_id,
			user_name: payment.user_name || "Unknown",
			house_number: payment.house_number || "Unknown",
			category_name: payment.category_name || "Uncategorized",
		}));
	} catch (err) {
		console.error("Error fetching payments:", err);
		error = err instanceof Error ? err.message : "Unknown error occurred";
	}

	// Use the fetched payments data or fallback to sample data
	const finalPayments: Payment[] =
		paymentsData.length > 0
			? paymentsData
			: [
					{
						id: "sample-1",
						amount: 150.0,
						created_at: "2025-08-12T10:30:00Z",
						interval_type: "monthly" as const,
						notes: "Sample maintenance payment",
						payment_date: "2025-08-12",
						period_start: "2025-08-01",
						period_end: "2025-08-31",
						user_id: session.user.id,
						user_name: session.user.name || "Sample User",
						house_number: "A-101",
						category_name: "Maintenance",
					},
					{
						id: "sample-2",
						amount: 200.0,
						created_at: "2025-08-11T14:15:00Z",
						interval_type: "monthly" as const,
						notes: "Sample utility payment",
						payment_date: "2025-08-11",
						period_start: "2025-08-01",
						period_end: "2025-08-31",
						user_id: session.user.id,
						user_name: session.user.name || "Sample User",
						house_number: "A-101",
						category_name: "Utilities",
					},
			  ];

	// Calculate totals from actual data
	const totalBalance = finalPayments.reduce(
		(sum, payment) => sum + payment.amount,
		0
	);
	const currentMonth = new Date().getMonth();
	const currentYear = new Date().getFullYear();
	const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
	const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

	const currentMonthPayments = finalPayments.filter(payment => {
		if (!payment.payment_date) return false;
		const paymentDate = new Date(payment.payment_date);
		return (
			paymentDate.getMonth() === currentMonth &&
			paymentDate.getFullYear() === currentYear
		);
	});

	const lastMonthPayments = finalPayments.filter(payment => {
		if (!payment.payment_date) return false;
		const paymentDate = new Date(payment.payment_date);
		return (
			paymentDate.getMonth() === lastMonth &&
			paymentDate.getFullYear() === lastMonthYear
		);
	});

	const monthlySpent = currentMonthPayments.reduce(
		(sum, payment) => sum + payment.amount,
		0
	);
	const lastMonthSpent = lastMonthPayments.reduce(
		(sum, payment) => sum + payment.amount,
		0
	);
	const monthlyChange =
		lastMonthSpent > 0
			? ((monthlySpent - lastMonthSpent) / lastMonthSpent) * 100
			: 0;
	const monthlyReceived = monthlySpent; // For now, assuming same as spent

	// Refresh action
	async function refreshData() {
		"use server";
		revalidatePath("/payments");
	}

	// Format currency
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
		}).format(amount);
	};

	return (
		<div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
			<div className='px-4 lg:px-6 max-w-6xl mx-auto w-full'>
				<div className='flex flex-col gap-6'>
					{/* Header */}
					<div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
						<div>
							<h1 className='text-2xl font-bold'>
								Maintenance Payments
							</h1>
							<p className='text-muted-foreground'>
								Track Maintenance, and manage maintenance.
							</p>
						</div>
						<div className='flex gap-2'>
							<form action={refreshData}>
								<Button
									variant='outline'
									size='sm'
									type='submit'
								>
									<IconRefresh className='mr-2 h-4 w-4' />
									Refresh
								</Button>
							</form>
							<Button variant='outline' size='sm'>
								<IconFilter className='mr-2 h-4 w-4' />
								Filter
							</Button>
							<Button variant='outline' size='sm'>
								<IconDownload className='mr-2 h-4 w-4' />
								Export
							</Button>
							<Button size='sm'>
								<IconPlus className='mr-2 h-4 w-4' />
								Add Payment
							</Button>
						</div>
					</div>

					{/* Balance Overview */}
					<div className='grid gap-4 md:grid-cols-3'>
						<Card>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>
									Total Maintenance
								</CardTitle>
								<IconCreditCard className='h-4 w-4 text-muted-foreground' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold'>
									{formatCurrency(totalBalance)}
								</div>
								<p className='text-xs text-muted-foreground'>
									Available for spending
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>
									This Month Expense
								</CardTitle>
								<IconArrowUpRight className='h-4 w-4 text-red-500' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold text-red-600'>
									{formatCurrency(monthlySpent)}
								</div>
								<p className='text-xs text-muted-foreground'>
									{monthlyChange >= 0 ? "+" : ""}
									{monthlyChange.toFixed(1)}% from last month
								</p>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
								<CardTitle className='text-sm font-medium'>
									This Month Maintenance Received
								</CardTitle>
								<IconArrowDownLeft className='h-4 w-4 text-green-500' />
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold text-green-600'>
									{formatCurrency(monthlyReceived)}
								</div>
								<p className='text-xs text-muted-foreground'>
									{monthlyChange >= 0 ? "+" : ""}
									{monthlyChange.toFixed(1)}% from last month
								</p>
							</CardContent>
						</Card>
					</div>

					{/* Maintenance Payments Table */}
					{error && !finalPayments.length ? (
						<Card>
							<CardHeader>
								<CardTitle>Error Loading Payments</CardTitle>
								<CardDescription>
									There was an error loading payment data.
									Check console for details.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className='text-center py-8 text-muted-foreground'>
									<p>Failed to load payment data</p>
									<p className='text-sm mt-2'>
										Error: {error}
									</p>
								</div>
							</CardContent>
						</Card>
					) : (
						<Card>
							<CardHeader>
								<CardTitle>
									Maintenance Payments ({finalPayments.length}
									)
								</CardTitle>
								<CardDescription>
									Detailed view of all maintenance payments
								</CardDescription>
							</CardHeader>
							<CardContent>
								<DataTable
									columns={columns}
									data={finalPayments}
								/>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}
