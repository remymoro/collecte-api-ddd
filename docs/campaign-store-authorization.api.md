# Campaign Store Authorization — API Contract (Admin + Centre)

Ce document décrit le **contrat HTTP** entre le Front et l’API pour la gestion des **autorisations de magasins** dans une campagne.

## 🎯 Concept métier

Une **autorisation** répond à une question simple :

> « Pour une campagne donnée, un magasin donné est-il autorisé à participer ? »

Elle possède un **cycle de vie** minimal :
- `ACTIVE` : le magasin participe
- `INACTIVE` : le magasin ne participe pas

## 🧠 Positionnement DDD / Clean Architecture (pour se comprendre)

- **Controller** = frontière HTTP : parsing route/body/query, validation DTO, appel des Use Cases.
- **DTO** = contrat de transport (shapes JSON) + validation (ex: UUID), partageable avec le Front.
- **Use Case** = scénario applicatif (orchestration + règles d’intention : idempotence, vérification d’existence, etc.).
- **Domaine** = source de vérité du métier (erreurs, invariants).
- **Infra (Prisma)** = persistance / I-O.

## Base URL

- Serveur dev: `http://localhost:3000`

## Formats

- `campaignId`, `storeId`, `centerId`: UUID v4 (validés côté API)
- JSON pour les bodies

## Erreurs (format standard)

L’API renvoie les erreurs domaine sous la forme :

```json
{
  "error": "ERROR_CODE",
  "message": "Human-readable message"
}
```

Mapping HTTP (extraits pertinents pour ce module) :
- `CAMPAIGN_NOT_FOUND` → `404`
- `STORE_NOT_FOUND` → `404`
- `STORE_NOT_AUTHORIZED_FOR_CAMPAIGN` → `403`
- `PERSISTENCE_ERROR` → `500`

> Note: Les erreurs de validation DTO (UUID invalides, champs inconnus) sont gérées par le `ValidationPipe` Nest et renvoient typiquement `400`.

---

# 1) Admin — Gestion globale des authorizations

Scope: un ADMIN gère l’autorisation d’un magasin pour une campagne.

## 1.1 Autoriser / Activer un magasin

**POST** `/campaigns/{campaignId}/authorizations`

### Body (DTO)

```json
{
  "storeId": "<uuid>"
}
```

### Réponse
- `204 No Content`

### Sémantique métier (idempotente)
- si l’autorisation n’existe pas → création `ACTIVE`
- si elle est `INACTIVE` → elle redevient `ACTIVE`
- si elle est déjà `ACTIVE` → pas d’erreur (no-op)

### Erreurs possibles
- `404` `CAMPAIGN_NOT_FOUND`
- `404` `STORE_NOT_FOUND`
- `500` `PERSISTENCE_ERROR`

---

## 1.2 Désactiver un magasin

**PATCH** `/campaigns/{campaignId}/authorizations/{storeId}/deactivate`

### Réponse
- `204 No Content`

### Sémantique métier (idempotente)
- si l’autorisation n’existe pas → no-op
- si elle est déjà `INACTIVE` → no-op
- sinon → passe à `INACTIVE`

### Erreurs possibles
- `404` `CAMPAIGN_NOT_FOUND`
- `404` `STORE_NOT_FOUND`
- `500` `PERSISTENCE_ERROR`

---

## 1.3 Réactiver un magasin

**PATCH** `/campaigns/{campaignId}/authorizations/{storeId}/activate`

### Réponse
- `204 No Content`

### Sémantique métier
Identique au POST (réutilise la même règle d’activation) : création / activation / no-op.

### Erreurs possibles
- `404` `CAMPAIGN_NOT_FOUND`
- `404` `STORE_NOT_FOUND`
- `500` `PERSISTENCE_ERROR`

---

## 1.4 Lister les magasins autorisés (ou non)

**GET** `/campaigns/{campaignId}/authorizations`

### Query params
- `status` (optionnel) : `ACTIVE | INACTIVE`
  - défaut: `ACTIVE`

Exemples:
- `/campaigns/<id>/authorizations` → liste des `ACTIVE`
- `/campaigns/<id>/authorizations?status=INACTIVE` → liste des `INACTIVE`

### Réponse
`200 OK`

```json
["<storeId>", "<storeId>"]
```

### Erreurs possibles
- `500` `PERSISTENCE_ERROR`

---

## 1.5 Détail d’une authorization

**GET** `/campaigns/{campaignId}/authorizations/{storeId}`

### Réponse
`200 OK`

```json
{
  "campaignId": "<uuid>",
  "storeId": "<uuid>",
  "status": "ACTIVE"
}
```

### Erreurs possibles
- `404` `CAMPAIGN_NOT_FOUND`
- `404` `STORE_NOT_FOUND`
- `403` `STORE_NOT_AUTHORIZED_FOR_CAMPAIGN`
- `500` `PERSISTENCE_ERROR`

---

# 2) Centre — Projection UI (magasins du centre + statut)

Scope: pour une campagne et un centre, obtenir une **projection** adaptée à l’IHM :
- *tous* les magasins du centre
- leur statut `ACTIVE/INACTIVE` pour la campagne

## 2.1 Lister les authorizations pour un centre

**GET** `/campaigns/{campaignId}/centers/{centerId}/authorizations`

### Réponse
`200 OK`

```json
[
  {
    "storeId": "<uuid>",
    "storeName": "Carrefour République",
    "address": "12 rue de Paris",
    "authorizationStatus": "ACTIVE"
  }
]
```

### Détails
- `authorizationStatus` est une projection pensée pour l’IHM :
  - `ACTIVE` : autorisé
  - `INACTIVE` : autorisation existante mais désactivée
  - `NONE` : aucune autorisation n'a jamais existé (jamais autorisé)

### Erreurs possibles
- `500` `PERSISTENCE_ERROR`

---

## Références (implémentation)

- Admin controller: `src/presentation/campaign-store-authorization/campaign-store-authorization.controller.ts`
- Centre controller: `src/presentation/campaign-store-authorization/campaign-center-store-authorization.controller.ts`
- DTOs: `src/presentation/campaign-store-authorization/dto/*`
- Domain error mapping: `src/presentation/filters/domain-error.http-map.ts`
