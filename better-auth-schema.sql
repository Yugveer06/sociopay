-- Better Auth Schema for PostgreSQL
-- This schema includes the core tables and your custom fields

-- User table with custom fields
CREATE TABLE IF NOT EXISTS public.user (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    emailVerified BOOLEAN DEFAULT FALSE,
    image TEXT,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Custom fields
    houseNumber TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL
);

-- Account table for OAuth providers
CREATE TABLE IF NOT EXISTS public.account (
    id TEXT PRIMARY KEY,
    accountId TEXT NOT NULL,
    providerId TEXT NOT NULL,
    userId TEXT NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    accessToken TEXT,
    refreshToken TEXT,
    idToken TEXT,
    accessTokenExpiresAt TIMESTAMP WITH TIME ZONE,
    refreshTokenExpiresAt TIMESTAMP WITH TIME ZONE,
    scope TEXT,
    password TEXT,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session table
CREATE TABLE IF NOT EXISTS public.session (
    id TEXT PRIMARY KEY,
    expiresAt TIMESTAMP WITH TIME ZONE NOT NULL,
    ipAddress TEXT,
    userAgent TEXT,
    userId TEXT NOT NULL REFERENCES public.user(id) ON DELETE CASCADE,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verification table for email verification, password reset, etc.
CREATE TABLE IF NOT EXISTS public.verification (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expiresAt TIMESTAMP WITH TIME ZONE NOT NULL,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updatedAt TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_account_userId ON public.account(userId);
CREATE INDEX IF NOT EXISTS idx_session_userId ON public.session(userId);
CREATE INDEX IF NOT EXISTS idx_verification_identifier ON public.verification(identifier);
CREATE INDEX IF NOT EXISTS idx_user_email ON public.user(email);
CREATE INDEX IF NOT EXISTS idx_user_houseNumber ON public.user(houseNumber);
