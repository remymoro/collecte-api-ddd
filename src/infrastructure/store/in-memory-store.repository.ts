// // src/infrastructure/store/in-memory-store.repository.ts

// import type { StoreRepository, StoreFilters } from '@domain/store/store.repository';
// import { Store } from '@domain/store/store.entity';
// import { StoreNotFoundError } from '@domain/store/errors';

// export class InMemoryStoreRepository implements StoreRepository {
//   private stores: Map<string, Store> = new Map();

//   async save(store: Store): Promise<void> {
//     this.stores.set(store.id, store);
//   }

//   async findById(id: string): Promise<Store> {
//     const store = this.stores.get(id);
//     if (!store) {
//       throw new StoreNotFoundError(id);
//     }
//     return store;
//   }

//   async findAll(filters?: StoreFilters): Promise<Store[]> {
//     let stores = Array.from(this.stores.values());

//     if (filters?.centerId) {
//       stores = stores.filter((s) => s.centerId === filters.centerId);
//     }

//     if (filters?.city) {
//       stores = stores.filter((s) => s.city === filters.city);
//     }

//     if (filters?.status) {
//       stores = stores.filter((s) => s.status === filters.status);
//     }

//     if (filters?.statusIn) {
//       stores = stores.filter((s) => filters.statusIn!.includes(s.status));
//     }

//     return stores.sort((a, b) => {
//       // Tri par status, puis city, puis name
//       if (a.status !== b.status) {
//         return a.status.localeCompare(b.status);
//       }
//       if (a.city !== b.city) {
//         return a.city.localeCompare(b.city);
//       }
//       return a.name.localeCompare(b.name);
//     });
//   }

//   async findByCenterIdAndAddress(
//     centerId: string,
//     address: string,
//     city: string,
//     postalCode: string,
//   ): Promise<Store | null> {
//     const store = Array.from(this.stores.values()).find(
//       (s) =>
//         s.centerId === centerId &&
//         s.address === address &&
//         s.city === city &&
//         s.postalCode === postalCode,
//     );

//     return store || null;
//   }

//   // Helper pour les tests
//   clear(): void {
//     this.stores.clear();
//   }
// }
