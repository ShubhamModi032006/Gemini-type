'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useSettings } from '@/contexts/SettingsContext'
import type { Theme, CursorStyle } from '@/contexts/SettingsContext'
import type { User } from '@supabase/supabase-js'

interface SettingsContentProps {
  user: User | null
}

export default function SettingsContent({ user }: SettingsContentProps) {
  const router = useRouter()
  const supabase = createClient()
  const { settings, updateSetting, resetSettings } = useSettings()
  const [activeTab, setActiveTab] = useState<'account' | 'theme' | 'typing' | 'sound' | 'display'>('account')
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' })
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordMessage({ type: '', text: '' })

    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Please fill in all fields' })
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters' })
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    setIsUpdatingPassword(true)

    try {
      const response = await fetch('/api/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setPasswordMessage({ type: 'success', text: 'Password updated successfully!' })
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        setPasswordMessage({ type: 'error', text: data.error || 'Failed to update password' })
      }
    } catch (error) {
      setPasswordMessage({ type: 'error', text: 'An error occurred. Please try again.' })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const themes: { name: string; value: Theme; colors: { bg: string; primary: string; text: string } }[] = [
    { name: 'Dark', value: 'dark', colors: { bg: 'bg-gray-900', primary: 'bg-gray-800', text: 'text-white' } },
    { name: 'Light', value: 'light', colors: { bg: 'bg-white', primary: 'bg-gray-100', text: 'text-gray-900' } },
    { name: 'Blue', value: 'blue', colors: { bg: 'bg-blue-950', primary: 'bg-blue-900', text: 'text-blue-100' } },
    { name: 'Green', value: 'green', colors: { bg: 'bg-green-950', primary: 'bg-green-900', text: 'text-green-100' } },
    { name: 'Purple', value: 'purple', colors: { bg: 'bg-purple-950', primary: 'bg-purple-900', text: 'text-purple-100' } },
    { name: 'Red', value: 'red', colors: { bg: 'bg-red-950', primary: 'bg-red-900', text: 'text-red-100' } },
    { name: 'Orange', value: 'orange', colors: { bg: 'bg-orange-950', primary: 'bg-orange-900', text: 'text-orange-100' } },
  ]

  const cursorStyles: { name: string; value: CursorStyle; preview: string }[] = [
    { name: 'Block', value: 'block', preview: '█' },
    { name: 'Line', value: 'line', preview: '|' },
    { name: 'Underline', value: 'underline', preview: '_' },
    { name: 'Outline', value: 'outline', preview: '▯' },
  ]

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col justify-between">
      <main className="w-full flex-grow flex items-start justify-center py-12">
        <div className="w-full max-w-4xl mx-auto p-4">
          <h1 className="text-4xl font-bold mb-8">Settings</h1>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-700">
            {[
              { id: 'account', label: 'Account' },
              { id: 'theme', label: 'Theme' },
              { id: 'typing', label: 'Typing' },
              { id: 'sound', label: 'Sound' },
              { id: 'display', label: 'Display' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-yellow-600 text-yellow-600'
                    : 'border-transparent text-gray-400 hover:text-white hover:border-gray-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Account Settings */}
          {activeTab === 'account' && (
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
              <h2 className="text-2xl font-semibold mb-4">Account Settings</h2>
              
              {!user ? (
                <p className="text-gray-400">Please log in to update your account settings.</p>
              ) : (
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Current Password</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-600"
                      placeholder="Enter current password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-600"
                      placeholder="Enter new password (min 6 characters)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-600"
                      placeholder="Confirm new password"
                    />
                  </div>

                  {passwordMessage.text && (
                    <div
                      className={`p-3 rounded-md ${
                        passwordMessage.type === 'success'
                          ? 'bg-green-900 text-green-100'
                          : 'bg-red-900 text-red-100'
                      }`}
                    >
                      {passwordMessage.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="px-6 py-2 bg-yellow-600 text-black rounded-md hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Theme Settings */}
          {activeTab === 'theme' && (
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
              <h2 className="text-2xl font-semibold mb-4">Theme Settings</h2>
              
              <div>
                <label className="block text-sm font-medium mb-4">Select Theme</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {themes.map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => updateSetting('theme', theme.value)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        settings.theme === theme.value
                          ? 'border-yellow-600 ring-2 ring-yellow-600'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className={`${theme.colors.bg} ${theme.colors.text} p-3 rounded mb-2`}>
                        <div className={`${theme.colors.primary} p-2 rounded text-xs`}>
                          Preview
                        </div>
                      </div>
                      <span className="text-sm">{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Typing Settings */}
          {activeTab === 'typing' && (
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
              <h2 className="text-2xl font-semibold mb-4">Typing Settings</h2>
              
              <div>
                <label className="block text-sm font-medium mb-4">Cursor Style</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {cursorStyles.map((style) => (
                    <button
                      key={style.value}
                      onClick={() => updateSetting('cursorStyle', style.value)}
                      className={`p-4 rounded-lg border-2 transition-all text-center ${
                        settings.cursorStyle === style.value
                          ? 'border-yellow-600 ring-2 ring-yellow-600 bg-gray-700'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="text-3xl mb-2">{style.preview}</div>
                      <span className="text-sm">{style.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium">Smooth Caret</span>
                  <input
                    type="checkbox"
                    checked={settings.smoothCaret}
                    onChange={(e) => updateSetting('smoothCaret', e.target.checked)}
                    className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-yellow-600 focus:ring-yellow-600"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium">Show Live WPM</span>
                  <input
                    type="checkbox"
                    checked={settings.showLiveWpm}
                    onChange={(e) => updateSetting('showLiveWpm', e.target.checked)}
                    className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-yellow-600 focus:ring-yellow-600"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium">Show Timer</span>
                  <input
                    type="checkbox"
                    checked={settings.showTimer}
                    onChange={(e) => updateSetting('showTimer', e.target.checked)}
                    className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-yellow-600 focus:ring-yellow-600"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium">Show Accuracy</span>
                  <input
                    type="checkbox"
                    checked={settings.showAccuracy}
                    onChange={(e) => updateSetting('showAccuracy', e.target.checked)}
                    className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-yellow-600 focus:ring-yellow-600"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Sound Settings */}
          {activeTab === 'sound' && (
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
              <h2 className="text-2xl font-semibold mb-4">Sound Settings</h2>
              
              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-sm font-medium">Sound on Error</span>
                    <p className="text-xs text-gray-400">Play sound when you make a typing mistake</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.soundOnError}
                    onChange={(e) => updateSetting('soundOnError', e.target.checked)}
                    className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-yellow-600 focus:ring-yellow-600"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-sm font-medium">Sound on Click</span>
                    <p className="text-xs text-gray-400">Play sound when typing</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.soundOnClick}
                    onChange={(e) => updateSetting('soundOnClick', e.target.checked)}
                    className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-yellow-600 focus:ring-yellow-600"
                  />
                </label>
              </div>
            </div>
          )}

          {/* Display Settings */}
          {activeTab === 'display' && (
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-6">
              <h2 className="text-2xl font-semibold mb-4">Display Settings</h2>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Font Size: {settings.fontSize}px
                </label>
                <input
                  type="range"
                  min="16"
                  max="32"
                  value={settings.fontSize}
                  onChange={(e) => updateSetting('fontSize', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Caret Opacity: {Math.round(settings.caretOpacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.caretOpacity}
                  onChange={(e) => updateSetting('caretOpacity', parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Words Per Line: {settings.wordsPerLine}
                </label>
                <input
                  type="range"
                  min="5"
                  max="20"
                  value={settings.wordsPerLine}
                  onChange={(e) => updateSetting('wordsPerLine', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-600"
                />
              </div>

              <div className="pt-4 border-t border-gray-700">
                <button
                  onClick={resetSettings}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Reset All Settings
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
