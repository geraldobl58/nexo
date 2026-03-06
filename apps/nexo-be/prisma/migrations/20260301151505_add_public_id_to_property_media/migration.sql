/*
  Warnings:

  - Added the required column `publicId` to the `PropertyMedia` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PropertyMedia" ADD COLUMN     "publicId" TEXT NOT NULL;
