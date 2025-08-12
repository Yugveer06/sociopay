'use server'

import { auth } from '@/lib/auth'
import { validatedAction, ActionState } from '@/lib/action-helpers'
import {
  signInSchema,
  signUpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  SignInData,
  SignUpData,
  ForgotPasswordData,
  ResetPasswordData,
} from '@/lib/schemas'
import { headers } from 'next/headers'

// Raw action functions that perform the actual auth operations
async function signInAction(data: SignInData): Promise<ActionState> {
  try {
    const response = await auth.api.signInEmail({
      body: {
        email: data.email,
        password: data.password,
        rememberMe: true,
      },
      headers: await headers(), // Add headers for cookie handling
    })

    return {
      success: true,
      message: 'Signed in successfully',
      data: { user: response.user },
    }
  } catch (error) {
    console.error('Sign in error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Sign in failed',
    }
  }
}

async function signUpAction(data: SignUpData): Promise<ActionState> {
  try {
    const response = await auth.api.signUpEmail({
      body: {
        name: data.fullName,
        email: data.email,
        password: data.password,
        houseNumber: data.houseNumber,
        phone: data.phone,
      },
      headers: await headers(), // Add headers for cookie handling
    })

    return {
      success: true,
      message: 'Account created successfully',
      data: { user: response.user },
    }
  } catch (error) {
    console.error('Sign up error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Sign up failed',
    }
  }
}

// Password reset actions
async function forgotPasswordAction(
  data: ForgotPasswordData
): Promise<ActionState> {
  try {
    await auth.api.forgetPasswordEmailOTP({
      body: {
        email: data.email,
      },
      headers: await headers(),
    })

    return {
      success: true,
      message: 'Password reset code sent to your email',
    }
  } catch (error) {
    console.error('Forgot password error:', error)
    return {
      success: false,
      message:
        error instanceof Error ? error.message : 'Failed to send reset code',
    }
  }
}

async function resetPasswordAction(
  data: ResetPasswordData
): Promise<ActionState> {
  try {
    await auth.api.resetPasswordEmailOTP({
      body: {
        email: data.email,
        otp: data.otp,
        password: data.password,
      },
      headers: await headers(),
    })

    return {
      success: true,
      message: 'Password reset successfully',
    }
  } catch (error) {
    console.error('Reset password error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Password reset failed',
    }
  }
}

// Exported validated actions
export const signIn = validatedAction(signInSchema, async data => {
  const result = await signInAction(data)
  return result
})

export const signUp = validatedAction(signUpSchema, async data => {
  const result = await signUpAction(data)
  return result
})

export const forgotPassword = validatedAction(
  forgotPasswordSchema,
  async data => {
    const result = await forgotPasswordAction(data)
    return result
  }
)

export const resetPassword = validatedAction(
  resetPasswordSchema,
  async data => {
    const result = await resetPasswordAction(data)
    return result
  }
)

// Sign out action
export async function signOut(): Promise<ActionState> {
  try {
    await auth.api.signOut({
      headers: await headers(),
    })

    return {
      success: true,
      message: 'Signed out successfully',
    }
  } catch (error) {
    console.error('Sign out error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Sign out failed',
    }
  }
}
