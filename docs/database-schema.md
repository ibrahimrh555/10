# Schéma de base de données

La base métier utilise SQLite/LibSQL/Turso via Drizzle. Les dates sont stockées en millisecondes Unix, les booléens en entiers SQLite, les prix en unités monétaires mineures et les payloads de notification en JSON sérialisé.

## Authentification

`user`, `session`, `account` et `verification` suivent BetterAuth 1.6.23. Les plugins admin et phone-number ajoutent respectivement les champs de rôle/bannissement et de téléphone. Les extensions d'onboarding sont déclarées dans la configuration BetterAuth et dans le même schéma Drizzle.

## Métier

- Référentiels : `cities`, `clubs`, `game_formats`.
- Matchs : `games`, `game_players`, `game_guests`, `game_circles`.
- Social : `circles`, `circle_members`, `connection_requests`, `user_connections`.
- Notifications : `notifications`, `notification_preferences`, `notification_devices`.
- Progression : `badges`, `user_badges`, `user_tracking`.

## Chat Durable Objects

Le chat n'est pas stocké dans cette base. Chaque Durable Object de match possède son SQLite interne avec les tables logiques suivantes : `messages` (auteur, contenu, création, modification), `reactions` (message, auteur, emoji, paire unique), `participants`/`presence` (utilisateur, état, dernière activité) et `notification_state` (rappels envoyés et curseurs). Leur cycle de vie suit celui de l'instance Durable Object.
