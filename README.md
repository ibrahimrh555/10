# Analyse des fonctionnalités du projet 10in

> Analyse statique du dépôt au 8 août 2026. « Implémentée » signifie que les couches visibles dans le code sont reliées ; cela ne remplace pas un test d'exécution. Les chemins sont relatifs à la racine du dépôt. Les migrations générées et les artefacts ont été inventoriés, mais non utilisés comme preuve unique.

## 1. Résumé du projet

10in est une application sociale de football. L'application Expo permet de s'authentifier par OTP, trouver, créer et gérer des matchs, inviter des joueurs ou des invités sans compte, organiser des cercles, discuter autour d'un match, recevoir des notifications et consulter des badges. Un dashboard React administre les utilisateurs, matchs, villes, clubs, formats, cercles et badges. Un Worker Cloudflare expose BetterAuth, tRPC, plusieurs routes Hono et un chat WebSocket persistant.

Le dépôt est un monorepo pnpm/Turbo avec 3 applications et 13 packages. Le README annonce encore « 8 packages » : cette valeur est obsolète.

## 2. Architecture générale

### 2.1 Applications

| Application | Rôle | Points d'entrée |
|---|---|---|
| `apps/mobile` | Client iOS/Android Expo Router ; interface joueur, cache TanStack Query/MMKV, i18n FR/EN, OneSignal | `src/app/_layout.tsx`, `src/app/(app)/_layout.tsx`, `src/lib/trpc.ts` |
| `apps/dash` | Dashboard React 19/Vite/TanStack Router réservé aux rôles admin et superadmin | `src/router.tsx`, `src/routes/dashboard.tsx`, `src/middleware/auth.ts` |
| `apps/server` | Worker Cloudflare : HTTP Hono, tRPC, BetterAuth, R2, Durable Object Chat, cron badges | `src/index.ts`, `wrangler.json` |

### 2.2 Packages

| Package | Rôle observé |
|---|---|
| `@10in/api` | Composition Hono/tRPC, routes REST, upload R2 et point d'entrée des jobs |
| `@10in/api-core` | Contexte tRPC, procédures publique/protégée/admin, services Google Places et notifications |
| `@10in/api-games` | Matchs, inscriptions, invitations, attente, joueurs et invités |
| `@10in/api-social` | Utilisateurs, connexions, cercles et notifications |
| `@10in/api-admin` | Procédures du dashboard |
| `@10in/api-extras` | Clubs, formats, badges et calcul de badges |
| `@10in/api-testing` | Factories et utilitaires de tests API |
| `@10in/auth` | BetterAuth, OTP email/téléphone, validation téléphone, Resend et VerifyWay |
| `@10in/chat` | Durable Object PartyServer, SQLite interne, WebSockets, messages, réactions, présence et alarmes |
| `@10in/db` | Client LibSQL, schémas Drizzle, relations, migrations, seeds et utilitaires métier |
| `@10in/notifications` | Registre typé et i18n des notifications, envoi OneSignal |
| `@10in/env` | Validation des variables client/Worker |
| `@10in/utils`, `@10in/config` | Pays/logging partagés et configuration TypeScript |

### 2.3 Technologies

- TypeScript 6, pnpm workspaces et Turbo.
- Mobile : Expo 55, React Native 0.83, Expo Router, TanStack Query/tRPC, React Hook Form et TanStack Form, Zod, MMKV, OneSignal, PartySocket.
- Dashboard : React 19, Vite, TanStack Router/Query/Table/Form, shadcn/Base UI, Tailwind CSS, Google Maps.
- Serveur : Hono, tRPC 11, Cloudflare Workers, PartyServer/Durable Objects, R2.
- Données : Drizzle ORM, SQLite/LibSQL/Turso ; stockage SQLite propre au Durable Object pour le chat.
- Authentification/intégrations : BetterAuth, Resend, VerifyWay WhatsApp, Google Places, OpenWeatherMap, Apple App Store et Google Play.

### 2.4 Communication entre les composants

`mobile` et `dash` appellent `/trpc/*` sur le Worker. Les cookies BetterAuth créés sous `/api/auth/**` sont transmis au contexte tRPC. Le mobile appelle aussi les routes Hono pays, lieux, météo, versions et upload. Le chat passe par `/chat/parties/...`, authentifié par le cookie placé dans le paramètre `token`; Hono le valide puis injecte `X-User-ID`. Chaque match possède une instance Durable Object et son stockage SQLite. Drizzle accède à LibSQL/Turso pour les données applicatives. Les mutations métier alimentent le chat et le registre de notifications, lequel envoie via OneSignal. `apps/server/src/index.ts` lance chaque heure le calcul de badges.

## 3. Fonctionnalités de l'application mobile

Les routes Expo sont matérialisées dans `apps/mobile/src/app`. Les routes publiques sont `welcome`, `sign-in`, `select-country` et `onboarding`; le groupe `(app)` contient les onglets accueil, exploration et profil, ainsi que les écrans modaux de matchs, invitations, utilisateurs, cercles, notifications, badges et paramètres. Les fichiers de route délèguent généralement aux écrans de `src/screens`.

### 3.1 Authentification et onboarding

