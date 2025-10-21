'use client'

import { useState, useEffect } from 'react'

interface AILoaderProps {
  message?: string
  isGenerating?: boolean
}

const AILoader = ({ message = "Generating text...", isGenerating = true }: AILoaderProps) => {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showCursor, setShowCursor] = useState(true)

  const fullText = message

  useEffect(() => {
    if (!isGenerating) {
      setDisplayedText('')
      setCurrentIndex(0)
      return
    }

    if (currentIndex < fullText.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + fullText[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 50 + Math.random() * 100) // Random typing speed between 50-150ms

      return () => clearTimeout(timer)
    }
  }, [currentIndex, fullText, isGenerating])

  // Cursor blinking effect
  useEffect(() => {
    const cursorTimer = setInterval(() => {
      setShowCursor(prev => !prev)
    }, 500)

    return () => clearInterval(cursorTimer)
  }, [])

  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex flex-col items-center space-y-4">
        {/* AI Brain Icon with pulse animation */}
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          {/* Ripple effect */}
          <div className="absolute inset-0 w-10 h-10 bg-blue-500 rounded-full animate-ping opacity-20"></div>
        </div>

        {/* Typewriter text */}
        <div className="text-sm text-gray-300 font-medium text-center max-w-md">
          <span className="inline-block">
            {displayedText}
            {showCursor && <span className="text-blue-400 animate-pulse">|</span>}
          </span>
        </div>

        {/* Typing dots animation */}
        {currentIndex >= fullText.length && (
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div 
                className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" 
                style={{ animationDelay: '0ms', animationDuration: '1s' }}
              ></div>
              <div 
                className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" 
                style={{ animationDelay: '200ms', animationDuration: '1.1s' }}
              ></div>
              <div 
                className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" 
                style={{ animationDelay: '400ms', animationDuration: '1s' }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AILoader
