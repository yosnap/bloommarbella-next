import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const email = url.searchParams.get('email')
    
    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user,
      roleInfo: {
        isCustomer: user.role === 'CUSTOMER',
        isAssociate: user.role === 'ASSOCIATE',
        isAdmin: user.role === 'ADMIN'
      }
    })
  } catch (error) {
    console.error('Error checking user:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { email, role } = await request.json()

    if (!email || !role) {
      return NextResponse.json({ error: 'Email and role required' }, { status: 400 })
    }

    if (!['CUSTOMER', 'ASSOCIATE', 'ADMIN'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Update user role in database
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true
      }
    })

    return NextResponse.json({
      message: 'Role updated successfully',
      user: updatedUser,
      note: 'User needs to sign out and sign back in to see the changes'
    })
  } catch (error) {
    console.error('Error updating user role:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}