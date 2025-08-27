'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useReceiptGenerator } from '@/hooks/use-receipt-generator'
import { ReceiptData } from '@/components/receipt/payment-receipt'
import { Download, Eye, Loader2 } from 'lucide-react'

interface ReceiptPreviewProps {
  data: ReceiptData
  trigger?: React.ReactNode
  companyName?: string
  companySubtitle?: string
}

export function ReceiptPreview({
  data,
  trigger,
  companyName,
  companySubtitle,
}: ReceiptPreviewProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)

  const { previewReceipt, downloadReceipt } = useReceiptGenerator({
    companyName,
    companySubtitle,
  })

  const handlePreview = async () => {
    if (previewUrl) return // Already loaded

    setIsLoading(true)
    try {
      const result = await previewReceipt(data)
      if (result.success && result.url) {
        setPreviewUrl(result.url)
      }
    } catch (error) {
      console.error('Error loading preview:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      await downloadReceipt(data, `receipt-${data.id}.pdf`)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open) {
      handlePreview()
    } else {
      // Clean up object URL when dialog closes
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(null)
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            Preview Receipt
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-4xl">
        <DialogHeader>
          <DialogTitle>Receipt Preview</DialogTitle>
          <DialogDescription>
            Preview the receipt for payment {data.id} before downloading
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-[500px] flex-1 overflow-hidden rounded-lg border">
          {isLoading ? (
            <div className="flex h-[500px] items-center justify-center">
              <div className="text-center">
                <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin" />
                <p className="text-muted-foreground text-sm">
                  Generating receipt preview...
                </p>
              </div>
            </div>
          ) : previewUrl ? (
            <iframe
              src={previewUrl}
              className="h-[500px] w-full"
              title="Receipt Preview"
            />
          ) : (
            <div className="flex h-[500px] items-center justify-center">
              <p className="text-muted-foreground text-sm">
                Failed to load preview
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Close
          </Button>
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
