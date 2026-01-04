// src/presentation/store/dto/store-view.dto.ts


export interface StoreViewDto {
  id: string;
  centerId: string;
  name: string;
  city: string;
  postalCode: string;
  status: string;
  phone?: string;
  contactName?: string;

  // 👇 NOUVEAU
  primaryImageUrl?: string;
}
