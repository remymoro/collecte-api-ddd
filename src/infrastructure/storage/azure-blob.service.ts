// src/infrastructure/storage/azure-blob.service.ts

import { Injectable } from '@nestjs/common';
import {
  BlobServiceClient,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  StorageSharedKeyCredential,
} from '@azure/storage-blob';
import { ConfigService } from '@nestjs/config';

/**
 * Service Azure Blob Storage (Adapter Infrastructure)
 *
 * Responsabilités :
 * - Génération de SAS Tokens sécurisés
 * - Construction d'URLs de blobs
 * - Suppression de blobs (futur)
 *
 * ❌ Jamais utilisé directement par le domaine
 * ✅ Uniquement injecté dans les use cases d'upload
 */
@Injectable()
export class AzureBlobService {
  private blobServiceClient: BlobServiceClient;
  private containerName: string;
  private accountName: string;
  private accountKey: string;

  constructor(private configService: ConfigService) {
    this.accountName = this.configService.get<string>(
      'AZURE_STORAGE_ACCOUNT_NAME',
    )!;
    this.accountKey = this.configService.get<string>(
      'AZURE_STORAGE_ACCOUNT_KEY',
    )!;
    this.containerName = this.configService.get<string>(
      'AZURE_STORAGE_CONTAINER_NAME',
      'stores',
    )!;

    const connectionString = `DefaultEndpointsProtocol=https;AccountName=${this.accountName};AccountKey=${this.accountKey};EndpointSuffix=core.windows.net`;
    this.blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
  }

  /**
   * Générer un SAS Token pour upload sécurisé
   *
   * Sécurité :
   * - Write-only (permission 'w')
   * - Expiration courte (5-10 minutes)
   * - Spécifique à un blob
   */
  async generateUploadSasToken(
    blobName: string,
    expiryMinutes: number = 5,
  ): Promise<string> {
    const sharedKeyCredential = new StorageSharedKeyCredential(
      this.accountName,
      this.accountKey,
    );

    const sasOptions = {
      containerName: this.containerName,
      blobName,
      permissions: BlobSASPermissions.parse('w'), // Write-only
      startsOn: new Date(),
      expiresOn: new Date(Date.now() + expiryMinutes * 60 * 1000),
    };

    return generateBlobSASQueryParameters(
      sasOptions,
      sharedKeyCredential,
    ).toString();
  }

  /**
   * Obtenir l'URL complète d'un blob
   */
  getBlobUrl(blobName: string): string {
    return `https://${this.accountName}.blob.core.windows.net/${this.containerName}/${blobName}`;
  }

  /**
   * Supprimer un blob (futur : pour nettoyage)
   */
  async deleteBlob(blobName: string): Promise<void> {
    const containerClient =
      this.blobServiceClient.getContainerClient(this.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.delete();
  }

  /**
   * Extraire le nom du blob depuis une URL complète
   */
  extractBlobNameFromUrl(url: string): string | null {
    try {
      const parsed = new URL(url);
      const pathParts = parsed.pathname.split('/');
      // Format: /container/path/to/blob.jpg
      if (pathParts.length >= 3 && pathParts[1] === this.containerName) {
        return pathParts.slice(2).join('/');
      }
      return null;
    } catch {
      return null;
    }
  }
}
