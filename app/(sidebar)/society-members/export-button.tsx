'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  IconDownload,
  IconFileTypeCsv,
  IconFileTypePdf,
} from '@tabler/icons-react'
import { useTransition } from 'react'
import { exportMembers } from './actions'
import { toast } from 'sonner'
import { PermissionGuard } from '@/components/guards'
import { useTableExport } from '@/hooks/use-table-export'

export function ExportButton() {
  const [isPending, startTransition] = useTransition()
  const { exportToPDF, exportToCSV } = useTableExport({
    companyName: 'SUKOON',
    companySubtitle: 'CO.OP. HOUSING SOC LTD',
  })

  const handleExport = (format: 'pdf' | 'csv') => {
    startTransition(async () => {
      try {
        const result = await exportMembers({ format })
        if (result?.success && result?.data) {
          const filename = `society-members-${new Date().toISOString().split('T')[0]}`

          if (format === 'pdf') {
            // Export PDF using the hook with the data array
            await exportToPDF(
              result.data,
              filename,
              'Society Members Report',
              `Generated on ${new Date().toLocaleDateString()}`
            )
          } else if (format === 'csv') {
            // Export CSV using the hook with the data array
            await exportToCSV(result.data, filename)
          }

          // Success toast is handled by useTableExport hook, no need to show another one
        } else {
          toast.error(result?.message || 'Failed to export members')
        }
      } catch (error) {
        console.error('Export error:', error)
        toast.error('Failed to export data. Please try again.')
      }
    })
  }

  return (
    <PermissionGuard permissions={{ members: ['export'] }}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={isPending}
            className="h-8 px-3"
          >
            <IconDownload className="mr-2 h-4 w-4" />
            Export {isPending && '...'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleExport('pdf')}>
            <IconFileTypePdf className="mr-2 h-4 w-4" />
            Export as PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('csv')}>
            <IconFileTypeCsv className="mr-2 h-4 w-4" />
            Export as CSV
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </PermissionGuard>
  )
}
