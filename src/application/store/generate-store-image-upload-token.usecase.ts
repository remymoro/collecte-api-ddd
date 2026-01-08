// src/application/store/generate-store-image-upload-token.usecase.ts

import { Inject, Injectable } from '@nestjs/common';
import { AZURE_BLOB_SERVICE } from '@infrastructure/storage/storage.tokens';
import type { AzureBlobService } from '@infrastructure/storage/azure-blob.service';
import { STORE_REPOSITORY } from '@domain/store/store.tokens';
import type { StoreRepository } from '@domain/store/store.repository';
import crypto from 'crypto';
import type { CenterRepository } from '@domain/center/center.repository';
import { CENTER_REPOSITORY } from '@domain/center/center.tokens';
import { CenterNotFoundError } from '@domain/center/errors';
import { StoreId } from '@domain/store/value-objects/store-id.vo';
import { CenterId } from '@domain/center/value-objects/center-id.vo';

export interface GenerateStoreImageUploadTokenInput {
  storeId: string;
  fileSize: number;
  mimeType: string;
}

export interface GenerateStoreImageUploadTokenOutput {
  uploadUrl: string;
  publicUrl: string;
  expiresAt: Date;
}

/**
 * Use Case : Générer un token d'upload sécurisé pour une image Store
 *
 * Flux :
 * 1. Frontend envoie fileSize + mimeType (validés par DTO)
 * 2. Backend GÉNÈRE le nom de fichier (UUID + extension)
 * 3. Backend vérifie que le Store existe
 * 4. Backend génère un SAS Token temporaire (write-only, 5 min)
 * 5. Frontend upload DIRECTEMENT sur Azure avec uploadUrl
 * 6. Frontend enregistre publicUrl via AddStoreImageUseCase
 *
 * Sécurité :
 * ✅ Nom de fichier contrôlé par le backend (UUID)
 * ✅ Validation MIME stricte (jpeg/png/webp)
 * ✅ Validation taille max (5MB)
 * ✅ Vérification Store existe
 * ✅ SAS write-only, blob-specific, courte durée
 * ✅ Pas d'exposition du SAS token brut dans la réponse
 */
@Injectable()
export class GenerateStoreImageUploadTokenUseCase {
  constructor(
    @Inject(AZURE_BLOB_SERVICE)
    private readonly azureBlobService: AzureBlobService,
    @Inject(STORE_REPOSITORY)
    private readonly storeRepository: StoreRepository,

    @Inject(CENTER_REPOSITORY)
    private readonly centerRepository: CenterRepository,
  ) {}

  async execute(
    input: GenerateStoreImageUploadTokenInput,
  ): Promise<GenerateStoreImageUploadTokenOutput> {
    // 1. Vérifier que le Store existe (sécurité : pas de SAS pour stores inexistants)
    const store = await this.storeRepository.findById(StoreId.from(input.storeId));

    // 1.b Vérifier que le Center du store est actif (center inactif = lecture seule)
    const center = await this.centerRepository.findById(CenterId.from(store.centerId));
    if (!center) {
      throw new CenterNotFoundError(store.centerId);
    }
    center.assertActive();

    // 2. Générer un nom de fichier sécurisé (UUID + extension)
    const fileExtension = this.getFileExtension(input.mimeType);
    const fileName = `${crypto.randomUUID()}${fileExtension}`;

    // 3. Construire le blob path (storeId/fileName)
    const blobName = `${input.storeId}/${fileName}`;

    // 4. Générer le SAS token (write-only, 5 minutes)
    const sasToken =
      await this.azureBlobService.generateUploadSasToken(blobName, 5);

    // 5. Construire les URLs
    const publicUrl = this.azureBlobService.getBlobUrl(blobName);
    const uploadUrl = `${publicUrl}?${sasToken}`;

    return {
      uploadUrl, // URL avec SAS (pour upload direct frontend)
      publicUrl, // URL sans SAS (pour enregistrement en base)
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    };
  }

  /**
   * Mapping MIME type → extension de fichier
   *
   * SÉCURITÉ : Whitelist stricte
   * - Seuls les types validés par le DTO sont autorisés
   * - Pas de extension arbitraire
   */
  private getFileExtension(mimeType: string): string {
    const mimeToExtension: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
    };

    const extension = mimeToExtension[mimeType];

    if (!extension) {
      throw new Error(`Unsupported MIME type: ${mimeType}`);
    }

    return extension;
  }
}
