# Authentification mobile par e-mail OTP

## Architecture du flux

`sign-in` charge les villes publiques par tRPC, valide l'e-mail et le `cityId`, puis demande un OTP à BetterAuth. Le store en mémoire `pending-auth-store` conserve uniquement l'e-mail normalisé, le `cityId` et l'heure de demande. `otp` vérifie le code, confirme la session BetterAuth, appelle `user.setCity`, lit `user.getOnboardingStatus`, efface le store et remplace la route courante par l'étape suivante.

Le code OTP n'est ni persisté, ni journalisé, ni transmis à Expo Router. Les cookies BetterAuth sont gérés par `@better-auth/expo` et `expo-secure-store`; le client tRPC réutilise le cookie exposé par ce client unique.

## Routes et procédures

- BetterAuth : `POST /api/auth/email-otp/send-verification-otp`, `POST /api/auth/sign-in/email-otp`, session BetterAuth.
- tRPC : `cities.list`, `cities.search`, `user.setCity`, `user.getOnboardingStatus`.
- Expo Router : `/sign-in`, `/otp`, `/name`, `/photo`, `/notifications-permission`, `/home`.

Les valeurs `nextStep` sont associées respectivement à ces quatre dernières destinations : `NAME`, `PHOTO`, `NOTIFICATIONS`, `COMPLETED`.

## Configuration

Définir `EXPO_PUBLIC_API_URL` avec l'origine du Worker, sans ajouter `/api/auth` ou `/trpc`. Aucun secret serveur ne doit être placé dans une variable `EXPO_PUBLIC_*`. Le backend doit définir ses variables BetterAuth, base de données et fournisseur OTP; pour Resend, `OTP_PROVIDER=resend`, `RESEND_API_KEY` et `OTP_FROM_EMAIL` sont requis.

Le serveur active le plugin Expo BetterAuth. Le mobile utilise une seule instance `authClient`, une seule instance `trpcClient` et un `QueryClient` créé hors des rendus React.

## États et erreurs gérés

L'écran Connexion couvre chargement/échec/nouvel essai des villes, recherche distante avec debounce 300 ms, sélection, validation Zod, envoi en cours et limites d'envoi. Le téléphone affiche uniquement un message « bientôt disponible ».

L'écran OTP couvre données temporaires absentes, e-mail masqué, saisie/collage numérique sur six chiffres, erreur visuelle, délai de renvoi calculé depuis `requestedAt`, renvoi, doubles soumissions, code incorrect/expiré, limites de tentatives, absence de session et erreurs réseau. Un code incorrect vide seulement le code et remet le focus dans le champ.

## Méthode de test

1. Démarrer le Worker avec une base contenant des villes et un fournisseur OTP configuré : `pnpm dev:server`.
2. Définir `EXPO_PUBLIC_API_URL` vers l'adresse accessible depuis le simulateur ou l'appareil (Android Emulator utilise généralement l'adresse hôte `10.0.2.2`, pas `localhost`).
3. Démarrer Expo : `pnpm dev:mobile`.
4. Choisir une ville, saisir un e-mail, demander le code puis saisir le code livré par le fournisseur de développement ou Resend.
5. Vérifier que la route OTP n'est plus dans l'historique, que la ville est associée et que l'étape d'onboarding correspond aux données utilisateur.

Validation automatisée : `pnpm --filter @10in/mobile typecheck`, `pnpm --filter @10in/mobile lint` et `pnpm --filter @10in/mobile test`.

## Limites connues

- SecureStore et les cookies natifs doivent être validés sur des builds iOS et Android réels; le web ne reproduit pas entièrement leur comportement.
- Resend ne peut être testé sans variables et accès réseau valides.
- Le store pending est volontairement en mémoire : fermer totalement l'application annule la demande en cours et ramène à Connexion.
