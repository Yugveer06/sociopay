'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import type { BankDetails } from '@/db/schema/bank-details'

interface BankDetailsDisplayProps {
  bankData: BankDetails | null
}

/**
 * Bank Details Display Component
 * Where traditional banking meets modern UI! 🏦💻
 */
export function BankDetailsDisplay({ bankData }: BankDetailsDisplayProps) {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard! 📋`)
  }

  if (!bankData) {
    return (
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="text-center">
          <div className="bg-muted mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full">
            <CreditCard className="text-muted-foreground h-6 w-6" />
          </div>
          <CardTitle className="text-lg">Bank Details Not Available</CardTitle>
          <p className="text-muted-foreground text-sm">
            Bank details will be displayed here once configured by admin
          </p>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="text-center">
        <div className="bg-primary/10 mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full">
          <CreditCard className="text-primary h-6 w-6" />
        </div>
        <CardTitle className="text-lg">Bank Details</CardTitle>
        <p className="text-muted-foreground text-sm">
          Use these details for cheque or bank transfer payments
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bank Details Card */}
        <div className="bg-muted/50 space-y-3 rounded-lg border p-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <span className="text-muted-foreground text-sm font-medium">
                Bank Name
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1"
                onClick={() => copyToClipboard(bankData.bankName, 'Bank name')}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <p className="font-medium">{bankData.bankName}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <span className="text-muted-foreground text-sm font-medium">
                Branch
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1"
                onClick={() =>
                  copyToClipboard(bankData.branchName, 'Branch name')
                }
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <p className="font-medium">{bankData.branchName}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <span className="text-muted-foreground text-sm font-medium">
                Account Holder
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1"
                onClick={() =>
                  copyToClipboard(
                    bankData.accountHolderName,
                    'Account holder name'
                  )
                }
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <p className="font-medium">{bankData.accountHolderName}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <span className="text-muted-foreground text-sm font-medium">
                Account Number
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1"
                onClick={() =>
                  copyToClipboard(bankData.accountNumber, 'Account number')
                }
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <p className="font-mono font-medium">{bankData.accountNumber}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <span className="text-muted-foreground text-sm font-medium">
                IFSC Code
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1"
                onClick={() => copyToClipboard(bankData.ifscCode, 'IFSC code')}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            <p className="font-mono font-medium">{bankData.ifscCode}</p>
          </div>

          {bankData.additionalInfo && (
            <div className="space-y-2">
              <span className="text-muted-foreground text-sm font-medium">
                Additional Info
              </span>
              <p className="rounded border border-orange-200 bg-orange-50 p-2 text-sm text-orange-600">
                {bankData.additionalInfo}
              </p>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="flex justify-center">
          <Badge variant={bankData.isActive ? 'default' : 'secondary'}>
            {bankData.isActive ? '✅ Active' : '❌ Inactive'}
          </Badge>
        </div>

        {/* Instructions */}
        <div className="space-y-2 text-center">
          <h4 className="text-sm font-medium">Payment Instructions</h4>
          <div className="text-muted-foreground space-y-1 text-xs">
            <p>1. Use these details for bank transfers or cheques</p>
            <p>2. Include your house number in the payment reference</p>
            <p>3. Keep the payment receipt for your records</p>
            <p>4. Contact admin after making the payment</p>
          </div>
        </div>

        {/* Copy All Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            const allDetails = `Bank: ${bankData.bankName}
Branch: ${bankData.branchName}
A/C Holder: ${bankData.accountHolderName}
A/C No: ${bankData.accountNumber}
IFSC: ${bankData.ifscCode}${
              bankData.additionalInfo
                ? `
Note: ${bankData.additionalInfo}`
                : ''
            }`
            copyToClipboard(allDetails, 'All bank details')
          }}
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy All Details
        </Button>
      </CardContent>
    </Card>
  )
}
