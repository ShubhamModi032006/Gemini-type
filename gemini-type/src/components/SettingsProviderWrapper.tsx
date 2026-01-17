'use client'

import { SettingsProvider } from '@/contexts/SettingsContext'
import ThemeWrapper from './ThemeWrapper'

export default function SettingsProviderWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SettingsProvider>
      <ThemeWrapper>
        {children}
      </ThemeWrapper>
    </SettingsProvider>
  )
}
