-- CreateTable
CREATE TABLE "CollecteEntry" (
    "id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "totalKg" DECIMAL(10,3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validatedAt" TIMESTAMP(3),

    CONSTRAINT "CollecteEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollecteEntryItem" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "productRef" TEXT NOT NULL,
    "weightKg" DECIMAL(10,3) NOT NULL,

    CONSTRAINT "CollecteEntryItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CollecteEntryItem" ADD CONSTRAINT "CollecteEntryItem_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "CollecteEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;
