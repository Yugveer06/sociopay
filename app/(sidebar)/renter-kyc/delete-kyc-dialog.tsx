'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { deleteKycDocument } from './actions'
import { toast } from 'sonner'
import { KycDocument } from '@/lib/zod'

/**
 * @deprecated This component is deprecated in favor of the permission-based delete functionality
 * integrated directly in the columns. Only admins can now delete KYC documents! 🔒
 * Use the getColumns function with appropriate permissions instead.
 */

interface DeleteKycDialogProps {
  document: KycDocument
}

export function DeleteKycDialog({ document }: DeleteKycDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [open, setOpen] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)

      const result = await deleteKycDocument({ id: document.id })

      if (result.success) {
        toast.success('KYC document deleted successfully! 🗑️')
        setOpen(false)
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

  // DEPRECATED: Permission checking is now handled in columns.tsx with getColumns()
  // Only admins have delete permissions - regular users can't delete KYC documents anymore! 🛡️

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete document</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete KYC Document</AlertDialogTitle>
          <div className="text-muted-foreground space-y-2 text-sm">
            <div>
              Are you sure you want to delete &quot;{document.fileName}&quot;?
              This action cannot be undone and will permanently remove the
              document from both the database and storage.
            </div>
            <div className="space-y-1">
              <div>
                <strong>Renter:</strong> {document.user_name} (House{' '}
                {document.house_number})
              </div>
              <div>
                <strong>Uploaded by:</strong> {document.uploaded_by_name}
              </div>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
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
  )
}
