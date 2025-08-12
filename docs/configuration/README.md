# Configuration Documentation

## Overview

SocioPay configuration includes environment variables, framework settings, and development tools configuration.

## Environment Configuration

### Environment Files

```
.env.example        # Template with all required variables
.env.local         # Local development environment (gitignored)
```

### Required Environment Variables

```bash
# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database

# Better Auth Configuration
BETTER_AUTH_SECRET=your-cryptographically-secure-secret-key

# Node Environment
NODE_ENV=development|production

# Supabase Configuration (if using Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Environment Variable Details

#### `DATABASE_URL`

- **Purpose**: PostgreSQL database connection string
- **Format**: `postgresql://username:password@host:port/database`
- **Example**: `postgresql://postgres:password@localhost:5432/sociopay`
- **Required**: Yes

#### `BETTER_AUTH_SECRET`

- **Purpose**: Secret key for Better Auth encryption and signing
- **Requirements**: Cryptographically secure, minimum 32 characters
- **Generation**: Use `openssl rand -base64 32` or similar
- **Required**: Yes

#### `NODE_ENV`

- **Purpose**: Determines runtime environment
- **Values**: `development`, `production`, `test`
- **Default**: `development`
- **Impact**: Affects SSL settings, error handling, optimizations

## Next.js Configuration

### `next.config.ts`

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable experimental features
  experimental: {
    // Enable server actions
    serverActions: true,
  },

  // TypeScript configuration
  typescript: {
    // Type checking during build
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    // Lint during build
    ignoreDuringBuilds: false,
  },

  // Image optimization
  images: {
    domains: ['localhost'],
  },
}

export default nextConfig
```

### Key Configuration Options

- **Server Actions**: Enabled for authentication operations
- **TypeScript**: Strict type checking enabled
- **ESLint**: Linting enforced during builds
- **Image Optimization**: Configured for local development

## TypeScript Configuration

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Key TypeScript Settings

- **Strict Mode**: Enabled for maximum type safety
- **Path Mapping**: `@/*` alias for root directory imports
- **JSX**: Preserve mode for Next.js processing
- **Module Resolution**: Bundler mode for modern imports

## Tailwind CSS Configuration

### `postcss.config.mjs`

```javascript
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

export default config
```

### Tailwind Features

- **Utility-First**: Utility classes for rapid development
- **Component System**: shadcn/ui integration
- **Responsive Design**: Mobile-first responsive utilities
- **Dark Mode**: Support for dark mode (if implemented)

## Package Management

### `package.json`

Key dependencies and scripts:

```json
{
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "auth:generate": "better-auth generate",
    "auth:migrate": "better-auth migrate",
    "db:types": "supabase gen types typescript --project-id=tqouszaaxafqemrwpmcn --schema=public > db/types.ts",
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:introspect": "drizzle-kit introspect"
  },
  "dependencies": {
    "next": "15.4.5",
    "react": "19.1.0",
    "better-auth": "1.3.4",
    "drizzle-orm": "latest",
    "drizzle-kit": "latest",
    "postgres": "latest",
    "zod": "4.0.17",
    "react-hook-form": "7.62.0"
  }
}
```

### `pnpm-workspace.yaml`

```yaml
packages:
  - '.'
```

### Development Scripts

#### Core Scripts

- **`pnpm dev`**: Start development server with Turbopack
- **`pnpm build`**: Build for production
- **`pnpm start`**: Start production server
- **`pnpm lint`**: Run ESLint
- **`pnpm format`**: Format code using Prettier
- **`pnpm format:check`**: Check code formatting without making changes

#### Authentication Scripts

- **`pnpm auth:generate`**: Generate Better Auth types
- **`pnpm auth:migrate`**: Run Better Auth migrations

#### Database Scripts (Drizzle ORM)

- **`pnpm db:generate`**: Generate migrations from schema changes
- **`pnpm db:push`**: Push schema changes to database
- **`pnpm db:studio`**: Open Drizzle Studio for database management
- **`pnpm db:introspect`**: Introspect existing database to generate schema

#### Legacy Database Scripts

- **`pnpm db:types`**: Generate Supabase TypeScript types (legacy)

## shadcn/ui Configuration

### `components.json`

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### shadcn/ui Settings

- **Style**: New York variant
- **RSC**: React Server Components enabled
- **TypeScript**: Full TypeScript support
- **CSS Variables**: Enabled for theming
- **Base Color**: Slate color palette

## Better Auth Configuration

### Main Configuration (`lib/auth.ts`)

```typescript
import { betterAuth } from 'better-auth'
import { admin } from 'better-auth/plugins'
import { Pool } from 'pg'

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
    },
  },
  emailAndPassword: { enabled: true },
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  plugins: [admin()],
})
```

### Configuration Options

- **Custom Fields**: House number and phone validation
- **Authentication**: Email/password enabled
- **Database**: Drizzle adapter with PostgreSQL
- **Plugins**: Admin plugin for user management
- **Security**: Environment-based SSL configuration

## Drizzle ORM Configuration

### Database Configuration (`lib/db.ts`)

```typescript
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Disable prefetch for connection pooling compatibility
const client = postgres(process.env.DATABASE_URL!, { prepare: false })
export const db = drizzle(client, { schema })

export type Database = typeof db
export * from './schema'
```

### Drizzle Kit Configuration (`drizzle.config.ts`)

```typescript
import { defineConfig } from 'drizzle-kit'
import { loadEnvConfig } from '@next/env'

// Load environment variables
loadEnvConfig(process.cwd())

export default defineConfig({
  schema: './lib/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
})
```

### Schema Definition (`lib/schema.ts`)

The schema file contains all table definitions, relationships, and custom types:

```typescript
import {
  pgTable,
  text,
  boolean,
  timestamp,
  pgEnum,
  serial,
  uuid,
  numeric,
  date,
  integer,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Custom enums
export const intervalTypeEnum = pgEnum('interval_type', [
  'monthly',
  'quarterly',
  'half_yearly',
  'annually',
])

// Better Auth tables
export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').unique().notNull(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  houseNumber: text('houseNumber').unique().notNull(),
  phone: text('phone').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// Application tables
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id),
  categoryId: integer('category_id')
    .notNull()
    .references(() => paymentCategories.id),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  paymentDate: date('payment_date').defaultNow(),
  periodStart: date('period_start'),
  periodEnd: date('period_end'),
  intervalType: intervalTypeEnum('interval_type'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
})

// Relations
export const userRelations = relations(user, ({ many }) => ({
  payments: many(payments),
}))
```

### Updated Better Auth Configuration

Better Auth now uses the Drizzle adapter:

```typescript
import { betterAuth } from 'better-auth'
import { admin, emailOTP } from 'better-auth/plugins'
import { nextCookies } from 'better-auth/next-js'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db'
import * as schema from './schema'

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
    nextCookies(),
    admin(),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        // Email OTP implementation
      },
    }),
  ],
})
```

## Development Tools

### ESLint Configuration

Extends Next.js ESLint configuration:

```json
{
  "extends": "next/core-web-vitals"
}
```

### Prettier Configuration

Code formatting is handled by Prettier with the following configuration files:

#### `.prettierrc`

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "trailingComma": "es5",
  "printWidth": 80,
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

#### `.prettierignore`

```
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
.next/
out/
dist/
build/

# Environment files
.env
.env.local
.env.production
.env.staging

# Generated files
db/types.ts
*.generated.*

# Lock files
package-lock.json
yarn.lock
pnpm-lock.yaml

# Drizzle
drizzle/

# Other
*.min.js
*.min.css
public/
coverage/
```

#### Formatting Scripts

- **`pnpm format`**: Automatically format all files in the project
- **`pnpm format:check`**: Check if files are properly formatted without making changes

#### Usage Examples

```bash
# Format all files
pnpm format

# Check formatting (useful in CI/CD)
pnpm format:check

# Format specific files
npx prettier --write "src/**/*.{ts,tsx,js,jsx,json,md}"

