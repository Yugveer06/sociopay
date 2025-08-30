'use client'

import { useSearchParams } from 'next/navigation'
import { LoadingOverlay } from '@/components/ui/loading-overlay'
import { useTransition, useEffect, useState } from 'react'

interface DashboardWrapperProps {
  children: React.ReactNode
}

export function DashboardWrapper({ children }: DashboardWrapperProps) {
  const [isPending] = useTransition()
  const [isFilterLoading, setIsFilterLoading] = useState(false)
  const searchParams = useSearchParams()

  // Listen for search param changes to show loading state
  useEffect(() => {
    setIsFilterLoading(true)
    const timer = setTimeout(() => {
      setIsFilterLoading(false)
    }, 100) // Small delay to prevent flash for instant loads

    return () => clearTimeout(timer)
  }, [searchParams])

  // Show loading state when transitioning or when filter is being applied
  const showLoading = isPending || isFilterLoading

  return (
    <div className="relative">
      <LoadingOverlay isLoading={showLoading} message="Applying filter..." />
      <div className={showLoading ? 'pointer-events-none opacity-50' : ''}>
        {children}
      </div>
    </div>
  )
}
