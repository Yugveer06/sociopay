'use client'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import Link from 'next/link'
import { SidebarData } from './app-sidebar'
import { ElementGuard } from './guards'
import { LoaderCircle } from 'lucide-react'
import { Skeleton } from './ui/skeleton'
import { usePermissions } from '@/hooks/use-permissions'
import { useIsMobile } from '@/hooks/use-mobile'

// Custom component for Renter KYC with special logic
function RenterKycNavItem({ item }: { item: SidebarData['navMain'][0] }) {
  const { role, session } = usePermissions()
  const { setOpenMobile } = useSidebar()
  const isMobile = useIsMobile()

  // Function to handle mobile sidebar close
  const handleMobileClick = () => {
    if (isMobile) {
      setOpenMobile(false) // Close mobile sidebar when link is clicked
    }
  }

  // Custom logic: Show to admins (any ownership) OR non-admin renters
  // Hide from non-admin owners
  const shouldShow =
    role === 'admin' || // Admins can always see it
    (role === 'user' && session?.user?.houseOwnership === 'renter') // Non-admin renters only

  if (!shouldShow) {
    return <div hidden>Not visible to non-admin owners</div>
  }

  return (
    <ElementGuard
      anyPermissions={[
        { renterKyc: ['list-all'] }, // Admin permission
        { renterKyc: ['list-own'] }, // Renter permission
      ]}
      unauthorizedFallback={<div hidden>No Access</div>}
      errorFallback={<div hidden>Error</div>}
      loadingFallback={
        <SidebarMenuItem>
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
    >
      <SidebarMenuItem>
        <SidebarMenuButton tooltip={item.title} asChild>
          <Link href={item.url} onClick={handleMobileClick}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </ElementGuard>
  )
}

export function NavMain({ items }: { items: SidebarData['navMain'] }) {
  const { setOpenMobile } = useSidebar()
  const isMobile = useIsMobile()

  // Function to handle mobile sidebar close
  const handleMobileClick = () => {
    if (isMobile) {
      setOpenMobile(false) // Close mobile sidebar when link is clicked
    }
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map(item => {
            // Handle custom logic for specific items
            if (item.customLogic === 'admin-or-renter-kyc') {
              return <RenterKycNavItem key={item.title} item={item} />
            }

            // Default permission-based rendering
            return (
              <ElementGuard
                permissions={item.permissions}
                anyPermissions={item.anyPermissions}
                anyOwnership={item.requiredOwnership}
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
                    <Link href={item.url} onClick={handleMobileClick}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </ElementGuard>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
