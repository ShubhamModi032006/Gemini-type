'use client'

import { useState, useEffect } from 'react'
import { calculateWPM, calculateAccuracy } from '@/lib/utils'

interface ResultsProps {
  text: string
  typed: string
  onReset: () => void
  mistakes: number
  duration: number
  level: string
  user: any
}

const Results = ({ text, typed, onReset, mistakes, duration, level, user }: ResultsProps) => {
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  
  const correctChars = typed.split('').filter((char, i) => char === text[i]).length
  const wpm = calculateWPM(correctChars, duration)
  const accuracy = calculateAccuracy(correctChars, typed.length)

  // Save test results to database when component mounts
  useEffect(() => {
    const saveResults = async () => {
      if (!user?.id) {
        console.log('No user logged in, skipping save')
        setSaveStatus('idle')
        return
      }

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
            duration: duration, // <<< --- THIS IS THE FIX ---
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
          return
        }

        if (response.ok) {
          setSaveStatus('success')
        } else {
          setSaveStatus('error')
          console.error('Failed to save test results. Status:', response.status, 'Data:', responseData)
        }
      } catch (error) {
        setSaveStatus('error')
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
  }, [wpm, accuracy, mistakes, level, duration, user?.id])

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
