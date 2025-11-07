// src/app/login/page.tsx
'use client' // <-- THIS IS THE MOST IMPORTANT LINE

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { FormEvent } from 'react'

export default function LoginPage() { // <-- Must be a default export
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault()
    setMessage('')
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMessage(`Could not sign up: ${error.message}`)
    } else {
      setMessage('Check your email for a confirmation link!')
    }
  }

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setMessage('')
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(`Could not log in: ${error.message}`)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center">
          Welcome
        </h2>

        {message && (
          <div 
            className={`p-3 text-center rounded-md ${
              message.includes('Could not') 
                ? 'text-red-700 bg-red-100 border border-red-200' 
                : 'text-green-700 bg-green-100 border border-green-200'
            }`}
          >
            {message}
          </div>
        )}
        
        <form className="space-y-4">
          <div>
            <label 
              htmlFor="email" 
              className="block mb-1 text-sm font-medium text-gray-300"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
            />
          </div>
          <div>
            <label 
              htmlFor="password" 
              className="block mb-1 text-sm font-medium text-gray-300"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
              placeholder="••••••••"
            />
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button 
              type="submit"
              onClick={handleLogin}
              className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Log In
            </button>
            <button 
              type="submit"
              onClick={handleSignUp}
              className="w-full px-4 py-2 font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Sign Up
            </button>
          </div>
        </form>

      </div>
    </main>
  )
}