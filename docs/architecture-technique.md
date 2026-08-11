# Architecture technique

## Décision d'ensemble

Conserver l'architecture monorepo TypeScript décrite dans le README, avec trois applications et des packages métier séparés. Pour le MVP, réduire le nombre de flux actifs sans réécrire la plateforme : REST/tRPC sur un Worker Cloudflare, données relationnelles dans LibSQL/Turso, R2 pour les images et un Durable Object par match pour le chat.

```text
Mobile Expo ───────┐
                   ├─ HTTPS / tRPC / Hono ─ Worker Cloudflare ─ LibSQL/Turso
Dashboard React ───┘              │                 │
                                  ├─ BetterAuth     ├─ R2 (images)
Mobile Expo ─ WebSocket ──────────└─ Durable Object par match (chat SQLite)
                                  │
                                  └─ services externes (email/push/places)
```

## Composants

### Clients

- `apps/mobile` : Expo Router, TanStack Query/tRPC, stockage local MMKV et PartySocket.
- `apps/dash` : React/Vite, TanStack Router/Query/Table/Form, accès réservé aux rôles `admin` et `superadmin`.
- Les clients ne prennent aucune décision d'autorisation. Ils masquent des actions pour l'ergonomie, tandis que le serveur les refuse systématiquement si elles sont interdites.

### API

- `apps/server` héberge Hono, tRPC, BetterAuth, les routes REST, les bindings R2/Durable Objects et les tâches planifiées.
- `protectedProcedure` exige une session valide ; `adminProcedure` exige en plus un rôle autorisé.
- Les règles d'audience, d'hôte, de capacité et d'état doivent être centralisées dans des fonctions de domaine réutilisées par les lectures et les mutations.
- Les mutations importantes utilisent transaction, idempotency key ou contrainte unique selon le cas.

### Packages métier

- `api-games` : cycle de vie des matchs et adhésions ;
- `api-social` : profils, connexions, cercles et notifications ;
- `api-admin` : opérations réservées au dashboard ;
- `api-extras` : clubs, formats et badges ;
- `auth`, `chat`, `db`, `notifications`, `env`, `utils` : capacités transversales.

## Flux critiques

### Authentification OTP

1. Le client demande un code avec une réponse non révélatrice de l'existence du compte.
2. Le serveur applique des limites par identifiant, IP et appareil.
3. Le fournisseur envoie le code ; seul un secret dérivé et expirant est conservé.
4. La vérification crée une session sécurisée, révocable et liée au contexte client.

### Rejoindre un match

1. Authentifier l'utilisateur et charger le match.
2. Vérifier statut, fenêtre d'ouverture et audience.
3. Dans une transaction, compter les joueurs et invités acceptés, puis créer ou mettre à jour l'adhésion.
4. Affecter `accepted` ou `waiting` sans dépassement de capacité.
5. Après commit, produire notifications et événement de chat de manière idempotente.

### Chat

1. Le Worker valide la session avant le passage WebSocket et transmet un identifiant serveur fiable au Durable Object.
2. L'instance du match vérifie que l'utilisateur peut accéder au chat.
3. Chaque message possède un identifiant client idempotent, un identifiant serveur et un horodatage serveur.
4. Historique, ACK, retry et réactions restent dans le stockage SQLite du Durable Object ; les métadonnées métier restent dans LibSQL.

## Intégrations externes

| Service | Usage | Stratégie de résilience |
|---|---|---|
| BetterAuth | Sessions et OTP | expiration, révocation, cookies adaptés mobile/web |
| Resend | OTP email | limitation, reprise bornée, métriques de délivrabilité |
| VerifyWay/WhatsApp | OTP téléphone | activation V1 derrière configuration |
| OneSignal | push | boîte interne comme source durable, push best effort |
| Google Places/Maps | villes et clubs | cache, quotas, saisie/admin de secours |
| OpenWeatherMap | météo | hors MVP, cache et quota avant activation |
| R2 | images | taille/MIME/signature, noms opaques, suppression contrôlée |
| Apple/Google stores | version disponible | hors parcours critique, timeout et cache durable |
| Sentry | erreurs et traces | suppression des OTP, tokens, téléphones et contenu sensible |

## Sécurité

- appliquer le moindre privilège à chaque procédure, y compris les lectures ;
- remplacer le cookie dans la query WebSocket si la plateforme permet un mécanisme moins exposé ; sinon jeton éphémère, usage unique et redaction des logs ;
- CORS par liste explicite, CSRF pour les mutations basées sur cookie et cookies `Secure`, `HttpOnly`, `SameSite` adaptés ;
- rate limiting sur OTP, login, recherche, météo, invitations, chat et uploads ;
- valider les fichiers par taille, type déclaré, signature réelle et dimensions ; servir avec en-têtes sûrs ;
- chiffrer les transports et secrets, séparer les environnements et prévoir leur rotation ;
- journaliser bannissement, suppression, rôle, modification/annulation de match et lecture exceptionnelle de données ;
- tests automatiques d'autorisation par matrice de rôles et d'audiences ;
- politique de rétention et anonymisation cohérente entre base principale, chat, logs, R2 et fournisseurs.

## Fiabilité et exploitation

- migrations versionnées, sauvegardes automatiques et exercice de restauration ;
- observabilité par corrélation de requête sans donnée personnelle ;
- métriques : latence/erreurs API, connexions WebSocket, retries, files d'attente, push, OTP et quotas tiers ;
- files ou table d'outbox pour dissocier commit métier et notifications ;
- tâches cron idempotentes avec verrou ou curseur durable ;
- environnements local, staging et production isolés avec données et clés distinctes.

## Risques prioritaires issus du README

1. accès non autorisé aux détails et participants d'un match ;
2. invitation et suppression de demande avec autorisation insuffisante ;
3. transfert d'hôte incohérent entre deux sources de vérité ;
4. upload arbitraire et consommation abusive de quotas ;
5. exposition de codes OTP de développement ou configuration non-production trompeuse ;
6. concurrence sur les places et ordre de liste d'attente ;
7. double stockage LibSQL/Durable Object et cohérence des droits après changement métier ;
8. absence de tests de parcours mobile/dashboard ;
9. dépendances externes non certifiées en conditions réelles.

## Décisions à formaliser par ADR

- canal OTP initial ;
- autorité canonique de l'hôte (`games.hostId` recommandé) ;
- politique d'accès au chat après départ/annulation ;
- mécanisme de transaction et promotion de liste d'attente ;
- outbox de notifications ;
- conservation/anonymisation des messages ;
- stratégie de géolocalisation et fournisseur de lieux.
