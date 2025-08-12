import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Validate environment variables
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required')
}

// Create postgres client with connection pooling compatibility
// Disable prefetch for Supabase connection pooling compatibility
const client = postgres(process.env.DATABASE_URL, {
  prepare: false,
  onnotice: process.env.NODE_ENV === 'development' ? console.log : undefined,
})

// Create Drizzle database instance with schema
export const db = drizzle(client, { schema })

// Export types for use throughout the application
export type Database = typeof db

// Export all schema types and tables
export * from './schema'

// Utility function for safe database operations
export async function safeDbOperation<T>(
  operation: () => Promise<T>
): Promise<{ data: T | null; error: string | null }> {
  try {
    const data = await operation()
    return { data, error: null }
  } catch (error) {
    console.error('Database operation failed:', error)
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown database error',
    }
  }
}
