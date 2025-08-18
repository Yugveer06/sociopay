'use client'

import { useState, useTransition } from 'react'
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
      periodStart: '',
      periodEnd: '',
      intervalType: 'quarterly',
      notes: '',
    },
  })

  const onSubmit = (data: AddPaymentData) => {
    startTransition(async () => {
      // Clean up empty strings for optional fields
      const cleanData = {
        ...data,
        periodStart: data.periodStart || undefined,
        periodEnd: data.periodEnd || undefined,
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
                        <SelectItem value="half_yearly" className="max-w-none">
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

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="periodStart"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Period Start</FormLabel>
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
                              date < new Date('1900-01-01') ||
                              date > new Date('2100-12-31')
                            }
                            autoFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="periodEnd"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Period End</FormLabel>
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
                            disabled={date => {
                              const periodStart = form.getValues('periodStart')
                              const minDate = periodStart
                                ? new Date(periodStart)
                                : new Date('1900-01-01')
                              const maxDate = new Date('2100-12-31')
                              return date < minDate || date > maxDate
                            }}
                            autoFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
