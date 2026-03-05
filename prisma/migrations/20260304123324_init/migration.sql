/*
  Warnings:

  - The values [OWNER,CLIENT] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `colorTheme` on the `Restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `active` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `pointsCost` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `restaurantId` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Reward` table. All the data in the column will be lost.
  - You are about to drop the `Client` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Coupon` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PointRule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RewardRedemption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StampTransaction` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[appName]` on the table `Restaurant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[urlSlug]` on the table `Restaurant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ownerId]` on the table `Restaurant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `appName` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `urlSlug` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `loyaltyProgramId` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pointsRequired` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Reward` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Made the column `password` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('RESTAURANT_OWNER', 'CUSTOMER', 'ADMIN');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'RESTAURANT_OWNER';
COMMIT;

-- DropForeignKey
ALTER TABLE "Client" DROP CONSTRAINT "Client_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "Client" DROP CONSTRAINT "Client_userId_fkey";

-- DropForeignKey
ALTER TABLE "Coupon" DROP CONSTRAINT "Coupon_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "PointRule" DROP CONSTRAINT "PointRule_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "Reward" DROP CONSTRAINT "Reward_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "RewardRedemption" DROP CONSTRAINT "RewardRedemption_clientId_fkey";

-- DropForeignKey
ALTER TABLE "RewardRedemption" DROP CONSTRAINT "RewardRedemption_rewardId_fkey";

-- DropForeignKey
ALTER TABLE "StampTransaction" DROP CONSTRAINT "StampTransaction_clientId_fkey";

-- DropForeignKey
ALTER TABLE "StampTransaction" DROP CONSTRAINT "StampTransaction_restaurantId_fkey";

-- AlterTable
ALTER TABLE "Restaurant" DROP COLUMN "colorTheme",
DROP COLUMN "phone",
ADD COLUMN     "appName" TEXT NOT NULL,
ADD COLUMN     "backgroundPattern" TEXT,
ADD COLUMN     "howToUse" TEXT,
ADD COLUMN     "openingHours" JSONB,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "qrCode" TEXT,
ADD COLUMN     "revenueSettings" JSONB,
ADD COLUMN     "socialMedia" JSONB,
ADD COLUMN     "termsConditions" TEXT,
ADD COLUMN     "theme" JSONB,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "urlSlug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Reward" DROP COLUMN "active",
DROP COLUMN "expiresAt",
DROP COLUMN "pointsCost",
DROP COLUMN "restaurantId",
DROP COLUMN "title",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "loyaltyProgramId" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "pointsRequired" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "password" SET NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'RESTAURANT_OWNER';

-- DropTable
DROP TABLE "Client";

-- DropTable
DROP TABLE "Coupon";

-- DropTable
DROP TABLE "PointRule";

-- DropTable
DROP TABLE "RewardRedemption";

-- DropTable
DROP TABLE "StampTransaction";

-- CreateTable
CREATE TABLE "LoyaltyProgram" (
    "id" TEXT NOT NULL,
    "spendThreshold" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "pointsEarned" INTEGER NOT NULL DEFAULT 1,
    "autoPushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "restaurantId" TEXT NOT NULL,

    CONSTRAINT "LoyaltyProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerProfile" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "stamps" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastVisit" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,

    CONSTRAINT "CustomerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Visit" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DOUBLE PRECISION NOT NULL,
    "pointsEarned" INTEGER NOT NULL,
    "stampsEarned" INTEGER NOT NULL DEFAULT 0,
    "customerId" TEXT NOT NULL,

    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EarnedReward" (
    "id" TEXT NOT NULL,
    "rewardId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "customerId" TEXT NOT NULL,

    CONSTRAINT "EarnedReward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LoyaltyProgram_restaurantId_key" ON "LoyaltyProgram"("restaurantId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerProfile_customerId_key" ON "CustomerProfile"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerProfile_userId_key" ON "CustomerProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_appName_key" ON "Restaurant"("appName");

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_urlSlug_key" ON "Restaurant"("urlSlug");

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_ownerId_key" ON "Restaurant"("ownerId");

-- AddForeignKey
ALTER TABLE "LoyaltyProgram" ADD CONSTRAINT "LoyaltyProgram_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerProfile" ADD CONSTRAINT "CustomerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerProfile" ADD CONSTRAINT "CustomerProfile_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "CustomerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_loyaltyProgramId_fkey" FOREIGN KEY ("loyaltyProgramId") REFERENCES "LoyaltyProgram"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EarnedReward" ADD CONSTRAINT "EarnedReward_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "CustomerProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EarnedReward" ADD CONSTRAINT "EarnedReward_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES "Reward"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