- Bienvenue et choix email/téléphone : `screens/auth/welcome-screen.tsx`, `sign-in-screen.tsx`, `components/identifier-*.tsx`.
- OTP téléphone via `authClient.phoneNumber.sendOtp/verify`; OTP email via `emailOtp.sendVerificationOtp` et `signIn.emailOtp`. Saisie, renvoi temporisé et erreurs existent dans `components/verification.tsx`.
- Pays et indicatif : route HTTP `/api/countries`, fallback local et `select-country-screen.tsx`.
- Garde de session et redirections : `hooks/use-auth-guard.ts`, `app/_layout.tsx`, `app/(app)/_layout.tsx`.
- Onboarding : saisie du nom (`authClient.updateUser`), photo de profil, ville et demande de notifications via `onboarding-screen.tsx` et les routes dédiées. L'état « profil complet » est dérivé du compte courant.
- Déconnexion nettoie OneSignal, cache/persistance Query et session BetterAuth (`lib/signout.ts`).

### 3.2 Profil utilisateur

- Consultation du profil, statistiques, graphique hebdomadaire, badges et cercles : `profile-screen.tsx`, `lib/api.ts`, `components/ui/game-activity-chart.tsx`.
- Modification nom/date de naissance/image : formulaire `edit-profile-screen.tsx`, `user.updateInfo` et upload multipart `/api/assets/upload`.
- Fiches d'autres joueurs : profil, statut de connexion, amis, matchs passés, badge, appel téléphonique conditionnel et actions hôte/cercle (`screens/user/**`).
- Paramètres : langue FR/EN, notification, déconnexion, suppression du compte et liens légaux (`settings-screen.tsx`). La suppression est une suppression logique de l'utilisateur et une révocation de sessions.

### 3.3 Gestion des matchs

- Accueil : prochains matchs, mes matchs passés/annulés et filtres dans `home/components/games-list.tsx`.
- Exploration géolocalisée : recherche autour des coordonnées/cité choisie par `games.exploreGamesList`; les règles backend filtrent visibilité publique, amis et cercles.
- Création/édition : club Google Places ou récent, format, date/heure, prix/devise, visibilité public/amis/privé, cercles et heure d'ouverture (`game/components/create-game-form/**`). Zod/TanStack Form puis `games.create/update`.
- Détail et chat unifiés : club, météo, statut, participants, invités, invitations, capacité, actions et conversation (`game-chat-screen.tsx`, `use-game-chat-screen-model.ts`).
- Hôte : confirmer/annuler, modifier, inviter, retirer un joueur, transférer l'hôte. `confirmGame` existe côté API mais aucun appel mobile n'a été localisé ; la confirmation paraît donc non exposée.
- Appel d'un joueur : `canCallPlayer` puis `getPlayerPhone`, uniquement pour joueurs acceptés du même match et selon la fenêtre temporelle définie côté serveur.

### 3.4 Inscriptions et invitations

- `acceptInvitation` couvre invitation, lien et découverte ; la capacité atomique place en `accepted` ou `waiting`.
- Décliner une invitation, quitter un match ou la liste d'attente, et notifications de place disponible sont implémentés. L'écran utilise explicitement accepter/quitter ; l'action `declineInvitation` n'a pas été retrouvée dans les appels mobiles, bien que l'API existe.
- Invitation d'amis et partage WhatsApp/générique d'un code de 6 caractères : `screens/invite/**`.
- Aperçu public pour landing : REST protégé par clé serveur `/api/invitations/:inviteId/public-game`; ce n'est pas appelé directement par le mobile.
- Invités sans compte : nom et téléphone optionnel, ajout par un joueur accepté, retrait par sponsor ou hôte, capacité et notifications (`add-guest-screen.tsx`, `guest-actions-screen.tsx`).

### 3.5 Amis et cercles

- Connexions : recherche/listing, demande, acceptation/rejet, annulation et suppression ; vues dans `user-friends-screen.tsx` et `user-details.tsx`.
- Cercles : créer/modifier/archiver, image R2, description riche, confidentialité, découverte/recherche, aperçu par code, partage et rotation du code côté API.
- Adhésion : demander/annuler, inviter, accepter/refuser, examiner les demandes, retirer/quitter et changer les rôles owner/admin/member.
- Jeux du cercle et restriction de visibilité par liaison `game_circles` : `circle-games-tab.tsx`, `circles.listGames`, formulaire de match.
- Les écrans `circle-link-editor` et `description-editor` conservent des données dans le store du formulaire avant `circles.update`; ils ne représentent pas des entités séparées en base.

### 3.6 Chat

- Connexion PartySocket par match, cookie BetterAuth, reconnexion liée au focus et persistance locale : `screens/chat/store/use-chat.ts`, `storage.ts`, `use-screen-focus.ts`.
- Chargement de l'historique, présence, statuts système, envoi avec identifiant temporaire/ACK, file et retry, modification serveur et réactions emoji.
- Validation Zod et contrôle auteur dans `packages/chat`; stockage SQLite du Durable Object, non dans `packages/db`.
- Notifications hors-ligne et alarmes avant/après match sont intégrées.
- Limite : le gestionnaire client porte un TODO pour l'événement de mise à jour (`screens/chat/store/event-handlers.ts`), et aucune commande d'édition visible n'a été localisée dans l'interface. L'édition est donc partielle côté client.

### 3.7 Notifications

- OneSignal initialise l'utilisateur, sa langue et les listeners ; opt-in/out dans l'écran de permission (`lib/one-signal.ts`, `lib/notifications/**`).
- Boîte de réception paginée, compteur non lu et « tout marquer comme lu » : `notifications-screen.tsx` et `api-social/src/notifications.ts`.
- Cartes typées naviguent vers matchs, joueurs, cercles ou badges selon le payload (`notification-card.tsx`).
- Le registre couvre événements de match, cercle, connexion, chat et badge, avec traductions FR/EN.

