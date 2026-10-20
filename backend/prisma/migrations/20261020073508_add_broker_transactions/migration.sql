-- CreateTable
CREATE TABLE "BrokerTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceTradeId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "isin" TEXT,
    "exchange" TEXT,
    "segment" TEXT,
    "series" TEXT,
    "side" "TradeSide" NOT NULL,
    "quantity" DECIMAL(18,8) NOT NULL,
    "price" DECIMAL(18,8) NOT NULL,
    "executedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrokerTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BrokerTransaction_userId_isin_executedAt_idx" ON "BrokerTransaction"("userId", "isin", "executedAt");

-- CreateIndex
CREATE UNIQUE INDEX "BrokerTransaction_userId_sourceTradeId_key" ON "BrokerTransaction"("userId", "sourceTradeId");

-- AddForeignKey
ALTER TABLE "BrokerTransaction" ADD CONSTRAINT "BrokerTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
