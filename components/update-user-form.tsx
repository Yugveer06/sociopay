'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'
import { useState } from 'react'
import { toast } from 'sonner'

interface UpdateUserFormProps {
  user: {
    name: string | null
    email: string
    phone?: string
    houseNumber?: string
  }
}

export function UpdateUserForm({ user }: UpdateUserFormProps) {
  const [name, setName] = useState(user.name || '')
  const [email, setEmail] = useState(user.email)
  const [phone, setPhone] = useState(user.phone || '')
  const [houseNumber, setHouseNumber] = useState(user.houseNumber || '')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!name.trim()) {
      toast.error('Name is required')
      return
    }

    if (!email.trim()) {
      toast.error('Email is required')
      return
    }

    // Validate phone number if provided
    if (phone && !/^[0-9]{10}$/.test(phone)) {
      toast.error('Phone number must be exactly 10 digits')
      return
    }

    // Validate house number format if provided
    if (houseNumber && !/^[A-Z]-\d{1,2}$/.test(houseNumber)) {
      toast.error('House number must be in format A-1, B-9, C-23, etc.')
      return
    }

    setIsLoading(true)

    try {
      const { data, error } = await authClient.updateUser({
        name: name.trim(),
        // Note: Better Auth doesn't support updating email directly through updateUser
        // You would need to implement changeEmail separately if needed
      })

      if (error) {
        toast.error(error.message || 'Failed to update profile')
      } else {
        toast.success('Profile updated successfully')
        // Refresh the page to show updated data
        window.location.reload()
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setName(user.name || '')
    setEmail(user.email)
    setPhone(user.phone || '')
    setHouseNumber(user.houseNumber || '')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Enter your full name"
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            disabled={true} // Email changes require special handling
            title="Email changes require verification. Contact support if needed."
          />
        </div>
        {user.phone !== undefined && (
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Enter your 10-digit phone number"
              disabled={isLoading}
            />
          </div>
        )}
        {user.houseNumber !== undefined && (
          <div className="space-y-2">
            <Label htmlFor="houseNumber">House Number</Label>
            <Input
              id="houseNumber"
              value={houseNumber}
              onChange={e => setHouseNumber(e.target.value)}
              placeholder="e.g., A-1, B-9, C-23"
              disabled={isLoading}
            />
          </div>
        )}
      </div>
      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