### 3.8 Badges et autres fonctionnalités

- Liste, progression verrouillée/déverrouillée, détail et amis possédant un badge : `screens/badges/**`, `components/badges/**` et `api-extras/src/badges.ts`.
- Badges `games_played` et `games_hosted` calculés après les matchs ; le cron est horaire.
- Météo à cinq jours depuis OpenWeatherMap (`hooks/use-weather.ts`). La route REST n'authentifie pas la session.
- Détection de mise à jour App Store/Google Play et prompt différable (`lib/store-versions/**`).
- Deep links initiaux, partage natif, ouverture de carte/téléphone, i18n et observabilité Sentry sont présents.

## 4. Fonctionnalités du dashboard d'administration

La route `/dashboard` est protégée côté client par `middleware/auth.ts` et côté API par `adminProcedure`, qui accepte seulement `admin` ou `superadmin`. `/login` utilise un OTP email. `admin.getLatestVerificationCode` est activé seulement hors production, mais reste une procédure publique dans ces environnements.

| Route | Données/actions observées | API |
|---|---|---|
| `/dashboard/` | Statistiques utilisateurs/matchs, tendances, statuts et activité | `admin.getStatistics` |
| `/dashboard/users` | Recherche, pagination, rôle/statut ; bannir/débannir, révoquer sessions, supprimer | BetterAuth admin directement ; les procédures `updateUser`, `softDeleteUser`, `restoreUser`, `getUserProfile` ne sont pas reliées à cette page |
| `/dashboard/games` | Tableau filtré/trié, navigation au détail | `admin.getAllGames` |
| `/dashboard/games/$gameId` | Détail, modification date/prix/statut, annulation, joueurs, ajout/retrait, lecture chat | `admin.getGameById`, `updateGame`, `cancelGame`, `getGamePlayers`, `searchUsers`, `addPlayerToGame`, `removePlayerFromGame`, `getGameChat` |
| `/dashboard/formats` | CRUD complet des formats | `getAllFormats`, `createFormat`, `updateFormat`, `deleteFormat` |
| `/dashboard/cities` | Liste, création, modification, carte, clubs d'une ville | `getAllCities`, `createCity`, `updateCity`, `getCityClubs`; `getOrCreateCity` non appelé |
| `/dashboard/clubs` | Liste, création/modification, ville et coordonnées/cartographie | `getAllClubs`, `createClub`, `updateClub` ; aucune suppression |
| `/dashboard/circles` et `/$circleId` | Liste/filtre puis détail propriétaire, membres et matchs | `getAllCircles`, `getCircleById`; lecture seule |
| `/dashboard/badges` | Calcul individuel/en masse, retrait, historique/tracking, catalogue et création | procédures admin badges + `badges.getUserBadges`; aucune modification/suppression de définition |

Toutes ces fonctions sont réservées aux administrateurs, sauf l'écran de connexion et la récupération de code de développement. La sidebar ne montre que les routes ci-dessus.

## 5. Fonctionnalités backend

### 5.1 Contrôles communs

`publicProcedure` journalise seulement ; `protectedProcedure` exige une session ; `adminProcedure` exige une session et le rôle admin/superadmin (`packages/api-core/src/trpc.ts`). Les entrées tRPC utilisent Zod et les erreurs Zod sont aplaties. Les règles fines (hôte, membre accepté, propriétaire/admin de cercle, audience, capacité et statut) sont réalisées dans chaque domaine. Hono possède un handler 500 global et CORS à origines configurées.

### 5.2 Catalogue des procédures tRPC

Chaque entrée donne `nom(paramètres principaux) — rôle ; tables ; consommateur`. Sauf mention contraire, Zod valide l'entrée et la procédure est protégée.

**Racine et utilisateur (`packages/api/src/routers/index.ts`, `packages/api-social/src/user.ts`)**

- `healthCheck()` public ; diagnostic. `privateData()` session ; diagnostic non consommé.
- `user.getCurrentUser()` — profil/cité ; `user`, `cities`; mobile.
- `user.updateInfo(name?, dateOfBirth?, image?)` — mise à jour du compte courant ; `user`; mobile ; champs bornés/validés.
- `user.setCity(googlePlaceId)` — crée/réutilise une ville Google puis l'affecte ; `cities`, `user`; mobile.
- `user.getAll()` — tous les utilisateurs ; `user`; aucun consommateur local, trop large pour une simple session.
- `user.getById(id)` — profil public enrichi ; `user`, jeux/connexions/badges ; mobile.
- `user.getLastVerificationCode()` public — dernier OTP seulement en développement ; `verification`; mobile debug.
- `user.getStats()` — statistiques du compte ; `games`, `game_players`, connexions ; mobile.
- `user.getContactMethods()` — email/téléphone vérifiés ; `user`; aucun appel local trouvé.
- `user.getUserGamesByWeek(userId?)`, `getFriends(userId,cursor?,limit?)` — activité et amis ; tables jeux/connexions ; mobile.
- `user.deleteAccount()` — soft delete, anonymisation et sessions révoquées ; `user`, `session`; mobile.

**Matchs (`packages/api-games/src/games.ts`)**

