import { NextRequest, NextResponse } from 'next/server'
import { translateProductTags } from '@/lib/translations/dynamic-translator'

export async function POST(req: NextRequest) {
  try {
    const { tags } = await req.json()
    
    if (!tags || !Array.isArray(tags)) {
      return NextResponse.json(
        { error: 'Tags array is required' },
        { status: 400 }
      )
    }
    
    const translatedTags = await translateProductTags(tags)
    
    return NextResponse.json({ translatedTags })
  } catch (error) {
    console.error('Error translating tags:', error)
    return NextResponse.json(
      { error: 'Failed to translate tags' },
      { status: 500 }
    )
  }
}