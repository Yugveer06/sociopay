import ThemeDropdown from '@/components/theme-dropdown'
import { DotBackground } from '@/components/ui/dot-background'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function SidebarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (session) {
    redirect('/dashboard')
  }

  return (
    <DotBackground>
      <ThemeDropdown className="fixed top-4 right-4 z-10" />
      <div className="relative flex min-w-screen items-center justify-center">
        {children}
      </div>
    </DotBackground>
  )
}
