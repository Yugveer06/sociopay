'use client'

import { createColumns, Payment } from './columns'
import { DataTable } from './data-table'

interface PaymentsDataTableProps {
  payments: Payment[]
  users: Array<{ id: string; name: string; houseNumber: string }>
  categories: Array<{ id: number; name: string }>
}

export function PaymentsDataTable({
  payments,
  users,
  categories,
}: PaymentsDataTableProps) {
  const columns = createColumns(users, categories)

  return <DataTable columns={columns} data={payments} />
}
