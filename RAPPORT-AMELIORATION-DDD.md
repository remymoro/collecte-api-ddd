# 📋 AUDIT DDD LIGHT - RAPPORT D'AMÉLIORATION

**Date :** 8 janvier 2026  
**Projet :** collecte-api  
**Statut global :** ✅ Architecture conforme DDD Light avec améliorations

---

## ✅ CE QUI EST DÉJÀ EXCELLENT

### 1. **Architecture en couches propre**
```
domain/        → Pur TypeScript, ZÉRO dépendance NestJS/Prisma ✅
application/   → Use cases avec orchestration ✅
infrastructure/ → Implémentation Prisma/mappeurs ✅
presentation/  → Controllers NestJS minimalistes ✅
```

**Pourquoi c'est bien :** Permet de changer d'ORM (remplacer Prisma par TypeORM) sans toucher au métier.

---

### 2. **Entities riches avec comportements**

#### `Center` ✅
```typescript
center.activate()      // Méthode métier
center.deactivate()    // Transitions d'état
center.assertActive()  // Protection d'invariant
```

**Règle métier protégée :** Un center inactif est en lecture seule.

#### `Campaign` ✅
```typescript
campaign.start()     // Machine à états
campaign.complete()  // Transitions validées
campaign.close()     // Logique de clôture
```

**Règle métier protégée :** Transitions de statut strictes (PLANIFIEE → EN_COURS → TERMINEE → CLOTUREE).

#### `Store` ✅
```typescript
store.markAsUnavailable(userId, reason)
store.close(userId, reason)
store.addImage(url, isPrimary)
```

**Règle métier protégée :** Un store fermé ne peut plus être modifié.

---

### 3. **Value Objects présents**

#### `Weight` ✅
```typescript
const weight = Weight.from(5.3);  // Arrondit à 6 kg
weight.valueKg  // 6 (immuable)
```

**Protection :** Refuse poids ≤ 0, arrondit automatiquement.

#### `StoreImage` ✅
```typescript
const image = StoreImage.create(url, isPrimary);
// Validation HTTPS obligatoire
```

**Protection :** URL valide + HTTPS uniquement.

---

### 4. **Erreurs métier typées** ✅

```typescript
throw new CenterNotFoundError(centerId);
throw new EmptyEntryError();
throw new InvalidCampaignPeriodError();
```

Langage ubiquitaire présent, erreurs explicites.

---

## 🔧 AMÉLIORATION APPLIQUÉE : Value Object pour les IDs

### ❌ AVANT : Primitive Obsession

```typescript
// ❌ Problème : on peut mélanger les IDs
const centerId: string = "campaign-123";  // ID de campaign !
const center = await centerRepository.findById(centerId);  // Compile sans erreur
```

**Danger :** Aucune protection TypeScript, bugs silencieux possibles.

---

### ✅ APRÈS : CenterId Value Object

#### Fichier créé : `src/domain/center/value-objects/center-id.vo.ts`

```typescript
export class CenterId {
  private constructor(private readonly value: string) {}

  static generate(): CenterId {
    return new CenterId(randomUUID());
  }

  static from(id: string): CenterId {
    // Validation UUID v4
    if (!uuidPattern.test(id)) {
      throw new Error('INVALID_CENTER_ID_FORMAT');
    }
    return new CenterId(id);
  }

  toString(): string {
    return this.value;
  }

  equals(other: CenterId): boolean {
    return this.value === other.value;
  }
}
```

---

### Changements dans l'Entity

#### AVANT
```typescript
export class Center {
  private constructor(
    readonly id: string,  // ❌ Primitif
    // ...
  ) {}

  static create(props: CreateCenterProps): Center {
    return new Center(
      randomUUID(),  // ❌ Génération inline
      // ...
    );
  }
}
```

#### APRÈS
```typescript
export class Center {
  private constructor(
    readonly id: CenterId,  // ✅ Value Object
    // ...
  ) {}

  static create(props: CreateCenterProps): Center {
    return new Center(
      CenterId.generate(),  // ✅ Factory métier
      // ...
    );
  }
}
```

---

### Changements dans le Repository

#### AVANT
```typescript
export interface CenterRepository {
  findById(id: string): Promise<Center | null>;  // ❌ string brut
  delete(id: string): Promise<void>;
}
```

