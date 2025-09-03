'use client'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useThemeSelector } from '@/hooks/use-theme-selector'
import { cn } from '@/lib/utils'
import { Check, Palette } from 'lucide-react'

export function ThemeSelector() {
  const { currentTheme, themes, changeTheme, isLoading } = useThemeSelector()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            <CardTitle>Theme Selection</CardTitle>
          </div>
          <CardDescription>
            Choose your preferred color theme for the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 15 }).map((_, i) => (
              <Skeleton key={i} className="h-22 w-full" />
            ))}
          </div>
          <Skeleton className="mt-8 h-14 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          <CardTitle>Theme Selection</CardTitle>
        </div>
        <CardDescription>
          Choose your preferred color theme for the application.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {themes.map(theme => (
            <div
              key={theme.id}
              className={cn(
                'relative cursor-pointer rounded-lg border p-4 transition-all hover:shadow-md',
                currentTheme === theme.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
              onClick={() => changeTheme(theme.id)}
            >
              {/* Theme Preview */}
              <div className="mb-3 flex justify-between gap-2">
                <div className="flex gap-2">
                  <div
                    className="h-6 w-6 rounded-full border-2 border-white/20"
                    style={{ backgroundColor: theme.preview.primary }}
                  />
                  <div
                    className="h-6 w-6 rounded-full border-2 border-white/20"
                    style={{ backgroundColor: theme.preview.background }}
                  />
                  <div
                    className="h-6 w-6 rounded-full border-2 border-white/20"
                    style={{ backgroundColor: theme.preview.accent }}
                  />
                </div>
                {theme.id === 'claude' && (
                  <Badge variant="outline" className="text-xs">
                    Default
                  </Badge>
                )}
              </div>

              {/* Theme Info */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{theme.name}</h3>
                  {currentTheme === theme.id && (
                    <Badge variant="default" className="h-5 px-2">
                      <Check className="h-3 w-3" />
                    </Badge>
                  )}
                </div>
              </div>

              {/* Overlay for better click experience */}
              <div className="absolute inset-0 rounded-lg" />
            </div>
          ))}
        </div>

        <div className="bg-muted/50 mt-6 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full">
              <div className="bg-primary h-2 w-2 rounded-full" />
            </div>
            <p className="text-muted-foreground text-xs">
              These themes automatically adapt to your light/dark mode
              preference. Try switching between light and dark mode to see how
              your selected theme looks!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
