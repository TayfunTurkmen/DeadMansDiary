import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const TabSchema = z.object({
  name: z.string().min(1).max(100),
  position: z.number().int().min(0),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tabs = await prisma.tab.findMany({
      orderBy: { position: 'asc' }
    })

    return NextResponse.json(tabs)
  } catch (error) {
    console.error('Error fetching tabs:', error)
    return NextResponse.json({ error: 'Failed to fetch tabs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const validated = TabSchema.parse(body)

    const tab = await prisma.tab.create({
      data: validated
    })

    return NextResponse.json(tab, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error('Error creating tab:', error)
    return NextResponse.json({ error: 'Failed to create tab' }, { status: 500 })
  }
}
