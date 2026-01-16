import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      isAdmin: true,
    },
  })

  console.log('✅ Admin user created:', admin.username)

  // Create sample tabs
  const personalTab = await prisma.tab.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Kişisel',
      position: 1,
    },
  })

  const workTab = await prisma.tab.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'İş',
      position: 2,
    },
  })

  console.log('✅ Tabs created')

  // Create sample pages
  const dailyPage = await prisma.page.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Günlük Notlar',
      position: 1,
      tabId: personalTab.id,
    },
  })

  const ideasPage = await prisma.page.upsert({
    where: { id: 2 },
    update: {},
    create: {
      name: 'Fikirler',
      position: 2,
      tabId: personalTab.id,
    },
  })

  const projectsPage = await prisma.page.upsert({
    where: { id: 3 },
    update: {},
    create: {
      name: 'Projeler',
      position: 1,
      tabId: workTab.id,
    },
  })

  console.log('✅ Pages created')

  // Create sample entries
  await prisma.entry.create({
    data: {
      title: 'İlk Günlük Girişim',
      content: '<p>Bu benim Next.js ile oluşturduğum modern günlük uygulamamın ilk girdisi! 🎉</p><p>Artık düşüncelerimi daha modern ve güvenli bir şekilde kaydedebileceğim.</p>',
      isPublic: true,
      pageId: dailyPage.id,
    },
  })

  await prisma.entry.create({
    data: {
      title: 'Yeni Proje Fikirleri',
      content: '<p><strong>Proje İdea Listesi:</strong></p><ul><li>AI destekli kişisel asistan</li><li>Blockchain tabanlı doğrulama sistemi</li><li>IoT ev otomasyon platformu</li></ul>',
      isPublic: false,
      pageId: ideasPage.id,
    },
  })

  await prisma.entry.create({
    data: {
      title: 'Q1 Hedefleri',
      content: '<p>Bu çeyrek için belirlediğim hedefler:</p><ol><li>Yeni müşteri kazanımı: +50</li><li>Ürün geliştirme tamamlama oranı: %80</li><li>Takım büyütme: 5 yeni üye</li></ol>',
      isPublic: false,
      pageId: projectsPage.id,
    },
  })

  console.log('✅ Sample entries created')
  console.log('🎉 Database seeded successfully!')
  console.log('\n📝 Login credentials:')
  console.log('   Username: admin')
  console.log('   Password: admin123')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
