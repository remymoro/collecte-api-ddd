// // src/infrastructure/campaign/in-memory-campaign.repository.ts

// import type { CampaignRepository, CampaignFilters } from '@domain/campaign/campaign.repository';
// import { Campaign } from '@domain/campaign/campaign.entity';
// import { CampaignStatus } from '@domain/campaign/enums/campaign-status.enum';
// import { CampaignNotFoundError } from '@domain/campaign/errors/campaign-not-found.error';

// export class InMemoryCampaignRepository implements CampaignRepository {
 
//   private campaigns: Map<string, Campaign> = new Map();

//   async create(campaign: Campaign): Promise<void> {
//     this.campaigns.set(campaign.id, campaign);
//   }

//   async update(campaign: Campaign): Promise<void> {
//     // For tests, update behaves as upsert to keep things simple.
//     this.campaigns.set(campaign.id, campaign);
//   }

//   async findById(id: string): Promise<Campaign> {
//     const campaign = this.campaigns.get(id);
//     if (!campaign) {
//       throw new CampaignNotFoundError(id);
//     }
//     return campaign;
//   }

//   async findAll(filters?: CampaignFilters): Promise<Campaign[]> {
//     let campaigns = Array.from(this.campaigns.values());

//     if (filters?.year) {
//       campaigns = campaigns.filter((c) => c.year === filters.year);
//     }

//     if (filters?.status) {
//       campaigns = campaigns.filter((c) => c.status === filters.status);
//     }

//     if (filters?.statusIn) {
//       campaigns = campaigns.filter((c) => filters.statusIn!.includes(c.status));
//     }

//     return campaigns.sort((a, b) => {
//       // Tri par année décroissante, puis date de début décroissante
//       if (a.year !== b.year) {
//         return b.year - a.year;
//       }
//       return b.startDate.getTime() - a.startDate.getTime();
//     });
//   }

//   async findActiveCampaign(): Promise<Campaign | null> {
//     const now = new Date();

//     const campaigns = Array.from(this.campaigns.values()).filter(
//       (c) =>
//         (c.status === CampaignStatus.EN_COURS ||
//           c.status === CampaignStatus.TERMINEE) &&
//         c.startDate <= now &&
//         c.gracePeriodEndDate >= now,
//     );

//     if (campaigns.length === 0) {
//       return null;
//     }

//     // Retourner la plus récente
//     return campaigns.sort(
//       (a, b) => b.startDate.getTime() - a.startDate.getTime(),
//     )[0];
//   }

//   async findActiveCampaignForCenter(): Promise<Campaign | null> {
//     const now = new Date();

//     // Pour les tests in-memory, on simplifie : on retourne la campagne active
//     // sans vérifier les autorisations de magasins (qui nécessiteraient un autre repository)
//     const campaigns = Array.from(this.campaigns.values()).filter(
//       (c) =>
//         (c.status === CampaignStatus.EN_COURS ||
//           c.gracePeriodEndDate >= now),
//     );

//     if (campaigns.length === 0) {
//       return null;
//     }

//     // Retourner la plus récente
//     return campaigns.sort(
//       (a, b) => b.startDate.getTime() - a.startDate.getTime(),
//     )[0];
//   }

//   async delete(id: string): Promise<void> {
//     this.campaigns.delete(id);
//   }

//   // Helper pour les tests
//   clear(): void {
//     this.campaigns.clear();
//   }
// }