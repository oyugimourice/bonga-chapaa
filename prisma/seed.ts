
import { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting seed...')

    // ==================== SETTINGS ====================
    console.log('\n📋 Seeding Settings...')
    const settings = await prisma.settings.upsert({
        where: { id: 'default' },
        update: {},
        create: {
            id: 'default',
            userRate: new Decimal('0.20'), // Cash per point to user
            safaricomRate: new Decimal('0.30'), // Cash per point from Safaricom
            emailNotifications: true,
            lowFloatWarning: true,
            lowFloatThreshold: new Decimal('10000'),
            notificationEmail: process.env.BREVO_SENDER_EMAIL || 'noreply@bongachapaa.com',
        },
    })
    console.log(`✅ Settings initialized with rates - User: ${settings.userRate}, Safaricom: ${settings.safaricomRate}`)

    // ==================== USERS ====================
    console.log('\n👤 Seeding Users...')
    
    // Main test user
    const user = await prisma.user.upsert({
        where: { phoneNumber: '254712345678' },
        update: {},
        create: {
            phoneNumber: '254712345678',
            name: 'Test User',
            totalPoints: new Decimal('5000'),
        },
    })
    console.log(`✅ Created/Found user: ${user.name} (${user.phoneNumber})`)

    // Admin user
    const adminUser = await prisma.user.upsert({
        where: { phoneNumber: '254700314150' },
        update: {},
        create: {
            phoneNumber: '254700314150',
            name: 'System Admin',
            totalPoints: new Decimal('0'),
        },
    })
    console.log(`✅ Created/Found admin: ${adminUser.name} (${adminUser.phoneNumber})`)

    // Additional test users
    const testUser2 = await prisma.user.upsert({
        where: { phoneNumber: '254722123456' },
        update: {},
        create: {
            phoneNumber: '254722123456',
            name: 'Demo User 2',
            totalPoints: new Decimal('2500'),
        },
    })
    console.log(`✅ Created/Found user: ${testUser2.name} (${testUser2.phoneNumber})`)


    // ==================== TRANSACTIONS ====================
    console.log('\n💰 Seeding Transactions...')
    const transactions = [
        {
            mpesaReceiptNumber: 'QW12345678',
            amount: 1000,
            payout: 300,
            payoutStatus: 'COMPLETED' as const,
            date: new Date(),
            userId: user.id,
        },
        {
            mpesaReceiptNumber: 'QW87654321',
            amount: 500,
            payout: 150,
            payoutStatus: 'PENDING' as const,
            date: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
            userId: user.id,
        },
        {
            mpesaReceiptNumber: 'QW11223344',
            amount: 2000,
            payout: 600,
            payoutStatus: 'FAILED' as const,
            date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            userId: user.id,
        },
        {
            mpesaReceiptNumber: 'QW55667788',
            amount: 750,
            payout: 225,
            payoutStatus: 'PROCESSING' as const,
            date: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
            userId: testUser2.id,
        },
    ]

    for (const tx of transactions) {
        const exists = await prisma.transaction.findUnique({
            where: { mpesaReceiptNumber: tx.mpesaReceiptNumber }
        });

        if (!exists) {
            await prisma.transaction.create({
                data: {
                    userId: tx.userId,
                    mpesaReceiptNumber: tx.mpesaReceiptNumber,
                    phoneNumber: (tx.userId === user.id) ? user.phoneNumber : testUser2.phoneNumber,
                    pointsPaid: new Decimal(tx.amount),
                    equivalentCash: new Decimal(tx.amount * 0.3),
                    payoutAmount: new Decimal(tx.payout),
                    serviceFee: new Decimal((tx.amount * 0.3) - tx.payout),
                    payoutStatus: tx.payoutStatus,
                    rawCallbackData: {
                        transactionType: 'C2B',
                        timestamp: tx.date,
                    },
                    createdAt: tx.date
                }
            });
            console.log(`✅ Created transaction: ${tx.mpesaReceiptNumber} [${tx.payoutStatus}]`);
        } else {
            console.log(`⚠️ Transaction ${tx.mpesaReceiptNumber} already exists. Skipping.`);
        }
    }

    // ==================== TOKEN STORE ====================
    console.log('\n🔐 Seeding TokenStore...')
    const tokenStore = await prisma.tokenStore.upsert({
        where: { id: 'daraja_token' },
        update: {
            expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        },
        create: {
            id: 'daraja_token',
            accessToken: 'placeholder_token_will_be_refreshed_on_first_api_call',
            expiresAt: new Date(Date.now() - 1), // Expired, will refresh on next API call
        },
    })
    console.log(`✅ TokenStore initialized (will refresh on first API call)`)

    console.log('\n✅ Seed completed successfully!')
    console.log('📊 Summary:')
    console.log(`   - Settings: 1 record`)
    console.log(`   - Users: 3 records`)
    console.log(`   - Transactions: ${transactions.length} records`)
    console.log(`   - TokenStore: 1 record`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
