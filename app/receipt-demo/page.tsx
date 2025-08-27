'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ReceiptPreview } from '@/components/receipt/receipt-preview'
import { useReceiptGenerator } from '@/hooks/use-receipt-generator'
import { ReceiptData } from '@/components/receipt/payment-receipt'
import { Download, Eye, Sparkles } from 'lucide-react'

const sampleReceiptData: ReceiptData = {
  id: 'PAY-2025-001',
  amount: 2500.0,
  paymentDate: '2025-01-15',
  userName: 'Rajesh Kumar',
  houseNumber: 'A-12',
  category: 'Maintenance Fee',
  paymentType: 'recurring',
  intervalType: 'monthly',
  periodStart: '2025-01-01',
  periodEnd: '2025-01-31',
  notes:
    'Monthly maintenance payment for society amenities including garden maintenance, security services, and common area cleaning.',
  createdAt: new Date().toISOString(),
}

export default function ReceiptDemoPage() {
  const [isGenerating, setIsGenerating] = useState(false)

  const { downloadReceipt } = useReceiptGenerator({
    companyName: 'SUKOON',
    companySubtitle: 'C.O.P. HOUSING SOC LTD',
  })

  const handleDirectDownload = async () => {
    setIsGenerating(true)
    try {
      await downloadReceipt(sampleReceiptData, 'sample-receipt.pdf')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="container mx-auto space-y-8 py-8">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold">Receipt Generation Demo</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl">
          Experience our new professional receipt generation system powered by
          react-pdf. Clean, customizable, and print-ready receipts with modern
          design standards.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Sample Receipt Data
            </CardTitle>
            <CardDescription>
              This is the data that will be used to generate the receipt
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Receipt ID:</strong>
                <p className="text-muted-foreground">{sampleReceiptData.id}</p>
              </div>
              <div>
                <strong>Amount:</strong>
                <p className="text-muted-foreground">
                  {new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                  }).format(sampleReceiptData.amount)}
                </p>
              </div>
              <div>
                <strong>Customer:</strong>
                <p className="text-muted-foreground">
                  {sampleReceiptData.userName}
                </p>
              </div>
              <div>
                <strong>House Number:</strong>
                <p className="text-muted-foreground">
                  {sampleReceiptData.houseNumber}
                </p>
              </div>
              <div>
                <strong>Category:</strong>
                <p className="text-muted-foreground">
                  {sampleReceiptData.category}
                </p>
              </div>
              <div>
                <strong>Payment Type:</strong>
                <p className="text-muted-foreground">
                  {sampleReceiptData.paymentType}
                </p>
              </div>
              <div>
                <strong>Service Period:</strong>
                <p className="text-muted-foreground">
                  {sampleReceiptData.periodStart} to{' '}
                  {sampleReceiptData.periodEnd}
                </p>
              </div>
              <div>
                <strong>Interval:</strong>
                <p className="text-muted-foreground">
                  {sampleReceiptData.intervalType}
                </p>
              </div>
            </div>

            {sampleReceiptData.notes && (
              <div>
                <strong>Notes:</strong>
                <p className="text-muted-foreground mt-1 text-sm">
                  {sampleReceiptData.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receipt Actions</CardTitle>
            <CardDescription>
              Try out the different ways to generate and view receipts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <ReceiptPreview
                data={sampleReceiptData}
                trigger={
                  <Button className="w-full" variant="outline">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview Receipt
                  </Button>
                }
                companyName="SUKOON"
                companySubtitle="C.O.P. HOUSING SOC LTD"
              />

              <Button
                onClick={handleDirectDownload}
                disabled={isGenerating}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Download className="mr-2 h-4 w-4" />
                {isGenerating ? 'Generating...' : 'Download PDF Directly'}
              </Button>
            </div>

            <div className="border-t pt-4">
              <h4 className="mb-2 font-semibold">Features:</h4>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>• Professional design with company branding</li>
                <li>• Print-ready layout and typography</li>
                <li>• Proper currency formatting (INR)</li>
                <li>• Date localization for Indian format</li>
                <li>• Responsive preview with iframe</li>
                <li>• Automatic PDF generation and download</li>
                <li>• Clean and customizable styling</li>
                <li>• Memory-efficient with URL cleanup</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integration Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="space-y-2 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold">Modern Technology</h3>
              <p className="text-muted-foreground text-sm">
                Built with react-pdf for better performance and maintainability
              </p>
            </div>

            <div className="space-y-2 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold">Preview First</h3>
              <p className="text-muted-foreground text-sm">
                Preview receipts before downloading to ensure accuracy
              </p>
            </div>

            <div className="space-y-2 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Download className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold">Easy Integration</h3>
              <p className="text-muted-foreground text-sm">
                Reusable components that work seamlessly across the app
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
