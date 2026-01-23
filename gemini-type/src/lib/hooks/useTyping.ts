'use client'

import { useState, useEffect, useRef } from 'react'
import { useSettings } from '@/contexts/SettingsContext'

export type TypingStatus = 'waiting' | 'in-progress' | 'finished'

const useTyping = (text: string, duration: number) => {
  // Ensure text is always a string to prevent undefined errors
  const safeText = text || ''
  const [typed, setTyped] = useState<string>('')
  const [cursor, setCursor] = useState<number>(0)
  const [status, setStatus] = useState<TypingStatus>('waiting')
  const [startTime, setStartTime] = useState<number | null>(null)
  const [endTime, setEndTime] = useState<number | null>(null)
  const [mistakes, setMistakes] = useState(0)
  const [timeLeft, setTimeLeft] = useState(duration)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Effect to handle the countdown timer
  useEffect(() => {
    if (status === 'in-progress') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!)
            setStatus('finished')
            setEndTime(Date.now())
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [status])
  
  // Effect to reset timer when duration changes
  useEffect(() => {
    setTimeLeft(duration)
    if (status === 'in-progress' || status === 'finished') {
      reset()
    }
  }, [duration])

  // Effect to handle test completion when all text is typed
  useEffect(() => {
    if (status === 'in-progress' && cursor === safeText.length) {
      setStatus('finished')
      setEndTime(Date.now())
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [status, cursor, safeText.length])

  const { settings } = useSettings() // Access settings context
  
  // Audio refs
  const clickSoundRef = useRef<HTMLAudioElement | null>(null)
  const errorSoundRef = useRef<HTMLAudioElement | null>(null)
  
  // Initialize audio
  useEffect(() => {
    clickSoundRef.current = new Audio('/sounds/click.mp3') // You'll need to add these files
    errorSoundRef.current = new Audio('/sounds/error.mp3')
    
    // Preload
    clickSoundRef.current.volume = 0.5
    errorSoundRef.current.volume = 0.5
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent interactions if typing box isn't focused or active (if needed)
      // For now, attaching to window is fine but ideally should be on the input.
      if (status !== 'in-progress') return
      
      // Ignore modifier keys
      if (e.key === 'Control' || e.key === 'Alt' || e.key === 'Shift' || e.key === 'Meta') return

      if (e.key === 'Backspace') {
        setTyped((prev) => prev.slice(0, -1))
        setCursor((prev) => Math.max(0, prev - 1))
        // Optional: Play sound on backspace?
        if (settings.soundOnClick && clickSoundRef.current) {
          clickSoundRef.current.currentTime = 0
          clickSoundRef.current.play().catch(() => {})
        }
      } else if (e.key.length === 1) {
        let isCorrect = e.key === safeText[cursor]
        
        if (!isCorrect) {
          setMistakes((prev) => prev + 1)
          if (settings.soundOnError && errorSoundRef.current) {
            errorSoundRef.current.currentTime = 0
            errorSoundRef.current.play().catch(() => {})
          }
        } else {
             if (settings.soundOnClick && clickSoundRef.current) {
                clickSoundRef.current.currentTime = 0
                clickSoundRef.current.play().catch(() => {})
             }
        }
        
        setTyped((prev) => prev + e.key)
        setCursor((prev) => prev + 1)
      }
    }

    // Attach to window only if we want global capture, otherwise let the input handle it
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [status, safeText, cursor, settings])

  const reset = () => {
    setTyped('')
    setCursor(0)
    setStatus('waiting')
    setStartTime(null)
    setEndTime(null)
    setMistakes(0)
    setTimeLeft(duration)
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }

  const start = () => {
    if (status !== 'waiting') return
    setStatus('in-progress')
    setStartTime(Date.now())
  }

  return { typed, cursor, status, startTime, endTime, reset, mistakes, timeLeft, start }
}

export default useTyping
