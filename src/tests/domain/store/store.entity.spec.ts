import { Store } from '@domain/store/store.entity';
import { StoreStatus } from '@domain/store/enums/store-status.enum';
import { CannotModifyClosedStoreError } from '@domain/store/errors/cannot-modify-closed-store.error';
import { StoreImageNotFoundError } from '@domain/store/errors/store-image-not-found.error';

describe('Store (Invariants métier)', () => {
  it('un magasin nouvellement créé démarre avec le statut ACTIF (DISPONIBLE)', () => {
    // Arrange
    const centerId = 'center-1';

    // Act
    const store = Store.create(
      centerId,
      'Magasin 1',
      '1 rue de Paris',
      'Paris',
      '75001',
    );

    // Assert
    expect(store.status).toBe(StoreStatus.DISPONIBLE);
  });

  it('toute tentative de modification d’un magasin fermé lève une erreur métier (type)', () => {
    // Arrange
    const store = Store.create(
      'center-1',
      'Magasin 1',
      '1 rue de Paris',
      'Paris',
      '75001',
    );
    store.close('user-1', 'Fermeture définitive');

    // Act & Assert
    expect(() =>
      store.updateInfo(
        'Magasin 1 (nouveau nom)',
        '2 rue de Paris',
        'Paris',
        '75002',
      ),
    ).toThrow(CannotModifyClosedStoreError);
  });

  it('la fermeture fige l’état du magasin (aucune mutation après échec de modification)', () => {
    // Arrange
    const store = Store.create(
      'center-1',
      'Magasin 1',
      '1 rue de Paris',
      'Paris',
      '75001',
    );
    store.close('user-1', 'Fermeture définitive');

    const snapshot = {
      name: store.name,
      address: store.address,
      city: store.city,
      postalCode: store.postalCode,
    };

    // Act
    try {
      store.updateInfo(
        'Magasin 1 (nouveau nom)',
        '2 rue de Paris',
        'Paris',
        '75002',
      );
    } catch {
      // ignore
    }

    // Assert
    expect(store.name).toBe(snapshot.name);
    expect(store.address).toBe(snapshot.address);
    expect(store.city).toBe(snapshot.city);
    expect(store.postalCode).toBe(snapshot.postalCode);
  });

  it('un magasin indisponible peut être réactivé et redevenir utilisable', () => {
    // Arrange
    const store = Store.create(
      'center-1',
      'Magasin 1',
      '1 rue de Paris',
      'Paris',
      '75001',
    );

    store.markAsUnavailable('user-1', 'Travaux');
    expect(store.status).toBe(StoreStatus.INDISPONIBLE);
    expect(store.isAvailableForCollection()).toBe(false);

    // Act
    store.markAsAvailable('user-2');

    // Assert
    expect(store.status).toBe(StoreStatus.DISPONIBLE);
    expect(store.isAvailableForCollection()).toBe(true);
  });

  it('ajouter une image fonctionne', () => {
    // Arrange
    const store = Store.create(
      'center-1',
      'Magasin 1',
      '1 rue de Paris',
      'Paris',
      '75001',
    );
    const imageUrl = 'https://example.com/store-1/image-1.jpg';

    // Act
    store.addImage(imageUrl);

    // Assert
    expect(store.images).toHaveLength(1);
    expect(store.images[0].url).toBe(imageUrl);
  });

  it('un magasin ne peut avoir qu’une seule image principale à la fois', () => {
    // Arrange
    const store = Store.create(
      'center-1',
      'Magasin 1',
      '1 rue de Paris',
      'Paris',
      '75001',
    );
    const url1 = 'https://example.com/store-1/image-1.jpg';
    const url2 = 'https://example.com/store-1/image-2.jpg';

    store.addImage(url1, true);
    store.addImage(url2, true);

    // Act
    const primary = store.primaryImage;
    const primaryCount = store.images.filter((img) => img.isPrimary).length;

    // Assert
    expect(primary).toBeDefined();
    expect(primary!.url).toBe(url2);
    expect(primaryCount).toBe(1);
  });

  it('définir une image inconnue comme principale est interdit (erreur métier)', () => {
    // Arrange
    const store = Store.create(
      'center-1',
      'Magasin 1',
      '1 rue de Paris',
      'Paris',
      '75001',
    );

    // Act & Assert
    expect(() =>
      store.setPrimaryImage('https://example.com/store-1/unknown.jpg'),
    ).toThrow(StoreImageNotFoundError);
  });
});
