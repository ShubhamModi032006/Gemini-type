'use client'

import { useState, useEffect, useRef } from 'react'
import { calculateWPM, calculateAccuracy } from '@/lib/utils'
import type { User } from '@supabase/supabase-js'

interface ResultsProps {
  text: string
  typed: string
  onReset: () => void
  mistakes: number
  duration: number
  level: string
  user: User | null
}

const Results = ({ text, typed, onReset, mistakes, duration, level, user }: ResultsProps) => {
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const savedResultKeyRef = useRef<string | null>(null)
  
  const correctChars = typed.split('').filter((char, i) => char === text[i]).length
  const wpm = calculateWPM(correctChars, duration)
  const accuracy = calculateAccuracy(correctChars, typed.length)

  // Create a unique key for this test result
  const resultKey = `${wpm}-${accuracy}-${mistakes}-${level}-${duration}-${typed.length}`

  // Save test results to database when component mounts (only once per unique result)
  useEffect(() => {
    // Prevent duplicate saves for the same result
    if (savedResultKeyRef.current === resultKey) {
      return
    }

    const saveResults = async () => {
      if (!user?.id) {
        console.log('No user logged in, skipping save')
        setSaveStatus('idle')
        return
      }

      // Mark this result as being saved
      savedResultKeyRef.current = resultKey
      setIsSaving(true)
      setSaveStatus('idle')
      
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 15000) 

        const response = await fetch('/api/save-result', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            wpm: wpm,
            accuracy: accuracy,
            errorCount: mistakes,
            testLevel: level,
            duration: duration,
          }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        let responseData
        try {
          responseData = await response.json()
        } catch (parseError) {
          console.error('Failed to parse response JSON:', parseError)
          setSaveStatus('error')
          savedResultKeyRef.current = null // Allow retry on error
          return
        }

        if (response.ok) {
          setSaveStatus('success')
        } else {
          setSaveStatus('error')
          savedResultKeyRef.current = null // Allow retry on error
          console.error('Failed to save test results. Status:', response.status, 'Data:', responseData)
        }
      } catch (error) {
        setSaveStatus('error')
        savedResultKeyRef.current = null // Allow retry on error
        if (error instanceof Error && error.name === 'AbortError') {
          console.error('Request timed out after 15 seconds')
        } else {
          console.error('Error saving test results:', error)
        }
      } finally {
        setIsSaving(false)
      }
    }

    saveResults()
  }, [resultKey, wpm, accuracy, mistakes, level, duration, user?.id])

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">Results</h2>
      <p>WPM: {wpm}</p>
      <p>Accuracy: {accuracy}%</p>
      <p>Mistakes: {mistakes}</p>
      
      {/* Save status indicator */}
      {isSaving && (
        <p className="text-blue-400 text-sm mt-2">Saving results...</p>
      )}
      {saveStatus === 'success' && (
        <p className="text-green-400 text-sm mt-2">✓ Results saved!</p>
      )}
      {saveStatus === 'error' && (
        <p className="text-red-400 text-sm mt-2">Failed to save results</p>
      )}
      
      <button onClick={onReset} className="mt-4 px-4 py-2 bg-blue-500 rounded-md hover:bg-blue-600 transition-colors">
        Restart Test
      </button>
    </div>
  )
}

export default Results
