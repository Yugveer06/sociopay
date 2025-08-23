'use client'

import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import ThemeDropdown from './theme-dropdown'

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

import React from 'react'
import { usePathname } from 'next/navigation'

export function SiteHeader() {
  const pathname = usePathname()

  // Split pathname into parts, filter empty, and capitalize each word in each part
  function capitalizeWords(str: string) {
    return str.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  }
  const parts = pathname.split('/').filter(Boolean).map(capitalizeWords)
  return (
    <header className="bg-background sticky top-0 z-50 flex h-(--header-height) shrink-0 items-center gap-2 rounded-t-md border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {parts.map((part, idx) => (
              <React.Fragment key={part + idx}>
                <BreadcrumbItem>
                  {idx < parts.length - 1 ? (
                    <BreadcrumbLink
                      href={'/' + parts.slice(0, idx + 1).join('/')}
                    >
                      {part}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{part}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {idx < parts.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ml-auto flex items-center gap-2">
          <ThemeDropdown />
        </div>
      </div>
    </header>
  )
}