# Check specific files
npx prettier --check "src/**/*.{ts,tsx,js,jsx,json,md}"
```

### Git Configuration

### `.gitignore`

```
# Dependencies
node_modules/
.pnpm-debug.log*

# Next.js
.next/
out/

# Environment variables
.env*.local

# Database
db-password.txt

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db
```

## Production Configuration

### Environment Variables

```bash
# Production database with SSL
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require

# Secure secret key
BETTER_AUTH_SECRET=production-secret-key

# Production environment
NODE_ENV=production
```

### Build Configuration

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

### Security Considerations

- **SSL**: Enabled for database connections
- **Secrets**: Use secure secret generation
- **Environment**: Never commit `.env.local`
- **HTTPS**: Use HTTPS in production
- **Headers**: Consider security headers

## Deployment Configuration

### Vercel Deployment

```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install"
}
```

### Environment Variables Setup

1. Set `DATABASE_URL` in deployment platform
2. Generate and set `BETTER_AUTH_SECRET`
3. Set `NODE_ENV=production`
4. Configure any additional service keys

### Database Migration

```bash
# Run migrations in production
pnpm auth:migrate
```

## Troubleshooting

### Common Issues

#### Database Connection

- Verify `DATABASE_URL` format
- Check SSL settings for production
- Ensure database is accessible

#### Authentication

- Verify `BETTER_AUTH_SECRET` is set
- Check secret key length (minimum 32 characters)
- Ensure proper environment variable loading

#### Build Issues

- Run `pnpm install` to update dependencies
- Check TypeScript errors with `pnpm build`
- Verify all environment variables are set

### Debug Configuration

```bash
# Check environment variables
node -e "console.log(process.env.DATABASE_URL)"

# Test database connection
node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); pool.query('SELECT NOW()', (err, res) => { console.log(err ? err : res.rows[0]); pool.end(); });"
```

## Best Practices

### Environment Management

1. **Never commit secrets** to version control
2. **Use different secrets** for different environments
3. **Validate environment variables** at startup
4. **Document all required variables** in `.env.example`

### Configuration Security

1. **Generate secure secrets** using cryptographic tools
2. **Use SSL in production** for all connections
3. **Validate configuration** before deployment
4. **Monitor configuration changes** in production

### Development Workflow

1. **Copy `.env.example`** to `.env.local` for new developers
2. **Update documentation** when adding new variables
3. **Test configuration changes** in development first
4. **Use consistent naming** for environment variables
5. **Format code before committing** using `pnpm format`
6. **Check formatting in CI/CD** using `pnpm format:check`

### Code Quality

1. **Run linting** with `pnpm lint` before committing
2. **Format code consistently** with `pnpm format`
3. **Check formatting** in pull requests with `pnpm format:check`
4. **Use TypeScript strict mode** for better type safety
5. **Follow component naming conventions** from shadcn/ui
