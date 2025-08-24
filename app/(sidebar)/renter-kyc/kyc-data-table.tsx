'use client'

import { getColumns } from './columns'
import { DataTable } from './data-table'
import { KycDocument } from '@/lib/zod'

interface KycDataTableProps {
  data: KycDocument[]
  canDelete: boolean
}

export function KycDataTable({ data, canDelete }: KycDataTableProps) {
  // Generate columns on the client side with proper permissions - keeping it secure! 🔒
  const columns = getColumns(canDelete)

  return <DataTable columns={columns} data={data} />
}
