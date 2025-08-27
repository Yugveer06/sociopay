'use client'

import { Table } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Filter, Banknote, CreditCard, Smartphone } from 'lucide-react'

interface PaymentTypeFilterProps<TData> {
  table: Table<TData>
}

export function PaymentTypeFilter<TData>({
  table,
}: PaymentTypeFilterProps<TData>) {
  const column = table.getColumn('payment_type')
  const selectedValues = new Set(column?.getFilterValue() as string[])

  const paymentTypes = [
    {
      value: 'cash',
      label: 'Cash',
      icon: Banknote,
      color: 'bg-green-100 text-green-800',
    },
    {
      value: 'cheque',
      label: 'Cheque',
      icon: CreditCard,
      color: 'bg-blue-100 text-blue-800',
    },
    {
      value: 'upi',
      label: 'UPI',
      icon: Smartphone,
      color: 'bg-purple-100 text-purple-800',
    },
  ]

  // Get count for each payment type
  const getTypeCount = (type: string) => {
    return table
      .getPreFilteredRowModel()
      .rows.filter(row => row.getValue('payment_type') === type).length
  }

  const hasActiveFilters = selectedValues.size > 0

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <Filter className="mr-2 h-4 w-4" />
          Payment Type
          {hasActiveFilters && (
            <div className="ml-2 flex items-center gap-1">
              <div className="bg-border h-4 w-px" />
              <Badge variant="secondary" className="h-5 px-1 text-xs">
                {selectedValues.size}
              </Badge>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        {paymentTypes.map(type => {
          const Icon = type.icon
          const count = getTypeCount(type.value)

          return (
            <DropdownMenuCheckboxItem
              key={type.value}
              className="capitalize"
              checked={selectedValues.has(type.value)}
              onCheckedChange={value => {
                if (value) {
                  selectedValues.add(type.value)
                } else {
                  selectedValues.delete(type.value)
                }
                const filterValues = selectedValues.size
                  ? Array.from(selectedValues)
                  : undefined
                column?.setFilterValue(filterValues)
              }}
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{type.label}</span>
                </div>
                <Badge variant="outline" className={`ml-2 ${type.color}`}>
                  {count}
                </Badge>
              </div>
            </DropdownMenuCheckboxItem>
          )
        })}
        {hasActiveFilters && (
          <>
            <div className="my-1 border-t" />
            <DropdownMenuCheckboxItem
              checked={false}
              onCheckedChange={() => {
                selectedValues.clear()
                column?.setFilterValue(undefined)
              }}
              className="justify-center text-center"
            >
              Clear filters
            </DropdownMenuCheckboxItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
