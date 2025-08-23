'use client'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import Link from 'next/link'
import { SidebarData } from './app-sidebar'
import { ElementGuard } from './guards'
import { LoaderCircle } from 'lucide-react'
import { Skeleton } from './ui/skeleton'

export function NavMain({ items }: { items: SidebarData['navMain'] }) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map(item => (
            <ElementGuard
              permissions={item.permissions}
              unauthorizedFallback={<div hidden>No Access</div>}
              errorFallback={<div hidden>Error</div>}
              loadingFallback={
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    asChild
                    className="pointer-events-none"
                  >
                    <Link href={item.url}>
                      <LoaderCircle className="animate-spin" />
                      <Skeleton
                        className="h-4"
                        style={{ width: item.title.length * 8 }}
                      />
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              }
              key={item.title}
            >
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton tooltip={item.title} asChild>
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </ElementGuard>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
