import { betterAuth } from 'better-auth'
import { admin, emailOTP } from 'better-auth/plugins'
import { nextCookies } from 'better-auth/next-js'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db'
import * as schema from './schema'
import { validateBetterAuthEnv } from './env-check'
import { sendOTPEmail } from './email-service'

// Validate environment variables
validateBetterAuthEnv()

export const auth = betterAuth({
  user: {
    additionalFields: {
      houseNumber: {
        type: 'string',
        unique: true,
        required: true,
        validation: {
          maxLength: 10,
          pattern: '^[A-Z]-\\d{1,2}$',
          message: 'Please enter a valid house number (e.g., A-1, B-9, C-23).',
        },
      },
      phone: {
        type: 'string',
        required: true,
        validation: {
          minLength: 10,
          maxLength: 10,
          pattern: '^[0-9]{10}$',
          message: 'Please enter a valid 10-digit phone number.',
        },
      },
      role: {
        type: 'string',
        required: false,
        defaultValue: 'user',
      },
    },
  },
  emailAndPassword: { enabled: true },
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      account: schema.account,
      session: schema.session,
      verification: schema.verification,
    },
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
  plugins: [
    nextCookies(), // nextCookies should come first
    admin(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        try {
          // Use Resend to send the OTP email
          await sendOTPEmail({
            to: email,
            otp,
            type,
          })

          console.log(`OTP email sent successfully to ${email} for ${type}`)
        } catch (error) {
          console.error('Failed to send OTP email:', error)

          // In development, allow the flow to continue with console logging
          if (process.env.NODE_ENV === 'development') {
            console.log(
              `[DEVELOPMENT FALLBACK] OTP for ${email}: ${otp} (type: ${type})`
            )
            console.log(
              'Please check your RESEND_API_KEY configuration in .env.local'
            )
            // Don't throw error in development - allow the flow to continue
            return
          }

          // In production, we should fail if email can't be sent
          throw error
        }
      },
    }),
  ],
})