#### APRÈS
```typescript
export interface CenterRepository {
  findById(id: CenterId): Promise<Center | null>;  // ✅ Type fort
  delete(id: CenterId): Promise<void>;
}
```

**Bénéfice :** Impossible de passer un `campaignId` à la place d'un `centerId`.

---

### Changements dans les Use Cases

#### AVANT
```typescript
async execute(centerId: string): Promise<Center> {
  const center = await this.repository.findById(centerId);  // ❌ Validation manquante
  // ...
}
```

#### APRÈS
```typescript
async execute(centerId: string): Promise<Center> {
  const id = CenterId.from(centerId);  // ✅ Validation + conversion
  const center = await this.repository.findById(id);
  // ...
}
```

**Bénéfice :** Validation UUID dès l'entrée du use case.

---

### Changements dans les Controllers

#### AVANT
```typescript
async getOne(@Param('id') id: string) {
  const center = await this.getCenter.execute(id);

  return {
    id: center.id,  // ❌ Retourne CenterId (erreur JSON)
    // ...
  };
}
```

#### APRÈS
```typescript
async getOne(@Param('id') id: string) {
  const center = await this.getCenter.execute(id);

  return {
    id: center.id.toString(),  // ✅ Conversion explicite
    // ...
  };
}
```

**Bénéfice :** Séparation claire domain (CenterId) vs. présentation (string JSON).

---

## 🎯 BÉNÉFICES DE CETTE AMÉLIORATION

### 1. **Type Safety**
```typescript
// ✅ Erreur de compilation immédiate
const campaignId = CampaignId.generate();
await centerRepository.findById(campaignId);  // ❌ Erreur TypeScript
```

### 2. **Validation centralisée**
```typescript
// ✅ Toute validation d'UUID est dans le Value Object
const id = CenterId.from("invalid-uuid");  // Throw INVALID_CENTER_ID_FORMAT
```

### 3. **Sémantique métier claire**
```typescript
// ❌ AVANT : Flou
function doSomething(centerId: string, storeId: string) { }

// ✅ APRÈS : Explicite
function doSomething(centerId: CenterId, storeId: StoreId) { }
```

### 4. **Refactoring sûr**
Si vous changez le format d'ID (UUID → ULID), vous ne changez QUE le Value Object.

---

## 📝 RECOMMANDATIONS POUR LA SUITE

### 🟡 PRIORITÉ 1 : Appliquer aux autres entités

Créer les mêmes Value Objects pour :
- `CampaignId`
- `StoreId`
- `UserId`
- `ProductId`
- `CollecteEntryId`

**Pourquoi :** Même protection partout, cohérence architecturale.

---

### 🟡 PRIORITÉ 2 : Value Objects pour autres primitifs sensibles

#### Email
```typescript
export class Email {
  private constructor(private readonly value: string) {}

  static from(email: string): Email {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('INVALID_EMAIL_FORMAT');
    }
    return new Email(email.toLowerCase().trim());
  }

  toString(): string {
    return this.value;
  }
}
```

**Utilisation :** `User` entity avec `email: Email` au lieu de `email: string`.

#### PostalCode (France)
```typescript
export class PostalCode {
  private constructor(private readonly value: string) {}

  static from(code: string): PostalCode {
    const frenchPostalCodeRegex = /^[0-9]{5}$/;
    if (!frenchPostalCodeRegex.test(code)) {
      throw new Error('INVALID_POSTAL_CODE_FORMAT');
    }
    return new PostalCode(code);
  }

  toString(): string {
    return this.value;
  }
}
```

**Utilisation :** `Center.postalCode: PostalCode`, `Store.postalCode: PostalCode`.

---

### 🟢 PRIORITÉ 3 : Affiner les erreurs métier

#### Actuellement
```typescript
throw new Error('INVALID_CENTER_ID_FORMAT');  // ❌ Error générique
```

#### Recommandation
```typescript
// domain/center/errors/invalid-center-id.error.ts
export class InvalidCenterIdError extends DomainError {
  readonly code = 'INVALID_CENTER_ID';

  constructor(id: string) {
    super(`Invalid center ID format: "${id}"`);
  }
}
```

**Pourquoi :** Cohérence avec les autres erreurs métier, meilleure traçabilité.

---

### 🔵 OPTIONNEL : Domain Services si logique inter-entities

#### Cas d'usage
Si vous avez de la logique métier qui implique **plusieurs entités**, créer un Domain Service.

