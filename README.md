# Projet PFA

Projet de fin d'études composé d'une application mobile et d'une API REST permettant de gérer des joueurs.

## Structure du projet

```text
projetPFA/
├── mobile/          # Application mobile
├── server/          # API REST principale
└── my-app - Copie/  # Copie de travail du service Cloudflare
```

## API

L'API est développée avec TypeScript, [Hono](https://hono.dev/) et Cloudflare Workers. Les données sont actuellement conservées en mémoire et sont donc réinitialisées lorsque le serveur redémarre.

### Prérequis

- Node.js
- npm

### Installation et démarrage

```bash
cd server
npm install
npm run dev
```

Wrangler affiche dans le terminal l'adresse locale de l'API.

### Endpoints disponibles

| Méthode | Route | Description |
| --- | --- | --- |
| `GET` | `/` | Vérifier que l'API fonctionne |
| `GET` | `/players` | Récupérer tous les joueurs |
| `GET` | `/players/:id` | Récupérer un joueur |
| `POST` | `/players` | Ajouter un joueur |
| `PUT` | `/players/:id` | Modifier un joueur |
| `DELETE` | `/players/:id` | Supprimer un joueur |

Exemple de données pour créer ou modifier un joueur :

```json
{
  "name": "Achraf Hakimi",
  "age": 27,
  "position": "Défenseur"
}
```

### Déploiement

Depuis le dossier `server` :

```bash
npm run deploy
```

## Variables d'environnement

Un modèle est disponible dans `server/.env.example`. Pour une utilisation locale, copiez-le vers `server/.env`, puis adaptez les valeurs à votre environnement. Le fichier `.env` est ignoré par Git et ne doit contenir que des secrets locaux.

## Scripts du serveur

- `npm run dev` : démarre le serveur de développement.
- `npm run deploy` : déploie l'API sur Cloudflare Workers.
- `npm run cf-typegen` : génère les types des bindings Cloudflare.