- `games.create(date,clubId,formatId,price,currency,visibility,joinableAt?,circleIds?)` — crée le match et l'hôte accepté, initialise chat et cercles ; `games`, `game_players`, `game_circles`, clubs/formats ; mobile. Vérifie date, références, appartenance aux cercles et cohérence visibilité.
- `games.update(id, mêmes champs partiels)` — hôte seulement, match actif ; mêmes tables, chat/alarmes ; mobile.
- `games.getInvitation(inviteId)`, `getWithDetails(id)`, `get(id)` — lectures invitation/détail/brute ; jeux, clubs, formats ; mobile pour les deux premières. `get/getWithDetails` n'effectuent pas de contrôle d'audience fin : risque de confidentialité.
- `games.upcomingGames()`, `myPastGames()`, `myCancelledGames()`, `listWithDetails()` — listes du compte ; jeux/joueurs/clubs/formats ; mobile sauf `listWithDetails` non localisé.
- `games.exploreGamesList(lat,lng)` — jeux visibles selon public, amis, cercle, distance et ouverture ; jeux/joueurs/connexions/cercles ; mobile.
- `games.cancelGame(id,reason?)` — hôte, actif, notifications et statut chat ; `games`, joueurs ; mobile.
- `games.getPastGamesByUserId(userId,cursor?,limit?)` — historique d'un joueur ; mobile.
- `games.confirmGame(id)` — hôte, transitions de statut/capacité ; aucun client local trouvé.
- `games.canCallPlayer(gameId,targetUserId)`, `getPlayerPhone(gameId,targetUserId)` — participants acceptés, règles temporelles ; `games`, `game_players`, `user`; mobile.

**Adhésion au match (`packages/api-games/src/game-membership/**`)**

- `invitePlayer(gameId,userId)` — invite/réinvite, sans restriction explicite à l'hôte : tout utilisateur authentifié peut inviter ; `games`, `game_players`, `user`; mobile. C'est un risque d'autorisation.
- `acceptInvitation(gameId)` — accepte ou rejoint, valide audience/activité/capacité et bascule en attente ; `games`, formats, joueurs, invités, cercles/connexions ; mobile.
- `declineInvitation(gameId)` — invitation existante seulement ; `game_players`; API testée, aucun appel client local trouvé.
- `removeInvite(invitationId)` — invitant seulement et invitation en attente ; `game_players`; aucun appel client local trouvé.
- `leaveGame(gameId)`, `leaveWaitlist(gameId)` — compte courant ; joueurs/invités ; mobile.
- `removePlayer(gameId,playerId)` — hôte, joueur non-hôte, match actif ; joueurs/invités ; mobile.
- `transferHost(gameId,newHostPlayerId)` — hôte vers joueur accepté ; `games`, joueurs, user ; mobile. Le champ `games.hostId` n'est pas mis à jour ici, alors que plusieurs contrôles s'y fient : incohérence probable.
- `addGuest(gameId,guestName,phone?)`, `removeGuest(gameId,guestId)` — joueur accepté puis sponsor/hôte ; jeux/formats/joueurs/invités ; mobile.
- `getPlayersByGameId(id)`, `getGuestsByGameId(id)` — listes ; joueurs/invités/user ; mobile. Session exigée, mais aucun contrôle d'appartenance/audience visible.

**Connexions et cercles (`packages/api-social/src/connections.ts`, `circles/**`)**

- `connections.getConnections(pagination)`, `getUsers(pagination)`, `getConnectionStatus(userId)` — listes/recherche/statut ; `user`, demandes, connexions ; mobile.
- `sendRequest(userId,message?)`, `respondToRequest(requestId,status)`, `removeRequest(requestId)`, `removeConnection(userId)` — cycle d'amitié ; demandes/connexions/notifications ; mobile. `removeRequest` ne reçoit pas `ctx` dans son handler et filtre seulement par identifiant : autorisation insuffisante probable.
- `circles.create(name,description?,image?,privacy)`, `update(circleId,...)`, `delete(circleId)` — création avec owner, modification/archivage owner/admin ; `circles`, `circle_members`; mobile.
- `getById(circleId)`, `getByShareCode(shareCode)` public, `listMine(pagination?)`, `listDiscoverable(search,cursor,limit)`, `listGames(circleId,...)` — détails/listes ; cercles/membres/jeux ; mobile. Les règles de visibilité sont appliquées dans les helpers métier.
- `getShareLink(circleId)`, `rotateShareCode(circleId)` — membre puis owner/admin ; cercles ; mobile pour le lien, rotation non exposée.
- `requestJoin(circleId)`, `cancelRequest(circleId)`, `inviteMember(circleId,userId)`, `respondInvite(circleId,accept)`, `reviewRequest(circleId,userId,approve)`, `removeMember(circleId,userId)`, `leave(circleId)`, `updateRole(circleId,userId,role)`, `listMembers(circleId,search?,status?,cursor?,limit?)` — workflow complet ; `circles`, membres, user, notifications ; mobile. Les helpers contrôlent owner/admin et empêchent les transitions invalides.

**Notifications, clubs et badges**

- `notifications.allNotificationsV2(cursor?,limit?)`, `allNotifications(pagination)`, `unreadCount()`, `markAllAsRead()` — boîte du compte ; `notifications`; mobile utilise V2/compteur/mark-all. L'ancienne liste reste disponible.
- `clubs.create(payload)`, `update(payload)` — session simple, sans rôle admin ; `clubs`; aucun client local trouvé, surface d'écriture trop permissive.
- `clubs.ensureFromPlace(googlePlaceId)`, `recentlyPlayed()`, `get(id)`, `getCurrencyByClubId(clubId)`, `list(pagination)`, `getAllFormats()` — Google Places, choix de terrain et formats ; clubs/villes/jeux/formats ; mobile. `update` et `create` sont non utilisés.
- `badges.getAllBadges()`, `getUserBadges(userId)`, `getBadgeDetail(badgeId,userId?)`, `getFriendsWithBadge(badgeId,cursor?,limit?)` — catalogue/progression/social ; badges/tracking/connexions ; mobile et dashboard.

