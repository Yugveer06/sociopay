'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  IconCaretUpDown,
  IconMail,
  IconPhone,
  IconHome,
  IconUserCheck,
  IconUserX,
} from '@tabler/icons-react'
import { ColumnDef } from '@tanstack/react-table'
import { z } from 'zod'
import { RowActions } from './row-actions'

export const SocietyMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  houseNumber: z.string(),
  phone: z.string(),
  role: z.string().nullable(),
  banned: z.boolean().nullable(),
  banReason: z.string().nullable(),
  banExpires: z.string().nullable(),
  image: z.string().nullable(),
  createdAt: z.string(),
  emailVerified: z.boolean(),
})

export type SocietyMember = z.infer<typeof SocietyMemberSchema>

export const columns: ColumnDef<SocietyMember>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Member
          <IconCaretUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const member = row.original
      const initials = member.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={member.image || ''} alt={member.name} />
            <AvatarFallback className="text-xs font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{member.name}</span>
            <div className="text-muted-foreground flex items-center gap-1 text-xs">
              <IconMail className="h-3 w-3" />
              {member.email}
            </div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'houseNumber',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          House Number
          <IconCaretUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const houseNumber = row.getValue('houseNumber') as string
      return (
        <div className="flex items-center gap-2">
          <IconHome className="text-muted-foreground h-4 w-4" />
          <span className="font-mono font-medium">{houseNumber}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ row }) => {
      const phone = row.getValue('phone') as string
      return (
        <div className="flex items-center gap-2">
          <IconPhone className="text-muted-foreground h-4 w-4" />
          <span className="font-mono">{phone}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.getValue('role') as string | null
      if (!role) {
        return <Badge variant="secondary">Member</Badge>
      }

      const roleColors: Record<
        string,
        'default' | 'secondary' | 'destructive' | 'outline'
      > = {
        admin: 'default',
        treasurer: 'default',
        secretary: 'default',
        member: 'secondary',
      }

      return (
        <Badge variant={roleColors[role.toLowerCase()] || 'outline'}>
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'banned',
    header: 'Status',
    cell: ({ row }) => {
      const member = row.original
      const isBanned = member.banned
      const banExpires = member.banExpires

      if (isBanned) {
        const isTemporary = banExpires && new Date(banExpires) > new Date()
        return (
          <div className="flex items-center gap-2">
            <IconUserX className="h-4 w-4 text-red-500" />
            <div className="flex flex-col">
              <Badge variant="destructive" className="w-fit">
                {isTemporary ? 'Suspended' : 'Banned'}
              </Badge>
              {banExpires && isTemporary && (
                <span className="text-muted-foreground mt-1 text-xs">
                  Until{' '}
                  {new Date(banExpires).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              )}
            </div>
          </div>
        )
      }

      return (
        <div className="flex items-center gap-2">
          <IconUserCheck className="h-4 w-4 text-green-700 dark:text-green-500" />
          <Badge
            variant="outline"
            className="border border-green-200 text-green-700 dark:border-green-900 dark:text-green-500"
          >
            Active
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Joined Date
          <IconCaretUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue('createdAt') as string
      if (!date) return <div className="text-muted-foreground">-</div>

      const joinDate = new Date(date)
      const now = new Date()
      const diffTime = now.getTime() - joinDate.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      let timeAgo = ''
      if (diffDays === 0) timeAgo = 'Today'
      else if (diffDays === 1) timeAgo = 'Yesterday'
      else if (diffDays < 7) timeAgo = `${diffDays} days ago`
      else if (diffDays < 30) timeAgo = `${Math.floor(diffDays / 7)} weeks ago`
      else if (diffDays < 365)
        timeAgo = `${Math.floor(diffDays / 30)} months ago`
      else timeAgo = `${Math.floor(diffDays / 365)} years ago`

      return (
        <div className="flex flex-col">
          <span className="font-medium">
            {joinDate.toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
          <span className="text-muted-foreground text-xs">{timeAgo}</span>
        </div>
      )
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const member = row.original
      return <RowActions member={member} />
    },
  },
]
