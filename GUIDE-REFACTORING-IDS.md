# 🛠️ GUIDE PRATIQUE - Appliquer CenterId Pattern aux autres entités

## 🎯 Objectif

Créer des Value Objects pour tous les IDs d'entités afin d'éliminer la primitive obsession.

---

## 📋 CHECKLIST DES ENTITÉS À TRAITER

- [x] ✅ **Center** → `CenterId` (FAIT)
- [ ] 🟡 **Campaign** → `CampaignId` (À FAIRE - PRIORITÉ 1)
- [ ] 🟡 **Store** → `StoreId` (À FAIRE - PRIORITÉ 1)
- [ ] 🟡 **User** → `UserId` (À FAIRE - PRIORITÉ 1)
- [ ] 🟡 **Product** → `ProductId` (À FAIRE - PRIORITÉ 2)
- [ ] 🟡 **CollecteEntry** → `CollecteEntryId` (À FAIRE - PRIORITÉ 2)

---

## 📝 TEMPLATE À SUIVRE

### Étape 1 : Créer le Value Object

**Fichier** : `src/domain/{entity}/value-objects/{entity}-id.vo.ts`

```typescript
import { randomUUID } from 'crypto';

/**
 * Value Object : Identifiant unique d'un {Entity}
 *
 * Protège contre la primitive obsession :
 * - Type fort (pas de mélange avec d'autres IDs)
 * - Validation du format UUID
 * - Génération sécurisée
 */
export class {Entity}Id {
  private constructor(private readonly value: string) {}

  /**
   * Génère un nouvel ID pour création métier
   */
  static generate(): {Entity}Id {
    return new {Entity}Id(randomUUID());
  }

  /**
   * Reconstruit un ID existant (depuis DB, URL, etc.)
   */
  static from(id: string): {Entity}Id {
    if (!id || !id.trim()) {
      throw new Error('{ENTITY}_ID_REQUIRED');
    }

    // Validation UUID v4
    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidPattern.test(id.trim())) {
      throw new Error('INVALID_{ENTITY}_ID_FORMAT');
    }

    return new {Entity}Id(id.trim());
  }

  /**
   * Retourne la valeur brute (pour persistence, URLs, etc.)
   */
  toString(): string {
    return this.value;
  }

  /**
   * Égalité par valeur
   */
  equals(other: {Entity}Id): boolean {
    return this.value === other.value;
  }
}
```

**Remplacer** :
- `{Entity}` → Nom de l'entité (Campaign, Store, User, etc.)
- `{ENTITY}` → Nom en MAJUSCULES (CAMPAIGN, STORE, USER, etc.)

---

### Étape 2 : Modifier l'Entity

#### AVANT
```typescript
import { randomUUID } from 'crypto';

export class {Entity} {
  private constructor(
    readonly id: string,  // ❌ À remplacer
    // ... autres props
  ) {}

  static create(props: Create{Entity}Props): {Entity} {
    return new {Entity}(
      randomUUID(),  // ❌ À remplacer
      // ...
    );
  }

  static rehydrate(props: Rehydrate{Entity}Props): {Entity} {
    return new {Entity}(
      props.id,  // ❌ À typer
      // ...
    );
  }
}
```

#### APRÈS
```typescript
import { {Entity}Id } from './value-objects/{entity}-id.vo';

export class {Entity} {
  private constructor(
    readonly id: {Entity}Id,  // ✅ Value Object
    // ... autres props
  ) {}

  static create(props: Create{Entity}Props): {Entity} {
    return new {Entity}(
      {Entity}Id.generate(),  // ✅ Factory métier
      // ...
    );
  }

  static rehydrate(props: Rehydrate{Entity}Props): {Entity} {
    return new {Entity}(
      props.id,  // ✅ Déjà typé dans props
      // ...
    );
  }
}

// Types à modifier
export type Rehydrate{Entity}Props = {
  id: {Entity}Id;  // ✅ Typer ici
  // ...
};
```

---

### Étape 3 : Modifier le Repository (interface)

**Fichier** : `src/domain/{entity}/{entity}.repository.ts`

