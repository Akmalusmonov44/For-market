-- AlterEnum
ALTER TYPE "PaymentType" ADD VALUE 'QARZ';

-- CreateTable
CREATE TABLE "Debt" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "saleId" TEXT,
    "mijozIsmi" TEXT NOT NULL,
    "mijozTelefon" TEXT,
    "summa" DECIMAL(14,2) NOT NULL,
    "toLanganSumma" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "izoh" TEXT,
    "sana" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Debt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Debt_storeId_createdAt_idx" ON "Debt"("storeId", "createdAt");

-- AddForeignKey
ALTER TABLE "Debt" ADD CONSTRAINT "Debt_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Debt" ADD CONSTRAINT "Debt_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale"("id") ON DELETE SET NULL ON UPDATE CASCADE;
