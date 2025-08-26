import { Suspense } from 'react'
import { getActiveQrCode } from './actions'
import { QrCodeDisplay } from './qr-code-display'
import { CreateQrForm } from './create-qr-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { getServerSession } from '@/lib/server-permissions'
import { checkServerPermission } from '@/lib/server-permissions'

// Force dynamic rendering since we use headers() for authentication
export const dynamic = 'force-dynamic'

/**
 * Payment QR Code Page
 * Where digital payments meet analog squares! 📱⬜
 */
export default async function PaymentQrPage() {
  const qrData = await getActiveQrCode()
  const session = await getServerSession()

  // Check if user can manage QR codes (admin only)
  const canManageQrCodes = session
    ? await checkServerPermission({
        qrCode: ['delete'],
      })
    : { success: false }

  return (
    <div className="container mx-auto space-y-8 p-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Payment QR Code</h1>
        <p className="text-muted-foreground">
          Scan the QR code below to make payments instantly ⚡
        </p>
      </div>

      <div className="flex flex-col items-center space-y-8">
        {/* QR Code Display - Centered */}
        <div className="w-full max-w-lg">
          <Suspense fallback={<QrCodeSkeleton />}>
            <QrCodeDisplay qrData={qrData} />
          </Suspense>
        </div>

        {/* Admin Controls - Below QR Code */}
        {canManageQrCodes.success && (
          <div className="w-full max-w-md">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Admin Controls</CardTitle>
              </CardHeader>
              <CardContent>
                {!qrData ? (
                  <div className="space-y-4">
                    <p className="text-muted-foreground text-center text-sm">
                      No QR code exists. Create one to enable payments.
                    </p>
                    <CreateQrForm />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-muted-foreground text-center text-sm">
                      QR code is active and ready for payments.
                    </p>
                    <div className="space-y-1 text-sm">
                      <p>
                        <strong>UPI ID:</strong> {qrData.upiId}
                      </p>
                      <p>
                        <strong>Merchant:</strong> {qrData.merchantName}
                      </p>
                      <p>
                        <strong>Status:</strong>
                        <span
                          className={
                            qrData.isActive ? 'text-green-600' : 'text-red-600'
                          }
                        >
                          {qrData.isActive ? ' Active' : ' Inactive'}
                        </span>
                      </p>
                    </div>
                    <CreateQrForm />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Non-logged-in users message */}
        {!session && (
          <div className="w-full max-w-md">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center text-sm">
                  Please log in to access payment features
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Loading skeleton for QR code display
 */
function QrCodeSkeleton() {
  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <Skeleton className="mx-auto h-6 w-32" />
        <Skeleton className="mx-auto h-4 w-48" />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* QR Code Skeleton */}
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <Skeleton className="mx-auto h-64 w-64" />
        </div>

        {/* Instructions Skeleton */}
        <div className="space-y-4 text-center">
          <Skeleton className="mx-auto h-6 w-24" />
          <div className="space-y-2">
            <Skeleton className="mx-auto h-4 w-64" />
            <Skeleton className="mx-auto h-4 w-56" />
            <Skeleton className="mx-auto h-4 w-60" />
            <Skeleton className="mx-auto h-4 w-52" />
          </div>
          <div className="space-y-2 border-t pt-4">
            <Skeleton className="mx-auto h-4 w-32" />
            <Skeleton className="mx-auto h-3 w-48" />
            <Skeleton className="mx-auto h-3 w-40" />
          </div>
        </div>

        {/* Buttons Skeleton */}
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-20" />
        </div>
      </CardContent>
    </Card>
  )
}
