# Backend Email OTP

## Architecture

Le Worker Hono expose BetterAuth sous `/api/auth/**` et tRPC sous `/trpc/**`. Chaque requête construit un client LibSQL et une instance BetterAuth à partir des bindings, puis ferme le client après la réponse. L'envoi d'e-mail est confié à `ExecutionContext.waitUntil`, sans promesse flottante. Le téléphone n'a aucun endpoint applicatif et reste désactivé côté produit.

BetterAuth 1.6.23 utilise le plugin Email OTP avec un code numérique de 6 chiffres, une expiration de 600 secondes, cinq tentatives, un stockage hashé, l'inscription automatique et une limite d'un envoi par fenêtre de 60 secondes. Les réponses de demande ne contiennent jamais le code.

## Endpoints BetterAuth

- `POST /api/auth/email-otp/send-verification-otp` avec `{ "email": "user@example.com", "type": "sign-in" }`.
- `POST /api/auth/sign-in/email-otp` avec `{ "email": "user@example.com", "otp": "123456" }`.
- `GET /api/auth/get-session` avec le cookie de session.
- `POST /api/auth/sign-out` pour révoquer la session courante.

Le client conserve temporairement `email` et `cityId`, puis appelle `user.setCity` seulement après réception du cookie de session. L'OTP ne doit jamais être écrit dans MMKV ou AsyncStorage.

## Procédures tRPC

- `cities.list({ countryCode? })` : maximum 100 villes triées et champs publics uniquement.
- `cities.search({ search, countryCode? })` : recherche insensible aux accents et maximum 20 résultats.
- `user.setCity({ cityId })` : session obligatoire et nouvelle validation de la ville.
- `user.getOnboardingStatus()` : renvoie `NAME`, `PHOTO`, `NOTIFICATIONS` ou `COMPLETED`.

## Variables

`NODE_ENV`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `OTP_PROVIDER`, `RESEND_API_KEY`, `OTP_FROM_EMAIL`, `DATABASE_URL`, `DATABASE_AUTH_TOKEN` et `MOBILE_APP_ORIGIN` sont validées au démarrage de la requête. Les secrets de production se configurent avec `wrangler secret put`, jamais dans Git.

En local, utiliser `OTP_PROVIDER=development`; le code est visible uniquement dans le terminal. Ce provider refuse de démarrer avec `NODE_ENV=production`. Pour Resend, vérifier le domaine expéditeur puis utiliser une adresse validée dans `OTP_FROM_EMAIL`.

## Test local

```powershell
pnpm --filter @10in/db db:migrate
pnpm --filter @10in/db db:seed
pnpm --filter @10in/server dev
```

Exemple de demande :

```bash
curl -i -X POST http://localhost:8787/api/auth/email-otp/send-verification-otp -H "content-type: application/json" -d '{"email":"joueur@example.test","type":"sign-in"}'
```

Copier le code du terminal local puis appeler `/api/auth/sign-in/email-otp`. Conserver le cookie retourné, appeler `user.setCity`, puis `user.getOnboardingStatus`; un nouvel utilisateur sans nom obtient `NAME`.

## Erreurs et sécurité

Les entrées invalides retournent 400, une limitation 429, un OTP incorrect/expiré une erreur générique d'authentification et une absence de session tRPC `UNAUTHORIZED`. Les erreurs internes Hono ne révèlent aucun détail. CORS n'accepte que `MOBILE_APP_ORIGIN`; les cookies sont HttpOnly, SameSite=Lax et Secure en production. Les OTP sont hashés, expirent, deviennent invalides après cinq essais, ne sont jamais loggés en production et la clé Resend reste exclusivement dans les bindings Worker.
