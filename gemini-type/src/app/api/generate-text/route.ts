// src/app/api/generate-text/route.ts
import { NextResponse, type NextRequest } from 'next/server'
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai'

// Get the API key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in .env.local')
}

// Initialize the Generative AI model
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
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

// The main POST function that handles requests
export async function POST(request: NextRequest) {
  try {
    // 1. Parse the request body to get the level
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }
    
    const { level } = body

    if (!level || !['Beginner', 'Intermediate', 'Advanced'].includes(level)) {
      return NextResponse.json(
        { error: 'Invalid "level" provided.' },
        { status: 400 }
      )
    }

    // 2. Create a prompt based on the level
    let prompt = ''
    switch (level) {
      case 'Beginner':
        prompt =
          'Generate a single, simple paragraph of about 100 words for a beginner typing test. The entire text must be in lowercase. Do not include any punctuation like periods, commas, or apostrophes. Use common English words.'
        break
      case 'Intermediate':
        prompt =
          'Generate a single paragraph of about 100 words for an intermediate typing test. The text must be entirely in lowercase. It must include proper use of commas and periods.'
        break
      case 'Advanced':
        prompt =
          'Generate a single paragraph of about 100 words for an advanced typing test. The text must use proper sentence case, including capitalizing the first letter of sentences and any proper nouns. It must also include punctuation like commas, periods, and apostrophes where appropriate.'
        break
    }

    // 3. Call the Gemini API
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    // 4. Send the generated text back to the frontend
    return NextResponse.json({ text })

  } catch (error) {
    console.error('Error in Gemini API route:', error)
    return NextResponse.json(
      { error: 'Failed to generate text.' },
      { status: 500 }
    )
  }
}