'use server'

import { db } from '@/db/drizzle'
import { user } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

type ActionResult = {
  success: boolean
  message?: string
}

export async function banSocietyMember(
  memberId: string,
  banReason?: string,
  banExpires?: string
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
        banExpires: banExpires ? new Date(banExpires) : null,
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
