import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const requests = await prisma.associateRequest.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('Error fetching associate requests:', error)
    return NextResponse.json(
      { message: 'Error al obtener las solicitudes' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { requestId, action, rejectionReason } = await request.json()

    if (!requestId || !action) {
      return NextResponse.json(
        { message: 'Datos requeridos: requestId, action' },
        { status: 400 }
      )
    }

    if (!['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json(
        { message: 'Acción inválida' },
        { status: 400 }
      )
    }

    // Get the associate request
    const associateRequest = await prisma.associateRequest.findUnique({
      where: { id: requestId },
      include: {
        user: true
      }
    })

    if (!associateRequest) {
      return NextResponse.json(
        { message: 'Solicitud no encontrada' },
        { status: 404 }
      )
    }

    if (associateRequest.status !== 'PENDING') {
      return NextResponse.json(
        { message: 'Esta solicitud ya ha sido procesada' },
        { status: 400 }
      )
    }

    if (action === 'APPROVE') {
      // Update user role to ASSOCIATE and approve request
      await prisma.$transaction([
        prisma.user.update({
          where: { id: associateRequest.userId },
          data: { role: 'ASSOCIATE' }
        }),
        prisma.associateRequest.update({
          where: { id: requestId },
          data: { 
            status: 'APPROVED',
            updatedAt: new Date()
          }
        })
      ])

      return NextResponse.json({
        message: 'Solicitud aprobada exitosamente',
        user: associateRequest.user.email
      })
    } else {
      // Reject the request
      await prisma.associateRequest.update({
        where: { id: requestId },
        data: { 
          status: 'REJECTED',
          rejectionReason: rejectionReason || 'Sin motivo especificado',
          updatedAt: new Date()
        }
      })

      return NextResponse.json({
        message: 'Solicitud rechazada',
        user: associateRequest.user.email
      })
    }
  } catch (error) {
    console.error('Error processing associate request:', error)
    return NextResponse.json(
      { message: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}