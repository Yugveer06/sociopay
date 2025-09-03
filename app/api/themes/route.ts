import { readdir } from 'fs/promises'
import { NextResponse } from 'next/server'
import { join } from 'path'

export async function GET() {
  try {
    // Get the path to the themes directory in the public folder
    const themesPath = join(process.cwd(), 'public', 'themes')

    // Read all files in the themes directory
    const files = await readdir(themesPath)

    // Filter for CSS files only
    const themeFiles = files.filter(file => file.endsWith('.css'))

    return NextResponse.json(themeFiles)
  } catch (error) {
    console.error('Error reading themes directory:', error)

    // Return fallback theme files if directory reading fails
    return NextResponse.json([
      'claude.css',
      'catppuccin.css',
      'vercel.css',
      'supabase.css',
      'twitter.css',
      'darkmatter.css',
      'mono.css',
      'perpetuity.css',
      'vintagePaper.css',
    ])
  }
}
