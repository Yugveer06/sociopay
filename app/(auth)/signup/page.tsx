'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState, useTransition, useRef } from 'react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { signUpSchema } from '@/lib/zod/auth'
import { Eye, EyeOff, LoaderCircle } from 'lucide-react'
import Link from 'next/link'
import { signUp } from '../actions'

export default function SignupPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const showPasswordRef = useRef(false)
  const showConfirmPasswordRef = useRef(false)
  const [, forceUpdate] = useState({}) // For rerendering on ref change
  const [actionResult, setActionResult] = useState<{
    success: boolean
    message: string
    errors?: Record<string, string[]>
  } | null>(null)

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      houseNumber: '',
      email: '',
      phone: '',
      houseOwnership: undefined,
      password: '',
      confirmPassword: '',
    },
  })

  function onSubmit(values: z.infer<typeof signUpSchema>) {
    startTransition(async () => {
      try {
        const result = await signUp(values)
        setActionResult(result)

        if (result.success) {
          // Redirect on successful sign up
          router.push('/dashboard')
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
        <CardTitle className="text-3xl font-bold">Create Account</CardTitle>
        <CardDescription className="mt-2">
          Sign up for a new account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {actionResult && !actionResult.success && (
          <div className="text-destructive bg-destructive/10 border-destructive/20 mb-4 rounded-md border p-3 text-sm">
            {actionResult.message}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-muted-foreground border-b pb-2 text-sm font-medium">
                Personal Information
              </h3>

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="houseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>House Number</FormLabel>
                      <FormControl>
                        <Input placeholder="A-10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          maxLength={10}
                          placeholder="10-digit number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="houseOwnership"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>House Ownership</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ownership type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="renter">Renter</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Account Information Section */}
            <div className="space-y-4">
              <h3 className="text-muted-foreground border-b pb-2 text-sm font-medium">
                Account Information
              </h3>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPasswordRef.current ? 'text' : 'password'}
                            placeholder="Create a strong password"
                            {...field}
                            className="pr-12"
                          />
                          <Button
                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                            variant="outline"
                            type="button"
                            onClick={() => {
                              showPasswordRef.current = !showPasswordRef.current
                              forceUpdate({})
                            }}
                          >
                            {showPasswordRef.current ? (
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
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={
                              showConfirmPasswordRef.current
                                ? 'text'
                                : 'password'
                            }
                            placeholder="Confirm your password"
                            {...field}
                            className="pr-12"
                          />
                          <Button
                            className="absolute inset-y-0 right-0 flex items-center pr-3"
                            variant="outline"
                            type="button"
                            onClick={() => {
                              showConfirmPasswordRef.current =
                                !showConfirmPasswordRef.current
                              forceUpdate({})
                            }}
                          >
                            {showConfirmPasswordRef.current ? (
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
              </div>
            </div>

            <Button type="submit" className="mt-8 w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  <span>Create Account</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </Button>
          </form>
        </Form>
        <div className="mt-6 text-center">
          <p className="text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
