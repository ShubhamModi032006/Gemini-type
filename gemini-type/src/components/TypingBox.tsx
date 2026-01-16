'use client'

import { useState, useEffect, useRef } from 'react'
import useTyping from '@/lib/hooks/useTyping'
import Results from './Results'
import AILoader from './AILoader'
import type { User } from '@supabase/supabase-js'

interface TypingBoxProps {
  user: User | null
}

const TypingBox = ({ user }: TypingBoxProps) => {
  const [level, setLevel] = useState('Beginner')
  const [duration, setDuration] = useState(30)
  const [text, setText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { typed, cursor, status, reset, mistakes, timeLeft, start } = useTyping(text, duration)
  const inputRef = useRef<HTMLInputElement | null>(null)

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
      setText(data.text)
      reset()
    } catch (error) {
      console.error('Error fetching text:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchText()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level])

  useEffect(() => {
    reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      {status === 'in-progress' && <div className="text-center text-2xl mb-4">{timeLeft}</div>}

      <div className="relative">
        {isLoading ? (
          <AILoader message={`Generating ${level.toLowerCase()} text...`} isGenerating={isLoading} />
        ) : (
          <>
            <div
              className="text-2xl text-gray-400 leading-relaxed tracking-wider"
              style={{ minHeight: '150px' }}
            >
              {text.split('').map((char, index) => {
                const isTyped = index < typed.length
                const isCorrect = isTyped && typed[index] === char
                const isCurrent = index === cursor

                return (
                  <span key={index} className="relative">
                    <span
                      className={`${isTyped ? (isCorrect ? 'text-white' : 'text-red-500') : ''}`}>
                      {char}
                    </span>
                    {isCurrent && (
                      <span className="absolute left-0 animate-pulse">|</span>
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
