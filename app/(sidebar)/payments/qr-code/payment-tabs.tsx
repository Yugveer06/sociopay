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
    <div className="w-full max-w-2xl">
      <Tabs defaultValue="qr-code" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="qr-code">QR Code Payment</TabsTrigger>
          <TabsTrigger value="bank-details">Bank Transfer</TabsTrigger>
        </TabsList>

        <TabsContent value="qr-code" className="space-y-6">
          <div className="flex justify-center">
            <Suspense fallback={<QrCodeSkeleton />}>
              <QrCodeDisplay qrData={qrData} />
            </Suspense>
          </div>

          {/* QR Code Admin Controls */}
          {canManagePayments && (
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">
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

        <TabsContent value="bank-details" className="space-y-6">
          <div className="flex justify-center">
            <BankDetailsDisplay bankData={bankData} />
          </div>

          {/* Bank Details Admin Controls */}
          {canManagePayments && (
            <div className="flex justify-center">
              <div className="w-full max-w-md">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-center">
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