**Administration (`packages/api-admin/src/**`)**

- Auth : `getLatestVerificationCode(email)` public, dev seulement ; `verification`; dashboard login.
- Utilisateurs : `getAllUsers(filtres)`, `getUserProfile(userId)`, `updateUser`, `banUser`, `unbanUser`, `softDeleteUser`, `restoreUser`; `user`, sessions et données associées. Seule la liste tRPC est remplacée en pratique par BetterAuth direct sur la page utilisateurs ; les autres procédures tRPC sont non consommées localement.
- Matchs : `getAllGames(filtres)`, `getGameById(id)`, `updateGame`, `cancelGame(id)`, `getStatistics()`, `getGamePlayers(gameId)`, `searchUsers(search,limit)`, `addPlayerToGame`, `removePlayerFromGame`, `getGameChat(gameId)` ; jeux/joueurs/invités/user + RPC Durable Object ; dashboard. Zod, rôle admin, existence/capacité et transitions sont contrôlés.
- Formats : `getAllFormats(pagination)`, `createFormat`, `updateFormat`, `deleteFormat(id)` ; formats/jeux ; dashboard, avec blocage de suppression si référencé.
- Villes : `createCity`, `getAllCities`, `getOrCreateCity(googlePlaceId)`, `getCityClubs(cityId)`, `updateCity`; villes/clubs ; dashboard sauf get-or-create.
- Clubs : `createClub`, `getAllClubs`, `updateClub`; clubs/villes ; dashboard. Pas de suppression.
- Cercles : `getAllCircles(filtres)`, `getCircleById(id)` ; cercles/membres/jeux ; dashboard lecture seule.
- Badges : `calculateUserBadges(userId)`, `calculateBadgesBulk()`, `removeUserBadge(userId,badgeId)`, `getUserTrackingHistory(pagination)`, `getUserTracking(userId)`, `getBadgeCalculationStats()`, `getAllBadges()`, `createBadge(category,threshold,name,description,icon)` ; tables badges/tracking/jeux ; dashboard.

### 5.3 Routes HTTP et WebSocket

| Route | Validation/autorisation | Stockage/service | Client |
|---|---|---|---|
| `GET/POST /api/auth/**` | BetterAuth/plugins OTP | auth tables, Resend/VerifyWay | mobile, dash |
| `POST /api/assets/upload` | session ; vérifie seulement `File` | R2 + image utilisateur | mobile |
| `POST /api/assets/circles/upload` | session ; vérifie seulement `File` | R2 | mobile |
| `GET /api/assets/r2/*` | public, clé non vide | R2 local/dev | assets |
| `GET /api/countries` | public | liste statique utils | mobile |
| `GET /api/places/autocomplete` | session, entrée ≥ 3 | Google Places | mobile ville |
| `GET /api/places/clubs-autocomplete` | session, texte ≥ 3 ou coordonnées | Google Places | mobile club |
| `GET /api/weather/:clubId?date=` | identifiants/date/plage 5 jours ; pas de session | clubs + OpenWeatherMap | mobile |
| `GET /api/invitations/:inviteId/public-game` | clé serveur header/bearer | jeux/joueurs/clubs/formats | landing externe |
| `GET /api/store-versions/latest` | public, cache 24 h | Apple/Google stores, cache mémoire | mobile |
| `/chat/parties/*` WebSocket | cookie en query puis session | Durable Object SQLite | mobile |

Les uploads n'imposent ni limite de taille ni liste MIME dans ce code. La route météo est publiquement accessible et peut consommer le quota tiers. Le cache des versions est en mémoire d'isolate, donc non global/durable.

## 6. Base de données

Les 19 tables applicatives sont exportées par les schémas Drizzle. `user.cityId` est relié dans `relations.ts` mais la colonne n'a pas de contrainte SQL `.references`, contrairement aux autres relations. Le chat utilise en plus des tables SQLite internes au Durable Object (messages, réactions, statuts, utilisateurs/état de notification) créées par les repositories de `packages/chat/src/domains/**` ; elles ne font pas partie des migrations Drizzle.

| Table | Rôle / colonnes principales | Relations principales | Fonctionnalités associées |
|---|---|---|---|
| `user` | identité, nom, email/téléphone vérifiés, image, naissance, rôle, ban, suppression, ville | sessions, jeux, joueurs, cercles, connexions, badges | auth, profil, admin |
| `session` | token, expiration, appareil/IP, impersonation | `userId → user` cascade | sessions BetterAuth |
| `account` | fournisseur et jetons BetterAuth | `userId → user` cascade | comptes auth |
| `verification` | identifiant, code/valeur, expiration | identifiant email/téléphone | OTP |
| `cities` | nom, pays, coordonnées, Google Place ID | utilisateurs et clubs | ville, exploration, admin |
| `clubs` | adresse, coordonnées, contacts, Google Place ID | ville, matchs | terrains, météo, admin |
| `game_formats` | nom, limite de joueurs | matchs | format/capacité |
| `games` | date, club, format, prix/devise, statut, hôte, code, visibilité, ouverture | club, format, host, joueurs, invités, cercles | cycle du match |
| `game_players` | utilisateur, invitant, hôte, statut, source et dates | jeu et utilisateurs | invitations, joueurs, attente |
| `game_guests` | nom, téléphone, sponsor, statut | jeu et sponsor | invités sans compte |
| `circles` | nom, description, image, confidentialité, code, archive | membres et jeux | cercles/partage |
| `circle_members` | rôle, statut d'adhésion | cercle et utilisateur, unicité paire | demandes/invitations/rôles |
| `game_circles` | liaison jeu-cercle | jeu et cercle, unicité paire | visibilité et calendrier cercle |
| `connection_requests` | émetteur, destinataire, statut, message | deux utilisateurs | demandes d'ami |
| `user_connections` | paire d'utilisateurs | deux utilisateurs | amitiés |
| `notifications` | destinataire, type, payload JSON, lu/date | utilisateur | boîte et push |
| `badges` | catégorie, seuil, nom, description, icône | attributions | catalogue |
| `user_badges` | utilisateur, badge, date de déblocage | user et badge, unicité paire | progression/récompenses |
| `user_tracking` | totaux joués/hébergés | utilisateur unique | calcul incrémental badges |

