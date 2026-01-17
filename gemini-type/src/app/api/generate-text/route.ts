// src/app/api/generate-text/route.ts
import { NextResponse, type NextRequest } from 'next/server'
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in .env.local')
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)

// CORRECTED: Configuration is now passed INSIDE the function
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash-lite', // Ensure this model is enabled in your Google Cloud Project
  generationConfig: {
    temperature: 0.9,
    topK: 1,
    topP: 1,
    maxOutputTokens: 2048,
  },
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const level = body.level || 'Beginner'

    if (!['Beginner', 'Intermediate', 'Advanced'].includes(level)) {
      return NextResponse.json({ error: 'Invalid level' }, { status: 400 })
    }

    let prompt = ''
    switch (level) {
      case 'Beginner':
        prompt = 'Generate 50 simple lowercase English words. No punctuation.'
        break
      case 'Intermediate':
        prompt = 'Generate 70 lowercase words with commas and periods.'
        break
      case 'Advanced':
        prompt = 'Generate 70 words with complex sentence structure and punctuation.'
        break
    }

    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    return NextResponse.json({ text })

  } catch (error: any) {
    console.error('Gemini API Error:', error.message)
    
    // Check for Quota Limit (429)
    if (error.message?.includes('429') || error.message?.includes('quota')) {
      return NextResponse.json(
        { error: 'Traffic limit reached. Please wait 30 seconds.' },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate text.' },
      { status: 500 }
    )
  }
}