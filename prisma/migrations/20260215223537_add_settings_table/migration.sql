-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "lowFloatWarning" BOOLEAN NOT NULL DEFAULT true,
    "lowFloatThreshold" DECIMAL(10,2) NOT NULL DEFAULT 10000,
    "notificationEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);