Les migrations `0000` à `0015` montrent l'évolution générée du schéma. Les seeds couvrent utilisateurs, clubs et matchs. Les contraintes notables sont les codes d'invitation/partage uniques, les paires membre/joueur/badge uniques et les cascades de suppression.

## 7. Tableau récapitulatif des fonctionnalités

| Module | Fonctionnalité | Interface | API | Base de données | Validation et autorisation | Statut | Preuves dans le code |
|---|---|---|---|---|---|---|---|
| Auth | OTP téléphone | Oui | BetterAuth | verification, user, session | téléphone validé, expiration | ✅ Implémentée | `screens/auth/components/identifier-phone-input.tsx`; `verification.tsx`; `auth/src/auth.ts` |
| Auth | OTP email | Oui mobile/dash | BetterAuth | verification, user, session | email, expiration | ✅ Implémentée | `identifier-email-input.tsx`; `dash/routes/login.tsx`; `auth/src/email-service.ts` |
| Auth | Onboarding | Oui | BetterAuth + user/setCity/upload | user, cities | session, formulaires | ✅ Implémentée | `screens/auth/onboarding-screen.tsx`; `screens/user/full-name-screen.tsx` |
| Auth | Déconnexion | Oui | BetterAuth | session | session courante | ✅ Implémentée | `mobile/src/lib/signout.ts`; `dash/components/app-sidebar.tsx` |
| Profil | Voir/modifier profil | Oui | user.* | user, cities | session/Zod | ✅ Implémentée | `profile-screen.tsx`; `edit-profile-screen.tsx`; `api-social/src/user.ts` |
| Profil | Avatar utilisateur | Oui | REST upload | R2 + user.image | session, File uniquement | 🟡 Partiellement implémentée | `lib/upload-assets.ts`; `api/src/assets.ts` (pas de taille/MIME) |
| Profil | Suppression de compte | Oui | user.deleteAccount | user, session | compte courant | ✅ Implémentée | `profile/settings-screen.tsx`; `api-social/src/user.ts` |
| Profil | Statistiques/activité | Oui | user.getStats/getUserGamesByWeek | games, game_players | session | ✅ Implémentée | `lib/api.ts`; `game-activity-chart.tsx`; `api-social/src/user.ts` |
| Social | Demandes d'ami | Oui | connections.* | connection_requests | session ; retrait fragile | 🟡 Partiellement implémentée | `user-friends-screen.tsx`; `api-social/src/connections.ts:143` |
| Social | Liste d'amis | Oui | getConnections/getFriends | user_connections | session/pagination | ✅ Implémentée | `user-friends-screen.tsx`; `api-social/src/connections.ts` |
| Match | Création | Oui | games.create | games, players, circles | Zod, date/références/cercle | ✅ Implémentée | `create-game-form/form.tsx`; `api-games/src/games.ts:85` |
| Match | Modification | Oui | games.update | games, circles | hôte, actif | ✅ Implémentée | `create-game-form/form.tsx`; `api-games/src/games.ts:201` |
| Match | Détail | Oui | getWithDetails + membership | jeux et relations | session, audience insuffisante | 🟡 Partiellement implémentée | `game-chat-screen.tsx`; `api-games/src/games.ts:474` |
| Match | Listes personnelles | Oui | upcoming/past/cancelled | games, players | compte courant | ✅ Implémentée | `home/components/games-list.tsx`; `api-games/src/games.ts` |
| Match | Exploration/localisation | Oui | exploreGamesList | games, connexions, cercles | session, audience/distance | ✅ Implémentée | `games-list.tsx:526`; `api-games/src/games.ts:510` |
| Match | Confirmation manuelle | Non trouvée | confirmGame | games, players | hôte/transitions | 🟡 Partiellement implémentée | `api-games/src/games.ts:628`; aucun appel client trouvé |
| Match | Annulation | Oui | cancelGame | games, notifications | hôte, actif | ✅ Implémentée | `cancel-game-screen.tsx`; `api-games/src/games.ts:518` |
| Match | Appel joueur | Oui | canCallPlayer/getPlayerPhone | games, players, user | participants/fenêtre | ✅ Implémentée | `user/components/user-details.tsx`; `api-games/src/games.ts:701` |
| Adhésion | Rejoindre/accepter | Oui | acceptInvitation | games, players, formats | audience, capacité atomique | ✅ Implémentée | `game-join-button.tsx`; `game-membership/invitations.ts:137` |
| Adhésion | Décliner invitation | Non localisée | declineInvitation | game_players | invité/session | 🟡 Partiellement implémentée | `game-membership/invitations.ts:183`; aucun appel mobile trouvé |
| Adhésion | Liste d'attente | Oui | accept/leaveWaitlist | game_players | capacité/statut | ✅ Implémentée | `game-join-button.tsx`; `game-membership/players.ts:324` |
| Adhésion | Inviter un joueur | Oui | invitePlayer | game_players | session, pas hôte | 🟡 Partiellement implémentée | `invite/invite-screen.tsx`; `game-membership/invitations.ts:22` |
| Adhésion | Quitter/retirer | Oui | leaveGame/removePlayer | players, guests | joueur/hôte | ✅ Implémentée | `game-actions-screen.tsx`; `player-actions-screen.tsx`; `players.ts` |
| Adhésion | Transfert d'hôte | Oui | transferHost | games, players | hôte/joueur accepté | 🟡 Partiellement implémentée | `player-actions-screen.tsx`; `players.ts:222` (hostId non modifié) |
| Invités | Ajouter/retirer invité | Oui | addGuest/removeGuest | game_guests | joueur accepté, sponsor/hôte | ✅ Implémentée | `add-guest-screen.tsx`; `guest-actions-screen.tsx`; `guests.ts` |
| Invitation | Partage lien match | Oui | code dans game | games | session/native share | ✅ Implémentée | `invite/invite-screen.tsx`; `games.inviteId` |
| Invitation | Landing publique | Externe | REST public-game | games, players | clé serveur | ❓ À tester | `api/src/routes/invitations.ts`; tests route présents |
| Cercles | CRUD et image | Oui | circles.create/update/delete | circles, members, R2 | owner/admin ; upload File | ✅ Implémentée | `circle-form-screen.tsx`; `circles/crud.ts`; `api/src/assets.ts` |
| Cercles | Découverte/aperçu | Oui | listDiscoverable/getByShareCode | circles, members | confidentialité/code | ✅ Implémentée | `circle-discover-screen.tsx`; `circles/crud.ts` |
| Cercles | Demandes/invitations | Oui | membership.* | circle_members | transitions/rôles | ✅ Implémentée | `circle-pending-requests-screen.tsx`; `circles/membership.ts` |
| Cercles | Membres et rôles | Oui | list/remove/updateRole/leave | circle_members | owner/admin | ✅ Implémentée | `circle-members-tab.tsx`; `circles/membership.ts` |
| Cercles | Jeux du cercle | Oui | listGames + gameCircles | game_circles, games | membre/visibilité | ✅ Implémentée | `circle-games-tab.tsx`; `circles/crud.ts:370` |
| Chat | Temps réel/historique | Oui | WebSocket DO | SQLite DO | session + Zod | ✅ Implémentée | `chat/store/use-chat.ts`; `chat/src/chat.server.ts` |
| Chat | Envoi/ACK/retry | Oui | message:add | SQLite DO | contenu 1..limite | ✅ Implémentée | `chat/store/**`; `chat/src/websocket-handler.ts` |
| Chat | Réactions | Oui | reaction add/remove | SQLite DO | schéma/auteur | ✅ Implémentée | `message-reactions.tsx`; `websocket-handler.ts` |
| Chat | Édition message | Interface non trouvée | message:update | SQLite DO | auteur/contenu | 🔴 Incomplète | `websocket-handler.ts`; TODO `chat/store/event-handlers.ts:41` |
| Chat | Présence/statuts système | Oui | WS/RPC DO | SQLite DO | connexion/session | ✅ Implémentée | `chat.server.ts`; `status/**`; tests chat |
| Notifications | Push OneSignal | Prompt/réglage | service notifications | notifications + OneSignal | compte/langue/permission | ❓ À tester | `lib/one-signal.ts`; `notifications/src/send-notification.ts` |
| Notifications | Boîte et compteur | Oui | notifications.* | notifications | compte courant | ✅ Implémentée | `notifications-screen.tsx`; `api-social/src/notifications.ts` |
| Notifications | Rappels de match | Non direct | alarmes DO | SQLite DO/OneSignal | joueurs acceptés | ❓ À tester | `chat/src/domains/notification/**`; tests intégration |
| Badges | Catalogue/progression | Oui | badges.* | badges, user_badges, tracking | session | ✅ Implémentée | `screens/badges/**`; `api-extras/src/badges.ts` |
| Badges | Déblocage automatique | Notification seulement | cron horaire | games, players, badges, tracking | matchs terminés | ❓ À tester | `server/wrangler.json`; `api-extras/src/badge-unlock.ts` |
| Divers | Météo | Oui | REST weather | clubs + OpenWeather | date 5 jours, pas session | 🟡 Partiellement implémentée | `hooks/use-weather.ts`; `api/src/routes/weather.ts` |
| Divers | Versions stores | Prompt | REST latest | cache mémoire + stores | parsing distant | ❓ À tester | `lib/store-versions/**`; `api/src/routes/store-versions.ts` |
| Admin | Accès dashboard | Oui | adminProcedure | user/session | rôle admin/superadmin | ✅ Implémentée | `dash/middleware/auth.ts`; `api-core/src/trpc.ts` |
| Admin | Utilisateurs | Oui | BetterAuth admin + tRPC liste | user/session | admin | ✅ Implémentée | `dash/routes/dashboard/users.tsx`; `api-admin/src/users.ts` |
| Admin | Matchs/joueurs/chat | Oui | admin games.* | games/players + DO | admin/Zod/capacité | ✅ Implémentée | `dash/routes/dashboard/games/**`; `api-admin/src/games.ts` |
| Admin | Formats | Oui | CRUD formats | game_formats | admin/références | ✅ Implémentée | `dash/routes/dashboard/formats.tsx`; `api-admin/src/formats.ts` |
| Admin | Villes/clubs | Oui | admin cities/clubs | cities, clubs | admin/Zod | ✅ Implémentée | `dash/routes/dashboard/cities.tsx`; `clubs.tsx`; `api-admin/src` |
| Admin | Cercles | Oui lecture | getAll/getById | circles/members/games | admin | ✅ Implémentée | `dash/routes/dashboard/circles/**`; `api-admin/src/circles.ts` |
| Admin | Badges | Oui | calcul/catalogue | badges/tracking | admin | ✅ Implémentée | `dash/routes/dashboard/badges.tsx`; `api-admin/src/badges.ts` |
| Admin | Modifier/supprimer badge | Non trouvée | Non trouvée | badges | — | ⚪ Non trouvée | création seule dans `api-admin/src/badges.ts` |