#### AVANT
```typescript
export interface {Entity}Repository {
  findById(id: string): Promise<{Entity} | null>;
  delete(id: string): Promise<void>;
  // ...
}
```

#### APRÈS
```typescript
import { {Entity}Id } from './value-objects/{entity}-id.vo';

export interface {Entity}Repository {
  findById(id: {Entity}Id): Promise<{Entity} | null>;
  delete(id: {Entity}Id): Promise<void>;
  // ...
}
```

---

### Étape 4 : Modifier le Mapper

**Fichier** : `src/infrastructure/{entity}/{entity}.mapper.ts`

#### AVANT
```typescript
export class {Entity}Mapper {
  static toDomain(row: Prisma{Entity}): {Entity} {
    return {Entity}.rehydrate({
      id: row.id,  // ❌ string brut
      // ...
    });
  }

  static toPersistence(entity: {Entity}) {
    return {
      id: entity.id,  // ❌ CenterId → string
      // ...
    };
  }
}
```

#### APRÈS
```typescript
import { {Entity}Id } from '@domain/{entity}/value-objects/{entity}-id.vo';

export class {Entity}Mapper {
  static toDomain(row: Prisma{Entity}): {Entity} {
    return {Entity}.rehydrate({
      id: {Entity}Id.from(row.id),  // ✅ Conversion
      // ...
    });
  }

  static toPersistence(entity: {Entity}) {
    return {
      id: entity.id.toString(),  // ✅ Conversion explicite
      // ...
    };
  }
}
```

---

### Étape 5 : Modifier le Repository (implémentation)

**Fichier** : `src/infrastructure/{entity}/prisma-{entity}.repository.ts`

#### AVANT
```typescript
async findById(id: string): Promise<{Entity} | null> {
  const row = await this.prisma.{entity}.findUnique({
    where: { id },
  });
  // ...
}

async delete(id: string): Promise<void> {
  await this.prisma.{entity}.delete({
    where: { id },
  });
}
```

#### APRÈS
```typescript
import { {Entity}Id } from '@domain/{entity}/value-objects/{entity}-id.vo';

async findById(id: {Entity}Id): Promise<{Entity} | null> {
  const row = await this.prisma.{entity}.findUnique({
    where: { id: id.toString() },  // ✅ Conversion
  });
  // ...
}

async delete(id: {Entity}Id): Promise<void> {
  await this.prisma.{entity}.delete({
    where: { id: id.toString() },  // ✅ Conversion
  });
}
```

---

### Étape 6 : Modifier les Use Cases

**Fichier** : `src/application/{entity}/*.usecase.ts`

#### AVANT
```typescript
async execute(entityId: string): Promise<{Entity}> {
  const entity = await this.repository.findById(entityId);  // ❌ Pas de validation
  // ...
}
```

#### APRÈS
```typescript
import { {Entity}Id } from '@domain/{entity}/value-objects/{entity}-id.vo';

async execute(entityId: string): Promise<{Entity}> {
  const id = {Entity}Id.from(entityId);  // ✅ Validation + conversion
  const entity = await this.repository.findById(id);
  // ...
}
```

---

### Étape 7 : Modifier le Controller

**Fichier** : `src/presentation/{entity}/{entity}.controller.ts`

#### AVANT
```typescript
async getOne(@Param('id') id: string) {
  const entity = await this.getEntity.execute(id);

  return {
    id: entity.id,  // ❌ Retourne {Entity}Id (erreur JSON)
    // ...
  };
}
```

#### APRÈS
```typescript
async getOne(@Param('id') id: string) {
  const entity = await this.getEntity.execute(id);

  return {
    id: entity.id.toString(),  // ✅ Conversion explicite
    // ...
  };
}
```

**Astuce :** Chercher tous les `entity.id` dans le controller et ajouter `.toString()`.

---

## 🔍 COMMENT TROUVER TOUS LES FICHIERS À MODIFIER

### Commande grep (PowerShell)
```powershell
# Chercher tous les usages de l'ID dans le domaine
Select-String -Path "src/domain/{entity}/*.ts" -Pattern "id: string"

# Chercher tous les usages dans les use cases
Select-String -Path "src/application/{entity}/*.ts" -Pattern "Id: string"

# Chercher tous les usages dans le controller
Select-String -Path "src/presentation/{entity}/*.ts" -Pattern "entity.id"
```

