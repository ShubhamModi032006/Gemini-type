'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Theme = 'dark' | 'light' | 'blue' | 'green' | 'purple' | 'red' | 'orange'
export type CursorStyle = 'block' | 'line' | 'underline' | 'outline'

export interface Settings {
  theme: Theme
  cursorStyle: CursorStyle
  soundOnError: boolean
  soundOnClick: boolean
  smoothCaret: boolean
  showLiveWpm: boolean
  showTimer: boolean
  showAccuracy: boolean
  fontSize: number
  caretOpacity: number
  wordsPerLine: number
}

const defaultSettings: Settings = {
  theme: 'dark',
  cursorStyle: 'block',
  soundOnError: false,
  soundOnClick: false,
  smoothCaret: true,
  showLiveWpm: true,
  showTimer: true,
  showAccuracy: true,
  fontSize: 24,
  caretOpacity: 1,
  wordsPerLine: 10,
}

interface SettingsContextType {
  settings: Settings
  updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  resetSettings: () => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [mounted, setMounted] = useState(false)

  // Load settings from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const savedSettings = localStorage.getItem('typing-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
      } catch (e) {
        console.error('Failed to parse settings:', e)
      }
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('typing-settings', JSON.stringify(settings))
      applyTheme(settings.theme)
    }
  }, [settings, mounted])

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
  }

  // Apply theme to document root
  const applyTheme = (theme: Theme) => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      root.classList.remove('theme-dark', 'theme-light', 'theme-blue', 'theme-green', 'theme-purple', 'theme-red', 'theme-orange')
      root.classList.add(`theme-${theme}`)
    }
  }

  // Always render the Provider, but only use localStorage when mounted
  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
