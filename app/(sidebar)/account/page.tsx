import { ChangePasswordForm } from '@/components/change-password-form'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { auth } from '@/lib/auth'
import {
  IconCalendar,
  IconEdit,
  IconHome,
  IconMail,
  IconPhone,
  IconShield,
  IconUser,
} from '@tabler/icons-react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function AccountPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/login')
  }

  const { user } = session

  // Generate avatar initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="mx-auto w-full max-w-6xl px-4 lg:px-6">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold">Account Settings</h1>
            <p className="text-muted-foreground">
              Manage your account information and preferences.
            </p>
          </div>

          {/* Profile Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconUser className="h-5 w-5" />
                Profile Overview
              </CardTitle>
              <CardDescription>
                Your personal information and account details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Section */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={user.image || ''}
                    alt={user.name || 'User'}
                  />
                  <AvatarFallback className="text-lg">
                    {getInitials(user.name || 'User')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <h3 className="text-xl font-semibold">{user.name}</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                  <Badge variant="secondary" className="w-fit">
                    <IconShield className="mr-1 h-3 w-3" />
                    Active User
                  </Badge>
                </div>
              </div>

              <Separator />

              {/* Details Grid */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="bg-muted/50 flex items-center gap-3 rounded-lg p-3">
                    <IconMail className="text-muted-foreground h-5 w-5" />
                    <div>
                      <p className="text-sm font-medium">Email Address</p>
                      <p className="text-muted-foreground text-sm">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {user.phone && (
                    <div className="bg-muted/50 flex items-center gap-3 rounded-lg p-3">
                      <IconPhone className="text-muted-foreground h-5 w-5" />
                      <div>
                        <p className="text-sm font-medium">Phone Number</p>
                        <p className="text-muted-foreground text-sm">
                          {user.phone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {user.houseNumber && (
                    <div className="bg-muted/50 flex items-center gap-3 rounded-lg p-3">
                      <IconHome className="text-muted-foreground h-5 w-5" />
                      <div>
                        <p className="text-sm font-medium">House Number</p>
                        <p className="text-muted-foreground text-sm">
                          {user.houseNumber}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="bg-muted/50 flex items-center gap-3 rounded-lg p-3">
                    <IconCalendar className="text-muted-foreground h-5 w-5" />
                    <div>
                      <p className="text-sm font-medium">Member Since</p>
                      <p className="text-muted-foreground text-sm">
                        {formatDate(user.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your password and account security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChangePasswordForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
