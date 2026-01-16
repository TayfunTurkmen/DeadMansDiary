import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const [totalEntries, totalTabs, totalPages, admin] = await Promise.all([
      prisma.entry.count(),
      prisma.tab.count(),
      prisma.page.count(),
      prisma.user.findFirst({ where: { isAdmin: true } }),
    ])

    return NextResponse.json({
      totalEntries,
      totalTabs,
      totalPages,
      lastCheckin: admin?.lastCheckin || new Date(),
    })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
