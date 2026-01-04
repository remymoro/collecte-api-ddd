import { CampaignRepository } from "@domain/campaign/campaign.repository";
import { CAMPAIGN_REPOSITORY } from "@domain/campaign/campaign.tokens";
import { StoreRepository } from "@domain/store/store.repository";
import { STORE_REPOSITORY } from "@domain/store/store.tokens";
import { UserRepository } from "@domain/user/user.repository";
import { USER_REPOSITORY } from "@domain/user/user.tokens";
import { Injectable, Inject } from "@nestjs/common";






export interface GetAvailableStoresForBenevoleInput {
  userId: string;
}
export interface AvailableStoreDto {
  id: string;
  name: string;
  campaignId: string;
  imageUrl?: string;
}


export interface GetAvailableStoresForBenevoleOutput {
  stores: AvailableStoreDto[];
}


@Injectable()
export class GetAvailableStoresForBenevoleUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,

    @Inject(CAMPAIGN_REPOSITORY)
    private readonly campaignRepository: CampaignRepository,

    @Inject(STORE_REPOSITORY)
    private readonly storeRepository: StoreRepository,
  ) {}

  async execute(
    input: GetAvailableStoresForBenevoleInput,
  ): Promise<GetAvailableStoresForBenevoleOutput> {
    // 1️⃣ Charger le bénévole
    const user = await this.userRepository.findById(input.userId);

    if (!user || !user.centerId) {
      return { stores: [] };
    }

    // 2️⃣ Vérifier qu’une campagne accepte les saisies
    const campaign =
      await this.campaignRepository.findCampaignAcceptingEntriesForCenter(
        user.centerId,
      );

    if (!campaign) {
      return { stores: [] };
    }

    // 3️⃣ Récupérer les magasins disponibles pour ce centre et cette campagne
    const stores =
      await this.storeRepository.findAvailableForCampaignAndCenter(
        campaign.id,
        user.centerId,
      );

    // 4️⃣ Mapping DTO
  return {
  stores: stores.map((store) => ({
    id: store.id,
    name: store.name,
    campaignId: campaign.id,
    imageUrl: store.images.find((img) => img.isPrimary)?.url
      ?? store.images[0]?.url
      ?? undefined,
  })),
};
  }
}