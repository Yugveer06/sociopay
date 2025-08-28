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
    <div className="container mx-auto max-w-7xl space-y-6 p-4 lg:space-y-8 lg:p-6">
      {/* Header Section */}
      <div className="space-y-3 text-center">
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl xl:text-4xl">
          Payment Methods
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-sm lg:text-base">
          Choose your preferred payment method below. Quick, secure, and
          convenient! ⚡🏦
        </p>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center space-y-6 lg:space-y-8">
        {/* Payment Methods Tabs */}
        <div className="w-full">
          <PaymentTabs
            qrData={qrData}
            bankData={bankData}
            canManagePayments={canManagePayments.success}
          />
        </div>

        {/* Non-logged-in users message */}
        {!session && (
          <div className="w-full max-w-md">
            <Card className="border-2 border-dashed">
              <CardContent className="pt-6">
                <div className="space-y-3 text-center">
                  <div className="bg-muted mx-auto flex h-12 w-12 items-center justify-center rounded-full">
                    <span className="text-2xl">🔐</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Please log in to access payment features and manage your
                    transactions
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
