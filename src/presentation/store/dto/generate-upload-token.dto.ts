// src/presentation/store/dto/generate-upload-token.dto.ts

import { IsNotEmpty, IsString, IsNumber, Max, IsIn } from 'class-validator';

/**
 * DTO : Demande de génération d'un SAS token pour upload direct Azure
 *
 * SÉCURITÉ :
 * ❌ INTERDIT : fileName (contrôlé par le client non fiable)
 * ✅ OBLIGATOIRE : fileSize et mimeType (validation backend)
 *
 * Le backend génère le nom de fichier (UUID + extension validée)
 */
export class GenerateUploadTokenDto {
  /**
   * Taille du fichier en bytes
   * Max : 5MB (5 * 1024 * 1024 bytes)
   */
  @IsNumber()
  @IsNotEmpty()
  @Max(5 * 1024 * 1024, { message: 'File size must not exceed 5MB' })
  fileSize: number;

  /**
   * Type MIME du fichier
   * Whitelist stricte : image/jpeg, image/png, image/webp
   */
  @IsString()
  @IsNotEmpty()
  @IsIn(['image/jpeg', 'image/png', 'image/webp'], {
    message: 'Only JPEG, PNG and WebP images are allowed',
  })
  mimeType: string;
}
