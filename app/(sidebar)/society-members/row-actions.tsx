'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  IconDots,
  IconUserX,
  IconUserCheck,
  IconCalendar,
} from '@tabler/icons-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { banSocietyMember, unbanSocietyMember } from './actions'
import { SocietyMember } from './columns'

interface RowActionsProps {
  member: SocietyMember
}

export function RowActions({ member }: RowActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showBanDialog, setShowBanDialog] = useState(false)
  const [banReason, setBanReason] = useState('')
  const [banExpires, setBanExpires] = useState('')

  const handleBan = async () => {
    setIsLoading(true)
    try {
      const result = await banSocietyMember(
        member.id,
        banReason || undefined,
        banExpires || undefined
      )

      if (result.success) {
        toast.success('Member banned successfully!')
        setShowBanDialog(false)
        setBanReason('')
        setBanExpires('')
      } else {
        toast.error(result.message || 'Failed to ban member')
      }
    } catch (error) {
      console.error('Error banning member:', error)
      toast.error('Failed to ban member')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnban = async () => {
    setIsLoading(true)
    try {
      const result = await unbanSocietyMember(member.id)

      if (result.success) {
        toast.success('Member unbanned successfully!')
      } else {
        toast.error(result.message || 'Failed to unban member')
      }
    } catch (error) {
      console.error('Error unbanning member:', error)
      toast.error('Failed to unban member')
    } finally {
      setIsLoading(false)
    }
  }

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted flex h-8 w-8 p-0"
            disabled={isLoading}
          >
            <IconDots className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          {member.banned ? (
            <DropdownMenuItem
              onClick={handleUnban}
              disabled={isLoading}
              className="text-green-600 focus:text-green-600"
            >
              <IconUserCheck className="mr-2 h-4 w-4" />
              Unban Member
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => setShowBanDialog(true)}
              disabled={isLoading}
              className="text-orange-600 focus:text-orange-600"
            >
              <IconUserX className="mr-2 h-4 w-4" />
              Ban Member
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Ban Member Dialog */}
      <AlertDialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <IconUserX className="h-5 w-5 text-orange-600" />
              Ban Member
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to ban <strong>{member.name}</strong> (
              {member.email}). This will prevent them from accessing society
              services.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ban-reason">Ban Reason (Optional)</Label>
              <Input
                id="ban-reason"
                placeholder="Enter reason for ban..."
                value={banReason}
                onChange={e => setBanReason(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ban-expires" className="flex items-center gap-2">
                <IconCalendar className="h-4 w-4" />
                Ban Expiry Date (Optional)
              </Label>
              <Input
                id="ban-expires"
                type="date"
                min={getTomorrowDate()}
                value={banExpires}
                onChange={e => setBanExpires(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-muted-foreground text-xs">
                Leave empty for indefinite ban
              </p>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isLoading}
              onClick={() => {
                setBanReason('')
                setBanExpires('')
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBan}
              disabled={isLoading}
              className="bg-orange-600 hover:bg-orange-700 focus:ring-orange-600"
            >
              {isLoading ? 'Banning...' : 'Ban Member'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
