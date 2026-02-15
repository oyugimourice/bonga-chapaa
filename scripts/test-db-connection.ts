import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testConnection() {
    console.log('🔌 Testing database connection...\n')

    try {
        // Test connection
        await prisma.$connect()
        console.log('✅ Database connection successful!')

        // Test query
        const result = await prisma.$queryRaw`SELECT 1 as test`
        console.log('✅ Query test successful:', result)

        // Check tables
        const userCount = await prisma.user.count()
        const txCount = await prisma.transaction.count()

        console.log('\n📊 Database Status:')
        console.log(`   Users: ${userCount}`)
        console.log(`   Transactions: ${txCount}`)

        console.log('\n✅ All connection tests passed!')

    } catch (error) {
        console.error('\n❌ Connection test failed!')
        console.error('Error:', error)

        if (error instanceof Error) {
            if (error.message.includes("Can't reach database server")) {
                console.log('\n💡 Troubleshooting steps:')
                console.log('   1. Check if your Neon database is active (may be paused)')
                console.log('   2. Visit https://console.neon.tech and wake up your database')
                console.log('   3. Verify DATABASE_URL in .env is correct')
                console.log('   4. Check your internet connection')
            }
        }

        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

testConnection()
