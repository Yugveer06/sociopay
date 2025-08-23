'use client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DotBackground } from '@/components/ui/dot-background'
import RotatingText from '@/components/ui/rotating-text'
import Link from 'next/link'
import { useSession } from '@/lib/auth-client'
import ThemeDropdown from '@/components/theme-dropdown'

export default function Home() {
  const { data: session } = useSession()
  return (
    <DotBackground>
      <ThemeDropdown className="fixed top-4 right-4" />
      <div className="flex w-full max-w-4xl flex-col items-center justify-center space-y-8">
        {/* Main Header */}
        <div className="space-y-4 text-center">
          <h1 className="mb-4 flex items-center justify-center gap-6 text-4xl font-bold md:text-6xl">
            <span>Sukoon</span>
            <RotatingText
              texts={['3', '&', '4']}
              mainClassName="px-2 sm:px-2 md:px-3 text-white bg-black dark:bg-white dark:text-black overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-[16px]"
              staggerFrom={'last'}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-120%' }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
              transition={{
                type: 'spring',
                damping: 30,
                stiffness: 400,
              }}
              rotationInterval={1500}
            />
            <span>Society</span>
          </h1>

          <p className="mx-auto max-w-2xl text-xl">
            Welcome to our Society portal. Connect, collaborate, and build
            together.
          </p>
        </div>

        {/* Authentication Card */}
        <Card className="bg-background/75 relative mt-24 w-full max-w-md border-2 backdrop-blur-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              <span>Get Started</span>
            </CardTitle>
            <CardDescription>
              Join our community or sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {session && session.user ? (
              <Link href="/dashboard" className="block">
                <Button variant="outline" className="w-full" size="lg">
                  Go to dashboard
                </Button>
              </Link>
            ) : (
              <div className="space-y-4">
                <Link href="/login" className="block">
                  <Button className="w-full" size="lg">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup" className="block">
                  <Button variant="outline" className="w-full" size="lg">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DotBackground>
  )
}
