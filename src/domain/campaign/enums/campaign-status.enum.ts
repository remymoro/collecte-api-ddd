// src/domain/campaign/enums/campaign-status.enum.ts

export enum CampaignStatus {
  PLANIFIEE = 'PLANIFIEE',   // Créée, pas encore commencée
  EN_COURS = 'EN_COURS',     // Période officielle en cours
  TERMINEE = 'TERMINEE',     // Période officielle terminée (tolérance en cours)
  CLOTUREE = 'CLOTUREE',     // Clôturée définitivement
  ANNULEE = 'ANNULEE',       // Annulée
}