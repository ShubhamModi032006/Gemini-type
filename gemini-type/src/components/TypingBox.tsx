'use client'

import { useState, useEffect, useRef } from 'react'
import useTyping from '@/lib/hooks/useTyping'
import { useSettings } from '@/contexts/SettingsContext'
import Results from './Results'
import AILoader from './AILoader'

interface TypingBoxProps {
  user: any
}

const TypingBox = ({ user }: TypingBoxProps) => {
  const { settings } = useSettings()
  const [level, setLevel] = useState('Beginner')
  const [duration, setDuration] = useState(30)
  const [text, setText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [cursorVisible, setCursorVisible] = useState(true)
  const { typed, cursor, status, startTime, endTime, reset, mistakes, timeLeft, start } = useTyping(text, duration)
  const inputRef = useRef<HTMLInputElement | null>(null)
  
  // Cursor blinking animation
  useEffect(() => {
    if (status === 'in-progress' && cursor < text.length) {
      const interval = setInterval(() => {
        setCursorVisible((prev) => !prev)
      }, 530)
      return () => clearInterval(interval)
    } else {
      setCursorVisible(true)
    }
  }, [status, cursor, text.length])
  
  // Get cursor style based on settings
  const getCursorChar = () => {
    switch (settings.cursorStyle) {
      case 'block':
        return '█'
      case 'line':
        return '|'
      case 'underline':
        return '_'
      case 'outline':
        return '▯'
      default:
        return '|'
    }
  }

  const fetchText = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/generate-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ level }),
      })
      const data = await response.json()
      setText(data.text || '')
      reset()
    } catch (error) {
      console.error('Error fetching text:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchText()
  }, [level])

  useEffect(() => {
    reset()
  }, [duration])

  if (status === 'finished') {
    return (
      <Results
        text={text}
        typed={typed}
        onReset={fetchText}
        mistakes={mistakes}
        duration={duration}
        level={level}
        user={user}
      />
    )
  }

  return (
    <div className="p-4 rounded-lg w-full max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
        <div className="inline-flex rounded-md shadow-sm overflow-hidden" role="group">
          <button
            disabled={status === 'in-progress'}
            onClick={() => setLevel('Beginner')}
            className={`px-3 py-1.5 text-sm border border-gray-600 ${level === 'Beginner' ? 'bg-yellow-600 text-black' : 'bg-transparent'} ${status === 'in-progress' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}`}
          >
            Beginner
          </button>
          <button
            disabled={status === 'in-progress'}
            onClick={() => setLevel('Intermediate')}
            className={`px-3 py-1.5 text-sm border-t border-b border-gray-600 -ml-px ${level === 'Intermediate' ? 'bg-yellow-600 text-black' : 'bg-transparent'} ${status === 'in-progress' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}`}
          >
            Intermediate
          </button>
          <button
            disabled={status === 'in-progress'}
            onClick={() => setLevel('Advanced')}
            className={`px-3 py-1.5 text-sm border border-gray-600 -ml-px ${level === 'Advanced' ? 'bg-yellow-600 text-black' : 'bg-transparent'} ${status === 'in-progress' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}`}
          >
            Advanced
          </button>
        </div>

        <div className="inline-flex rounded-md shadow-sm overflow-hidden" role="group">
          <button
            disabled={status === 'in-progress'}
            onClick={() => setDuration(15)}
            className={`px-3 py-1.5 text-sm border border-gray-600 ${duration === 15 ? 'bg-yellow-600 text-black' : 'bg-transparent'} ${status === 'in-progress' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}`}
          >
            15s
          </button>
          <button
            disabled={status === 'in-progress'}
            onClick={() => setDuration(30)}
            className={`px-3 py-1.5 text-sm border-t border-b border-gray-600 -ml-px ${duration === 30 ? 'bg-yellow-600 text-black' : 'bg-transparent'} ${status === 'in-progress' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}`}
          >
            30s
          </button>
          <button
            disabled={status === 'in-progress'}
            onClick={() => setDuration(60)}
            className={`px-3 py-1.5 text-sm border border-gray-600 -ml-px ${duration === 60 ? 'bg-yellow-600 text-black' : 'bg-transparent'} ${status === 'in-progress' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}`}
          >
            60s
          </button>
        </div>

        <button
          onClick={() => {
            if (status === 'in-progress') return
            // ensure text loaded
            if (!text) {
              fetchText()
            }
            inputRef.current?.focus()
            start()
          }}
          className={`px-4 py-2 text-sm rounded-md ${status === 'in-progress' ? 'bg-gray-700 cursor-not-allowed opacity-60' : 'bg-blue-600 hover:bg-blue-500'} `}
          disabled={status === 'in-progress'}
        >
          Start
        </button>
      </div>

      {status === 'in-progress' && settings.showTimer && (
        <div className="text-center text-2xl mb-4">{timeLeft}</div>
      )}

      <div className="relative">
        {isLoading ? (
          <AILoader message={`Generating ${level.toLowerCase()} text...`} isGenerating={isLoading} />
        ) : (
          <>
            <div
              className="text-gray-400 leading-relaxed tracking-wider"
              style={{ 
                minHeight: '150px',
                fontSize: `${settings.fontSize}px`,
              }}
            >
              {(text || '').split('').map((char, index) => {
                const isTyped = index < typed.length
                const isCorrect = isTyped && typed[index] === char
                const isCurrent = index === cursor

                return (
                  <span key={index} className="relative inline-block">
                    {isCurrent && settings.cursorStyle === 'block' ? (
                      <span 
                        className={`${settings.smoothCaret ? 'transition-all duration-75' : ''}`}
                        style={{ 
                          opacity: cursorVisible ? settings.caretOpacity : 0,
                        }}
                      >
                        <span className="bg-yellow-600 text-yellow-600">{char || ' '}</span>
                      </span>
                    ) : isCurrent && settings.cursorStyle === 'underline' ? (
                      <span 
                        className={`${settings.smoothCaret ? 'transition-all duration-75' : ''}`}
                        style={{ 
                          opacity: cursorVisible ? settings.caretOpacity : 0,
                        }}
                      >
                        <span className="border-b-2 border-yellow-600">{char || ' '}</span>
                      </span>
                    ) : isCurrent && settings.cursorStyle === 'outline' ? (
                      <span 
                        className={`${settings.smoothCaret ? 'transition-all duration-75' : ''}`}
                        style={{ 
                          opacity: cursorVisible ? settings.caretOpacity : 0,
                        }}
                      >
                        <span className="text-yellow-600">{getCursorChar()}</span>
                      </span>
                    ) : isCurrent ? (
                      <span 
                        className={`text-yellow-600 ${settings.smoothCaret ? 'transition-all duration-75' : ''}`}
                        style={{ 
                          opacity: cursorVisible ? settings.caretOpacity : 0,
                        }}
                      >
                        {getCursorChar()}
                      </span>
                    ) : (
                      <span
                        className={`${isTyped ? (isCorrect ? 'text-white' : 'text-red-500') : ''}`}
                      >
                        {char}
                      </span>
                    )}
                  </span>
                )
              })}
            </div>
            <input
              ref={inputRef}
              type="text"
              className="absolute inset-0 w-full h-full opacity-0 cursor-text"
              aria-label="Typing input"
            />
          </>
        )}
      </div>
    </div>
  )
}

export default TypingBox
