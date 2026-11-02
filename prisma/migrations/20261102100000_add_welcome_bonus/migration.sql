-- AlterTable
ALTER TABLE "LoyaltyProgram" ADD COLUMN "welcomeBonusPoints" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "welcomeBonusActive" BOOLEAN NOT NULL DEFAULT false;
