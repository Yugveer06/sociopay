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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  IconDots,
  IconUserX,
  IconUserCheck,
  IconCalendar,
  IconEdit,
} from '@tabler/icons-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  banSocietyMember,
  unbanSocietyMember,
  editUserDetails,
} from './actions'
import { SocietyMember } from './columns'
import { EditUserDetailsData } from '@/lib/zod/auth'

interface RowActionsProps {
  member: SocietyMember
}

export function RowActions({ member }: RowActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showBanDialog, setShowBanDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [banReason, setBanReason] = useState('')
  const [banExpires, setBanExpires] = useState('')

  // Edit form state
  const [editForm, setEditForm] = useState<EditUserDetailsData>({
    name: member.name,
    email: member.email,
    houseNumber: member.houseNumber,
    phone: member.phone.replace('+91 ', ''), // Remove country code for editing
    role: member.role || 'user',
    houseOwnership: (member.houseOwnership === 'Renter'
      ? 'Renter'
      : 'Owner') as 'Owner' | 'Renter',
  })

  // Reset form when dialog opens to ensure fresh data
  useEffect(() => {
    if (showEditDialog) {
      setEditForm({
        name: member.name,
        email: member.email,
        houseNumber: member.houseNumber,
        phone: member.phone.replace('+91 ', ''),
        role: member.role || 'user',
        houseOwnership: (member.houseOwnership === 'Renter'
          ? 'Renter'
          : 'Owner') as 'Owner' | 'Renter',
      })
    }
  }, [
    showEditDialog,
    member.name,
    member.email,
    member.houseNumber,
    member.phone,
    member.role,
    member.houseOwnership,
  ])

  // Reset form when member prop changes (e.g., after successful update)
  useEffect(() => {
    setEditForm({
      name: member.name,
      email: member.email,
      houseNumber: member.houseNumber,
      phone: member.phone.replace('+91 ', ''),
      role: member.role || 'user',
      houseOwnership: (member.houseOwnership === 'Renter'
        ? 'Renter'
        : 'Owner') as 'Owner' | 'Renter',
    })
  }, [
    member.name,
    member.email,
    member.houseNumber,
    member.phone,
    member.role,
    member.houseOwnership,
  ])

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

  const handleEditDetails = async () => {
    setIsLoading(true)
    try {
      const result = await editUserDetails(member.id, editForm)

      if (result.success) {
        toast.success('Member details updated successfully!')
        setShowEditDialog(false)
        // Reset form on successful update
        resetEditForm()
      } else {
        toast.error(result.message || 'Failed to update member details')
        // Don't reset form on error - let user fix their input
      }
    } catch (error) {
      console.error('Error updating member details:', error)
      toast.error('Failed to update member details')
      // Don't reset form on error - let user fix their input
    } finally {
      setIsLoading(false)
    }
  }

  const resetEditForm = () => {
    setEditForm({
      name: member.name,
      email: member.email,
      houseNumber: member.houseNumber,
      phone: member.phone.replace('+91 ', ''),
      role: member.role || 'user',
      houseOwnership: (member.houseOwnership === 'Renter'
        ? 'Renter'
        : 'Owner') as 'Owner' | 'Renter',
    })
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
          <DropdownMenuItem
            onClick={() => setShowEditDialog(true)}
            disabled={isLoading}
            className="text-blue-600 focus:text-blue-600"
          >
            <IconEdit className="mr-2 h-4 w-4" />
            Edit Details
          </DropdownMenuItem>
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

      {/* Edit Details Dialog */}
      <AlertDialog
        open={showEditDialog}
        onOpenChange={open => {
          setShowEditDialog(open)
          if (!open) {
            // Reset form when dialog is closed
            resetEditForm()
          }
        }}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <IconEdit className="h-5 w-5 text-blue-600" />
              Edit Member Details
            </AlertDialogTitle>
            <AlertDialogDescription>
              Edit details for <strong>{member.name}</strong>. All fields are
              required and must be unique where applicable.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="max-h-96 space-y-4 overflow-y-auto py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                placeholder="Enter full name"
                value={editForm.name}
                onChange={e =>
                  setEditForm(prev => ({ ...prev, name: e.target.value }))
                }
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email Address</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="Enter email address"
                value={editForm.email}
                onChange={e =>
                  setEditForm(prev => ({ ...prev, email: e.target.value }))
                }
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-house">House Number</Label>
              <Input
                id="edit-house"
                placeholder="e.g., A-1, B-9, C-23"
                value={editForm.houseNumber}
                onChange={e =>
                  setEditForm(prev => ({
                    ...prev,
                    houseNumber: e.target.value,
                  }))
                }
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-phone">Phone Number</Label>
              <Input
                id="edit-phone"
                placeholder="10-digit phone number"
                value={editForm.phone}
                onChange={e =>
                  setEditForm(prev => ({ ...prev, phone: e.target.value }))
                }
                disabled={isLoading}
                maxLength={10}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={editForm.role || 'user'}
                onValueChange={value =>
                  setEditForm(prev => ({ ...prev, role: value }))
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="treasurer">Treasurer</SelectItem>
                  <SelectItem value="secretary">Secretary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-ownership">House Ownership</Label>
              <Select
                value={editForm.houseOwnership}
                onValueChange={value =>
                  setEditForm(prev => ({
                    ...prev,
                    houseOwnership: value as 'Owner' | 'Renter',
                  }))
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ownership type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Owner">Owner</SelectItem>
                  <SelectItem value="Renter">Renter</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-xs">
                Automatically determined but can be overridden manually
              </p>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isLoading}
              onClick={() => {
                resetEditForm()
                setShowEditDialog(false)
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEditDetails}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-600"
            >
              {isLoading ? 'Updating...' : 'Update Details'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
