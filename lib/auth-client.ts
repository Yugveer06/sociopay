import { createAuthClient } from 'better-auth/react'
import { adminClient, emailOTPClient } from 'better-auth/client/plugins'
import { ac, roles } from './permissions'

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  // Don't specify baseURL to use the same domain/port automatically
  plugins: [
    adminClient({
      ac,
      roles,
    }),
    emailOTPClient(),
  ],
})

// Export hooks for easier use
export const { useSession, signIn, signOut, signUp } = authClient