---

## ⚡ EXEMPLE CONCRET : CampaignId

### 1. Créer le Value Object

**Fichier** : `src/domain/campaign/value-objects/campaign-id.vo.ts`

```typescript
import { randomUUID } from 'crypto';

export class CampaignId {
  private constructor(private readonly value: string) {}

  static generate(): CampaignId {
    return new CampaignId(randomUUID());
  }

  static from(id: string): CampaignId {
    if (!id || !id.trim()) {
      throw new Error('CAMPAIGN_ID_REQUIRED');
    }

    const uuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    if (!uuidPattern.test(id.trim())) {
      throw new Error('INVALID_CAMPAIGN_ID_FORMAT');
    }

    return new CampaignId(id.trim());
  }

  toString(): string {
    return this.value;
  }

  equals(other: CampaignId): boolean {
    return this.value === other.value;
  }
}
```

---

### 2. Modifier Campaign Entity

**Fichier** : `src/domain/campaign/campaign.entity.ts`

#### AVANT (ligne ~11)
```typescript
export class Campaign {
  constructor(
    private readonly _id: string,
    // ...
  ) {}
```

#### APRÈS
```typescript
import { CampaignId } from './value-objects/campaign-id.vo';

export class Campaign {
  constructor(
    private readonly _id: CampaignId,
    // ...
  ) {}
```

#### AVANT (ligne ~47, dans `create()`)
```typescript
return new Campaign(
  crypto.randomUUID(),
  name,
  // ...
);
```

#### APRÈS
```typescript
return new Campaign(
  CampaignId.generate(),
  name,
  // ...
);
```

#### AVANT (ligne ~88, dans `rehydrate()`)
```typescript
static rehydrate(props: {
  id: string;
  // ...
}): Campaign {
  return new Campaign(
    props.id,
    // ...
  );
}
```

#### APRÈS
```typescript
static rehydrate(props: {
  id: CampaignId;
  // ...
}): Campaign {
  return new Campaign(
    props.id,
    // ...
  );
}
```

#### AVANT (ligne ~30, getter)
```typescript
get id(): string {
  return this._id;
}
```

#### APRÈS
```typescript
get id(): CampaignId {
  return this._id;
}
```

---

### 3. Modifier CampaignRepository

**Fichier** : `src/domain/campaign/campaign.repository.ts`

#### AVANT
```typescript
export interface CampaignRepository {
  findById(id: string): Promise<Campaign | null>;
  delete(id: string): Promise<void>;
  // ...
}
```

#### APRÈS
```typescript
import { CampaignId } from './value-objects/campaign-id.vo';

export interface CampaignRepository {
  findById(id: CampaignId): Promise<Campaign | null>;
  delete(id: CampaignId): Promise<void>;
  // ...
}
```

---

### 4. Modifier CampaignMapper

**Fichier** : `src/infrastructure/campaign/campaign.mapper.ts`

#### AVANT
```typescript
static toDomain(row: PrismaCampaign): Campaign {
  return Campaign.rehydrate({
    id: row.id,
    // ...
  });
}

static toPersistence(campaign: Campaign) {
  return {
    id: campaign.id,
    // ...
  };
}
```

#### APRÈS
```typescript
import { CampaignId } from '@domain/campaign/value-objects/campaign-id.vo';

static toDomain(row: PrismaCampaign): Campaign {
  return Campaign.rehydrate({
    id: CampaignId.from(row.id),
    // ...
  });
}

static toPersistence(campaign: Campaign) {
  return {
    id: campaign.id.toString(),
    // ...
  };
}
```

---

### 5. Modifier PrismaCampaignRepository

**Fichier** : `src/infrastructure/campaign/prisma-campaign.repository.ts`

#### AVANT
```typescript
async findById(id: string): Promise<Campaign | null> {
  const row = await this.prisma.campaign.findUnique({
    where: { id },
  });
  // ...
}
```

