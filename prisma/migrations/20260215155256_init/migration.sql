-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REVERSED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "name" TEXT,
    "totalPoints" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mpesaReceiptNumber" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "pointsPaid" DECIMAL(10,2) NOT NULL,
    "equivalentCash" DECIMAL(10,2) NOT NULL,
    "payoutAmount" DECIMAL(10,2) NOT NULL,
    "serviceFee" DECIMAL(10,2) NOT NULL,
    "payoutStatus" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "b2cConversationId" TEXT,
    "b2cOriginatorId" TEXT,
    "rawCallbackData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phoneNumber_key" ON "User"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_mpesaReceiptNumber_key" ON "Transaction"("mpesaReceiptNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_b2cConversationId_key" ON "Transaction"("b2cConversationId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_b2cOriginatorId_key" ON "Transaction"("b2cOriginatorId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
