// src/domain/store/enums/store-status.enum.ts

export enum StoreStatus {
  DISPONIBLE = 'DISPONIBLE',     // Ouvert ET accepte les collectes
  INDISPONIBLE = 'INDISPONIBLE', // Ouvert MAIS n'accepte PAS les collectes
  FERME = 'FERME',               // Fermé définitivement
}