# Schéma de base de données

## Vue d'ensemble

Le README recense 19 tables applicatives dans LibSQL/Turso, gérées avec Drizzle, et un stockage SQLite distinct par Durable Object pour le chat. La base relationnelle porte l'identité, les droits et le cycle des matchs ; le stockage du chat ne doit pas devenir une deuxième source de vérité pour les autorisations.

## Domaines et entités

### Identité et authentification

| Entité | Rôle | Relations principales |
|---|---|---|
| `user` | profil, contacts vérifiés, rôle, bannissement, suppression logique, ville | ville, sessions, matchs, relations sociales, badges |
| `session` | session BetterAuth, expiration, appareil/IP, impersonation | `userId → user` avec cascade |
| `account` | fournisseur et jetons d'authentification | `userId → user` avec cascade |
| `verification` | challenge OTP et expiration | identifiant email/téléphone |

### Référentiels géographiques et sportifs

| Entité | Rôle | Relations principales |
|---|---|---|
| `cities` | ville, pays, coordonnées, Google Place ID | utilisateurs, clubs |
| `clubs` | terrain, adresse, coordonnées, contacts, Place ID | ville, matchs |
| `game_formats` | format et capacité maximale | matchs |

### Matchs

| Entité | Rôle | Relations principales |
|---|---|---|
| `games` | date, club, format, prix/devise, statut, hôte, code, visibilité, ouverture | club, format, hôte, joueurs, invités, cercles |
| `game_players` | adhésion d'un compte, invitant, statut, source, rôle hôte | match, utilisateur, invitant |
| `game_guests` | invité sans compte, téléphone optionnel, sponsor, statut | match, sponsor |
| `game_circles` | audience/association match-cercle | match, cercle ; paire unique |

### Social

| Entité | Rôle | Relations principales |
|---|---|---|
| `circles` | communauté, confidentialité, code de partage, archivage | membres, matchs |
| `circle_members` | adhésion, statut et rôle owner/admin/member | cercle, utilisateur ; paire unique |
| `connection_requests` | demande d'amitié et statut | émetteur, destinataire |
| `user_connections` | relation d'amitié acceptée | paire d'utilisateurs |
| `notifications` | boîte durable, type, payload, lecture | destinataire utilisateur |

### Gamification

| Entité | Rôle | Relations principales |
|---|---|---|
| `badges` | définition, catégorie, seuil et présentation | attributions |
| `user_badges` | badge débloqué et date | utilisateur, badge ; paire unique |
| `user_tracking` | compteurs de matchs joués/hébergés | utilisateur unique |

## Relations structurantes

```text
cities 1 ── n user
cities 1 ── n clubs
user 1 ── n games (hostId)
clubs 1 ── n games
game_formats 1 ── n games
games 1 ── n game_players n ── 1 user
games 1 ── n game_guests n ── 1 user (sponsor)
games n ── n circles (game_circles)
circles 1 ── n circle_members n ── 1 user
user n ── n user (requests/connections)
user n ── n badges (user_badges)
```

## Contraintes recommandées

- clé étrangère SQL sur `user.cityId`, absente d'après le README ;
- unicité sur les codes d'invitation et de partage ;
- unicité `(gameId, userId)`, `(circleId, userId)` et `(userId, badgeId)` ;
- contraintes empêchant les auto-demandes de connexion et paires sociales dupliquées dans l'ordre inverse ;
- valeurs contrôlées pour statuts, rôles, visibilité, devise et source ;
- prix non négatif, capacité strictement positive et dates cohérentes ;
- index sur dates/statuts des matchs, coordonnées ou stratégie géospatiale, clés étrangères, notifications non lues et recherches admin ;
- `games.hostId` comme source canonique de l'hôte, avec synchronisation transactionnelle de `game_players.isHost` ou suppression de cette duplication ;
- suppression logique utilisateur compatible avec les contraintes uniques d'email/téléphone et l'anonymisation.

## Invariants métier

- un match a exactement un hôte actif ;
- l'hôte est un participant accepté du match ;
- joueurs acceptés + invités acceptés ne dépassent jamais la capacité du format ;
- une adhésion ne peut occuper simultanément les états accepté et attente ;
- seul un membre accepté peut recevoir un rôle de cercle ;
- un cercle possède toujours au moins un owner, sauf archivage/suppression ;
- une notification appartient exclusivement à son destinataire ;
- les opérations de promotion depuis l'attente sont atomiques et ordonnées.

## Stockage du chat

Chaque match possède une instance Durable Object avec des tables internes pour messages, réactions, statuts, utilisateurs présents et état de notification. Les champs minimaux recommandés sont :

- message : identifiant serveur, identifiant client idempotent, auteur, contenu, création, modification et suppression logique ;
- réaction : message, utilisateur, emoji, création, avec unicité du triplet ;
- état de lecture/notification : utilisateur, dernier message lu et dernière notification envoyée.

L'accès doit être réévalué depuis la base principale lors de la connexion et après un changement d'adhésion. La rétention, l'export et la suppression doivent inclure ce stockage séparé.

## Données sensibles et conservation

- téléphone, email, date de naissance, IP et tokens sont des données sensibles à accès restreint ;
- les OTP doivent expirer rapidement et ne jamais être stockés ou journalisés en clair ;
- les payloads JSON de notification doivent être validés par type et ne pas contenir de secrets ;
- définir des délais pour vérifications expirées, sessions, notifications, chat, comptes supprimés et objets R2 orphelins ;
- maintenir une trace d'audit distincte des données métier pour les actions d'administration.

## Migrations et qualité

- appliquer les migrations dans l'ordre et tester aller-retour sur une copie ;
- contrôler les données existantes avant d'ajouter clés étrangères et contraintes ;
- tester concurrence d'inscription, transfert d'hôte, suppression de compte et archivage de cercle ;
- conserver des seeds sans données personnelles et un jeu de données de tests couvrant toutes les audiences.