**Comptage du tableau : 52 fonctionnalités — 37 ✅, 8 🟡, 5 ❓, 1 🔴, 1 ⚪.**

## 8. Fonctionnalités partielles ou incomplètes

1. **Avatar et images de cercle** : upload fonctionnel, mais aucune limite de taille, dimension ou type MIME autorisé côté serveur ; un fichier arbitraire authentifié peut être stocké.
2. **Confidentialité des détails/listes de match** : plusieurs queries exigent une session mais ne vérifient pas systématiquement l'audience ou l'appartenance (`getWithDetails`, listes joueurs/invités).
3. **Invitation de joueur** : `invitePlayer` ne contrôle pas que l'appelant est hôte ou participant ; toute session semble pouvoir inviter à un match connu.
4. **Retrait d'une demande de connexion** : `removeRequest` n'utilise pas la session dans le handler et supprime par identifiant ; un identifiant connu pourrait suffire.
5. **Transfert d'hôte** : `game_players.isHost` est transféré, mais `games.hostId` reste inchangé. Les contrôles utilisant `games.hostId` peuvent continuer à reconnaître l'ancien hôte.
6. **Confirmation et refus d'invitation** : procédures backend et tests présents, mais aucun déclencheur client localisé pour `confirmGame` et `declineInvitation`.
7. **Édition de message** : support serveur présent, mais gestion client explicitement inachevée et aucune interface visible.
8. **Météo** : endpoint sans session, exposant potentiellement le quota OpenWeatherMap.
9. **Écritures club hors admin** : `clubs.create/update` utilisent `protectedProcedure`, sans rôle admin et sans consommateur local ; surface à confirmer ou retirer.
10. **Dashboard** : procédures de profil/restauration utilisateur, création automatique de ville et rotation de code cercle existent sans interface ; badges n'ont ni édition ni suppression.
11. **Schéma ville utilisateur** : relation Drizzle déclarée, mais `user.cityId` n'a pas de clé étrangère SQL.
12. **OTP non-production** : VerifyWay et Resend ne transmettent rien hors production, sauf comptes QA statiques ; le parcours doit être testé avec la configuration prévue.

