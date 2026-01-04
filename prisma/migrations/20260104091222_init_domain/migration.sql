-- CreateEnum
CREATE TYPE "EntryStatus" AS ENUM ('EN_COURS', 'VALIDEE');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'BENEVOLE');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('PLANIFIEE', 'EN_COURS', 'TERMINEE', 'CLOTUREE', 'ANNULEE');

-- CreateEnum
CREATE TYPE "StoreStatus" AS ENUM ('DISPONIBLE', 'INDISPONIBLE', 'FERME');

-- CreateEnum
CREATE TYPE "CampaignStoreAuthorizationStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "gracePeriodEndDate" TIMESTAMP(3) NOT NULL,
    "status" "CampaignStatus" NOT NULL DEFAULT 'PLANIFIEE',
    "objectives" TEXT,
    "description" TEXT,
    "createdBy" TEXT NOT NULL,
    "closedBy" TEXT,
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Center" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Center_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "phone" TEXT,
    "contactName" TEXT,
    "status" "StoreStatus" NOT NULL DEFAULT 'DISPONIBLE',
    "images" JSONB NOT NULL DEFAULT '[]',
    "statusChangedAt" TIMESTAMP(3),
    "statusChangedBy" TEXT,
    "statusReason" TEXT,
    "centerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignStoreAuthorization" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "status" "CampaignStoreAuthorizationStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignStoreAuthorization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollecteEntry" (
    "id" TEXT NOT NULL,
    "status" "EntryStatus" NOT NULL DEFAULT 'EN_COURS',
    "totalKg" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "campaignId" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "centerId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "validatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validatedAt" TIMESTAMP(3),

    CONSTRAINT "CollecteEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CollecteEntryItem" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "productRef" TEXT NOT NULL,
    "family" TEXT NOT NULL,
    "subFamily" TEXT,
    "weightKg" DECIMAL(10,3) NOT NULL,

    CONSTRAINT "CollecteEntryItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "reference" TEXT NOT NULL,
    "family" TEXT NOT NULL,
    "subFamily" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("reference")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "centerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_year_key" ON "Campaign"("year");

-- CreateIndex
CREATE INDEX "Campaign_status_idx" ON "Campaign"("status");

-- CreateIndex
CREATE INDEX "Campaign_startDate_idx" ON "Campaign"("startDate");

-- CreateIndex
CREATE INDEX "Campaign_endDate_idx" ON "Campaign"("endDate");

-- CreateIndex
CREATE INDEX "Center_city_idx" ON "Center"("city");

-- CreateIndex
CREATE INDEX "Center_isActive_idx" ON "Center"("isActive");

-- CreateIndex
CREATE INDEX "Store_centerId_idx" ON "Store"("centerId");

-- CreateIndex
CREATE INDEX "Store_city_idx" ON "Store"("city");

-- CreateIndex
CREATE INDEX "Store_status_idx" ON "Store"("status");

-- CreateIndex
CREATE INDEX "CampaignStoreAuthorization_campaignId_idx" ON "CampaignStoreAuthorization"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignStoreAuthorization_storeId_idx" ON "CampaignStoreAuthorization"("storeId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignStoreAuthorization_campaignId_storeId_key" ON "CampaignStoreAuthorization"("campaignId", "storeId");

-- CreateIndex
CREATE INDEX "CollecteEntry_campaignId_idx" ON "CollecteEntry"("campaignId");

-- CreateIndex
CREATE INDEX "CollecteEntry_storeId_idx" ON "CollecteEntry"("storeId");

-- CreateIndex
CREATE INDEX "CollecteEntry_centerId_idx" ON "CollecteEntry"("centerId");

-- CreateIndex
CREATE INDEX "CollecteEntry_status_idx" ON "CollecteEntry"("status");

-- CreateIndex
CREATE INDEX "CollecteEntryItem_entryId_idx" ON "CollecteEntryItem"("entryId");

-- CreateIndex
CREATE INDEX "CollecteEntryItem_productRef_idx" ON "CollecteEntryItem"("productRef");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_centerId_idx" ON "User"("centerId");

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_closedBy_fkey" FOREIGN KEY ("closedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "Center"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignStoreAuthorization" ADD CONSTRAINT "CampaignStoreAuthorization_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignStoreAuthorization" ADD CONSTRAINT "CampaignStoreAuthorization_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollecteEntry" ADD CONSTRAINT "CollecteEntry_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollecteEntry" ADD CONSTRAINT "CollecteEntry_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollecteEntry" ADD CONSTRAINT "CollecteEntry_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "Center"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollecteEntry" ADD CONSTRAINT "CollecteEntry_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollecteEntry" ADD CONSTRAINT "CollecteEntry_validatedBy_fkey" FOREIGN KEY ("validatedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollecteEntryItem" ADD CONSTRAINT "CollecteEntryItem_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "CollecteEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "Center"("id") ON DELETE SET NULL ON UPDATE CASCADE;
