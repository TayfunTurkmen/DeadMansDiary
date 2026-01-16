import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.user.update({
      where: { id: parseInt(session.user.id) },
      data: { lastCheckin: new Date() },
    })

    return NextResponse.json({ message: 'Check-in successful' })
  } catch (error) {
    console.error('Error during checkin:', error)
    return NextResponse.json({ error: 'Check-in failed' }, { status: 500 })
  }
}
