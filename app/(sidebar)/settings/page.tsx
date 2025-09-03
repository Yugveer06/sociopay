import { LightDarkThemeSelector } from '@/components/light-dark-theme-selector'
import { ThemeSelector } from '@/components/theme-selector'

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="mx-auto w-full max-w-6xl px-4 lg:px-6">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Settings</h1>
              <p className="text-muted-foreground">
                Manage your account preferences and application settings
              </p>
            </div>
          </div>

          {/* Settings Sections */}
          <div className="space-y-6">
            {/* Appearance Settings */}
            <section>
              <LightDarkThemeSelector />
            </section>

            {/* Theme Settings */}
            <section>
              <ThemeSelector />
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
