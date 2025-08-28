'use client'

import { Suspense } from 'react'
import { QrCodeDisplay } from './qr-code-display'
import { BankDetailsDisplay } from './bank-details-display'
import { CreateQrForm } from './create-qr-form'
import { BankDetailsForm } from './bank-details-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { QrCode } from '@/lib/zod/qr-codes'
import type { BankDetails } from '@/lib/zod/bank-details'

interface PaymentTabsProps {
  qrData: QrCode | null
  bankData: BankDetails | null
  canManagePayments: boolean
}

/**
 * Payment Tabs Client Component
 * Where tab switching meets payment magic! 🎯💫
 */
export function PaymentTabs({
  qrData,
  bankData,
  canManagePayments,
}: PaymentTabsProps) {
  return (
    <div className="w-full">
      <Tabs defaultValue="qr-code" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="qr-code">QR Code Payment</TabsTrigger>
          <TabsTrigger value="bank-details">Bank Transfer</TabsTrigger>
        </TabsList>

        <TabsContent
          value="qr-code"
          className="mt-6 space-y-6 lg:mt-8 lg:space-y-8"
        >
          <Suspense fallback={<QrCodeSkeleton />}>
            <QrCodeDisplay qrData={qrData} />
          </Suspense>

          {/* QR Code Admin Controls */}
          {canManagePayments && (
            <div className="flex justify-center">
              <div className="w-full max-w-4xl">
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle className="text-center text-lg lg:text-xl">
                      QR Code Admin Controls
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!qrData ? (
                      <div className="space-y-4">
                        <p className="text-muted-foreground text-center text-sm">
                          No QR code exists. Create one to enable UPI payments.
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
                                qrData.isActive
                                  ? 'text-green-600'
                                  : 'text-red-600'
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
            </div>
          )}
        </TabsContent>

        <TabsContent
          value="bank-details"
          className="mt-6 space-y-6 lg:mt-8 lg:space-y-8"
        >
          <BankDetailsDisplay bankData={bankData} />

          {/* Bank Details Admin Controls */}
          {canManagePayments && (
            <div className="flex justify-center">
              <div className="w-full max-w-4xl">
                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle className="text-center text-lg lg:text-xl">
                      Bank Details Admin Controls
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!bankData ? (
                      <div className="space-y-4">
                        <p className="text-muted-foreground text-center text-sm">
                          No bank details configured. Add them to enable
                          traditional payments.
                        </p>
                        <BankDetailsForm />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-muted-foreground text-center text-sm">
                          Bank details are configured and ready.
                        </p>
                        <div className="space-y-1 text-sm">
                          <p>
                            <strong>Bank:</strong> {bankData.bankName}
                          </p>
                          <p>
                            <strong>A/C No:</strong> {bankData.accountNumber}
                          </p>
                          <p>
                            <strong>Status:</strong>
                            <span
                              className={
                                bankData.isActive
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }
                            >
                              {bankData.isActive ? ' Active' : ' Inactive'}
                            </span>
                          </p>
                        </div>
                        <BankDetailsForm existingBankDetails={bankData} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

/**
 * Loading skeleton for QR code display
 * Making loading as smooth as a buttered slide! 🧈✨
 */
function QrCodeSkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <Card>
        <CardHeader className="pb-4 text-center">
          <div className="bg-muted mx-auto mb-4 h-16 w-16 rounded-full">
            <Skeleton className="h-full w-full rounded-full" />
          </div>
          <Skeleton className="mx-auto h-8 w-48" />
          <Skeleton className="mx-auto mt-2 h-4 w-32" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
            {/* QR Code Section Skeleton */}
            <Card>
              <CardHeader className="text-center">
                <Skeleton className="mx-auto h-6 w-24" />
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-4">
                <div className="rounded-xl bg-white p-4 shadow-lg ring-1 ring-gray-200 lg:p-6">
                  <Skeleton className="h-48 w-48 lg:h-64 lg:w-64" />
                </div>
                <div className="flex w-full gap-3">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </CardContent>
            </Card>

            {/* Instructions Skeleton */}
            <div className="space-y-4 lg:space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="mt-0.5 h-6 w-6 flex-shrink-0 rounded-full" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-36" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
