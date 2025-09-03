'use client'

import { useEffect } from 'react'

export function ThemeProvider() {
  useEffect(() => {
    // Load the saved theme on initial page load
    const savedTheme = localStorage.getItem('sociopay-theme')

    if (savedTheme) {
      // Check if theme CSS is already loaded
      const existingLink = document.getElementById('theme-css')
      if (!existingLink) {
        const link = document.createElement('link')
        link.id = 'theme-css'
        link.rel = 'stylesheet'
        link.href = `/themes/${savedTheme}.css`
        document.head.appendChild(link)
      }
    } else {
      // Load default claude theme if no theme is saved
      const link = document.createElement('link')
      link.id = 'theme-css'
      link.rel = 'stylesheet'
      link.href = `/themes/claude.css`
      document.head.appendChild(link)
      localStorage.setItem('sociopay-theme', 'claude')
    }
  }, [])

  return null // This component doesn't render anything
}
