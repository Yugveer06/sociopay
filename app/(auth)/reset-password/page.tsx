'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { resetPasswordSchema } from '@/lib/schemas'
import { ArrowLeft, Eye, EyeOff, LoaderCircle } from 'lucide-react'
import Link from 'next/link'
import { resetPassword } from '../actions'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [actionResult, setActionResult] = useState<{
    success: boolean
    message: string
    errors?: Record<string, string[]>
  } | null>(null)

  const form = useForm<z.infer<typeof resetPasswordSchema>>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
      otp: '',
      password: '',
      confirmPassword: '',
    },
  })

  // Pre-fill email if provided in query params
  useEffect(() => {
    const email = searchParams.get('email')
    if (email) {
      form.setValue('email', email)
    }
  }, [searchParams, form])

  function onSubmit(values: z.infer<typeof resetPasswordSchema>) {
    startTransition(async () => {
      try {
        const result = await resetPassword(values)
        setActionResult(result)

        if (result.success) {
          // Redirect to login page after successful reset
          setTimeout(() => {
            router.push('/login')
          }, 2000)
          return
        }

        if (result.errors) {
          // Set form errors from validation
          Object.entries(result.errors).forEach(([field, messages]) => {
            form.setError(field as keyof typeof form.formState.errors, {
              type: 'manual',
              message: messages[0],
            })
          })
        }
      } catch {
        setActionResult({
          success: false,
          message: 'An unexpected error occurred',
        })
      }
    })
  }

  return (
    <Card className="bg-background/75 relative w-full max-w-md border-2 backdrop-blur-2xl">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">Reset Password</CardTitle>
        <CardDescription className="mt-2">
          Enter the code sent to your email and your new password
        </CardDescription>
      </CardHeader>
      <CardContent>
        {actionResult && (
          <div
            className={`mb-4 rounded-md border p-3 text-sm ${
              actionResult.success
                ? 'border-green-200 bg-green-50 text-green-600'
                : 'text-destructive bg-destructive/10 border-destructive/20'
            }`}
          >
            {actionResult.message}
            {actionResult.success && (
              <div className="mt-1 text-xs">Redirecting to login page...</div>
            )}
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      {...field}
                      className="justify-center"
                    >
                      <InputOTPGroup className="w-full">
                        <InputOTPSlot className="flex-1" index={0} />
                        <InputOTPSlot className="flex-1" index={1} />
                        <InputOTPSlot className="flex-1" index={2} />
                        <InputOTPSlot className="flex-1" index={3} />
                        <InputOTPSlot className="flex-1" index={4} />
                        <InputOTPSlot className="flex-1" index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        {...field}
                        className="pr-12"
                      />
                      <Button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        variant="outline"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        {...field}
                        className="pr-12"
                      />
                      <Button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        variant="outline"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  <span>Resetting Password</span>
                </>
              ) : (
                <span>Reset Password</span>
              )}
            </Button>
          </form>
        </Form>
        <div className="mt-6 text-center">
          <Link
            href="/forgot-password"
            className="text-primary inline-flex items-center text-sm font-medium"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Forgot Password
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Card className="bg-background/75 relative w-full max-w-md border-2 backdrop-blur-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold">
                Reset Password
              </CardTitle>
              <CardDescription className="mt-2">Loading...</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <LoaderCircle className="h-8 w-8 animate-spin" />
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
