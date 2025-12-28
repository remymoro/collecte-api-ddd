# Auth / Sécurité — notes (préparation)

## Décisions métier (sans code)

- **Rôle**: `BENEVOLE`
- **Centre courant**: l’utilisateur agit toujours « dans un centre » (ex: `currentCenterId`)
- **JWT**: principe *stateless* (chaque requête porte ses infos d’identité), pas de session serveur

## Préparation technique légère

Objectif: visualiser le flux sans bloquer le projet.

- `FakeAuthGuard`: injecte un utilisateur hardcodé dans `request.user`
- `@CurrentUser()`: décorateur pour récupérer `request.user` dans le controller

Flux visé:

HTTP → Guard → Controller → Use case
