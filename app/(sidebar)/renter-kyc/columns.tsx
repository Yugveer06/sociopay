'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Download, Eye, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { formatBytes } from '@/lib/utils'
import { KycDocument } from '@/lib/zod'
import { deleteKycDocument } from './actions'
import { toast } from 'sonner'
import { useState } from 'react'

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
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [isDeleting, setIsDeleting] = useState(false)

      const handleDelete = async () => {
        try {
          setIsDeleting(true)
          const result = await deleteKycDocument({ id: document.id })

          if (result.success) {
            toast.success('KYC document deleted successfully! 🗑️')
          } else {
            toast.error(result.message || 'Failed to delete KYC document')
          }
        } catch (error) {
          console.error('Delete error:', error)
          toast.error('Something went wrong while deleting the document')
        } finally {
          setIsDeleting(false)
        }
      }

      return (
        <div className="flex items-center gap-2">
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
                  try {
                    // Create download link with proper attributes
                    const link = window.document.createElement('a')
                    link.href = document.downloadUrl
                    link.download = document.fileName
                    link.target = '_blank'
                    link.rel = 'noopener noreferrer'

                    // Force download by setting the appropriate headers via URL params
                    const url = new URL(document.downloadUrl)
                    url.searchParams.set('download', 'true')
                    url.searchParams.set(
                      'response-content-disposition',
                      `attachment; filename="${document.fileName}"`
                    )
                    link.href = url.toString()

                    // Add to DOM, click, and cleanup
                    window.document.body.appendChild(link)
                    link.click()
                    window.document.body.removeChild(link)

                    toast.success('Download started! 📥')
                  } catch (error) {
                    console.error('Download error:', error)
                    toast.error('Failed to download document')
                  }
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
              <DropdownMenuSeparator />

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={e => e.preventDefault()}
                    className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Document
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <div className="text-muted-foreground space-y-2 text-sm">
                      <div>
                        This action cannot be undone and will permanently remove
                        the document from both the database and storage.
                      </div>
                      <div className="bg-muted space-y-1 rounded-md p-3 text-sm">
                        <div>
                          <strong>Document:</strong> {document.fileName}
                        </div>
                        <div>
                          <strong>Renter:</strong> {document.user_name} (House{' '}
                          {document.house_number})
                        </div>
                        <div>
                          <strong>Uploaded by:</strong>{' '}
                          {document.uploaded_by_name}
                        </div>
                      </div>
                    </div>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete Document'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]
