'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Download, Eye } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatBytes } from '@/lib/utils'
import { KycDocument } from '@/lib/zod'

export const columns: ColumnDef<KycDocument>[] = [
  {
    accessorKey: 'fileName',
    header: 'Document Name',
    cell: ({ row }) => {
      const fileName = row.getValue('fileName') as string
      return <div className="font-medium">{fileName}</div>
    },
  },
  {
    accessorKey: 'user_name',
    header: 'Renter Name',
    cell: ({ row }) => {
      const userName = row.getValue('user_name') as string
      const houseNumber = row.original.house_number
      return (
        <div>
          <div className="font-medium">{userName}</div>
          <div className="text-muted-foreground text-sm">
            House {houseNumber}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'fileSize',
    header: 'Size',
    cell: ({ row }) => {
      const fileSize = row.getValue('fileSize') as string | null
      return (
        <div className="text-sm">
          {fileSize ? formatBytes(parseInt(fileSize)) : 'Unknown'}
        </div>
      )
    },
  },
  {
    accessorKey: 'uploadedAt',
    header: 'Uploaded Date',
    cell: ({ row }) => {
      const uploadedAt = row.getValue('uploadedAt') as string
      return (
        <div className="text-sm">
          {new Date(uploadedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </div>
      )
    },
  },
  {
    accessorKey: 'uploaded_by_name',
    header: 'Uploaded By',
    cell: ({ row }) => {
      const uploadedByName = row.getValue('uploaded_by_name') as string
      return <div className="text-sm">{uploadedByName}</div>
    },
  },
  {
    accessorKey: 'contentType',
    header: 'Type',
    cell: ({ row }) => {
      const contentType = row.getValue('contentType') as string
      return (
        <Badge variant="secondary">
          {contentType === 'application/pdf' ? 'PDF' : contentType}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const document = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => window.open(document.downloadUrl, '_blank')}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Document
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const link = window.document.createElement('a')
                link.href = document.downloadUrl
                link.download = document.fileName
                link.click()
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(document.id)}
            >
              Copy Document ID
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
