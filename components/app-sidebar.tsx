'use client'

import { Home, LayoutDashboard, Users, FileText } from 'lucide-react'
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
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const session = useSession()

  // Array of available avatar images
  const avatarImages = [
    'banana.jpg',
    'hakla.jpg',
    'salmon.jpg',
    'ubli.jpg',
    'mota.jpg',
    'gandu.jpg',
    'thala.jpg',
  ]

  // Function to get a random avatar
  const getRandomAvatar = () => {
    const randomIndex = Math.floor(Math.random() * avatarImages.length)
    return `/avatars/${avatarImages[randomIndex]}`
  }

  // Default user data for when session is loading or not available
  const userData = {
    name: session.data?.user?.name || 'Guest User',
    email: session.data?.user?.email || 'guest@example.com',
    avatar: getRandomAvatar(),
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <Home className="!size-5" />
                <span className="text-base font-semibold">Sukun Soc.</span>
              </a>
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
