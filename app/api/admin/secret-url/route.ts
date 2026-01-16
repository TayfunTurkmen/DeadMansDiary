import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import crypto from 'crypto'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let setting = await prisma.setting.findUnique({
      where: { key: 'secret_checkin_token' },
    })

    if (!setting) {
      const token = crypto.randomBytes(32).toString('hex')
      setting = await prisma.setting.create({
        data: {
          key: 'secret_checkin_token',
          value: token,
        },
      })
    }

    const url = `${process.env.NEXTAUTH_URL}/api/checkin/${setting.value}`
    return NextResponse.json({ url })
  } catch (error) {
    console.error('Error getting secret URL:', error)
    return NextResponse.json({ error: 'Failed to get secret URL' }, { status: 500 })
  }
}
