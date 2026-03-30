-- Create BonusRequest table
CREATE TABLE "BonusRequest" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "proofName" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectedReason" TEXT,

    CONSTRAINT "BonusRequest_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "BonusRequest" ADD CONSTRAINT "BonusRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "CustomerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "BonusRequest" ADD CONSTRAINT "BonusRequest_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add bonus stars columns to Restaurant if they don't exist
ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "googleMapsBonusStars" INTEGER DEFAULT 50;
ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "facebookBonusStars" INTEGER DEFAULT 50;
ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "instagramBonusStars" INTEGER DEFAULT 50;
ALTER TABLE "Restaurant" ADD COLUMN IF NOT EXISTS "twitterBonusStars" INTEGER DEFAULT 50;