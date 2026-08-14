# Commandes de base de données

Depuis la racine :

```powershell
$env:DATABASE_URL='file:./local.db'
pnpm --filter @10in/db db:generate
pnpm --filter @10in/db db:migrate
pnpm --filter @10in/db db:seed
pnpm --filter @10in/db test
```

Pour Turso, définir `DATABASE_URL=libsql://...` et `DATABASE_AUTH_TOKEN` dans l'environnement. Ne jamais les versionner. `db:generate` ajoute une migration à `packages/db/drizzle`; relire le SQL avant `db:migrate`. Le seed est reproductible grâce aux identifiants fixes et à `ON CONFLICT DO NOTHING`.
