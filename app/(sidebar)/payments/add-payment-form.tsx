'use client'

import React, { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { addPaymentSchema, AddPaymentData } from '@/lib/zod'
import { addPayment } from './actions'
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
import { Plus, Loader2, Calendar as CalendarIcon } from 'lucide-react'
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

interface AddPaymentFormProps {
  users: Array<{ id: string; name: string; houseNumber: string }>
  categories: Array<{ id: number; name: string }>
}

export function AddPaymentForm({ users, categories }: AddPaymentFormProps) {
  const [open, setOpen] = useState(false)
  const [userPopoverOpen, setUserPopoverOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<AddPaymentData>({
    resolver: zodResolver(addPaymentSchema),
    defaultValues: {
      userId: '',
      categoryId: '',
      amount: '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentDuration: undefined,
      intervalType: 'quarterly',
      notes: '',
    },
  })

  // Watch for category changes to show/hide maintenance-specific fields
  const selectedCategoryId = form.watch('categoryId')
  const intervalType = form.watch('intervalType')
  const isMaintenanceCategory = selectedCategoryId === '1'

  // Clear maintenance-specific fields when category changes away from maintenance
  React.useEffect(() => {
    if (!isMaintenanceCategory) {
      form.setValue('paymentDuration', undefined)
      form.setValue('intervalType', undefined)
    } else {
      // Set default interval type when switching to maintenance
      if (!intervalType) {
        form.setValue('intervalType', 'quarterly')
      }
    }
  }, [isMaintenanceCategory, form, intervalType])

  // Helper function to get last day of month
  const getLastDayOfMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0)
  }

  // Generate range based on interval type
  const generateIntervalRange = (fromDate: Date, intervalType: string) => {
    const from = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1)
    let monthsToAdd = 0

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
  }

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
  }, [intervalType, isMaintenanceCategory, form])

  const onSubmit = (data: AddPaymentData) => {
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

      console.log('Form data being submitted:', cleanData)

      const result = await addPayment(cleanData)

      if (result.success) {
        toast.success(result.message)
        form.reset()
        setOpen(false)
      } else {
        console.error('Validation error:', result)
        toast.error(result.message)
        // Display validation errors if they exist
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, errors]) => {
            form.setError(field as keyof AddPaymentData, {
              message: errors[0],
            })
          })
        }
      }
    })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Payment
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto max-w-lg min-w-96 p-6" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">Add New Payment</h4>
            <p className="text-muted-foreground text-sm">
              Fill in the details to add a new maintenance payment.
            </p>
          </div>

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
                                  value={`${user.houseNumber} ${user.name}`}
                                  key={user.id}
                                  onSelect={() => {
                                    form.setValue('userId', user.id)
                                    setUserPopoverOpen(false)
                                  }}
                                >
                                  <span className="text-muted-foreground shrink-0">
                                    ({user.houseNumber})
                                  </span>
                                  <span className="truncate">{user.name}</span>
                                  <Check
                                    className={cn(
                                      'ml-auto',
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
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder="Select a category"
                            className="truncate"
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-w-none">
                        {categories.map(category => (
                          <SelectItem
                            key={category.id}
                            value={category.id.toString()}
                            className="max-w-none"
                          >
                            <span className="truncate">{category.name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="0"
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
                            captionLayout="dropdown"
                            startMonth={new Date(2000, 0)}
                            endMonth={
                              new Date(new Date().getFullYear() + 10, 11)
                            }
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={date =>
                              field.onChange(
                                date ? format(date, 'yyyy-MM-dd') : ''
                              )
                            }
                            disabled={date =>
                              date >
                                new Date(
                                  new Date().getFullYear() + 10,
                                  11,
                                  31
                                ) || date < new Date('1900-01-01')
                            }
                            autoFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {isMaintenanceCategory && (
                <FormField
                  control={form.control}
                  name="intervalType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interval Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder="Select interval"
                              className="truncate"
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-w-none">
                          <SelectItem value="monthly" className="max-w-none">
                            Monthly
                          </SelectItem>
                          <SelectItem value="quarterly" className="max-w-none">
                            Quarterly
                          </SelectItem>
                          <SelectItem
                            value="half_yearly"
                            className="max-w-none"
                          >
                            Half Yearly
                          </SelectItem>
                          <SelectItem value="annually" className="max-w-none">
                            Annually
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {isMaintenanceCategory && (
                <FormField
                  control={form.control}
                  name="paymentDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Duration</FormLabel>
                      <FormControl>
                        <PaymentDurationSelector
                          value={field.value}
                          onSelect={field.onChange}
                          intervalType={intervalType}
                          placeholder="Select payment period"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Additional notes..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add Payment
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </PopoverContent>
    </Popover>
  )
}
