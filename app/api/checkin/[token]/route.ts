import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'secret_checkin_token' },
    })

    if (!setting || setting.value !== params.token) {
      return new NextResponse('Not found', { status: 404 })
    }

    await prisma.user.updateMany({
      where: { isAdmin: true },
      data: { lastCheckin: new Date() },
    })

    return new NextResponse(`
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Check-in Başarılı</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
          }
          .success-box {
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(10px);
            padding: 60px;
            border-radius: 24px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          }
          .success-box h1 {
            color: #10b981;
            font-size: 64px;
            margin: 0 0 24px 0;
          }
          .success-box p {
            color: #1e293b;
            font-size: 24px;
            margin: 0;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="success-box">
          <h1>✅</h1>
          <p>Check-in Başarılı!</p>
          <p style="font-size: 18px; margin-top: 12px; color: #64748b;">
            Günlüğünüz 30 gün daha özel kalacak.
          </p>
        </div>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' },
    })
  } catch (error) {
    console.error('Error during checkin:', error)
    return new NextResponse('Error', { status: 500 })
  }
}
