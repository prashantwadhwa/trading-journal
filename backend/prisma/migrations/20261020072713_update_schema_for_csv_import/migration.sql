-- CreateEnum
CREATE TYPE "PositionStatus" AS ENUM ('OPEN', 'CLOSED');

-- AlterTable
ALTER TABLE "Trade" ADD COLUMN     "exchange" TEXT,
ADD COLUMN     "importSource" TEXT,
ADD COLUMN     "isin" TEXT,
ADD COLUMN     "positionStatus" "PositionStatus" NOT NULL DEFAULT 'OPEN',
ADD COLUMN     "segment" TEXT,
ADD COLUMN     "series" TEXT;

-- CreateIndex
CREATE INDEX "Trade_userId_positionStatus_idx" ON "Trade"("userId", "positionStatus");
