'use client'

import { createColumns, Ticket } from './columns'
import { DataTable } from './data-table'

interface TicketsDataTableProps {
  tickets: Ticket[]
}

export function TicketsDataTable({ tickets }: TicketsDataTableProps) {
  const columns = createColumns()
  return <DataTable columns={columns} data={tickets} />
}
