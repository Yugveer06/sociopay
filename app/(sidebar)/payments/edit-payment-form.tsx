'use client'

import * as React from 'react'
import { useState, useTransition, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { editPaymentSchema, EditPaymentData } from '@/lib/zod'
import { editPayment } from './actions'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Edit, Loader2, Calendar as CalendarIcon } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { PaymentDurationSelector } from '@/components/ui/payment-duration-selector'
import { Payment } from './columns'

interface EditPaymentFormProps {
  payment: Payment
  users: Array<{ id: string; name: string; houseNumber: string }>
  categories: Array<{ id: number; name: string }>
  trigger?: React.ReactNode
}

export function EditPaymentForm({
  payment,
  users,
  categories,
  trigger,
}: EditPaymentFormProps) {
  const [open, setOpen] = useState(false)
  const [userPopoverOpen, setUserPopoverOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Convert payment data to form data
  const getFormDefaultValues = (): EditPaymentData => {
    return {
      id: payment.id,
      userId: payment.user_id,
      categoryId:
        categories
          .find(cat => cat.name === payment.category_name)
          ?.id.toString() || '1',
      amount: payment.amount.toString(),
      paymentDate: payment.payment_date
        ? format(new Date(payment.payment_date), 'yyyy-MM-dd')
        : '',
      paymentType: payment.payment_type || 'upi',
      periodStart: payment.period_start || '',
      periodEnd: payment.period_end || '',
      intervalType: payment.interval_type || undefined,
      notes: payment.notes || '',
      paymentDuration:
        payment.period_start && payment.period_end
          ? {
              from: new Date(payment.period_start),
              to: new Date(payment.period_end),
            }
          : undefined,
    }
  }

  const form = useForm<EditPaymentData>({
    resolver: zodResolver(editPaymentSchema),
    defaultValues: getFormDefaultValues(),
  })

  // Watch fields for dynamic behavior
  const selectedCategoryId = form.watch('categoryId')
  const intervalType = form.watch('intervalType')

  // Check if selected category is maintenance (assuming categoryId 1 is maintenance)
  const isMaintenanceCategory = selectedCategoryId === '1'

  // Helper function to get the last day of a given month
  const getLastDayOfMonth = useCallback((year: number, month: number) => {
    return new Date(year, month + 1, 0)
  }, [])

  // Generate payment period range based on interval type
  const generateIntervalRange = useCallback(
    (fromDate: Date, intervalType: string) => {
      const from = fromDate
      let monthsToAdd: number

      switch (intervalType) {
        case 'monthly':
          monthsToAdd = 1
          break
        case 'quarterly':
          monthsToAdd = 3
          break
        case 'half_yearly':
          monthsToAdd = 6
          break
        case 'annually':
          monthsToAdd = 12
          break
        default:
          monthsToAdd = 3
      }

      const to = getLastDayOfMonth(
        fromDate.getFullYear(),
        fromDate.getMonth() + monthsToAdd - 1
      )

      return { from, to }
    },
    [getLastDayOfMonth]
  )

  // Update payment duration when interval type changes
  React.useEffect(() => {
    const currentDuration = form.getValues('paymentDuration')

    // Only update if we have a current duration with a 'from' date and we're in maintenance category
    if (isMaintenanceCategory && intervalType && currentDuration?.from) {
      const newDuration = generateIntervalRange(
        currentDuration.from,
        intervalType
      )
      form.setValue('paymentDuration', newDuration)
    }
  }, [intervalType, isMaintenanceCategory, form, generateIntervalRange])

  const onSubmit = (data: EditPaymentData) => {
    startTransition(async () => {
      // Transform paymentDuration to periodStart/periodEnd for server compatibility
      // Only include these fields for maintenance payments
      const cleanData = {
        ...data,
        periodStart:
          isMaintenanceCategory && data.paymentDuration?.from
            ? format(data.paymentDuration.from, 'yyyy-MM-dd')
            : '',
        periodEnd:
          isMaintenanceCategory && data.paymentDuration?.to
            ? format(data.paymentDuration.to, 'yyyy-MM-dd')
            : '',
        intervalType: isMaintenanceCategory ? data.intervalType : undefined,
        notes: data.notes || undefined,
      }

      console.log('Edit form data being submitted:', cleanData)

      const result = await editPayment(cleanData)

      if (result.success) {
        toast.success(result.message)
        setOpen(false)
      } else {
        console.error('Edit validation error:', result)
        toast.error(result.message)
        // Display validation errors if they exist
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, errors]) => {
            form.setError(field as keyof EditPaymentData, {
              message: errors[0],
            })
          })
        }
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Edit className="h-4 w-4" />
            <span className="sr-only">Edit payment</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Payment</DialogTitle>
          <DialogDescription>
            Make changes to the payment details. Click save when you&apos;re
            done.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User</FormLabel>
                  <Popover
                    open={userPopoverOpen}
                    onOpenChange={setUserPopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            'justify-between',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            <div className="flex w-full min-w-0 items-center gap-2">
                              <span className="text-muted-foreground shrink-0">
                                (
                                {
                                  users.find(user => user.id === field.value)
                                    ?.houseNumber
                                }
                                )
                              </span>
                              <span className="truncate">
                                {
                                  users.find(user => user.id === field.value)
                                    ?.name
                                }
                              </span>
                            </div>
                          ) : (
                            'Select a user'
                          )}
                          <ChevronsUpDown className="opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search user..."
                          className="h-9"
                        />
                        <CommandList>
                          <CommandEmpty>No user found.</CommandEmpty>
                          <CommandGroup>
                            {users.map(user => (
                              <CommandItem
                                value={`${user.name} ${user.houseNumber}`}
                                key={user.id}
                                onSelect={() => {
                                  form.setValue('userId', user.id)
                                  setUserPopoverOpen(false)
                                }}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-muted-foreground">
                                    ({user.houseNumber})
                                  </span>
                                  <span>{user.name}</span>
                                </div>
                                <Check
                                  className={cn(
                                    'ml-auto h-4 w-4',
                                    user.id === field.value
                                      ? 'opacity-100'
                                      : 'opacity-0'
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Enter amount"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={date =>
                          field.onChange(date ? format(date, 'yyyy-MM-dd') : '')
                        }
                        disabled={date =>
                          date > new Date() || date < new Date('1900-01-01')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isMaintenanceCategory && (
              <>
                <FormField
                  control={form.control}
                  name="intervalType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Interval</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select interval" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="half_yearly">
                            Half Yearly
                          </SelectItem>
                          <SelectItem value="annually">Annually</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Period</FormLabel>
                      <FormControl>
                        <PaymentDurationSelector
                          value={field.value}
                          onSelect={field.onChange}
                          intervalType={intervalType}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Add any additional notes..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
