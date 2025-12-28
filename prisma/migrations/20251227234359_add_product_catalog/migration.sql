/*
  Warnings:

  - Changed the type of `status` on the `CollecteEntry` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "EntryStatus" AS ENUM ('EN_COURS', 'VALIDEE');

-- AlterTable
ALTER TABLE "CollecteEntry" DROP COLUMN "status",
ADD COLUMN     "status" "EntryStatus" NOT NULL;

-- CreateIndex
CREATE INDEX "CollecteEntryItem_entryId_idx" ON "CollecteEntryItem"("entryId");
