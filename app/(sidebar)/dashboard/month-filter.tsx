'use client'

import { useState, useTransition, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { MonthSelector } from '@/components/ui/month-selector'
import { Calendar, X, Loader2 } from 'lucide-react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export function DashboardMonthFilter() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isClient, setIsClient] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Ensure component only renders after hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Get current month and year from URL params
  const currentMonth = isClient ? searchParams.get('month') : null
  const currentYear = isClient ? searchParams.get('year') : null

  // Create selected date from URL params or default to current month
  const selectedMonth =
    currentMonth && currentYear
      ? new Date(parseInt(currentYear), parseInt(currentMonth) - 1, 1)
      : undefined

  const handleMonthSelect = (date: Date | undefined) => {
    const params = new URLSearchParams(searchParams)

    if (!date) {
      // Clear the filter
      params.delete('month')
      params.delete('year')
    } else {
      // Set month and year params (month is 1-indexed for URL)
      params.set('month', (date.getMonth() + 1).toString())
      params.set('year', date.getFullYear().toString())
    }

    // Use startTransition to show loading state during navigation
    startTransition(() => {
      router.push(pathname + '?' + params.toString())
    })
    setOpen(false)
  }

  const clearFilter = () => {
    const params = new URLSearchParams(searchParams)
    params.delete('month')
    params.delete('year')

    // Use startTransition to show loading state during navigation
    startTransition(() => {
      router.push(pathname + '?' + params.toString())
    })
    setOpen(false)
  }

  const hasActiveFilter = isClient && !!selectedMonth

  // Don't render until client-side hydration is complete
  if (!isClient) {
    return (
      <Button variant="outline" size="sm" className="h-8" disabled>
        <Calendar className="mr-2 h-4 w-4" />
        Month Filter
      </Button>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Calendar className="mr-2 h-4 w-4" />
          )}
          {isPending ? 'Loading...' : 'Month Filter'}
          {hasActiveFilter && !isPending && selectedMonth && (
            <div className="ml-2 flex items-center gap-1">
              <div className="bg-border h-4 w-px" />
              <Badge variant="secondary" className="h-5 px-1 text-xs">
                {selectedMonth.toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </Badge>
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-medium">Filter by Month</h4>
            {hasActiveFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilter}
                className="h-6 w-6 p-0"
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <X className="h-3 w-3" />
                )}
              </Button>
            )}
          </div>

          <MonthSelector
            mode="single"
            selected={selectedMonth}
            onSelect={handleMonthSelect}
            showYearSelector={true}
            startYear={2020}
            endYear={2030}
            className="rounded-md border"
            disabled={isPending}
          />

          {hasActiveFilter && (
            <div className="mt-3 text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilter}
                className="h-7 text-xs"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  'Clear Filter'
                )}
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
