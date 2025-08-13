# SocioPay

A modern community-based payment and management system built with Next.js, TypeScript, and Drizzle ORM.

## 🚀 Features

- **Community Management**: Member authentication with house number validation (A-1, B-9, C-23 format)
- **Payment System**: Track member payments with categories, intervals, and export functionality
- **Expense Management**: Record and categorize community expenses with detailed reporting
- **Dashboard Analytics**: Interactive charts and data visualization for financial insights
- **Data Export**: CSV and PDF export capabilities for payments and expenses
- **Type-Safe Operations**: Full type safety with Drizzle ORM and TypeScript
- **Modern UI**: Responsive design with shadcn/ui components and drag-and-drop tables
- **Email Integration**: OTP-based password reset with Resend email service

## 🛠️ Tech Stack

- **Next.js 15.4.5** with App Router
- **Better Auth 1.3.4** for authentication
- **Drizzle ORM** for type-safe database operations
- **Supabase** PostgreSQL database
- **TypeScript** for type safety
- **Tailwind CSS** with shadcn/ui components
- **React Hook Form** with Zod validation
- **Recharts** for data visualization

## 📚 Documentation

For detailed documentation, visit the [docs](./docs) folder:

- [Authentication](./docs/authentication/README.md) - Complete authentication system documentation
- [Components](./docs/components/README.md) - React component documentation
- [Database](./docs/database/README.md) - Database schema, types, and migration guide
- [API](./docs/api/README.md) - API endpoints and server actions
- [Configuration](./docs/configuration/README.md) - Project configuration and setup

## 🚨 Database Type Migration

The project has migrated from Supabase-generated types to Drizzle ORM types for improved type safety and developer experience.

**Quick Links:**

- **[Migration Summary](./docs/MIGRATION_SUMMARY.md)** - Complete overview of changes
- **[Type Migration Guide](./docs/database/type-migration.md)** - Detailed migration instructions

## 🏗️ Quick Start

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd sociopay
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Environment setup**:

   ```bash
   cp .env.example .env.local
   ```

   Configure your environment variables in `.env.local`

4. **Database setup**:
   Configure your Supabase database connection and run:

   ```bash
   pnpm db:push
   ```

5. **Start development server**:
   ```bash
   pnpm dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📝 Available Scripts

### Core Development

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm format` - Format code using Prettier
- `pnpm format:check` - Check code formatting without making changes

### Database Commands

- `pnpm db:generate` - Generate migrations from schema changes
- `pnpm db:push` - Push schema changes to database
- `pnpm db:studio` - Open Drizzle Studio for database management
- `pnpm db:introspect` - Introspect existing database to generate schema

### Authentication Commands

- `pnpm auth:generate` - Generate Better Auth types
- `pnpm auth:migrate` - Run Better Auth migrations

## 📁 Project Structure

```
sociopay/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (sidebar)/         # Main application pages
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/                # shadcn/ui components
│   └── guards/            # Permission guards
├── docs/                  # Project documentation
├── drizzle/              # Database schema and migrations
├── lib/                  # Utility functions and configurations
├── hooks/                # Custom React hooks
└── types/                # TypeScript type definitions
```

## 🔧 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL=your_supabase_database_url

# Better Auth
BETTER_AUTH_SECRET=your_auth_secret
BETTER_AUTH_URL=http://localhost:3000

# Email (Resend)
RESEND_API_KEY=your_resend_api_key

# Other configuration variables...
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 📞 Support

For support and questions, please refer to the [documentation](./docs) or create an issue in the repository.
