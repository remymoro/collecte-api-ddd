# AUDIT INDÉPENDANT - TESTS & ARCHITECTURE DDD LIGHT

**Date** : 2026-01-04
**Auditeur** : Lead Developer Senior externe
**Contexte** : Backend NestJS - Architecture Clean/Hexagonale - DDD Light
**Périmètre** : 20 suites, 87 tests, ~1540 lignes, ~1.2s d'exécution

---

## EXECUTIVE SUMMARY

### Notes globales

| Dimension | Note | Commentaire |
|-----------|------|-------------|
| **Architecture** | 9/10 | Excellente séparation des couches, ports/adapters bien respectés |
| **Tests** | 6/10 | Bonne couverture métier mais sur-testing massif sur use cases triviaux |
| **Maturité DDD Light** | 8/10 | Bon équilibre pragmatisme/rigueur, langage métier présent |

### Verdict

**Vous êtes sur la bonne voie.** Les problèmes identifiés ne sont **pas architecturaux** mais **organisationnels** : sur-testing, redondance, fichiers zombies, et un test critique manquant.

**Objectif** : Passer de 1540 lignes à ~900 lignes de tests sans perte de couverture métier.

---

## 1) QUALITÉ DDD LIGHT

### ✅ Points forts

#### Entités riches avec comportements métier
- **Store** : Protection des invariants (statut, fermeture, images)
- **Campaign** : Gestion période, transitions de statut, période de grâce
- **CollecteEntry** : Validation, arrondissement poids, immutabilité après validation

#### Errors typées métier
- `CannotModifyClosedStoreError`
- `InvalidCampaignPeriodError`
- `EmptyEntryError`
- `ProductArchivedError`
- etc.

Langage ubiquitaire présent ✅

#### Value Objects utilisés
`Weight` avec validation et arrondissement - bon positionnement en DDD Light

#### Architecture découplée
- Repositories abstraits (ports)
- In-memory pour tests
- Aucune dépendance Prisma/NestJS dans les tests domaine
- **Changement d'ORM sans impact** ✅

### ⚠️ Points d'attention

#### 1. Product - Entité "anémique" acceptable en DDD Light

**Fichier** : [src/domain/product/product.entity.ts](src/domain/product/product.entity.ts)

```typescript
// Lignes 72-78
updateMetadata(input: { family: string; subFamily?: string }): void {
  this._family = input.family;
  if (input.subFamily !== undefined) {
    this._subFamily = input.subFamily;
  }
}
```

**Analyse** :
- En DDD tactique strict : ❌ Setter glorifié, pas d'invariant
- En DDD Light : ✅ **Master data** (référentiel statique) avec CRUD administratif

**Verdict** : Acceptable. `Product` est un catalogue, pas un agrégat complexe. La méthode `archive()` protège le flag → suffisant.

#### 2. Backward compatibility getters

