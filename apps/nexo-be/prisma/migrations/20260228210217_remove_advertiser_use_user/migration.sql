/*
  Warnings:

  - You are about to drop the column `advertiserId` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `advertiserId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `advertiserId` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `advertiserId` on the `PropertyBoost` table. All the data in the column will be lost.
  - You are about to drop the column `advertiserId` on the `Report` table. All the data in the column will be lost.
  - You are about to drop the column `advertiserId` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the `Advertiser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `Conversation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `PropertyBoost` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_advertiserId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_advertiserId_fkey";

-- DropForeignKey
ALTER TABLE "Property" DROP CONSTRAINT "Property_advertiserId_fkey";

-- DropForeignKey
ALTER TABLE "PropertyBoost" DROP CONSTRAINT "PropertyBoost_advertiserId_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_advertiserId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_advertiserId_fkey";

-- DropIndex
DROP INDEX "Conversation_advertiserId_idx";

-- DropIndex
DROP INDEX "Property_advertiserId_idx";

-- DropIndex
DROP INDEX "PropertyBoost_advertiserId_idx";

-- DropIndex
DROP INDEX "Report_advertiserId_idx";

-- DropIndex
DROP INDEX "Review_advertiserId_idx";

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "advertiserId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "advertiserId",
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Property" DROP COLUMN "advertiserId";

-- AlterTable
ALTER TABLE "PropertyBoost" DROP COLUMN "advertiserId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "advertiserId",
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "advertiserId",
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "advertiserType" "AdvertiserType";

-- DropTable
DROP TABLE "Advertiser";

-- CreateIndex
CREATE INDEX "Conversation_userId_idx" ON "Conversation"("userId");

-- CreateIndex
CREATE INDEX "PropertyBoost_userId_idx" ON "PropertyBoost"("userId");

-- CreateIndex
CREATE INDEX "Report_userId_idx" ON "Report"("userId");

-- CreateIndex
CREATE INDEX "Review_userId_idx" ON "Review"("userId");

-- AddForeignKey
ALTER TABLE "PropertyBoost" ADD CONSTRAINT "PropertyBoost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
