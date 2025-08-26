'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { insertQrCodeSchema } from '@/lib/zod/qr-codes'
import { updateQrCodeAction } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'

type FormData = z.infer<typeof insertQrCodeSchema>

interface CreateQrFormProps {
  onSuccess?: () => void
}

/**
 * Form to create or update UPI QR code
 * For admins to manage magical payment squares! 🎨📱
 */
export function CreateQrForm({ onSuccess }: CreateQrFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(insertQrCodeSchema),
    defaultValues: {
      upiId: 'sukoo98259@barodampay',
      merchantName: 'Sukun 3 Co. Op. Hsg. Soc. Ltd.',
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      const result = await updateQrCodeAction(data)

      if (result.success) {
        toast.success(result.message)
        reset()
        onSuccess?.()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error('Failed to process QR code')
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">Manage Payment QR Code</CardTitle>
        <p className="text-muted-foreground text-center text-sm">
          Create or update the payment QR code
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="upiId">UPI ID</Label>
            <Input
              id="upiId"
              type="text"
              placeholder="yourname@bankname"
              {...register('upiId')}
              className={errors.upiId ? 'border-destructive' : ''}
            />
            {errors.upiId && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.upiId.message}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="merchantName">Merchant Name</Label>
            <Input
              id="merchantName"
              type="text"
              placeholder="Your Business Name"
              {...register('merchantName')}
              className={errors.merchantName ? 'border-destructive' : ''}
            />
            {errors.merchantName && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {errors.merchantName.message}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Save QR Code'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
