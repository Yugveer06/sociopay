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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  IconCalendar,
  IconDots,
  IconUserCheck,
  IconUserX,
} from '@tabler/icons-react'
import { format } from 'date-fns'
import { CalendarIcon, Pencil, LoaderCircle } from 'lucide-react'
import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  banSocietyMember,
  unbanSocietyMember,
  editSocietyMember,
} from './actions'
import { SocietyMember } from './columns'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { editMemberSchema } from '@/lib/zod/auth'

interface RowActionsProps {
  member: SocietyMember
}

export function RowActions({ member }: RowActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [showBanDialog, setShowBanDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [banReason, setBanReason] = useState('')
  const [banExpires, setBanExpires] = useState<Date | null>()

  const form = useForm<z.infer<typeof editMemberSchema>>({
    resolver: zodResolver(editMemberSchema),
    defaultValues: {
      fullName: member.name,
      houseNumber: member.houseNumber,
      email: member.email,
      phone: member.phone,
      houseOwnership: (member.houseOwnership as 'owner' | 'renter') || 'owner',
      role: (member.role as 'user' | 'admin') || 'user',
    },
  })

  const handleBan = async () => {
    setIsLoading(true)
    try {
      const result = await banSocietyMember(
        member.id,
        banReason || undefined,
        banExpires!
      )

      if (result.success) {
        toast.success('Member banned successfully!')
        setShowBanDialog(false)
        setBanReason('')
        setBanExpires(null)
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

  const handleEditSubmit = (values: z.infer<typeof editMemberSchema>) => {
    startTransition(async () => {
      try {
        const result = await editSocietyMember(member.id, values)

        if (result.success) {
          toast.success('Member updated successfully!')
          setShowEditDialog(false)
          // Reset form with current member data
          form.reset({
            fullName: member.name,
            houseNumber: member.houseNumber,
            email: member.email,
            phone: member.phone,
            houseOwnership:
              (member.houseOwnership as 'owner' | 'renter') || 'owner',
            role: (member.role as 'user' | 'admin') || 'user',
          })
        } else {
          toast.error(result.message || 'Failed to update member')
        }
      } catch (error) {
        console.error('Error updating member:', error)
        toast.error('Failed to update member')
      }
    })
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
          >
            <Pencil className="text-primary mr-2 h-4 w-4" />
            Edit Member
          </DropdownMenuItem>

          {member.banned ? (
            <DropdownMenuItem
              onClick={handleUnban}
              disabled={isLoading}
              className="text-green-600 focus:bg-green-600/10 focus:text-green-600"
            >
              <IconUserCheck className="mr-2 h-4 w-4" />
              Unban Member
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => setShowBanDialog(true)}
              disabled={isLoading}
              className="text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <IconUserX className="text-primary mr-2 h-4 w-4" />
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    data-empty={!banExpires}
                    className="data-[empty=true]:text-muted-foreground w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon />
                    {banExpires ? (
                      format(banExpires, 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    disabled={{
                      before: new Date(Date.now() + 24 * 60 * 60 * 1000), // disables all previous dates including today
                    }}
                    selected={banExpires!}
                    onSelect={setBanExpires}
                  />
                </PopoverContent>
              </Popover>
              {banExpires ? (
                <span className="text-muted-foreground text-xs">
                  Ban will expire on{' '}
                  {banExpires.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    minute: '2-digit',
                    hour: '2-digit',
                  })}
                </span>
              ) : (
                <span className="text-muted-foreground text-xs">
                  Leave empty for indefinite ban
                </span>
              )}
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={isLoading}
              onClick={() => {
                setBanReason('')
                setBanExpires(null)
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

      {/* Edit Member Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              Edit Member
            </DialogTitle>
            <DialogDescription>
              Update member information for <strong>{member.name}</strong>
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleEditSubmit)}
              className="space-y-6"
            >
              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-muted-foreground border-b pb-2 text-sm font-medium">
                  Personal Information
                </h3>

                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="houseNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>House Number</FormLabel>
                        <FormControl>
                          <Input placeholder="A-10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            maxLength={10}
                            placeholder="10-digit number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="houseOwnership"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>House Ownership</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select ownership type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="owner">Owner</SelectItem>
                          <SelectItem value="renter">Renter</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Account Information Section */}
              <div className="space-y-4">
                <h3 className="text-muted-foreground border-b pb-2 text-sm font-medium">
                  Account Information
                </h3>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter email address"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditDialog(false)
                    // Reset form with original member data
                    form.reset({
                      fullName: member.name,
                      houseNumber: member.houseNumber,
                      email: member.email,
                      phone: member.phone,
                      houseOwnership:
                        (member.houseOwnership as 'owner' | 'renter') ||
                        'owner',
                      role: (member.role as 'user' | 'admin') || 'user',
                    })
                  }}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}
