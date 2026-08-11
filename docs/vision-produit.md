# Vision produit

## Résumé

10in est une application sociale mobile qui aide les joueurs de football amateur à trouver, organiser et remplir des matchs locaux. Le produit réduit trois frictions : trouver des joueurs fiables, coordonner les informations du match et maintenir une communauté après la rencontre.

Le dashboard web permet à une petite équipe d'exploitation de modérer les utilisateurs et les matchs, et de maintenir les référentiels de villes, clubs et formats.

## Problème utilisateur

Aujourd'hui, l'organisation repose souvent sur des groupes de messagerie dispersés, des listes manuelles et des relances individuelles. Il est difficile de connaître les places restantes, de remplacer un désistement, de partager la bonne adresse et de savoir qui participe réellement.

## Utilisateurs cibles

- **Joueur** : cherche un match proche, rejoint une partie et suit ses participations.
- **Organisateur** : crée un match, remplit les places et gère les participants.
- **Invité sans compte** : est ajouté ponctuellement par un participant.
- **Responsable de cercle** : anime un groupe récurrent de joueurs.
- **Administrateur** : modère et maintient les données opérationnelles.

## Proposition de valeur

> Trouver ou organiser un match amateur local, remplir les places et coordonner les joueurs depuis une seule application.

## Parcours cœur

1. Le joueur s'authentifie par OTP et complète un profil minimal.
2. Il découvre des matchs selon sa ville ou crée le sien.
3. Il rejoint une place disponible ou passe automatiquement en liste d'attente.
4. Les participants reçoivent les changements importants et échangent dans le chat du match.
5. L'organisateur gère les participants, les invités et l'annulation éventuelle.

## Principes produit

- La disponibilité d'une place doit être exacte, même en cas d'inscriptions simultanées.
- Une information privée n'est visible que par son audience autorisée.
- Les actions critiques affichent clairement leur résultat et sont auditables.
- Le produit reste utilisable si une intégration non essentielle est indisponible.
- Le MVP optimise d'abord le taux de matchs remplis, pas le volume de fonctions sociales.

## Indicateurs de succès

- activation : profil complété puis première création ou inscription sous 7 jours ;
- liquidité : part des matchs atteignant leur capacité cible ;
- délai médian pour remplir un match ;
- taux d'annulation et taux de désistement ;
- rétention des joueurs et organisateurs à 4 semaines ;
- fiabilité : erreurs d'inscription, doublons et dépassements de capacité ;
- sécurité : incidents d'accès non autorisé et délai de traitement des signalements.

## Périmètre fonctionnel observé dans le README

### Mobile

Le produit décrit couvre OTP email/téléphone, onboarding, profil, exploration géolocalisée, création et gestion de matchs, invitations et invités, liste d'attente, amis, cercles, chat temps réel, notifications, badges, météo, deep links, partage et détection de version.

### Dashboard

Le dashboard couvre les statistiques, utilisateurs, matchs, participants et chat, ainsi que les référentiels de formats, villes et clubs. Les cercles sont consultables et les badges sont calculables/créables, mais plusieurs opérations d'administration ne disposent pas d'interface.

### Backend

Le backend combine authentification BetterAuth, API tRPC, routes Hono, stockage relationnel LibSQL/Turso, objets R2, chat WebSocket sur Durable Objects, notifications OneSignal et tâches planifiées de badges.

## Hors objectifs du MVP

- devenir un réseau social généraliste ;
- classement compétitif, paiement ou réservation de terrain ;
- édition riche des messages et présence avancée ;
- gamification complète ;
- gestion exhaustive de communautés complexes ;
- dépendance obligatoire à la météo ou aux stores pour accomplir le parcours cœur.

## Points à clarifier avec les parties prenantes

- pays et villes de lancement, langues et devises ;
- qui peut inviter un joueur : hôte uniquement ou tout participant ;
- définition métier des statuts `active`, `confirmed`, `completed` et `cancelled` ;
- moment exact où un numéro de téléphone devient visible ;
- politique de conservation du chat et des données d'un compte supprimé ;
- modèle économique et responsabilités liées aux terrains/prix ;
- règles de modération, signalement et blocage, absentes du périmètre décrit.
