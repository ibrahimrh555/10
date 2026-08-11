# Installation et démarrage du monorepo

## Résultat

Le socle initial du monorepo est installé. Il contient trois applications et douze packages partagés, sans fonctionnalité métier.

```text
apps/
  mobile/       Expo 57, Expo Router, React Native 0.86
  dashboard/    React 19, Vite, TanStack Router
  server/       Cloudflare Worker, Hono, tRPC

packages/
  api/          composition HTTP et routeur tRPC
  api-core/     contexte et primitives tRPC
  api-games/    frontière du domaine matchs, vide
  api-social/   frontière du domaine social, vide
  api-admin/    frontière du domaine administration, vide
  auth/         types et validation de configuration
  db/           point d'entrée Drizzle, sans schéma métier
  chat/         contrat technique temps réel minimal
  notifications/ contrat technique de notification minimal
  env/          validation Zod des environnements
  config/       configurations TypeScript partagées
  utils/        utilitaires transversaux
```

Les workspaces sont gérés par pnpm et les tâches par Turborepo. TypeScript est configuré en mode strict. Les alias locaux `@/*` ciblent les sources de chaque application et les alias `@10in/*` ciblent les packages du workspace.

## Prérequis

- Node.js 22.13 ou plus récent ;
- pnpm 11.12 ;
- Expo Go compatible SDK 57 pour tester sur un appareil ;
- un compte Cloudflare uniquement pour un futur déploiement, pas pour le développement local actuel.

## Installation

Depuis la racine :

```powershell
pnpm install
Copy-Item .env.example .env
pnpm --filter @10in/server run cf-typegen
```

Le fichier `.env.example` ne contient aucun secret réel. Les valeurs sensibles doivent rester dans `.env` pour les outils locaux ou dans les secrets Wrangler pour les futurs environnements Cloudflare.

## Démarrer les applications

### Mobile

```powershell
pnpm --filter @10in/mobile dev
```

Raccourcis utiles :

```powershell
pnpm --filter @10in/mobile android
pnpm --filter @10in/mobile ios
pnpm --filter @10in/mobile web
```

Le terminal Expo affiche un QR code pour Expo Go. L'appareil et le poste doivent pouvoir communiquer sur le même réseau.

### Dashboard

```powershell
pnpm --filter @10in/dashboard dev
```

Adresse locale par défaut : `http://localhost:5173`.

### Serveur

```powershell
pnpm --filter @10in/server dev
```

Adresse locale par défaut : `http://localhost:8787`. La route technique disponible est `GET /health`. La configuration utilise la date de compatibilité `2026-08-08`, dernière date prise en charge par le binaire `workerd` installé au moment de la préparation.

### Toutes les applications

```powershell
pnpm dev
```

Cette commande lance les tâches persistantes avec Turborepo. Pour des journaux plus lisibles pendant le développement, il est généralement préférable d'ouvrir un terminal par application.

## Commandes de qualité

```powershell
pnpm build
pnpm lint
pnpm typecheck
pnpm test
```

Les mêmes scripts existent dans chaque workspace et peuvent être ciblés avec `pnpm --filter <nom> <script>`.

## Vérifications exécutées

| Vérification | Résultat |
|---|---|
| `pnpm install` | Réussie ; lockfile généré |
| `pnpm --filter @10in/server run cf-typegen` | Réussie ; `worker-configuration.d.ts` généré |
| `pnpm typecheck` | Réussie ; 14 tâches sur 14 |
| `pnpm lint` | Réussie ; 14 tâches sur 14 |
| `pnpm --filter @10in/mobile exec expo install --check` | Réussie ; dépendances SDK 57 à jour |

Les répertoires générés `.expo`, `.wrangler`, `dist`, `coverage` et `.turbo` sont exclus du contrôle de version et du lint.

## Choix de configuration

- Les configurations TypeScript strictes sont centralisées dans `packages/config`.
- ESLint utilise une configuration flat unique à la racine.
- Les packages publient leurs sources TypeScript uniquement à l'intérieur du workspace ; aucune publication npm n'est configurée.
- Wrangler utilise `nodejs_compat`, l'observabilité et des types générés depuis `wrangler.jsonc`.
- pnpm autorise uniquement les scripts d'installation d'`esbuild` et `workerd`, requis par Vite et Wrangler.
- Aucun binding de base de données, bucket, Durable Object ou secret Cloudflare n'est encore déclaré.

## Limites volontaires du socle

- aucune authentification réelle ;
- aucun schéma ni migration métier Drizzle ;
- aucune procédure de match, sociale ou d'administration ;
- aucun Durable Object de chat ;
- aucun envoi de notification ;
- aucune interface produit au-delà des écrans techniques initiaux.

Ces éléments seront ajoutés progressivement selon `docs/mvp.md`, `docs/roadmap.md` et `docs/backlog.md`.
