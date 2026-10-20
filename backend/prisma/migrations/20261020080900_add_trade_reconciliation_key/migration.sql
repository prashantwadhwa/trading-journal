/*
  Warnings:

  - A unique constraint covering the columns `[userId,reconciliationKey]` on the table `Trade` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Trade" ADD COLUMN     "reconciliationKey" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Trade_userId_reconciliationKey_key" ON "Trade"("userId", "reconciliationKey");
