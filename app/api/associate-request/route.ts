import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const request = await prisma.associateRequest.findUnique({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        companyName: true,
        taxId: true,
        phone: true,
        address: true,
        city: true,
        postalCode: true,
        documentType: true,
        status: true,
        rejectionReason: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ request })
  } catch (error) {
    console.error('Error fetching associate request:', error)
    return NextResponse.json(
      { message: 'Error al obtener la solicitud' },
      { status: 500 }
    )
  }
}