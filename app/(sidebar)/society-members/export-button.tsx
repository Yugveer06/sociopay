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
  IconFileText,
  IconFileTypePdf,
} from '@tabler/icons-react'
import { useTransition } from 'react'
import { exportMembers } from './actions'
import { toast } from 'sonner'
import { PermissionGuard } from '@/components/guards'

export function ExportButton() {
  const [isPending, startTransition] = useTransition()

  const handleExport = (format: 'pdf' | 'csv' | 'json') => {
    startTransition(async () => {
      try {
        const result = await exportMembers({ format })
        if (result?.success) {
          toast.success(
            `Society members exported successfully as ${format.toUpperCase()}`
          )
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
          <DropdownMenuItem onClick={() => handleExport('json')}>
            <IconFileText className="mr-2 h-4 w-4" />
            Export as JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </PermissionGuard>
  )
}