#### APRÈS
```typescript
import { CampaignId } from '@domain/campaign/value-objects/campaign-id.vo';

async findById(id: CampaignId): Promise<Campaign | null> {
  const row = await this.prisma.campaign.findUnique({
    where: { id: id.toString() },
  });
  // ...
}
```

---

### 6. Modifier les Use Cases

**Fichier** : `src/application/campaign/get-campaign.usecase.ts`

#### AVANT
```typescript
async execute(campaignId: string): Promise<Campaign> {
  const campaign = await this.repository.findById(campaignId);
  // ...
}
```

#### APRÈS
```typescript
import { CampaignId } from '@domain/campaign/value-objects/campaign-id.vo';

async execute(campaignId: string): Promise<Campaign> {
  const id = CampaignId.from(campaignId);
  const campaign = await this.repository.findById(id);
  // ...
}
```

---

### 7. Modifier le Controller

**Fichier** : `src/presentation/campaign/campaign.controller.ts`

#### AVANT
```typescript
async getOne(@Param('id') id: string) {
  const campaign = await this.getCampaign.execute(id);

  return {
    id: campaign.id,  // ❌ CampaignId
    name: campaign.name,
    // ...
  };
}
```

#### APRÈS
```typescript
async getOne(@Param('id') id: string) {
  const campaign = await this.getCampaign.execute(id);

  return {
    id: campaign.id.toString(),  // ✅ string
    name: campaign.name,
    // ...
  };
}
```

---

## 🧪 TESTER LES CHANGEMENTS

### 1. Vérifier la compilation
```powershell
npm run build
```

Si erreurs TypeScript → fichiers oubliés, les corriger.

---

### 2. Tester la validation UUID

```typescript
// ✅ UUID valide
const id1 = CampaignId.from("123e4567-e89b-12d3-a456-426614174000");  // OK

// ❌ UUID invalide
const id2 = CampaignId.from("invalid-uuid");  // Throw INVALID_CAMPAIGN_ID_FORMAT

// ❌ String vide
const id3 = CampaignId.from("");  // Throw CAMPAIGN_ID_REQUIRED
```

---

### 3. Tester l'API

```bash
# GET /campaigns/:id avec UUID valide
curl http://localhost:3000/campaigns/123e4567-e89b-12d3-a456-426614174000

# Devrait retourner un JSON avec "id" en string
# {
#   "id": "123e4567-e89b-12d3-a456-426614174000",
#   "name": "Campaign 2025",
#   ...
# }
```

---

## ⚠️ PIÈGES À ÉVITER

### ❌ Oublier `.toString()` dans le controller
```typescript
// ❌ ERREUR
return {
  id: campaign.id,  // CampaignId n'est pas sérialisable en JSON
};

// ✅ CORRECT
return {
  id: campaign.id.toString(),
};
```

---

### ❌ Oublier `CampaignId.from()` dans les use cases
```typescript
// ❌ ERREUR (pas de validation)
const campaign = await this.repository.findById(campaignId);

// ✅ CORRECT
const id = CampaignId.from(campaignId);
const campaign = await this.repository.findById(id);
```

---

### ❌ Oublier de typer les props de rehydrate
```typescript
// ❌ ERREUR
export type RehydrateCampaignProps = {
  id: string;  // ❌ Encore primitif
  // ...
};

// ✅ CORRECT
export type RehydrateCampaignProps = {
  id: CampaignId;  // ✅ Value Object
  // ...
};
```

---

## 📊 PROGRESSION

| Entité | Value Object | Entity | Repository | Mapper | Use Cases | Controller | Status |
|--------|--------------|--------|------------|--------|-----------|-----------|--------|
| Center | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ FAIT |
| Campaign | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | À FAIRE |
| Store | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | À FAIRE |
| User | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | À FAIRE |
| Product | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | À FAIRE |
| CollecteEntry | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | 🟡 | À FAIRE |

---

## ✅ QUAND CONSIDÉRER FINI

- [ ] Tous les IDs sont des Value Objects (pas de `id: string` dans le domain)
- [ ] `npm run build` compile sans erreur
- [ ] Tests unitaires passent
- [ ] Tests E2E passent
- [ ] API retourne des strings dans les JSON (pas d'objets CampaignId)

---

**Bon courage ! 🚀**
