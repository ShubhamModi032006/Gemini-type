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
  model: 'gemini-2.5-flash-lite', // Revert to valid model
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
  let level = 'Beginner' // Default level

  try {
    const body = await request.json()
    level = body.level || 'Beginner'

    if (!['Beginner', 'Intermediate', 'Advanced'].includes(level)) {
      return NextResponse.json({ error: 'Invalid level' }, { status: 400 })
    }

    let prompt = ''
    switch (level) {
      case 'Beginner':
        prompt = 'Generate a distinct list of 50 common, simple English words suitable for typing practice (e.g., house, tree, world, open). Output them as a single string separated by spaces. Do not use any punctuation or newlines.'
        break
      case 'Intermediate':
        prompt = 'Generate a coherent, easy-to-read paragraph of approximately 60 words about a general topic like nature, technology, or travel. Use standard capitalization and punctuation. Ensure there is a space after every period and comma.'
        break
      case 'Advanced':
        prompt = 'Generate a sophisticated paragraph of approximately 60 words with properly constructed sentences. Use varied punctuation (commas, semi-colons, periods). Choose a topic like history, science, or literature. MUST ensure standard spacing between all words and after punctuation.'
        break
    }

    const result = await model.generateContent(prompt)
    const response = result.response
    let text = response.text()

    // Clean up text
    text = text.replace(/[\n\t\r]+/g, ' ')
    // Ensure space after punctuation if missing
    text = text.replace(/([.,;?!])([^\s])/g, '$1 $2')
    // Remove multiple spaces and trim
    text = text.replace(/\s{2,}/g, ' ').trim()

    return NextResponse.json({ text })

  } catch (error: any) {
    console.error('Gemini API Error:', error.message)
    
    // Check for Quota Limit (429) or other API errors to provide fallback
    // We can now use 'level' here because it is defined in the outer scope
    if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('503')) {
      console.log(`Quota/API Error limit reached. Serving fallback text for level: ${level}`)
      
      let fallbackText = ''
      
      switch (level) {
        case 'Beginner':
            fallbackText = 'time person year way day thing man world life hand part child eye woman place work week case point government company number group problem fact be have do say get make go know take see come think look want give use find tell ask work seem feel try leave call'
            break
        case 'Intermediate':
            fallbackText = 'The quick brown fox jumps over the lazy dog. Programming is the art of telling another human what one wants the computer to do. The only way to do great work is to love what you do. If you can dream it, you can do it.'
            break
        case 'Advanced':
            fallbackText = 'To be, or not to be, that is the question: whether \'tis nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles and by opposing end them? To die: to sleep; no more; and by a sleep to say we end the heart-ache and the thousand natural shocks that flesh is heir to.'
            break
         default:
            fallbackText = 'The quick brown fox jumps over the lazy dog.'
      }

       return NextResponse.json({ 
         text: fallbackText,
         isFallback: true 
       })
    }

    return NextResponse.json(
      { error: 'Failed to generate text.' },
      { status: 500 }
    )
  }
}