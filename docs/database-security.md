# Sécurité des données

- Les secrets BetterAuth, tokens Turso et fournisseurs OTP restent dans les bindings/environnements Cloudflare.
- Les valeurs OTP sont gérées et transformées par BetterAuth; aucun OTP, mot de passe ou token réel n'est seedé.
- Les utilisateurs sont anonymisés et marqués par `deletedAt`; leurs références historiques ne sont pas supprimées.
- Les sessions et comptes sont supprimés en cascade lors d'une purge administrative exceptionnelle.
- Les clés étrangères doivent être activées sur toute connexion SQLite locale (`PRAGMA foreign_keys=ON`); LibSQL/Turso les applique côté service.
- Les payloads JSON ne doivent contenir que les identifiants nécessaires, jamais de secret ni de donnée personnelle superflue.
- Les migrations sont immuables après déploiement. Toute évolution produit une nouvelle migration et fait l'objet d'une sauvegarde/restauration testée.
- L'accès Worker utilise une factory de client sans état global mutable; les credentials sont injectés par bindings.
