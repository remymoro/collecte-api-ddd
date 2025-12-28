-- Add Product catalog
CREATE TABLE IF NOT EXISTS "Product" (
  "reference" TEXT NOT NULL,
  "family" TEXT NOT NULL,
  "subFamily" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Product_pkey" PRIMARY KEY ("reference")
);

-- Snapshot fields on CollecteEntryItem
ALTER TABLE "CollecteEntryItem" ADD COLUMN IF NOT EXISTS "family" TEXT NOT NULL DEFAULT '';
ALTER TABLE "CollecteEntryItem" ADD COLUMN IF NOT EXISTS "subFamily" TEXT;

-- Remove the default after backfill (Prisma expects required without default)
ALTER TABLE "CollecteEntryItem" ALTER COLUMN "family" DROP DEFAULT;
