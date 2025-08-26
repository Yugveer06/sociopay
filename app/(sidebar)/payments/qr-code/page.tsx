import { getActiveQrCode } from './actions'
import { getActiveBankDetails } from './bank-actions'
import { PaymentTabs } from './payment-tabs'
import { Card, CardContent } from '@/components/ui/card'
import { getServerSession } from '@/lib/server-permissions'
import { checkServerPermission } from '@/lib/server-permissions'

// Force dynamic rendering since we use headers() for authentication
export const dynamic = 'force-dynamic'

/**
 * Payment QR Code & Bank Details Page
 * Where digital payments meet traditional banking! 📱🏦
 */
export default async function PaymentQrPage() {
  const qrData = await getActiveQrCode()
  const bankData = await getActiveBankDetails()
  const session = await getServerSession()

  // Check if user can manage payment methods (admin only)
  const canManagePayments = session
    ? await checkServerPermission({
        qrCode: ['delete'],
      })
    : { success: false }

  return (
    <div className="container mx-auto space-y-8 p-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Payment Methods</h1>
        <p className="text-muted-foreground">
          Choose your preferred payment method below ⚡🏦
        </p>
      </div>

      <div className="flex flex-col items-center space-y-8">
        {/* Payment Methods Tabs */}
        <PaymentTabs
          qrData={qrData}
          bankData={bankData}
          canManagePayments={canManagePayments.success}
        />

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
