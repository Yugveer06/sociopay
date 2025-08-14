'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
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
import { forgotPasswordSchema } from '@/lib/zod'
import { ArrowLeft, LoaderCircle } from 'lucide-react'
import Link from 'next/link'
import { forgotPassword } from '../actions'

export default function ForgotPasswordPage() {
  const router = useRouter()

  const [isPending, startTransition] = useTransition()
  const [actionResult, setActionResult] = useState<{
    success: boolean
    message: string
    errors?: Record<string, string[]>
  } | null>(null)

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
    startTransition(async () => {
      try {
        const result = await forgotPassword(values)
        setActionResult(result)

        if (result.success) {
          // Redirect to reset password page with email
          router.push(
            `/reset-password?email=${encodeURIComponent(values.email)}`
          )
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
        <CardTitle className="text-3xl font-bold">Forgot Password</CardTitle>
        <CardDescription className="mt-2">
          Enter your email to receive a reset code
        </CardDescription>
      </CardHeader>
      <CardContent>
        {actionResult && (
          <div
            className={`mb-4 rounded-md border p-3 text-sm ${
              actionResult.success
                ? 'border-green-200 bg-green-50 text-green-600 dark:border-green-800 dark:bg-green-900'
                : 'text-destructive bg-destructive/10 border-destructive/20'
            }`}
          >
            {actionResult.message}
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
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  <span>Sending Reset Code</span>
                </>
              ) : (
                <span>Send Reset Code</span>
              )}
            </Button>
          </form>
        </Form>
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-primary inline-flex items-center text-sm font-medium"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
