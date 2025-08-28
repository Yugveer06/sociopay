'use client'

import { useEffect, useState, useCallback } from 'react'
import QRCode from 'qrcode'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertCircle,
  Download,
  Trash2,
  Smartphone,
  CreditCard,
  CheckCircle,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { usePermissions } from '@/hooks/use-permissions'
import { toast } from 'sonner'
import { deleteQrCodeAction } from './actions'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
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
      <div className="mx-auto w-full max-w-4xl">
        <Card className="border-2 border-dashed">
          <CardHeader className="pb-4 text-center">
            <div className="bg-muted mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <Smartphone className="text-muted-foreground h-8 w-8" />
            </div>
            <CardTitle className="text-xl lg:text-2xl">
              Payment QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Alert className="mx-auto max-w-md">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No active QR code found. Admin can create one to enable instant
                payments.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!qrData.isActive) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20">
          <CardHeader className="pb-4 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
              <AlertCircle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
            <CardTitle className="text-xl lg:text-2xl">
              Payment QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Alert className="mx-auto max-w-md border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                QR code is currently inactive. Please contact admin to activate
                payments.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Header Section */}
      <div className="mb-6 text-center lg:mb-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
          <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="mb-2 text-2xl font-bold lg:text-3xl">Scan to Pay</h1>
        <p className="text-muted-foreground text-sm lg:text-base">
          {qrData.merchantName}
        </p>
        <Badge variant="secondary" className="mt-2">
          <Smartphone className="mr-1 h-3 w-3" />
          UPI Payment
        </Badge>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        {/* QR Code Section */}
        <Card className="order-2 lg:order-1">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-lg lg:text-xl">
              <CreditCard className="h-5 w-5" />
              QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            {isLoading ? (
              <div className="flex h-48 w-full items-center justify-center lg:h-64">
                <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
              </div>
            ) : qrCodeUrl ? (
              <>
                {/* QR Code Display */}
                <div className="rounded-xl bg-white p-4 shadow-lg ring-1 ring-gray-200 lg:p-6 dark:ring-gray-700">
                  <Image
                    src={qrCodeUrl}
                    alt="UPI Payment QR Code"
                    width={200}
                    height={200}
                    className="mx-auto lg:h-64 lg:w-64"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex w-full gap-3">
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="flex-1"
                    size="sm"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>

                  {permissions.isAdmin && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={isDeleting}
                          className="shrink-0"
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
                            action cannot be undone and users will no longer be
                            able to make payments using this QR code.
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
              </>
            ) : (
              <Alert className="w-full">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to generate QR code. Please try refreshing the page.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Instructions & Details Section */}
        <div className="order-1 space-y-4 lg:order-2 lg:space-y-6">
          {/* Payment Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg lg:text-xl">How to Pay</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  'Open any UPI app (PhonePe, Paytm, Google Pay, etc.)',
                  'Tap on "Scan QR" or camera icon',
                  'Point your camera at the QR code',
                  'Enter amount and complete payment',
                  'Share payment confirmation with society management',
                ].map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium">
                      {index + 1}
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed lg:text-base">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg lg:text-xl">
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-muted-foreground text-sm font-medium">
                    UPI ID:
                  </span>
                  <code className="bg-muted rounded-md px-3 py-1.5 font-mono text-xs break-all lg:text-sm">
                    {qrData.upiId}
                  </code>
                </div>

                <Separator />

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-muted-foreground text-sm font-medium">
                    Payee Name:
                  </span>
                  <span className="text-sm font-medium lg:text-base">
                    {qrData.merchantName}
                  </span>
                </div>

                <Separator />

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-muted-foreground text-sm font-medium">
                    Currency:
                  </span>
                  <Badge variant="outline">INR (₹)</Badge>
                </div>
              </div>

              {/* Important Note */}
              <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="mb-1 text-sm font-medium text-blue-900 dark:text-blue-100">
                      Important Note
                    </p>
                    <p className="text-xs text-blue-800 lg:text-sm dark:text-blue-200">
                      After completing your payment, please share the
                      transaction details with society management for record
                      keeping and confirmation.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
