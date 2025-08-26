'use client'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Check, ChevronsUpDown, X, Home } from 'lucide-react'
import { Table } from '@tanstack/react-table'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface HouseNumberFilterProps<TData> {
  table: Table<TData>
}

export function HouseNumberFilter<TData>({
  table,
}: HouseNumberFilterProps<TData>) {
  const [open, setOpen] = useState(false)

  // Get unique house numbers from the data
  const allHouseNumbers = Array.from(
    new Set(
      table
        .getCoreRowModel()
        .rows.map(row => row.getValue('house_number') as string)
        .filter(Boolean)
    )
  ).sort((a, b) => {
    // Custom sort to handle house number format (e.g., A-1, A-10, B-1)
    const [letterA, numberA] = a.split('-')
    const [letterB, numberB] = b.split('-')

    if (letterA !== letterB) {
      return letterA.localeCompare(letterB)
    }

    return parseInt(numberA || '0') - parseInt(numberB || '0')
  })

  // Get currently selected house numbers
  const selectedHouseNumbers =
    (table.getColumn('house_number')?.getFilterValue() as string[]) || []

  const handleSelect = (houseNumber: string) => {
    const currentFilter = selectedHouseNumbers
    let newFilter: string[]

    if (currentFilter.includes(houseNumber)) {
      // Remove the house number if it's already selected
      newFilter = currentFilter.filter(hn => hn !== houseNumber)
    } else {
      // Add the house number to the selection
      newFilter = [...currentFilter, houseNumber]
    }

    // Set the filter value
    table
      .getColumn('house_number')
      ?.setFilterValue(newFilter.length ? newFilter : undefined)
  }

  const clearFilter = () => {
    table.getColumn('house_number')?.setFilterValue(undefined)
  }

  const isSelected = (houseNumber: string) =>
    selectedHouseNumbers.includes(houseNumber)

  return (
    <div className="flex items-center space-x-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 border-dashed">
            <Home className="mr-2 h-4 w-4" />
            House Number
            {selectedHouseNumbers.length > 0 && (
              <>
                <div className="border-border ml-2 border-l pl-2">
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedHouseNumbers.length}
                  </Badge>
                </div>
              </>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search house numbers..." />
            <CommandList>
              <CommandEmpty>No house numbers found.</CommandEmpty>
              <CommandGroup>
                {allHouseNumbers.map(houseNumber => (
                  <CommandItem
                    key={houseNumber}
                    onSelect={() => handleSelect(houseNumber)}
                  >
                    <div
                      className={cn(
                        'border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                        isSelected(houseNumber)
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible'
                      )}
                    >
                      <Check className="h-4 w-4" />
                    </div>
                    <Badge variant="outline" className="font-mono">
                      {houseNumber}
                    </Badge>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedHouseNumbers.length > 0 && (
        <Button
          variant="ghost"
          onClick={clearFilter}
          className="h-8 px-2 lg:px-3"
        >
          Reset
          <X className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
