# Relations et politique de suppression

Les suppressions en cascade sont réservées aux données dépendantes sans valeur historique autonome : sessions/comptes auth, préférences, appareils, notifications, associations et attributions. Les villes, clubs, formats, hôtes, joueurs, sponsors, propriétaires et badges référencés utilisent `RESTRICT`; un utilisateur doit être supprimé logiquement via `user.deletedAt`.

Relations principales : une ville possède clubs et utilisateurs; un club et un format possèdent des matchs; un match possède joueurs, invités et cercles; un cercle possède membres et matchs; un utilisateur possède sessions, comptes, participations, notifications, badges et tracking.

Les relations Drizzle sont exportées avec le schéma. Les index couvrent toutes les clés étrangères chaudes, la recherche de villes/clubs/utilisateurs, date/statut/visibilité des matchs et la boîte de notifications. Les connexions imposent une paire canonique; les demandes `pending` utilisent un index fonctionnel symétrique.
