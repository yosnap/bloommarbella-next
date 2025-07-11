import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('DEBUG: GET request received')
  console.log('DEBUG: URL:', request.url)
  console.log('DEBUG: Method:', request.method)
  console.log('DEBUG: Headers:', Object.fromEntries(request.headers.entries()))
  
  return NextResponse.json({ 
    success: true, 
    message: 'Debug endpoint working',
    url: request.url,
    method: request.method,
    timestamp: new Date().toISOString()
  })
}

export async function POST(request: NextRequest) {
  console.log('DEBUG: POST request received')
  return NextResponse.json({ 
    success: true, 
    message: 'Debug POST endpoint working',
    timestamp: new Date().toISOString()
  })
}