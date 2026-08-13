# Système de design mobile

Cette première version traduit la direction visuelle 3 dans le prototype Expo de 10in. Les valeurs sont dérivées des références PNG et pourront être affinées si les sources Figma et les polices de marque deviennent disponibles.

## Source de vérité

Les tokens sont définis dans `apps/mobile/src/design-system/tokens` et assemblés dans `apps/mobile/src/design-system/theme.ts`. Les écrans et composants utilisent les rôles de `theme.colors` plutôt que des couleurs hexadécimales locales.

## Tokens

- Couleurs : `primary`, `primaryPressed`, `background`, `surface`, `surfaceBrand`, `textPrimary`, `textSecondary`, `textInverse`, `border`, `borderSubtle`, `success`, `warning`, `danger`, `disabled` et `disabledText`.
- Espacements : échelle de base 4 allant de 0 à 64.
- Rayons : 0, 6, 10, 14, 20 et rayon plein.
- Icônes : 16, 20, 24, 28, 32 et 64.
- Contrôles : cible tactile minimale 44, champ 54, bouton 56 et navigation basse 68.
- Typographie : trois styles display, trois titres, trois corps, deux labels, action et légende.
- Ombres : `none`, `sm` et `md`, volontairement rares et diffuses.

## Composants

`AppText`, `AppButton`, `AppTextInput`, `ScreenContainer`, `AppHeader`, `ProgressIndicator`, `OtpInput`, `Avatar`, `MatchCard`, `BottomNavigation` et `ScreenTitle`.

`ScreenContainer` centralise les Safe Areas, le scroll, l’évitement du clavier, les marges et la largeur maximale web/tablette.

## Limites de cette version

- La police display utilise le fallback `sans-serif-condensed`; aucune police de marque n’a été fournie.
- Le CTA utilise une couleur pleine, car aucun composant de gradient n’était installé.
- Aucun thème sombre n’est défini faute de référence sombre.
- L’avatar, l’OTP, les permissions, les villes et les matchs sont fictifs.
- La barre de navigation inférieure est visuelle dans ce premier prototype.