**Fichier** : [src/domain/collecte/collecte-entry.entity.ts:98-133](src/domain/collecte/collecte-entry.entity.ts#L98-L133)

```typescript
get entryId(): string { return this._id; }
get entryCampaignId(): string { return this._campaignId; }
// ... 10 getters préfixés "entry"
```

**Analyse** : Dette technique pour migration API ?

**Action** :
- ✅ OK temporaire si utilisé uniquement en couche présentation/infrastructure
- ❌ Nettoyez si utilisé dans le domaine
- **Documentez cette dette technique**

#### 3. Règle métier dans AddItemUseCase - Acceptable en DDD Light

**Fichier** : [src/application/collecte/add-item.usecase.ts:25-32](src/application/collecte/add-item.usecase.ts#L25-L32)

```typescript
const product = await this.productRepo.findByReference(input.productRef);
if (!product) throw new ProductNotFoundError(input.productRef);
if (!product.isActive) throw new ProductArchivedError(product.reference);
```

**Analyse** :
- En DDD tactique : ❌ Règle métier leakée hors du domaine
- En DDD Light : ✅ **Orchestration cross-aggregate légitime**

**Justification** :
- `CollecteEntry` ne connaît pas `Product` (pas de dépendance entité → entité)
- Le use case fait le pont entre agrégats
- C'est une règle d'orchestration, pas un invariant de `CollecteEntry`

**MAIS** : Test manquant (voir section Recommandations)

---

## 2) STRATÉGIE DE TEST

### Volumétrie

```
~1540 lignes de tests
87 tests
20 suites
47 use cases dans le code
7 entités domaine

Ratio : ~5-6 tests/use case, ~12 tests/entité
```

### ❌ SUR-TESTING MASSIF détecté

#### Cas #1 : ListEntriesUseCase - 238 lignes pour un READ pur

**Fichier** : [src/tests/application/collecte/list-entries.usecase.spec.ts](src/tests/application/collecte/list-entries.usecase.spec.ts)

**Le use case fait littéralement** :
```typescript
async execute() {
  return await this.repository.findAll();
}
```

**Vous avez 10 tests qui vérifient** :
- ✅ Liste vide (légitime)
- ❌ Retourne 3 entrées (test d'implémentation du repo)
- ❌ Retourne totalWeightKg (test de l'entité)
- ❌ Retourne status (test de l'entité)
- ❌ Retourne createdAt (test de l'entité)
- ❌ Gère les entrées vides (déjà testé sur l'entité)
- ❌ Calcule les totaux avec arrondis (déjà testé sur Weight VO + entité)
- ❌ Vue simplifiée sans items (test de mapping/DTO)
- ❌ Retourne dans l'ordre (test du repo)

**Verdict** : **80% de ces tests sont redondants**

Vous testez :
1. Le comportement du repo in-memory (qui est un fake de test)
2. Les getters de l'entité (déjà testés)
3. Les règles métier de l'entité (déjà testées)

#### Cas #2 : GetEntryUseCase - 216 lignes pour un findById()

**Fichier** : [src/tests/application/collecte/get-entry.usecase.spec.ts](src/tests/application/collecte/get-entry.usecase.spec.ts)

**11 tests** pour un simple `findById()`. 1-2 tests suffisent (trouvé/pas trouvé).

**Même problème** : Re-test des getters et calculs de l'entité.

#### Cas #3 : RemoveItemUseCase - 185 lignes

**Fichier** : [src/tests/application/collecte/remove-item.usecase.spec.ts](src/tests/application/collecte/remove-item.usecase.spec.ts)

**10 tests**. Le use case appelle juste `entry.removeItem(index)` puis `save()`.

**50% des tests re-testent l'entité**.

### ✅ Tests légitimes au niveau use case

#### CreateEntryUseCase ✅
**Fichier** : [src/tests/application/collecte/create-entry.usecase.spec.ts](src/tests/application/collecte/create-entry.usecase.spec.ts)

Teste la règle métier **"ne pas créer de doublon EN_COURS"** → Orchestration métier, bien placé.

#### ValidateEntryUseCase ✅
**Fichier** : [src/tests/application/collecte/validate-entry.usecase.spec.ts](src/tests/application/collecte/validate-entry.usecase.spec.ts)

Teste que la validation persiste, refuse les doublons → Orchestration correcte.

#### AddItemUseCase ⚠️
**Fichier** : [src/tests/application/collecte/add-item.usecase.spec.ts](src/tests/application/collecte/add-item.usecase.spec.ts)

Teste l'enrichissement catalogue → OK

**MAIS manque** : Test du rejet de produit archivé (règle métier critique).

### ⚠️ SOUS-TESTING critique

**Aucun test pour** :
- ❌ Produit archivé dans AddItemUseCase (règle métier critique)
- ❌ Gestion des erreurs de persistence (retry, transaction ?)
- ❌ Règles d'autorisation (campagne clôturée refuse les ajouts ?)

**Vous sur-testez le happy path trivial et sous-testez les edge cases métier.**

---

## 3) COUPLAGE & ROBUSTESSE

### ✅ Excellent découplage

- Repositories abstraits (ports) ✅
- In-memory pour les tests ✅
- Aucune dépendance Prisma/NestJS dans les tests domaine ✅

**Un changement d'ORM ne casserait rien au niveau domaine/application.**

### ❌ Assertions fragiles détectées

#### Test Controller

**Fichier** : [src/presentation/collecte/collecte.controller.spec.ts:59](src/presentation/collecte/collecte.controller.spec.ts#L59)

```typescript
it('should be defined', () => {
  expect(controller).toBeDefined();
});
```

**Analyse** : Test de plomberie NestJS sans valeur métier.

**Verdict** : Si le contrôleur est mal câblé, les vrais tests (E2E) échoueront. Ce test n'apporte rien.

#### RolesGuard

**Fichier** : [src/infrastructure/auth/roles.guard.spec.ts](src/infrastructure/auth/roles.guard.spec.ts)

**Analyse** : Tests unitaires de guards NestJS = infrastructure, pas domaine.

**Recommandation** :
- Si E2E couvre tous les cas RBAC → Supprimez
- Sinon → Gardez (mais vérifiez d'abord la couverture E2E)

### 🧟 Fichier zombie détecté

**Fichier** : [src/tests/domain/collecte/collecte-entry.entity.complete.spec.ts](src/tests/domain/collecte/collecte-entry.entity.complete.spec.ts)

```typescript
describe('CollecteEntry (spec obsolète)', () => {
  it('est remplacé par collecte-entry.entity.spec.ts', () => {
    expect(true).toBe(true);
  });
});
```

**Verdict** : **SUPPRIMEZ IMMÉDIATEMENT**. Pollution du code, bruit dans la suite.

---

## 4) ANTI-PATTERNS IDENTIFIÉS

### 1. Test d'implémentation au lieu de comportement

**Fichier** : [src/tests/domain/store/store.entity.spec.ts:46-81](src/tests/domain/store/store.entity.spec.ts#L46-L81)

```typescript
it('la fermeture fige l\'état du magasin (aucune mutation après échec)', () => {
  const snapshot = {
    name: store.name,
    address: store.address,
    city: store.city,
    postalCode: store.postalCode,
  };

  try {
    store.updateInfo(/* ... */);
  } catch {}

  expect(store.name).toBe(snapshot.name);
  // ...
});
```

**Analyse** : Vous testez que l'état n'a PAS changé après une exception.

**Pourquoi c'est un anti-pattern** :
- En DDD (Light ou pas), si une méthode throw, l'état ne DOIT PAS muter (principe de transaction)
- Ce test est une conséquence logique du throw (ligne 24-44)
- Si vous n'avez pas confiance, c'est un problème de design, pas un besoin de test

**Verdict** : Test paranoïaque. **Supprimez.**

### 2. Redondance entité ↔ use case

**Exemple** :
- [collecte-entry.entity.spec.ts:72-85](src/tests/domain/collecte/collecte-entry.entity.spec.ts#L72-L85) teste qu'on ne peut pas `addItem()` après validation
- [validate-entry.usecase.spec.ts:66-81](src/tests/application/collecte/validate-entry.usecase.spec.ts#L66-L81) re-teste la même chose

**Analyse** : Le use case appelle `entry.addItem()`. Si l'entité est testée, pas besoin de re-tester au niveau use case.

**Exception** : Si le use case a une logique AVANT l'appel (ex: vérifier une autorisation), testez ça. Mais pas le comportement de l'entité.

**Philosophie DDD Light pour les tests** :
- **Entité** : Tester les comportements métier (validation, transitions d'état)
- **Use case** : Tester l'orchestration (appels corrects, logique de décision)
- **Repository** : Tester l'intégration (E2E ou tests d'intégration)

### 3. Tests de getters triviaux

**Fichier** : [src/tests/domain/product/product.entity.spec.ts:6-15](src/tests/domain/product/product.entity.spec.ts#L6-L15)

```typescript
it('crée un produit avec référence et famille', () => {
  const product = Product.create({
    reference: 'PROD_1',
    family: 'Protéines',
  });

  expect(product.reference).toBe('PROD_1');
  expect(product.family).toBe('Protéines');
  expect(product.subFamily).toBeUndefined();
});
```

**Analyse** : Vous testez que les getters retournent ce que vous avez passé au constructeur.

**Verdict** : Inutile. Si un getter est cassé, tous les autres tests échoueront.

**Test légitime** : Tester les **defaults métier**

```typescript
it('un produit créé est actif par défaut', () => {
  const product = Product.create({ reference: 'P1', family: 'F1' });
  expect(product.isActive).toBe(true); // ← règle métier
});
```

Ça, c'est un test de comportement. Le reste (reference/family) est du bruit.

### 4. Stringly-typed errors ?

❌ Non détecté. Vos erreurs sont bien typées (classes dédiées). ✅

---

## 5) RECOMMANDATIONS ACTIONNABLES

### 🔴 À SUPPRIMER SANS REGRET

| Fichier | Raison | Gain |
|---------|--------|------|
| `collecte-entry.entity.complete.spec.ts` | Fichier zombie | -7 lignes |
| `collecte.controller.spec.ts` | Test NestJS sans valeur métier, redondant avec E2E | -62 lignes |
| `roles.guard.spec.ts` | Test d'infrastructure (à vérifier si couvert en E2E) | -73 lignes |
| `store.entity.spec.ts:46-81` | Test paranoïaque de non-mutation | -36 lignes |
| `product.entity.spec.ts:6-27` | Tests de getters triviaux (garder uniquement ligne 29-36) | -22 lignes |
| 50% de `list-entries.usecase.spec.ts` | Redondance avec tests d'entité | ~120 lignes |
| 60% de `get-entry.usecase.spec.ts` | Redondance avec tests d'entité | ~130 lignes |
| 40% de `remove-item.usecase.spec.ts` | Redondance avec tests d'entité | ~75 lignes |

**Gain estimé** : Passer de ~1540 lignes à **~800-900 lignes** sans perte de couverture métier.

### 🟢 À GARDER ABSOLUMENT

#### 1. Tous les tests d'invariants domaine

- **Store** : statut, fermeture, images
- **Campaign** : période, transitions de statut, période de grâce
- **CollecteEntry** : validation, arrondissement poids
- **Weight** VO : validation, arrondissement

#### 2. Tests d'orchestration métier dans use cases

- CreateEntry : pas de doublon EN_COURS
- ValidateEntry : persistence + état
- CreateProduct : unicité référence

#### 3. Tests d'erreurs métier

- `ProductAlreadyExistsError`
- `EmptyEntryError`
- `InvalidCampaignPeriodError`
- `CannotModifyClosedStoreError`
- etc.

### 🟡 À AJOUTER - Test critique manquant

#### AddItemUseCase : Refus produit archivé

**Fichier** : [src/tests/application/collecte/add-item.usecase.spec.ts](src/tests/application/collecte/add-item.usecase.spec.ts)

```typescript
it('refuse d\'ajouter un produit archivé à une saisie', async () => {
  // Arrange
  const product = Product.create({
    reference: 'PROD_ARCHIVED',
    family: 'Famille test',
  });
  product.archive();
  await productRepo.save(product);

  const entry = CollecteEntry.create(context);
  await entryRepo.save(entry);

  // Act & Assert
  await expect(
    useCase.execute(entry.id, {
      productRef: 'PROD_ARCHIVED',
      weightKg: 10,
    })
  ).rejects.toThrow(ProductArchivedError);
});
```

**Pourquoi critique** : C'est une règle métier (on ne collecte pas des produits archivés), et elle est dans le use case. Si elle n'est pas testée, elle peut disparaître lors d'un refactor.

### 🔵 À RENFORCER si le produit évolue

#### 1. Règles d'autorisation complexes
- Si une campagne clôturée refuse les saisies → test use case
- Si un centre désactivé bloque l'accès → test use case

#### 2. Logique de calcul métier
- Si le calcul de poids devient plus complexe (TVA, remises, bonus) → tests dédiés
- Si les arrondis suivent des règles fiscales → tests exhaustifs

#### 3. Saga / transactions
- Si vous ajoutez des événements domaine (DomainEvents) → tests de publication
- Si vous orchestrez plusieurs agrégats → tests de cohérence

---

## 6) PLAN D'ACTION DÉTAILLÉ

### Phase 1 : Nettoyage (2h)

1. ✂️ Supprimer `collecte-entry.entity.complete.spec.ts`
2. ✂️ Supprimer `collecte.controller.spec.ts` (si E2E couvre les controllers)
3. ✂️ Supprimer `store.entity.spec.ts:46-81` (test de non-mutation)
4. ✂️ Nettoyer `product.entity.spec.ts` (garder uniquement test default `isActive`)

### Phase 2 : Réduction redondance (2h)

#### 5. 🔪 ListEntriesUseCase.spec : réduire à 4 tests

**Garder** :
```typescript
it('retourne une liste vide quand il n\'y a pas d\'entrées')
it('retourne plusieurs entrées avec la structure correcte', () => {
  // Vérifier : id, status, totalWeight, createdAt
})
it('gère correctement les entrées vides (totalWeightKg = 0)')
it('retourne une vue simplifiée (sans propriété items)')
```

**Supprimer** : Tous les autres (redondance avec tests d'entité)

#### 6. 🔪 GetEntryUseCase.spec : réduire à 3 tests

**Garder** :
```typescript
it('récupère une entrée avec tous ses items')
it('throw EntryNotFoundError pour un ID inexistant')
it('récupère une entrée validée avec validatedAt')
```

**Supprimer** : Tous les autres (redondance avec tests d'entité)

#### 7. 🔪 RemoveItemUseCase.spec : réduire à 5 tests

**Garder** :
```typescript
it('supprime un item par index')
it('persiste l\'entrée après suppression')
it('met à jour le poids total après suppression')
it('refuse de supprimer un item d\'une entrée validée')
it('permet de vider complètement une entrée')
```

**Supprimer** : Tests redondants (supprime premier/dernier, conserve les autres)

### Phase 3 : Ajout test manquant (30min)

8. ➕ **AddItemUseCase.spec** : ajouter test produit archivé (voir code ci-dessus)

### Phase 4 : Vérification E2E (1h)

9. 🔍 Lire `collecte-entries.e2e-spec.ts`
10. 🔍 Vérifier couverture RBAC
11. 🔍 Décider si `roles.guard.spec.ts` peut être supprimé

---

## 7) RÉSULTAT ATTENDU

### Métriques

| Métrique | Avant | Après | Delta |
|----------|-------|-------|-------|
| **Lignes de tests** | ~1540 | ~900-1000 | -35% |
| **Nombre de tests** | 87 | ~55-60 | -31% |
| **Couverture métier** | Bonne | Identique | = |
| **Temps d'exécution** | ~1.2s | ~1.2s | = |

### Bénéfices

✅ Suite plus lisible : focus sur comportements, pas plomberie
✅ Maintenance facilitée : moins de redondance
✅ Onboarding simplifié : tests plus explicites
✅ Couverture métier renforcée (ajout test produit archivé)
✅ Confiance identique avec moins de code

---

## 8) CONCLUSION

### Diagnostic

**Vous êtes sur la bonne voie en DDD Light.**

Vos problèmes ne sont **pas architecturaux**, ils sont **organisationnels** :
- ❌ Sur-testing des use cases triviaux
- ❌ Redondance entité ↔ use case
- ❌ Fichiers zombies non nettoyés
- ❌ Test critique manquant (edge case métier)

**C'est du refactor de maintenance, pas une refonte.**

### Notes finales

| Dimension | Note avant | Note après refactor | Commentaire |
|-----------|------------|---------------------|-------------|
| **Architecture** | 9/10 | 9/10 | Déjà excellente |
| **Tests** | 6/10 | **8/10** | Après nettoyage et ajout test manquant |
| **Maturité DDD Light** | 8/10 | 8/10 | Déjà bon niveau |

### Note globale attendue : **8.5/10**

**Bon niveau pour une équipe en croissance.**

Nettoyez selon le plan d'action, et vous aurez une base de tests exemplaire en DDD Light.

---

## ANNEXES

### A. Philosophie DDD Light rappel

**DDD Light** = Architecture en couches + entités avec comportements + langage métier, **SANS** :
- Agrégats complexes
- Domain Events
- Specifications
- Repository ultra-strict
- Obsession sur "tout dans le domaine"

**Pragmatisme > Dogme**

### B. Checklist de revue de test

Avant d'écrire un test, se poser ces questions :

1. ✅ **Est-ce un comportement métier ?** → Test entité
2. ✅ **Est-ce de l'orchestration ?** → Test use case
3. ❌ **Est-ce un getter trivial ?** → Pas de test
4. ❌ **Est-ce déjà testé ailleurs ?** → Pas de test
5. ❌ **Est-ce de la plomberie framework ?** → E2E ou pas de test

### C. Références

- [collecte-api/src/domain](src/domain) : Entités domaine
- [collecte-api/src/application](src/application) : Use cases
- [collecte-api/src/tests](src/tests) : Tests actuels
- [collecte-api/test](test) : Tests E2E

---

**Audit réalisé sans complaisance. Recommandations actionnables et pragmatiques.**

**Pas de blabla, pas de dogme. DDD Light bien compris et bien appliqué.**
