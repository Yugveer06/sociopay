// Better Auth type extensions
declare module 'better-auth/client' {
  interface SignUpOptions {
    houseNumber?: string
    phone?: string
  }
}

// Global utility types (compile-time only)
// Add any shared TypeScript types that don't need runtime presence here
