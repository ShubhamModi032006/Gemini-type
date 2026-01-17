'use client'

import { useSettings } from '@/contexts/SettingsContext'
import { useEffect } from 'react'

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings()
  
  useEffect(() => {
    // Apply theme to body and root elements
    const root = document.documentElement
    const body = document.body
    
    // Remove all theme classes
    root.classList.remove('theme-dark', 'theme-light', 'theme-blue', 'theme-green', 'theme-purple', 'theme-red', 'theme-orange')
    body.classList.remove('theme-dark', 'theme-light', 'theme-blue', 'theme-green', 'theme-purple', 'theme-red', 'theme-orange')
    
    // Add current theme class
    root.classList.add(`theme-${settings.theme}`)
    body.classList.add(`theme-${settings.theme}`)
  }, [settings.theme])
  
  return <>{children}</>
}
