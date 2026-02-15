import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verify() {
    console.log('🔍 Verifying BongaChapaa Admin Setup...\n')

    try {
        // Test database connection
        await prisma.$connect()
        console.log('✅ Database connection successful')

        // Check for admin user
        const adminCount = await prisma.user.count()
        console.log(`✅ Users in database: ${adminCount}`)

        // Check for transactions
        const txCount = await prisma.transaction.count()
        console.log(`✅ Transactions in database: ${txCount}`)

        if (txCount > 0) {
            const statuses = await prisma.transaction.groupBy({
                by: ['payoutStatus'],
                _count: true
            })
            console.log('\n📊 Transaction Status Breakdown:')
            statuses.forEach(s => {
                console.log(`   ${s.payoutStatus}: ${s._count}`)
            })
        }

        // Check environment variables
        console.log('\n🔐 Admin Credentials:')
        console.log(`   Username: ${process.env.ADMIN_USER || '⚠️  NOT SET (using default "admin")'}`)
        console.log(`   Password: ${process.env.ADMIN_PASSWORD ? '✅ SET' : '⚠️  NOT SET (using default "admin")'}`)

        console.log('\n💰 Business Configuration:')
        console.log(`   User Payout Rate: ${process.env.USER_PAYOUT_RATE || '⚠️  NOT SET'}`)
        console.log(`   Safaricom Rate: ${process.env.SAFARICOM_PAYOUT_RATE || '⚠️  NOT SET'}`)

        console.log('\n✅ Admin setup verification complete!')
        console.log('\n📝 Next steps:')
        console.log('   1. Run: npm run dev')
        console.log('   2. Visit: http://localhost:3000/admin')
        console.log(`   3. Login with: ${process.env.ADMIN_USER || 'admin'} / ${process.env.ADMIN_PASSWORD || 'admin'}`)

    } catch (error) {
        console.error('\n❌ Verification failed:', error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

verify()
