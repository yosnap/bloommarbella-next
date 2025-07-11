import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    
    // Extract form fields
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const companyName = formData.get('companyName') as string
    const taxId = formData.get('taxId') as string
    const phone = formData.get('phone') as string
    const address = formData.get('address') as string
    const city = formData.get('city') as string
    const postalCode = formData.get('postalCode') as string
    const documentType = formData.get('documentType') as string
    const document = formData.get('document') as File

    // Validate required fields
    if (!email || !password || !name || !companyName || !taxId || !document) {
      return NextResponse.json(
        { message: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Ya existe un usuario con este email' },
        { status: 400 }
      )
    }

    // Check if tax ID already exists in requests
    const existingRequest = await prisma.associateRequest.findFirst({
      where: { taxId },
    })

    if (existingRequest) {
      return NextResponse.json(
        { message: 'Ya existe una solicitud con este CIF/NIF' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'documents')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory already exists
    }

    // Save the document
    const bytes = await document.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = path.extname(document.name)
    const filename = `associate_${timestamp}_${Math.random().toString(36).substring(7)}${fileExtension}`
    const filepath = path.join(uploadsDir, filename)
    
    await writeFile(filepath, buffer)
    
    // Document URL (relative to public folder)
    const documentUrl = `/uploads/documents/${filename}`

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user and associate request in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user with CUSTOMER role initially
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'CUSTOMER', // Will be changed to ASSOCIATE when approved
        },
      })

      // Create associate request
      const associateRequest = await tx.associateRequest.create({
        data: {
          userId: user.id,
          companyName,
          taxId,
          phone,
          address,
          city,
          postalCode,
          documentType: documentType as any,
          documentUrl,
        },
      })

      return { user, associateRequest }
    })

    // TODO: Send notification email to admins
    // TODO: Send confirmation email to user

    return NextResponse.json(
      { 
        message: 'Solicitud de asociado enviada exitosamente',
        requestId: result.associateRequest.id 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Associate registration error:', error)
    return NextResponse.json(
      { message: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}