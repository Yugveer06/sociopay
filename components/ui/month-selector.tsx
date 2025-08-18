'use client'

import * as React from 'react'
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

interface PresetConfig {
  name: string
  value: number // Number of months
  label?: string // Optional display label, defaults to name
}

interface MonthSelectorSingleProps {
  mode?: 'single'
  selected?: Date
  onSelect?: (date: Date | undefined) => void
}

interface MonthSelectorRangeProps {
  mode: 'range'
  selected?: { from?: Date; to?: Date }
  onSelect?: (range: { from?: Date; to?: Date } | undefined) => void
}

interface MonthSelectorBaseProps {
  className?: string
  classNames?: Partial<{
    root: string
    nav: string
    button_previous: string
    button_next: string
    year_caption: string
    year_selector: string
    months_grid: string
    month_button: string
  }>
  startYear?: number
  endYear?: number
  disabled?: boolean
  buttonVariant?: React.ComponentProps<typeof Button>['variant']

  // Year selector props
  showYearSelector?: boolean
  onYearChange?: (year: number) => void

  // Preset functionality
  enablePresets?: boolean
  presets?: PresetConfig[]
  defaultPreset?: string // Name of the default preset, 'custom' for manual selection
  onPresetChange?: (presetName: string) => void

  formatters?: {
    formatMonth?: (date: Date) => string
    formatYear?: (year: number) => string
  }
  components?: {
    Chevron?: React.ComponentType<{
      className?: string
      orientation: 'left' | 'right' | 'down'
    }>
    MonthButton?: React.ComponentType<{
      date: Date
      selected: boolean
      isCurrentMonth: boolean
      isRangeStart?: boolean
      isRangeEnd?: boolean
      isRangeMiddle?: boolean
      disabled?: boolean
      onClick: () => void
      className?: string
      children: React.ReactNode
    }>
    YearSelector?: React.ComponentType<{
      year: number
      startYear: number
      endYear: number
      onYearChange: (year: number) => void
      className?: string
    }>
  }
}

type MonthSelectorProps = MonthSelectorBaseProps &
  (MonthSelectorSingleProps | MonthSelectorRangeProps)

