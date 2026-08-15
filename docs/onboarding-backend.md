# Backend d’onboarding

Ce module couvre uniquement `Nom → Photo → Notifications → Finalisation`. Le flux BetterAuth email OTP, Resend et la sélection de ville existante ne sont pas modifiés.

## Schéma et migration

La table `user` possède `profile_photo_step_completed`, `notification_permission_asked` et `onboarding_completed`, tous non nuls et à `false` par défaut. `notification_preferences` est liée en 1:1 à `user`; le push et le marketing sont désactivés par défaut. `notification_devices` conserve les abonnements OneSignal, leur plateforme, leur activité et leur dernière utilisation. Les suppressions utilisateur cascadent vers ces données dépendantes.

La migration `packages/db/drizzle/0001_organic_clea.sql` conserve les lignes de préférences existantes, corrige le défaut de `push_enabled` à `false` et crée l’index unique `notification_preferences_user_uidx`.

## Procédures tRPC

- `user.updateName({ name })` normalise les espaces et accepte de 2 à 60 caractères Unicode.
- `user.skipProfilePhoto()` marque l’étape sans effacer l’image.
- `user.getOnboardingStatus()` retourne `NAME`, `PHOTO`, `NOTIFICATIONS` ou `COMPLETED`. Une ville anormalement absente produit `ONBOARDING_CITY_REQUIRED`.
- `user.completeOnboarding()` vérifie toutes les étapes dans une transaction et est idempotente.
- `notifications.getPreferences()` crée les valeurs sûres au premier accès.
- `notifications.updatePreferences({ pushEnabled, ...options })` effectue un upsert partiel et marque la permission comme demandée dans la même transaction.
- `notifications.registerDevice({ subscriptionId, platform })` enregistre un appareil OneSignal. Un abonnement lié à un autre compte produit `DEVICE_ALREADY_LINKED`; aucune réattribution silencieuse n’est faite.
- `notifications.unregisterDevice({ subscriptionId })` désactive l’appareil du compte courant sans supprimer son historique.

Exemple :

```json
{ "name": "  Amine   El Idrissi " }
```

```json
{ "id": "user-id", "name": "Amine El Idrissi", "image": null, "cityId": "city-id", "onboardingCompleted": false }
```

## Photo de profil et R2

`POST /api/assets/profile-photo` exige une session BetterAuth et un corps `multipart/form-data` contenant exactement un fichier. JPEG, PNG et WebP sont acceptés jusqu’à 5 Mo. La signature binaire doit correspondre au MIME annoncé; SVG, fichiers vides et faux MIME sont refusés.

La clé R2 est générée avec `crypto.randomUUID()` sous `profile-photos/<userId>/`. Le nom client n’est jamais utilisé. La base est mise à jour après le nouvel objet R2; en cas d’échec SQL, le nouvel objet est supprimé par compensation. L’ancienne photo gérée par ce bucket n’est supprimée qu’après succès. `ProfilePhotoStorage` permet d’injecter un stockage de test.

Configuration Cloudflare :

- binding R2 : `PROFILE_PHOTOS`;
- variable non secrète : `R2_PUBLIC_URL`;
- secret : `ONESIGNAL_REST_API_KEY` via `wrangler secret put ONESIGNAL_REST_API_KEY`;
- variable serveur : `ONESIGNAL_APP_ID`.

`.env.example` expose aussi, sans valeur réelle :

```dotenv
R2_BUCKET_NAME=
R2_PUBLIC_URL=
ONESIGNAL_APP_ID=
ONESIGNAL_REST_API_KEY=
```

La clé REST OneSignal reste exclusivement côté Worker. Aucun push n’est envoyé pendant l’onboarding; seules les préférences et l’association du périphérique sont enregistrées.

## Erreurs métier

- `UNAUTHORIZED` / HTTP 401 : session absente;
- `BAD_REQUEST` / HTTP 400 : entrée, multipart ou image invalide;
- `NOT_FOUND` / HTTP 404 : utilisateur ou appareil absent;
- `CONFLICT` : `ONBOARDING_CITY_REQUIRED`, `ONBOARDING_STEP_REQUIRED:<STEP>` ou `DEVICE_ALREADY_LINKED`;
- `INTERNAL_SERVER_ERROR` / HTTP 500 : stockage ou écriture interne échoué, sans détail sensible.

## Validation locale

```bash
pnpm --filter @10in/db db:generate
pnpm --filter @10in/db db:migrate
pnpm --filter @10in/api test
pnpm --filter @10in/api typecheck
pnpm --filter @10in/api lint
pnpm --filter @10in/api build
pnpm --filter @10in/server build
```

Pour un essai réel, démarrer le Worker avec une base migrée, un binding R2 local et une session BetterAuth valide, puis envoyer un formulaire avec le champ fichier à `/api/assets/profile-photo`.