## 9. Éléments à vérifier manuellement

- OTP réel Resend et VerifyWay, cookies Expo/web et expiration/renvoi.
- Redirections onboarding, deep links `i/[id]` et `c/[id]`, landing externe.
- Concurrence de capacité : deux inscriptions/invités simultanés et ordre de liste d'attente.
- Visibilités public/amis/privé/cercle depuis des comptes aux relations différentes.
- Transfert d'hôte puis modification, annulation, retrait et départ.
- Reconnexion/hybridation du Durable Object, historique, ACK/retry, réactions et notifications hors-ligne.
- Alarmes 1 h, veille et lendemain selon fuseau ; suppression après annulation.
- Livraison OneSignal sur iOS/Android, navigation depuis chaque type de payload, badge d'icône.
- Cron horaire, idempotence du tracking et notification de badge.
- Uploads photo sur R2, cache/CDN, formats volumineux ou non-images.
- Google Places, géolocalisation, ouverture de cartes et météo aux limites de cinq jours.
- Parsing des versions App Store/Play Store et comportement hors réseau.
- Toutes les opérations dashboard et leurs états d'erreur/chargement.

Les tests automatisés couvrent largement API jeux/membership, cercles, connexions, notifications, badges, routes invitations/store, auth OTP et chat (unitaires, WebSocket, hibernation et alarmes). Les écrans mobile/dashboard n'ont pas de tests de parcours ; quelques tests mobiles ciblent utilitaires, store chat et versions.

## 10. Conclusion

Le produit contient un parcours joueur substantiel et connecté : authentification OTP, profil, découverte/création de matchs, adhésion avec attente, invitations et invités, réseau social, cercles, chat temps réel, notifications et badges. Le dashboard couvre les principales ressources opérationnelles. Le backend dispose de validations métier et de tests nettement plus riches que les clients.

Les principaux risques statiques concernent les autorisations fines sur certaines procédures, l'incohérence du transfert d'hôte, la validation des uploads, les capacités backend sans interface et les intégrations externes impossibles à certifier sans exécution. Le chat est complet pour envoi/réception/réactions, mais l'édition reste inachevée côté mobile.

### Comptage vérifié des statuts

Comptage des lignes du tableau récapitulatif :

- ✅ Implémentée : 37
- 🟡 Partiellement implémentée : 8
- ❓ À tester : 5
- 🔴 Incomplète : 1
- ⚪ Non trouvée : 1
- **Total : 52 fonctionnalités**
