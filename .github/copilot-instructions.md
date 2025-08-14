# SocioPay Copilot Instructions

## Key Patterns

- **Better Auth** with custom fields: `houseNumber` (`A-1` format), `phone` (10 digits)
- **Dual Zod schemas**: client form validation + server action with transforms
- **Server actions**: use `validatedAction()` wrapper, always include `headers: await headers()`
- **Route groups**: `(auth)` redirects authenticated, `(sidebar)` requires auth
- **Permissions**: `PermissionGuard` component, `usePermissions()` hook

## Critical Files

- `lib/schema.ts` - Drizzle tables/relations
- `lib/schemas.ts` - Zod validation (client + server versions)
- `lib/auth.ts` - Better Auth config with custom fields
- `components/guards/` - Permission protection

## Commands

- `pnpm db:push` - Push schema changes
- `pnpm auth:generate` - Generate auth types

## Conventions

- House numbers: `^[A-Z]-\d{1,2}$` pattern
- Use `cn()` for conditional classes
- shadcn/ui New York variant
- Add subtle funny comments while coding (keep it professional but witty)
