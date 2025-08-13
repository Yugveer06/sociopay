'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { addExpenseSchema, AddExpenseData } from '@/lib/schemas'
import { addExpense } from './actions'
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
import { IconPlus, IconLoader2, IconCalendar } from '@tabler/icons-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface AddExpenseFormProps {
  categories: Array<{ id: number; name: string }>
}

export function AddExpenseForm({ categories }: AddExpenseFormProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<AddExpenseData>({
    resolver: zodResolver(addExpenseSchema),
    defaultValues: {
      categoryId: '',
      amount: '',
      expenseDate: new Date().toISOString().split('T')[0],
      notes: '',
    },
  })

  const onSubmit = (data: AddExpenseData) => {
    startTransition(async () => {
      // Clean up empty strings for optional fields
      const cleanData = {
        ...data,
        notes: data.notes || undefined,
      }

      console.log('Form data being submitted:', cleanData)

      const result = await addExpense(cleanData)

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
            form.setError(field as keyof AddExpenseData, {
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
          <IconPlus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto max-w-lg min-w-96 p-6" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">Add New Expense</h4>
            <p className="text-muted-foreground text-sm">
              Fill in the details to add a new society expense.
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expenseDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expense Date</FormLabel>
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
                              <IconCalendar className="ml-auto h-4 w-4 opacity-50" />
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
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Add Expense
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </PopoverContent>
    </Popover>
  )
}
