/*
  Warnings:

  - You are about to drop the column `roles` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_roles_idx";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "roles",
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'SUPPORT';

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");
