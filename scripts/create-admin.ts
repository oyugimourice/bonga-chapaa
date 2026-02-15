import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔧 Creating admin user...')

    const admin = await prisma.user.upsert({
        where: { phoneNumber: '254712345678' },
        update: {
            name: 'System Admin',
        },
        create: {
            phoneNumber: '254712345678',
            name: 'System Admin',
            totalPoints: 0
        },
    })

    console.log(`✅ Admin user ready: ${admin.name} (${admin.phoneNumber})`)
    console.log(`📝 Use these credentials to login:`)
    console.log(`   Username: ${process.env.ADMIN_USER || 'admin'}`)
    console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'admin'}`)
}

main()
    .catch((e) => {
        console.error('❌ Error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
