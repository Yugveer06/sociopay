/**
 * Maintenance Due Calculator
 *
 * Utility functions for calculating overdue maintenance payments
 * based on payment history and period coverage.
 */

export interface MaintenanceDue {
  userId: string
  userName: string
  houseNumber: string
  lastPaidPeriodEnd: string | null
  overdueDays: number
  overdueMonths: number
  formattedDuration: string
}

export interface PaymentPeriod {
  userId: string
  userName: string
  houseNumber: string
  periodStart: string | null
  periodEnd: string | null
  paymentDate: string | null
  categoryId: number
}

export interface DueCalculationResult {
  usersWithDue: MaintenanceDue[]
  totalOverdueUsers: number
  averageOverdueDays: number
}

/**
 * Formats a duration in days to a human-readable string
 * @param days - Number of days
 * @returns Formatted string like "2 months, 15 days"
 */
export function formatDuration(days: number): string {
  if (days <= 0) return '0 days'

  const months = Math.floor(days / 30)
  const remainingDays = days % 30

  if (months === 0) {
    return `${remainingDays} day${remainingDays === 1 ? '' : 's'}`
  }

  if (remainingDays === 0) {
    return `${months} month${months === 1 ? '' : 's'}`
  }

  return `${months} month${months === 1 ? '' : 's'}, ${remainingDays} day${remainingDays === 1 ? '' : 's'}`
}

/**
 * Calculates maintenance due for a single user based on their payment history
 * @param userId - User ID
 * @param userName - User name
 * @param houseNumber - House number
 * @param payments - Array of payment periods for the user
 * @returns MaintenanceDue object if user has overdue payments, null otherwise
 */
export function calculateUserDue(
  userId: string,
  userName: string,
  houseNumber: string,
  payments: PaymentPeriod[]
): MaintenanceDue | null {
  // Filter only maintenance payments (categoryId = 1)
  const maintenancePayments = payments.filter(p => p.categoryId === 1)

  // If no maintenance payments, user is not tracked for due calculation
  if (maintenancePayments.length === 0) {
    return null
  }

  // Sort payments by period start date
  const sortedPayments = maintenancePayments
    .filter(p => p.periodStart && p.periodEnd)
    .sort((a, b) => {
      const dateA = new Date(a.periodStart!)
      const dateB = new Date(b.periodStart!)
      return dateA.getTime() - dateB.getTime()
    })

  if (sortedPayments.length === 0) {
    return null
  }

  // Find the latest period end date
  const latestPayment = sortedPayments.reduce((latest, current) => {
    const latestEnd = new Date(latest.periodEnd!)
    const currentEnd = new Date(current.periodEnd!)
    return currentEnd > latestEnd ? current : latest
  })

  const lastPaidPeriodEnd = new Date(latestPayment.periodEnd!)
  const currentDate = new Date()

  // Calculate days since last paid period ended
  const timeDiff = currentDate.getTime() - lastPaidPeriodEnd.getTime()
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))

  // If the last paid period covers current date or future, user is not overdue
  if (daysDiff <= 0) {
    return null
  }

  // Calculate months and format duration
  const months = Math.floor(daysDiff / 30)
  const formattedDuration = formatDuration(daysDiff)

  return {
    userId,
    userName,
    houseNumber,
    lastPaidPeriodEnd: latestPayment.periodEnd,
    overdueDays: daysDiff,
    overdueMonths: months,
    formattedDuration,
  }
}

/**
 * Calculates maintenance due for all users
 * @param payments - Array of all payment periods with user data
 * @returns DueCalculationResult with users who have overdue payments
 */
export function calculateAllMaintenanceDue(
  payments: PaymentPeriod[]
): DueCalculationResult {
  // Group payments by user
  const userPayments = new Map<
    string,
    {
      userName: string
      houseNumber: string
      payments: PaymentPeriod[]
    }
  >()

  payments.forEach(payment => {
    if (!userPayments.has(payment.userId)) {
      userPayments.set(payment.userId, {
        userName: payment.userName,
        houseNumber: payment.houseNumber,
        payments: [],
      })
    }
    userPayments.get(payment.userId)!.payments.push(payment)
  })

  // Calculate due for each user
  const usersWithDue: MaintenanceDue[] = []

  userPayments.forEach((userData, userId) => {
    const due = calculateUserDue(
      userId,
      userData.userName,
      userData.houseNumber,
      userData.payments
    )

    if (due) {
      usersWithDue.push(due)
    }
  })

  // Calculate summary statistics
  const totalOverdueUsers = usersWithDue.length
  const averageOverdueDays =
    totalOverdueUsers > 0
      ? Math.round(
          usersWithDue.reduce((sum, user) => sum + user.overdueDays, 0) /
            totalOverdueUsers
        )
      : 0

  return {
    usersWithDue,
    totalOverdueUsers,
    averageOverdueDays,
  }
}

/**
 * Validates payment period data
 * @param payment - Payment period to validate
 * @returns true if payment has valid period dates
 */
export function isValidPaymentPeriod(payment: PaymentPeriod): boolean {
  if (!payment.periodStart || !payment.periodEnd) {
    return false
  }

  const startDate = new Date(payment.periodStart)
  const endDate = new Date(payment.periodEnd)

  // Check if dates are valid and end date is after start date
  return (
    !isNaN(startDate.getTime()) &&
    !isNaN(endDate.getTime()) &&
    endDate >= startDate
  )
}
