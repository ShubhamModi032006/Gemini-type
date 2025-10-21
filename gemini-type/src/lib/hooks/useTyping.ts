'use client'

import { useState, useEffect, useRef } from 'react'

export type TypingStatus = 'waiting' | 'in-progress' | 'finished'

const useTyping = (text: string, duration: number) => {
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
    if (status === 'in-progress' && cursor === text.length) {
      setStatus('finished')
      setEndTime(Date.now())
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [status, cursor, text.length])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== 'in-progress') return

      if (e.key === 'Backspace') {
        setTyped((prev) => prev.slice(0, -1))
        setCursor((prev) => Math.max(0, prev - 1))
      } else if (e.key.length === 1) {
        if (e.key !== text[cursor]) {
          setMistakes((prev) => prev + 1)
        }
        setTyped((prev) => prev + e.key)
        setCursor((prev) => prev + 1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [status, text, cursor])

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
