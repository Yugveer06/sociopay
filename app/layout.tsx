import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { ThemeProvider as CustomThemeProvider } from '@/components/theme-provider-component'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: 'Sukoon Society',
  description: 'A Society Management System',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CustomThemeProvider />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
