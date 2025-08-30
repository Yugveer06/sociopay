'use server'

import { db } from '@/db/drizzle'
import { user } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { validatedAction } from '@/lib/action-helpers'
import { z } from 'zod'

type ActionResult = {
  success: boolean
  message?: string
}

export async function banSocietyMember(
  memberId: string,
  banReason?: string,
  banExpires?: Date
): Promise<ActionResult> {
  try {
    // Check if user is authenticated and has permission
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session || !session.user) {
      return {
        success: false,
        message: 'Unauthorized. Please log in.',
      }
    }

    // Check if the current user has admin privileges
    const currentUser = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1)

    if (
      !currentUser[0] ||
      !currentUser[0].role ||
      !['admin'].includes(currentUser[0].role.toLowerCase())
    ) {
      return {
        success: false,
        message: 'You do not have permission to ban members.',
      }
    }

    // Check if trying to ban themselves
    if (memberId === session.user.id) {
      return {
        success: false,
        message: 'You cannot ban yourself.',
      }
    }

    // Update the user's ban status
    await db
      .update(user)
      .set({
        banned: true,
        banReason: banReason || 'No reason provided',
        banExpires: banExpires ? banExpires : null,
      })
      .where(eq(user.id, memberId))

    revalidatePath('/society-members')

    return {
      success: true,
      message: 'Member banned successfully.',
    }
  } catch (error) {
    console.error('Error banning member:', error)
    return {
      success: false,
      message: 'Failed to ban member. Please try again.',
    }
  }
}

export async function unbanSocietyMember(
  memberId: string
): Promise<ActionResult> {
  try {
    // Check if user is authenticated and has permission
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session || !session.user) {
      return {
        success: false,
        message: 'Unauthorized. Please log in.',
      }
    }

    // Check if the current user has admin privileges
    const currentUser = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1)

    if (
      !currentUser[0] ||
      !currentUser[0].role ||
      !['admin'].includes(currentUser[0].role.toLowerCase())
    ) {
      return {
        success: false,
        message: 'You do not have permission to unban members.',
      }
    }

    // Update the user's ban status
    await db
      .update(user)
      .set({
        banned: false,
        banReason: null,
        banExpires: null,
      })
      .where(eq(user.id, memberId))

    revalidatePath('/society-members')

    return {
      success: true,
      message: 'Member unbanned successfully.',
    }
  } catch (error) {
    console.error('Error unbanning member:', error)
    return {
      success: false,
      message: 'Failed to unban member. Please try again.',
    }
  }
}

export async function editSocietyMember(
  memberId: string,
  data: {
    fullName: string
    houseNumber: string
    email: string
    phone: string
    houseOwnership: string
    role: string
  }
): Promise<ActionResult> {
  try {
    // Check if user is authenticated and has permission
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session || !session.user) {
      return {
        success: false,
        message: 'Unauthorized. Please log in.',
      }
    }

    // Check if the current user has admin privileges
    const currentUser = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1)

    if (
      !currentUser[0] ||
      !currentUser[0].role ||
      !['admin'].includes(currentUser[0].role.toLowerCase())
    ) {
      return {
        success: false,
        message: 'You do not have permission to edit members.',
      }
    }

    // Check if email or house number already exists for other users
    const existingUsers = await db
      .select()
      .from(user)
      .where(eq(user.email, data.email))
      .limit(1)

    if (existingUsers.length > 0 && existingUsers[0].id !== memberId) {
      return {
        success: false,
        message: 'Email address is already in use by another member.',
      }
    }

    const existingHouseNumber = await db
      .select()
      .from(user)
      .where(eq(user.houseNumber, data.houseNumber))
      .limit(1)

    if (
      existingHouseNumber.length > 0 &&
      existingHouseNumber[0].id !== memberId
    ) {
      return {
        success: false,
        message: 'House number is already assigned to another member.',
      }
    }

    // Update the user's information
    await db
      .update(user)
      .set({
        name: data.fullName,
        houseNumber: data.houseNumber,
        email: data.email,
        phone: data.phone,
        houseOwnership: data.houseOwnership,
        role: data.role,
      })
      .where(eq(user.id, memberId))

    revalidatePath('/society-members')

    return {
      success: true,
      message: 'Member updated successfully.',
    }
  } catch (error) {
    console.error('Error updating member:', error)
    return {
      success: false,
      message: 'Failed to update member. Please try again.',
    }
  }
}

const exportMembersSchema = z.object({
  format: z.enum(['csv', 'pdf']).default('csv'),
})

export const exportMembers = validatedAction(
  exportMembersSchema,
  async data => {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      throw new Error('Unauthorized')
    }

    // Check if the current user has admin privileges
    const currentUser = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1)

    if (
      !currentUser[0] ||
      !currentUser[0].role ||
      !['admin'].includes(currentUser[0].role.toLowerCase())
    ) {
      throw new Error('Insufficient permissions to export members data')
    }

    try {
      // Fetch all members with detailed information
      const result = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          houseNumber: user.houseNumber,
          phone: user.phone,
          role: user.role,
          houseOwnership: user.houseOwnership,
          banned: user.banned,
          banReason: user.banReason,
          banExpires: user.banExpires,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })
        .from(user)
        .orderBy(desc(user.createdAt))

      // Transform data for export - standardize the format
      const exportData = result.map(member => ({
        Name: member.name || 'N/A',
        Email: member.email,
        'House Number': member.houseNumber || 'N/A',
        Phone: member.phone || 'N/A',
        Role: member.role || 'user',
        'House Ownership': member.houseOwnership || 'N/A',
        'Account Status': member.banned ? 'Banned' : 'Active',
        'Ban Reason': member.banReason || 'N/A',
        'Ban Expires': member.banExpires
          ? member.banExpires.toISOString().split('T')[0]
          : 'N/A',
        'Email Verified': member.emailVerified ? 'Yes' : 'No',
        'Member Since': member.createdAt.toISOString().split('T')[0],
        'Last Updated': member.updatedAt?.toISOString().split('T')[0] || 'N/A',
      }))

      return {
        success: true,
        message: `Export data prepared successfully for ${data.format.toUpperCase()} format`,
        data: exportData,
        format: data.format,
      }
    } catch (error) {
      console.error('Export error:', error)
      throw new Error('Failed to export members data')
    }
  }
)
