'use client'

import { useEffect, useState } from 'react'

export type Theme = {
  id: string
  name: string
  preview: {
    primary: string
    background: string
    accent: string
  }
}

// Function to parse CSS and extract preview colors
const parseThemeCSS = (
  cssText: string
): { primary: string; background: string; accent: string } => {
  const primaryMatch = cssText.match(/--primary:\s*([^;]+);/)
  const backgroundMatch = cssText.match(/--background:\s*([^;]+);/)
  const accentMatch = cssText.match(/--accent:\s*([^;]+);/)

  return {
    primary: primaryMatch?.[1]?.trim() || 'oklch(0.5 0.1 200)',
    background: backgroundMatch?.[1]?.trim() || 'oklch(0.98 0 0)',
    accent: accentMatch?.[1]?.trim() || 'oklch(0.92 0.01 200)',
  }
}

// Function to convert theme ID to display name
const formatThemeName = (themeId: string): string => {
  return themeId
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Function to discover themes from the themes directory
const discoverThemes = async (): Promise<Theme[]> => {
  try {
    // Fetch the themes directory listing from the API
    const response = await fetch('/api/themes')
    if (!response.ok) {
      throw new Error('Failed to fetch themes')
    }

    const themeFiles: string[] = await response.json()
    const themes: Theme[] = []

    // Process each theme file
    for (const filename of themeFiles) {
      if (!filename.endsWith('.css')) continue

      const themeId = filename.replace('.css', '')

      try {
        // Fetch the CSS content
        const cssResponse = await fetch(`/themes/${filename}`)
        if (!cssResponse.ok) continue

        const cssText = await cssResponse.text()
        const preview = parseThemeCSS(cssText)

        themes.push({
          id: themeId,
          name: formatThemeName(themeId),
          preview,
        })
      } catch (error) {
        console.warn(`Failed to process theme: ${themeId}`, error)
      }
    }

    return themes.sort((a, b) => a.name.localeCompare(b.name))
  } catch (error) {
    console.error('Failed to discover themes, falling back to defaults:', error)

    // Fallback to a minimal default theme list
    return [
      {
        id: 'claude',
        name: 'Claude',
        preview: {
          primary: 'oklch(0.6171 0.1375 39.0427)',
          background: 'oklch(0.9818 0.0054 95.0986)',
          accent: 'oklch(0.9245 0.0138 92.9892)',
        },
      },
    ]
  }
}

const STORAGE_KEY = 'sociopay-theme'

export function useThemeSelector() {
  const [currentTheme, setCurrentTheme] = useState<string>('claude')
  const [themes, setThemes] = useState<Theme[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load and discover themes on mount
  useEffect(() => {
    const initializeThemes = async () => {
      setIsLoading(true)

      // Discover available themes
      const discoveredThemes = await discoverThemes()
      setThemes(discoveredThemes)

      // Load saved theme or default
      const savedTheme = localStorage.getItem(STORAGE_KEY)
      if (savedTheme && discoveredThemes.find(t => t.id === savedTheme)) {
        setCurrentTheme(savedTheme)
        loadThemeCSS(savedTheme)
      } else {
        // Default to claude theme or first available theme
        const defaultTheme =
          discoveredThemes.find(t => t.id === 'claude') || discoveredThemes[0]
        if (defaultTheme) {
          setCurrentTheme(defaultTheme.id)
          loadThemeCSS(defaultTheme.id)
        }
      }

      setIsLoading(false)
    }

    initializeThemes()
  }, [])

  // Function to dynamically load theme CSS
  const loadThemeCSS = async (themeId: string) => {
    try {
      // Remove existing theme CSS
      const existingLink = document.getElementById(
        'theme-css'
      ) as HTMLLinkElement
      if (existingLink) {
        existingLink.remove()
      }

      // Add new theme CSS
      const link = document.createElement('link')
      link.id = 'theme-css'
      link.rel = 'stylesheet'
      link.href = `/themes/${themeId}.css`

      // Wait for the CSS to load
      await new Promise((resolve, reject) => {
        link.onload = resolve
        link.onerror = reject
        document.head.appendChild(link)
      })
    } catch (error) {
      console.error('Failed to load theme:', themeId, error)
    }
  }

  // Function to change theme
  const changeTheme = async (themeId: string) => {
    const theme = themes.find(t => t.id === themeId)
    if (!theme) return

    setIsLoading(true)
    try {
      await loadThemeCSS(themeId)
      setCurrentTheme(themeId)
      localStorage.setItem(STORAGE_KEY, themeId)
    } catch (error) {
      console.error('Failed to change theme:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    currentTheme,
    themes,
    changeTheme,
    isLoading,
  }
}