function MonthSelector({
  className,
  classNames,
  startYear = 1970,
  endYear = 2100,
  disabled = false,
  buttonVariant = 'ghost',
  showYearSelector = false,
  onYearChange,
  enablePresets = false,
  presets = [],
  defaultPreset = 'custom',
  onPresetChange,
  formatters,
  components,
  ...props
}: MonthSelectorProps) {
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()

  const [displayYear, setDisplayYear] = React.useState(
    props.mode === 'range'
      ? (props.selected?.from?.getFullYear() ?? currentYear)
      : (props.selected?.getFullYear() ?? currentYear)
  )

  // Internal preset state
  const [activePreset, setActivePreset] = React.useState(defaultPreset)

  const isRangeMode = props.mode === 'range'

  // Helper function to get last day of month
  const getLastDayOfMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0)
  }

  // Generate range based on preset
  const generatePresetRange = (clickedDate: Date, presetName: string) => {
    if (presetName === 'custom') return null

    const preset = presets.find(p => p.name === presetName)
    if (!preset) return null

    const from = new Date(clickedDate.getFullYear(), clickedDate.getMonth(), 1)
    const to = getLastDayOfMonth(
      clickedDate.getFullYear(),
      clickedDate.getMonth() + preset.value - 1
    )

    return { from, to }
  }

  // Create date for first day of month
  const createMonthDate = (year: number, month: number) => {
    return new Date(year, month, 1)
  }

  // Check if date is selected
  const isSelected = (date: Date) => {
    if (isRangeMode) {
      const range = (props as MonthSelectorRangeProps).selected
      if (!range?.from) return false

      const dateTime = date.getTime()
      const fromTime = range.from.getTime()

      if (!range.to) {
        return dateTime === fromTime
      }

      const toTime = range.to.getTime()
      return dateTime >= fromTime && dateTime <= toTime
    } else {
      const selected = (props as MonthSelectorSingleProps).selected
      if (!selected) return false
      return (
        date.getFullYear() === selected.getFullYear() &&
        date.getMonth() === selected.getMonth()
      )
    }
  }

  // Check if date is current month
  const isCurrentMonth = (date: Date) => {
    return (
      date.getFullYear() === currentYear && date.getMonth() === currentMonth
    )
  }

  // Range selection helpers
  const isRangeStart = (date: Date) => {
    if (!isRangeMode) return false
    const range = (props as MonthSelectorRangeProps).selected
    return range?.from?.getTime() === date.getTime()
  }

  const isRangeEnd = (date: Date) => {
    if (!isRangeMode) return false
    const range = (props as MonthSelectorRangeProps).selected
    if (!range?.to) return false

    // Compare by year and month since 'to' is set to last day of month
    return (
      range.to.getFullYear() === date.getFullYear() &&
      range.to.getMonth() === date.getMonth()
    )
  }

  const isRangeMiddle = (date: Date) => {
    if (!isRangeMode) return false
    const range = (props as MonthSelectorRangeProps).selected
    if (!range?.from || !range?.to) return false

    const dateYear = date.getFullYear()
    const dateMonth = date.getMonth()
    const fromYear = range.from.getFullYear()
    const fromMonth = range.from.getMonth()
    const toYear = range.to.getFullYear()
    const toMonth = range.to.getMonth()

    // Create comparable date values (year * 12 + month)
    const dateValue = dateYear * 12 + dateMonth
    const fromValue = fromYear * 12 + fromMonth
    const toValue = toYear * 12 + toMonth

    return dateValue > fromValue && dateValue < toValue
  }

  // Handle month selection
  const handleMonthSelect = (date: Date) => {
    if (disabled) return

    // Handle preset-based selection
    if (enablePresets && activePreset !== 'custom') {
      const presetRange = generatePresetRange(date, activePreset)
      if (presetRange && isRangeMode) {
        const rangeProps = props as MonthSelectorRangeProps
        rangeProps.onSelect?.(presetRange)
        return
      }
    }

    // Default behavior for custom selection or single mode
    if (isRangeMode) {
      const rangeProps = props as MonthSelectorRangeProps
      const currentRange = rangeProps.selected

      if (!currentRange?.from || (currentRange.from && currentRange.to)) {
        // Start new range
        rangeProps.onSelect?.({ from: date, to: undefined })
      } else {
        // Complete range - use last day of month for 'to' date
        const from = currentRange.from
        const to = date

        if (to.getTime() < from.getTime()) {
          const toLastDay = getLastDayOfMonth(to.getFullYear(), to.getMonth())
          rangeProps.onSelect?.({ from: to, to: toLastDay })
        } else {
          const toLastDay = getLastDayOfMonth(to.getFullYear(), to.getMonth())
          rangeProps.onSelect?.({ from, to: toLastDay })
        }
      }
    } else {
      const singleProps = props as MonthSelectorSingleProps
      const isCurrentlySelected = isSelected(date)
      singleProps.onSelect?.(isCurrentlySelected ? undefined : date)
    }
  }

  // Handle preset change
  const handlePresetChange = (presetName: string) => {
    setActivePreset(presetName)
    onPresetChange?.(presetName)

    // If switching to a preset and we have a current selection, apply the preset
    if (presetName !== 'custom' && isRangeMode) {
      const rangeProps = props as MonthSelectorRangeProps
      const currentRange = rangeProps.selected

      if (currentRange?.from) {
        const presetRange = generatePresetRange(currentRange.from, presetName)
        if (presetRange) {
          rangeProps.onSelect?.(presetRange)
        }
      }
    }
  }

  // Navigation handlers
  const handlePreviousYear = () => {
    if (displayYear > startYear) {
      const newYear = displayYear - 1
      setDisplayYear(newYear)
      onYearChange?.(newYear)
    }
  }

  const handleNextYear = () => {
    if (displayYear < endYear) {
      const newYear = displayYear + 1
      setDisplayYear(newYear)
      onYearChange?.(newYear)
    }
  }

  const handleYearSelect = (year: number) => {
    setDisplayYear(year)
    onYearChange?.(year)
  }

  // Default components
  const ChevronComponent = components?.Chevron ?? DefaultChevron
  const MonthButtonComponent = components?.MonthButton ?? DefaultMonthButton
  const YearSelectorComponent = components?.YearSelector ?? DefaultYearSelector

  return (
    <div
      data-slot="month-selector"
      className={cn('w-fit p-3', classNames?.root, className)}
    >
      {/* Year Selector */}
      {showYearSelector && (
        <div className={cn('mb-4', classNames?.year_selector)}>
          <YearSelectorComponent
            year={displayYear}
            startYear={startYear}
            endYear={endYear}
            onYearChange={handleYearSelect}
          />
        </div>
      )}

      {/* Year Navigation */}
      {!showYearSelector && (
        <div
          className={cn(
            'mb-4 flex items-center justify-between',
            classNames?.nav
          )}
        >
          <Button
            variant={buttonVariant}
            size="icon"
            className={cn(
              'h-7 w-7 p-0 select-none',
              classNames?.button_previous
            )}
            onClick={handlePreviousYear}
            disabled={disabled || displayYear <= startYear}
          >
            <ChevronComponent orientation="left" className="h-4 w-4" />
            <span className="sr-only">Previous year</span>
          </Button>

          <div
            className={cn(
              'text-sm font-semibold select-none',
              classNames?.year_caption
            )}
          >
            {formatters?.formatYear?.(displayYear) ?? displayYear}
          </div>

          <Button
            variant={buttonVariant}
            size="icon"
            className={cn('h-7 w-7 p-0 select-none', classNames?.button_next)}
            onClick={handleNextYear}
            disabled={disabled || displayYear >= endYear}
          >
            <ChevronComponent orientation="right" className="h-4 w-4" />
            <span className="sr-only">Next year</span>
          </Button>
        </div>
      )}

      {/* Months Grid */}
      <div className={cn('grid grid-cols-3 gap-2', classNames?.months_grid)}>
        {MONTHS.map((monthName, monthIndex) => {
          const date = createMonthDate(displayYear, monthIndex)
          const selected = isSelected(date)
          const current = isCurrentMonth(date)
          const rangeStart = isRangeStart(date)
          const rangeEnd = isRangeEnd(date)
          const rangeMiddle = isRangeMiddle(date)

          return (
            <MonthButtonComponent
              key={monthIndex}
              date={date}
              selected={selected}
              isCurrentMonth={current}
              isRangeStart={rangeStart}
              isRangeEnd={rangeEnd}
              isRangeMiddle={rangeMiddle}
              disabled={disabled}
              onClick={() => handleMonthSelect(date)}
              className={classNames?.month_button}
            >
              {formatters?.formatMonth?.(date) ?? monthName.slice(0, 3)}
            </MonthButtonComponent>
          )
        })}
      </div>

      {/* Presets */}
      {enablePresets && presets.length > 0 && isRangeMode && (
        <div className="mt-4 border-t pt-4">
          <div className="text-muted-foreground mb-2 text-xs font-medium">
            Presets
          </div>
          <div className="grid grid-cols-2 gap-2">
            {presets.map(preset => (
              <Button
                key={preset.name}
                variant={activePreset === preset.name ? 'default' : 'outline'}
                size="sm"
                className="h-8 text-xs"
                onClick={() => handlePresetChange(preset.name)}
                disabled={disabled}
              >
                {preset.label || preset.name}
              </Button>
            ))}
            <Button
              variant={activePreset === 'custom' ? 'default' : 'outline'}
              size="sm"
              className="h-8 text-xs"
              onClick={() => handlePresetChange('custom')}
              disabled={disabled}
            >
              Custom
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Default Chevron Component
function DefaultChevron({
  className,
  orientation,
  ...props
}: {
  className?: string
  orientation: 'left' | 'right' | 'down'
}) {
  if (orientation === 'left') {
    return <ChevronLeftIcon className={cn('size-4', className)} {...props} />
  }

  if (orientation === 'right') {
    return <ChevronRightIcon className={cn('size-4', className)} {...props} />
  }

  return <ChevronDownIcon className={cn('size-4', className)} {...props} />
}

// Default Month Button Component
function DefaultMonthButton({
  date,
  selected,
  isCurrentMonth,
  isRangeStart,
  isRangeEnd,
  isRangeMiddle,
  disabled,
  onClick,
  className,
  children,
}: {
  date: Date
  selected: boolean
  isCurrentMonth: boolean
  isRangeStart?: boolean
  isRangeEnd?: boolean
  isRangeMiddle?: boolean
  disabled?: boolean
  onClick: () => void
  className?: string
  children: React.ReactNode
}) {
  console.log('date', date)
  console.log('selected', selected)
  console.log('isCurrentMonth', isCurrentMonth)
  console.log('isRangeStart', isRangeStart)
  console.log('isRangeEnd', isRangeEnd)
  console.log('isRangeMiddle', isRangeMiddle)
  return (
    <Button
      variant="ghost"
      size="sm"
      data-month={date.toISOString()}
      data-selected-single={
        selected && !isRangeStart && !isRangeEnd && !isRangeMiddle
      }
      data-range-start={isRangeStart}
      data-range-end={isRangeEnd}
      data-range-middle={isRangeMiddle}
      className={cn(
        'h-9 w-full text-xs font-normal select-none',
        // Base styling for all buttons
        'hover:bg-accent hover:text-accent-foreground',
        // Current month styling (when not selected)
        isCurrentMonth &&
          !selected &&
          !isRangeStart &&
          !isRangeEnd &&
          !isRangeMiddle &&
          'bg-accent/50 text-accent-foreground',
        // Single selection styling
        selected &&
          !isRangeStart &&
          !isRangeEnd &&
          !isRangeMiddle &&
          'bg-primary text-primary-foreground rounded-md',
        // Range start styling
        isRangeStart &&
          !isRangeEnd &&
          'bg-primary text-primary-foreground rounded-l-md rounded-r-none',
        // Range end styling
        isRangeEnd &&
          !isRangeStart &&
          'bg-primary text-primary-foreground rounded-l-none rounded-r-md',
        // Range middle styling
        isRangeMiddle && 'bg-accent text-accent-foreground rounded-none',
        // Single month range (both start and end)
        isRangeStart &&
          isRangeEnd &&
          'bg-primary text-primary-foreground rounded-md',
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  )
}

// Default Year Selector Component
function DefaultYearSelector({
  year,
  startYear,
  endYear,
  onYearChange,
  className,
}: {
  year: number
  startYear: number
  endYear: number
  onYearChange: (year: number) => void
  className?: string
}) {
  const years = React.useMemo(() => {
    const yearList = []
    for (let y = startYear; y <= endYear; y++) {
      yearList.push(y)
    }
    return yearList
  }, [startYear, endYear])

  return (
    <select
      value={year}
      onChange={e => onYearChange(Number(e.target.value))}
      className={cn(
        'border-input bg-background w-full rounded-md border px-3 py-2 text-sm',
        'focus:ring-ring focus:border-transparent focus:ring-2 focus:outline-none',
        className
      )}
    >
      {years.map(y => (
        <option key={y} value={y}>
          {y}
        </option>
      ))}
    </select>
  )
}

export { MonthSelector, type MonthSelectorProps, type PresetConfig }
