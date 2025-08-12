# SocioPay Documentation

Welcome to the SocioPay documentation. This guide covers all aspects of the community-based payment and management system.

## Table of Contents

- [Authentication](./authentication/README.md) - Complete authentication system documentation
- [Components](./components/README.md) - React component documentation
- [Database](./database/README.md) - Database schema, types, and migration guide
- [API](./api/README.md) - API endpoints and server actions
- [Configuration](./configuration/README.md) - Project configuration and setup

## Quick Start

1. **Environment Setup**: Copy `.env.example` to `.env.local` and configure your environment variables
2. **Install Dependencies**: Run `pnpm install`
3. **Database Setup**: Configure your Supabase database connection
4. **Database Schema**: Run `pnpm db:push` to sync Drizzle schema with database
5. **Development**: Run `pnpm dev` to start the development server

## 🚨 Database Type Migration

The project has migrated from Supabase-generated types to Drizzle ORM types.

**Quick Links:**

- **[Migration Summary](./MIGRATION_SUMMARY.md)** - Complete overview of changes
- **[Type Migration Guide](./database/type-migration.md)** - Detailed migration instructions

## Development Commands

### Core Development Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code using Prettier
- `pnpm format:check` - Check code formatting without making changes

### Database Commands

#### Drizzle ORM Commands

- `pnpm db:generate` - Generate migrations from schema changes
- `pnpm db:push` - Push schema changes to database
- `pnpm db:studio` - Open Drizzle Studio for database management
- `pnpm db:introspect` - Introspect existing database to generate schema

#### Authentication Commands

- `pnpm auth:generate` - Generate Better Auth types
- `pnpm auth:migrate` - Run Better Auth migrations

## Project Overview

SocioPay is built with:

- **Next.js 15.4.5** with App Router
- **Better Auth 1.3.4** for authentication
- **Drizzle ORM** for type-safe database operations
- **Supabase** PostgreSQL database
- **TypeScript** for type safety
- **Tailwind CSS** with shadcn/ui components

## Key Features

- Community member authentication with house number validation
- Phone-based verification system
- Secure session management
- Type-safe database operations with Drizzle ORM
- Modern React components with form validation
