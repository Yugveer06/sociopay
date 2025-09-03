'use client'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Check, Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

const themeOptions = [
  {
    id: 'light',
    name: 'Light',
    description: 'Clean and bright interface',
    icon: Sun,
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Easy on the eyes in low light',
    icon: Moon,
  },
  {
    id: 'system',
    name: 'System',
    description: 'Follows your device settings',
    icon: Monitor,
  },
]

export function LightDarkThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Wait until mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sun className="h-5 w-5" />
            <CardTitle>Appearance</CardTitle>
          </div>
          <CardDescription>
            Choose between light and dark mode for the interface
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {themeOptions.map(option => (
              <div key={option.id} className="rounded-lg border p-4 opacity-50">
                <div className="mb-3 flex items-center justify-center">
                  <option.icon className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <h3 className="text-sm font-medium">{option.name}</h3>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {option.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sun className="h-5 w-5" />
          <CardTitle>Appearance</CardTitle>
        </div>
        <CardDescription>
          Choose between light and dark mode for the interface
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {themeOptions.map(option => {
            const IconComponent = option.icon
            const isSelected = theme === option.id

            return (
              <div
                key={option.id}
                className={cn(
                  'relative cursor-pointer rounded-lg border p-4 transition-all hover:shadow-md',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
                onClick={() => setTheme(option.id)}
              >
                {/* Theme Icon */}
                <div className="mb-3 flex items-center justify-center">
                  <IconComponent
                    className={cn(
                      'h-8 w-8 transition-colors',
                      isSelected ? 'text-primary' : 'text-muted-foreground'
                    )}
                  />
                </div>

                {/* Theme Info */}
                <div className="space-y-1 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <h3 className="text-sm font-medium">{option.name}</h3>
                    {isSelected && (
                      <Badge variant="default" className="h-5 px-2">
                        <Check className="h-3 w-3" />
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {option.description}
                  </p>
                </div>

                {/* Overlay for better click experience */}
                <div className="absolute inset-0 rounded-lg" />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
