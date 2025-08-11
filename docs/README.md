# SocioPay Documentation

Welcome to the SocioPay documentation. This guide covers all aspects of the community-based payment and management system.

## Table of Contents

-   [Authentication](./authentication/README.md) - Complete authentication system documentation
-   [Components](./components/README.md) - React component documentation
-   [Database](./database/README.md) - Database schema and types
-   [API](./api/README.md) - API endpoints and server actions
-   [Configuration](./configuration/README.md) - Project configuration and setup

## Quick Start

1. **Environment Setup**: Copy `.env.example` to `.env.local` and configure your environment variables
2. **Install Dependencies**: Run `pnpm install`
3. **Database Setup**: Configure your Supabase database connection
4. **Development**: Run `pnpm dev` to start the development server

## Project Overview

SocioPay is built with:

-   **Next.js 15.4.5** with App Router
-   **Better Auth 1.3.4** for authentication
-   **Supabase** PostgreSQL database
-   **TypeScript** for type safety
-   **Tailwind CSS** with shadcn/ui components

## Key Features

-   Community member authentication with house number validation
-   Phone-based verification system
-   Secure session management
-   Type-safe database operations
-   Modern React components with form validation
