
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting seed...')

    // Create or connect User (Admin/Test User)
    const user = await prisma.user.upsert({
        where: { phoneNumber: '254712345678' },
        update: {},
        create: {
            phoneNumber: '254712345678',
            name: 'Admin User',
            totalPoints: 5000,
        },
    })

    console.log(`👤 Created/Found user: ${user.name} (${user.phoneNumber})`)

    // Create Dummy Transactions
    const transactions = [
        {
            mpesaReceiptNumber: 'QW12345678',
            amount: 1000,
            payout: 300,
            status: 'COMPLETED' as const,
            date: new Date(),
        },
        {
            mpesaReceiptNumber: 'QW87654321',
            amount: 500,
            payout: 150,
            status: 'PENDING' as const,
            date: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
        },
        {
            mpesaReceiptNumber: 'QW11223344',
            amount: 2000,
            payout: 600,
            status: 'FAILED' as const,
            date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        }
    ]

    for (const tx of transactions) {
        const exists = await prisma.transaction.findUnique({
            where: { mpesaReceiptNumber: tx.mpesaReceiptNumber }
        });

        if (!exists) {
            await prisma.transaction.create({
                data: {
                    userId: user.id,
                    mpesaReceiptNumber: tx.mpesaReceiptNumber,
                    phoneNumber: user.phoneNumber,
                    pointsPaid: tx.amount,
                    equivalentCash: tx.amount * 0.3, // Assuming 0.3 rate
                    payoutAmount: tx.payout,
                    serviceFee: (tx.amount * 0.3) - tx.payout,
                    payoutStatus: tx.status,
                    createdAt: tx.date
                }
            });
            console.log(`✅ Created transaction: ${tx.mpesaReceiptNumber} [${tx.status}]`);
        } else {
            console.log(`⚠️ Transaction ${tx.mpesaReceiptNumber} already exists. Skipping.`);
        }
    }

    console.log('✅ Seed completed successfully!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
