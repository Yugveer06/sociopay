'use client'

import { useEffect, useState, useCallback } from 'react'
import QRCode from 'qrcode'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle, Download, Trash2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { usePermissions } from '@/hooks/use-permissions'
import { toast } from 'sonner'
import { deleteQrCodeAction } from './actions'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface QrCodeDisplayProps {
  qrData: {
    id: string
    upiId: string
    merchantName: string
    isActive: boolean
  } | null
}

/**
 * UPI QR Code Display Component
 * Makes payments as easy as scanning a barcode at the grocery store! 🛒📱
 */
export function QrCodeDisplay({ qrData }: QrCodeDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const permissions = usePermissions()

  const generateQRCode = useCallback(async () => {
    if (!qrData) return

    setIsLoading(true)
    try {
      // UPI QR Code format: upi://pay?pa=UPI_ID&pn=MERCHANT_NAME&cu=INR
      const upiUrl = `upi://pay?pa=${qrData.upiId}&pn=${encodeURIComponent(qrData.merchantName)}&cu=INR`

      // Generate QR code with high error correction and good size
      const qrDataUrl = await QRCode.toDataURL(upiUrl, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        margin: 2,
        width: 300,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      })

      setQrCodeUrl(qrDataUrl)
    } catch {
      console.error('Error generating QR code')
      toast.error('Failed to generate QR code')
    } finally {
      setIsLoading(false)
    }
  }, [qrData])

  // Generate UPI QR code when qrData changes
  useEffect(() => {
    if (qrData && qrData.isActive) {
      generateQRCode()
    }
  }, [qrData, generateQRCode])

  const handleDownload = () => {
    if (!qrCodeUrl || !qrData) return

    const link = document.createElement('a')
    link.href = qrCodeUrl
    link.download = `${qrData.merchantName.replace(/[^a-zA-Z0-9]/g, '_')}_UPI_QR.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('QR code downloaded! 📱')
  }

  const handleDelete = async () => {
    if (!qrData) return

    setIsDeleting(true)
    try {
      const result = await deleteQrCodeAction({ id: qrData.id })
      if (result.success) {
        toast.success(result.message)
        setQrCodeUrl('')
      } else {
        toast.error(result.message)
      }
    } catch {
      toast.error('Failed to delete QR code')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!qrData) {
    return (
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Payment QR Code</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No active QR code found. Admin can create one to enable payments.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!qrData.isActive) {
    return (
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Payment QR Code</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              QR code is currently inactive. Please contact admin.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">Scan to Pay</CardTitle>
        <p className="text-muted-foreground text-center text-sm">
          {qrData.merchantName}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
          </div>
        ) : qrCodeUrl ? (
          <div className="flex flex-col items-center space-y-6">
            {/* QR Code */}
            <div className="rounded-lg bg-white p-6 shadow-lg">
              <Image
                src={qrCodeUrl}
                alt="UPI Payment QR Code"
                width={256}
                height={256}
                className="mx-auto"
              />
            </div>

            {/* Instructions */}
            <div className="space-y-4 text-center">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">How to Pay</h3>
                <div className="text-muted-foreground space-y-1 text-sm">
                  <p>1. Open any UPI app (PhonePe, Paytm, Google Pay, etc.)</p>
                  <p>2. Tap on &quot;Scan QR&quot; or camera icon</p>
                  <p>3. Point your camera at the QR code above</p>
                  <p>4. Enter amount and complete payment</p>
                  <p>
                    5. After Payment make sure to confirm the transaction by
                    contacting the society management.
                  </p>
                </div>
              </div>

              <div className="space-y-2 border-t pt-4">
                <p className="text-sm font-medium">Payment Details</p>
                <p className="text-muted-foreground text-xs">
                  UPI ID:{' '}
                  <span className="bg-muted rounded px-2 py-1 font-mono">
                    {qrData.upiId}
                  </span>
                </p>
                <p className="text-muted-foreground text-xs">
                  Payee:{' '}
                  <span className="font-medium">{qrData.merchantName}</span>
                </p>
              </div>
            </div>

            <div className="flex w-full gap-2">
              <Button
                onClick={handleDownload}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                <Download className="mr-2 h-4 w-4" />
                Download QR
              </Button>

              {permissions.isAdmin && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={isDeleting}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete QR Code</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this QR code? This
                        action cannot be undone and users will no longer be able
                        to make payments using this QR code.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete QR Code
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to generate QR code. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