**Exemple :** Vérifier si un bénévole peut créer une collecte.

```typescript
// domain/collecte/services/collecte-authorization.service.ts
export class CollecteAuthorizationService {
  canBenevoleCreateEntry(
    benevole: User,
    campaign: Campaign,
    store: Store,
  ): boolean {
    // ✅ Logique métier multi-entités
    if (benevole.role !== UserRole.BENEVOLE) {
      return false;
    }

    if (campaign.status !== CampaignStatus.EN_COURS) {
      return false;
    }

    if (store.isClosed()) {
      return false;
    }

    if (benevole.centerId !== store.centerId) {
      return false;  // Règle : même centre
    }

    return true;
  }
}
```

**Utilisation dans un Use Case :**
```typescript
const authService = new CollecteAuthorizationService();

if (!authService.canBenevoleCreateEntry(user, campaign, store)) {
  throw new UnauthorizedCollecteCreationError();
}
```

**Attention :** À utiliser **seulement si nécessaire** (YAGNI). Si la logique tient dans une entity, la garder là.

---

## 🚫 CE QU'IL NE FAUT PAS FAIRE

### ❌ Pas de Domain Events (trop complexe)
```typescript
// ❌ NE PAS FAIRE
campaign.close();
this.eventBus.publish(new CampaignClosedEvent(campaign.id));
```

**Pourquoi pas :** DDD Light = pragmatique. Les events ajoutent de la complexité inutile ici.

**Alternative :** Appeler directement les use cases dépendants si besoin.

---

### ❌ Pas de CQRS
```typescript
// ❌ NE PAS FAIRE
class GetCampaignQuery { }
class GetCampaignQueryHandler { }
```

**Pourquoi pas :** Votre modèle lecture = modèle écriture. CQRS n'apporte rien ici.

**Alternative :** Use cases simples comme actuellement.

---

### ❌ Pas de Specifications Pattern
```typescript
// ❌ NE PAS FAIRE
class ActiveCampaignSpecification {
  isSatisfiedBy(campaign: Campaign): boolean { }
}
```

**Pourquoi pas :** Over-engineering. Vos règles métier sont simples.

**Alternative :** Méthodes sur l'entity (`campaign.isActive()`).

---

### ❌ Pas d'Aggregate Root ultra-strict
```typescript
// ❌ NE PAS FAIRE
// Interdire l'accès direct à campaign.stores, forcer campaign.addStore()
```

**Pourquoi pas :** Votre domaine n'a pas de relations parent/enfant complexes.

**Alternative :** Relations gérées par repositories comme actuellement.

---

## 📊 CHECKLIST FINALE AVANT LIVRAISON

### Domain Layer ✅
- [x] Entities avec comportements (pas d'anémie)
- [x] Value Objects pour concepts métier (Weight, StoreImage, CenterId)
- [x] Erreurs métier typées
- [x] ZÉRO dépendance infra (pas de Prisma, NestJS)
- [ ] Value Objects pour tous les IDs (à faire)
- [ ] Value Objects pour Email, PostalCode (optionnel)

### Application Layer ✅
- [x] Use cases simples et lisibles
- [x] Orchestration uniquement (pas de logique métier)
- [x] Validation des entrées
- [x] Gestion des erreurs métier

### Infrastructure Layer ✅
- [x] Repositories implémentés avec Prisma
- [x] Mappers domain ↔ persistence
- [x] Aucune fuite vers le domain

### Presentation Layer ✅
- [x] Controllers minimalistes
- [x] DTOs pour validation (class-validator)
- [x] Conversion explicite domain → JSON
- [x] Exception filters pour HTTP

---

## 🎓 CONCLUSION

**Votre projet est déjà très bien structuré !** 🎉

Les changements appliqués (CenterId Value Object) corrigent le seul anti-pattern critique : la **primitive obsession sur les IDs**.

### Prochaines étapes recommandées

1. **Court terme (critique)** : Appliquer le même pattern aux autres entités (Campaign, Store, User, etc.)
2. **Moyen terme (amélioration)** : Value Objects pour Email, PostalCode
3. **Long terme (optionnel)** : Domain Services si logique inter-entities complexe

### Règle d'or DDD Light

> **"Ajouter de la complexité uniquement si elle protège le métier."**

Si une abstraction ne protège aucune règle métier → ne pas la faire (YAGNI).

---

**Bon courage pour la finalisation ! 🚀**
