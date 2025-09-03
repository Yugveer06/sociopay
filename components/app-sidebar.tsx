'use client'

import {
  Home,
  LayoutDashboard,
  Users,
  FileText,
  WalletCards,
  Tickets,
  Settings,
} from 'lucide-react'
import * as React from 'react'

import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useSession } from '@/lib/auth-client'
import { BanknoteArrowDown, IndianRupee } from 'lucide-react'
import { Statement } from '@/lib/permissions'
import Link from 'next/link'
import { signOut } from '@/app/(auth)/actions'

// Type definitions for better TypeScript support
export type Resource = keyof Statement
export type Permission<T extends Resource> = Statement[T][number]
export type PermissionCheck = {
  [K in Resource]?: Permission<K>[]
}

type NavItem = {
  title: string
  url: string
  icon: React.ElementType
  permissions?: PermissionCheck
  anyPermissions?: PermissionCheck[]
  allPermissions?: PermissionCheck[]
  requiredOwnership?: ('owner' | 'renter')[]
  customLogic?: 'admin-or-renter-kyc' // Special handling for complex logic
}

export type SidebarData = {
  navMain: NavItem[]
}

const data: SidebarData = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboard,
      permissions: { dashboard: ['view'] },
    },
    {
      title: 'Payments',
      url: '/payments',
      icon: IndianRupee,
      anyPermissions: [
        { payment: ['list-own'] }, // Regular users see their own payments
        { payment: ['list-all'] }, // Admins see all payments
      ],
    },
    {
      title: 'Payment Methods',
      url: '/payments/methods',
      icon: WalletCards,
      permissions: { qrCode: ['view'] },
    },
    {
      title: 'Expenses',
      url: '/expenses',
      icon: BanknoteArrowDown,
      permissions: { expenses: ['list'] },
    },
    {
      title: 'Renter KYC',
      url: '/renter-kyc',
      icon: FileText,
      customLogic: 'admin-or-renter-kyc',
      // 🎯 Custom logic: Admins (any ownership) OR non-admin renters only!
      // Non-admin owners should NOT see this
    },
    {
      title: 'Society Members',
      url: '/society-members',
      icon: Users,
      permissions: { members: ['list'] },
    },
    {
      title: 'Tickets',
      url: '/tickets',
      icon: Tickets,
      permissions: { tickets: ['list'] },
    },
    {
      title: 'Settings',
      url: '/settings',
      icon: Settings,
      // Everyone can access settings - no permission check needed
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const session = useSession()

  // Default user data for when session is loading or not available
  const userData = {
    name: session.data?.user?.name || 'Guest User',
    email: session.data?.user?.email || 'guest@example.com',
  }

  // If the user is banned, sign them out as a side-effect after render.
  // Calling signOut() during render causes React errors (updates during render).
  React.useEffect(() => {
    if (session?.data?.user?.banned) {
      // fire-and-forget; action handles its own errors
      void signOut()
    }
  }, [session?.data?.user?.banned])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <Home className="!size-5" />
                <span className="text-base font-semibold">Sukun Soc.</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
