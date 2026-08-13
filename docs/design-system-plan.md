# Plan du système de design mobile — direction visuelle 3

## 1. Objet et niveau de certitude

Ce document prépare le système de design de l’application mobile **10in** à partir de la direction visuelle 3, présentée dans les trois planches PNG de `docs/design-references`. Il ne constitue pas encore une implémentation.

Les références observées couvrent l’authentification, l’OTP, l’onboarding, l’activation des notifications, l’accueil, les listes de matchs, la navigation basse et plusieurs états transversaux. Elles permettent de définir une direction solide, mais pas de récupérer des valeurs sources exactes comme dans un fichier Figma ou un jeu de design tokens.

Convention utilisée ci-dessous :

- **Observé** : visible de manière répétée dans les références.
- **Estimé** : valeur proposée par mesure visuelle du PNG, à valider avant implémentation.
- **À définir** : impossible à déduire précisément des références.

## 2. État réel du projet mobile

Le dossier `apps/mobile` est actuellement un socle Expo Router minimal :

- `src/app/_layout.tsx` contient uniquement une pile sans en-tête ;
- `src/app/index.tsx` contient un écran centré avec deux textes et un `StyleSheet` local ;
- aucun thème, token, composant UI partagé, police, icône ou asset applicatif n’existe dans `apps/mobile` ;
- aucune bibliothèque dédiée aux polices, gradients, icônes, animations, formulaires ou tests UI n’est déclarée dans `apps/mobile/package.json` ;
- les dépendances UI disponibles sont celles du socle Expo/React Native : Expo Router, Status Bar, Safe Area Context et Screens.

Le `README.md` décrit une version beaucoup plus complète de l’application mobile et cite de nombreux écrans et composants qui ne sont pas présents dans l’arborescence actuelle. Ces éléments ne doivent donc pas être considérés comme réutilisables tant qu’ils ne sont pas restaurés ou fournis.

## 3. Principes visuels de la direction 3

- Univers football assumé, énergique et éditorial.
- Contraste entre une typographie d’affichage très condensée et une typographie de lecture simple.
- Fond chaud presque blanc, surfaces discrètes et contours fins vert sombre.
- Vert vif réservé aux actions, sélections, progression et succès.
- Vert profond utilisé pour le texte principal, les surfaces immersives et la navigation.
- Imagerie de terrain texturée utilisée comme accent, jamais comme substitut à l’information.
- Boutons principaux larges, bas dans l’écran, avec libellé condensé en capitales et flèche directionnelle.

## 4. Couleurs

Les codes hexadécimaux suivants sont **estimés depuis des PNG aplatis**. La compression, l’anticrénelage, les textures et les gradients empêchent d’en déduire les valeurs originales exactes.

### 4.1 Palette primitive proposée

| Token proposé | Valeur estimée | Source visuelle | Certitude |
|---|---:|---|---|
| `green.950` | `#00382B` | titres sombres, navigation, icônes | estimé |
| `green.900` | `#004832` | cartes terrain, toast | estimé |
| `green.700` | `#007A43` | liens, succès secondaires | estimé |
| `green.500` | `#00C96B` | CTA, mot-clé de titre, sélection | estimé |
| `green.400` | `#20DD82` | extrémité claire du gradient CTA | estimé |
| `green.100` | `#DDF3E4` | fonds d’icônes/états positifs | estimé |
| `ivory.50` | `#FAFAF6` | fond principal | estimé |
| `white` | `#FFFFFF` | champs et surfaces élevées | observé |
| `neutral.900` | `#13231E` | texte courant principal | estimé |
| `neutral.600` | `#5F6965` | texte secondaire et placeholders | estimé |
| `neutral.400` | `#AEB8B3` | état inactif, progression restante | estimé |
| `neutral.200` | `#E2E6E3` | séparateurs et skeleton | estimé |
| `yellow.500` | `#FFC72C` | capacité/attention positive sur carte | estimé |
| `red.500` | `#FF3B3F` | erreur, validation invalide | estimé |

### 4.2 Rôles sémantiques

| Rôle | Token recommandé | Usage |
|---|---|---|
| `background.canvas` | `ivory.50` | arrière-plan de tous les écrans clairs |
| `background.surface` | `white` | champs, cartes, feuilles et blocs élevés |
| `background.brand` | `green.900` | navigation, cartes immersives, toast sombre |
| `text.primary` | `green.950` | titres, libellés et contenu prioritaire |
| `text.secondary` | `neutral.600` | descriptions et métadonnées |
| `text.inverse` | `white` | texte sur surface sombre |
| `text.brand` | `green.500` | accent dans les titres et liens actifs |
| `action.primary` | gradient `green.500 → green.400` | CTA principal |
| `action.primaryPressed` | `green.700` | état pressé ; à valider visuellement |
| `action.secondary` | transparent | bouton contour |
| `border.default` | `green.950` à opacité visuelle réduite | champs et boutons secondaires |
| `border.subtle` | `neutral.200` | cartes et séparateurs |
| `state.success` | `green.500` | confirmation, sélection, code correct |
| `state.warning` | `yellow.500` | capacité ou attention non bloquante |
| `state.error` | `red.500` | erreurs de saisie et échec |
| `state.disabled` | `neutral.200` / `neutral.400` | fond et contenu désactivés |
| `focus.ring` | `green.500` | focus clavier et accessibilité |
| `overlay.scrim` | `green.950` à 40–60 % | modal/overlay ; non montré, à définir |

Le mode sombre n’est pas représenté. Malgré `userInterfaceStyle: "automatic"` dans `app.json`, aucune palette sombre ne peut être déduite ; il faudra soit définir ce thème, soit forcer temporairement le thème clair lors de l’implémentation.

## 5. Typographie

### 5.1 Familles

- **Display condensée** — titres éditoriaux, heures de match et libellés de CTA en capitales. Style observé : sans serif extrêmement condensée, lourde, légèrement oblique pour les grands titres. **Famille exacte impossible à identifier depuis les PNG.** Une licence et les fichiers de police devront être fournis ou une alternative compatible choisie après comparaison (par exemple une famille condensée de type Bebas/Oswald/Roboto Condensed, sans présumer qu’il s’agit de la police originale).
- **Sans serif de lecture** — corps, labels de formulaire, navigation et métadonnées. **Famille exacte impossible à identifier.** Le rendu évoque une sans serif étroite/humaniste ; utiliser la police système au départ seulement si aucune police de marque n’est fournie.
- Prévoir des variantes `regular`, `medium`, `semibold`, `bold` pour le texte de lecture et `bold/black` pour l’affichage.

Les références montrent correctement les accents français ; toute police retenue doit couvrir Latin Extended et les chiffres tabulaires utiles aux heures, distances et OTP.

### 5.2 Échelle de tailles proposée

Échelle **estimée** en points React Native, à contrôler sur appareils iOS et Android :

| Style | Taille / interligne | Poids/style | Usage |
|---|---|---|---|
| `display.xl` | `48 / 48` | display black, condensée, oblique | titre d’accueil ou activation |
| `display.lg` | `40 / 42` | display black, condensée, oblique | titres d’authentification/onboarding |
| `display.md` | `32 / 34` | display bold, condensée | heure de match majeure |
| `heading.lg` | `24 / 30` | sans bold | salutation, titre de page compact |
| `heading.md` | `20 / 26` | sans semibold | titres de section/carte |
| `heading.sm` | `16 / 22` | sans semibold | items et sous-sections |
| `body.lg` | `17 / 24` | sans regular | introduction |
| `body.md` | `16 / 22` | sans regular | contenu et saisie |
| `body.sm` | `14 / 20` | sans regular | aide et métadonnées |
| `label.md` | `14 / 18` | sans medium | labels de champs |
| `label.sm` | `12 / 16` | sans semibold | chips, navigation et surtitres |
| `action.md` | `18 / 20` | display bold, condensée | CTA principal |
| `caption` | `11 / 14` | sans regular | légendes secondaires |

Règles : ne pas réduire le corps sous 14 pt ; supporter le redimensionnement système ; autoriser les titres sur plusieurs lignes ; ne jamais compenser une police manquante avec un espacement de lettres excessif.

## 6. Espacements

Utiliser une grille de base de 4 pt :

| Token | Valeur | Usage typique |
|---|---:|---|
| `space.0` | 0 | aucun espace |
| `space.1` | 4 | micro-écart, icône/label compact |
| `space.2` | 8 | éléments proches |
| `space.3` | 12 | padding de chip, lignes compactes |
| `space.4` | 16 | padding de champ/carte compact |
| `space.5` | 20 | groupe de contenu |
| `space.6` | 24 | marge latérale d’écran |
| `space.8` | 32 | séparation de sections |
| `space.10` | 40 | grands groupes |
| `space.12` | 48 | respiration éditoriale |
| `space.16` | 64 | séparation majeure |

Les références suggèrent 24 pt de marge horizontale et 12–16 pt entre contrôles. Ces mesures sont estimées.

## 7. Rayons

| Token | Valeur estimée | Usage |
|---|---:|---|
| `radius.none` | 0 | séparateurs |
| `radius.sm` | 6 | OTP, petits tags |
| `radius.md` | 10 | champs et petits boutons |
| `radius.lg` | 14 | cartes et CTA |
| `radius.xl` | 20 | grandes cartes/panneaux |
| `radius.full` | 999 | boutons icône, avatar, indicateurs |

La direction privilégie des coins modérément arrondis, pas des contrôles systématiquement en pilule.

## 8. Bordures

- `border.hairline` : `StyleSheet.hairlineWidth`, séparateurs non interactifs.
- `border.default` : 1 pt, champs, cartes et boutons secondaires.
- `border.strong` : 1.5–2 pt, focus, erreur, succès et sélection.
- Les champs utilisent le vert sombre au repos, le vert vif au focus/succès et le rouge en erreur.
- Ne pas utiliser la couleur seule : associer icône, texte ou changement de forme aux états.
- Le dessin exact des contours et leur opacité ne peut pas être extrait précisément des PNG.

## 9. Ombres et élévation

Les ombres sont rares et très diffuses :

| Token | Proposition | Usage |
|---|---|---|
| `shadow.none` | aucune | champs et cartes internes |
| `shadow.sm` | opacité 6 %, rayon 8, décalage Y 2, élévation Android 2 | carte légère |
| `shadow.md` | opacité 10 %, rayon 16, décalage Y 6, élévation Android 4 | toast/navigation flottante/modal |

Couleur d’ombre recommandée : `green.950`. Les paramètres exacts sont **à définir**, les ombres visibles pouvant appartenir à la présentation des maquettes plutôt qu’à l’interface elle-même.

## 10. Icônes

Échelle proposée :

- 16 pt : icône inline et statut compact ;
- 20 pt : champ, chip et métadonnée ;
- 24 pt : action standard et navigation basse ;
- 28 pt : bouton icône important ;
- 32 pt : état vide compact ;
- 48–72 pt : illustration d’état ou permission.

Style observé : contour, extrémités arrondies, trait approximatif de 1.5–2 pt, sans remplissage sauf état actif. La famille exacte n’est pas identifiable. Aucune bibliothèque d’icônes n’est installée actuellement ; choisir une seule famille couvrant flèche, retour, localisation, téléphone, e-mail, appareil photo, galerie, terrain, joueurs, chat, profil, filtres, calendrier, succès et erreur. Les zones tactiles doivent rester au minimum à 44 × 44 pt, indépendamment de la taille visuelle.

## 11. Grille et mise en page

- Conception mobile portrait, largeur de référence visuelle proche de 390–430 pt, mais responsive dès 320 pt.
- Respect obligatoire des safe areas ; contenu principal en colonne unique.
- Marge horizontale : 24 pt estimés, 20 pt sur petits écrans si nécessaire.
- Grille : 4 colonnes, gouttière 16 pt, marge 24 pt pour les compositions structurées ; la plupart des formulaires restent en pleine largeur utile.
- Largeur maximale du contenu sur tablette/web : 480 pt pour auth/onboarding, à centrer.
- CTA principal généralement ancré en bas de la zone sûre, sans recouvrir le contenu ; conserver 16 pt au-dessus de la safe area.
- Barre de navigation : cinq destinations, hauteur visuelle estimée de 64 pt plus safe area, icône au-dessus du libellé.
- Listes : cartes pleine largeur, espaces verticaux de 8–12 pt.
- Les grands titres peuvent occuper 2–3 lignes, alignés à gauche.
- Prévoir le clavier, le scroll, les textes agrandis et les petits écrans ; aucun positionnement vertical fixe basé uniquement sur la hauteur de la maquette.

## 12. Composants réutilisables nécessaires

### 12.1 Fondations

- `Screen` / `ScrollableScreen` : safe areas, fond, marges, clavier et largeur maximale.
- `Text` typé : styles display, heading, body, label, action et caption.
- `Icon` : taille, couleur, accessibilité et famille unique.
- `Divider`, `Spacer` et primitives de surface.

### 12.2 Actions

- `Button` : variantes `primary`, `secondary`, `ghost`, `danger`, tailles `sm/md/lg`, icône gauche/droite.
- `IconButton` : retour, filtre, fermeture et actions rapides.
- `TextLink` : action secondaire inline.

États requis : `default`, `pressed`, `focused`, `disabled`, `loading`, plus `destructive` lorsqu’applicable. Le chargement conserve la largeur du bouton et expose un libellé accessible.

### 12.3 Formulaires

- `TextField` avec label, icône, placeholder, aide et message d’erreur.
- `PhoneField` avec sélecteur de pays.
- `SegmentedControl` pour téléphone/e-mail.
- `OtpInput` à six cellules.
- `SearchField` avec effacement.
- `SelectField` / `CountryPicker` / `CityPicker`.
- `RadioRow` pour choix unique.
- `FormMessage` pour erreur ou succès.

États requis : `empty`, `filled`, `focused`, `disabled`, `readOnly`, `loading`, `error`, `success`; pour la recherche : `results`, `noResults`, `offline`; pour OTP : `partial`, `complete`, `verifying`, `incorrect`, `verified`, `expired`.

### 12.4 Navigation et progression

- `AppHeader` avec titre/salutation, localisation et action optionnelle.
- `BackButton`.
- `StepProgress` avec compteur « n sur total » et points reliés.
- `BottomTabBar` à cinq destinations.
- `SectionHeader` avec action « Voir tout ».

États requis : onglet `active/inactive/pressed/focused`, étape `completed/current/upcoming`, en-tête `default/scrolled` si l’élévation au scroll est retenue.

### 12.5 Données football et contenu

- `FeaturedMatchCard` avec distance, capacité, date/heure, format, lieu et CTA.
- `MatchListItem` compact.
- `PlayerCountBadge`, `DistanceBadge` et `StatusChip`.
- `PermissionBenefitRow`.
- `AvatarPicker` / `PhotoPicker` avec progression.

États requis : match `upcoming/joinable/full/waitlist/cancelled/completed`, carte `default/pressed/loading`; photo `empty/uploading/success/error/permissionDenied`; capacité `available/almostFull/full`.

### 12.6 Retour système

- `Toast` : `success`, `error`, `info`, avec fermeture.
- `InlineAlert` : `info`, `warning`, `error`, `success`.
- `LoadingIndicator` et `Skeleton`.
- `EmptyState` et `ErrorState` avec action optionnelle.
- `Modal` / `BottomSheet` et `ConfirmDialog` seront probablement nécessaires au produit décrit dans le README, mais leur apparence n’est pas montrée.

États requis : skeleton `loading`; état vide `default/filtered`; erreur `offline/server/permission`; toast `entering/visible/dismissing` si animé.

## 13. Règles d’accessibilité

- Contraste WCAG : au moins 4.5:1 pour le texte courant, 3:1 pour le grand texte et les composants graphiques essentiels. Vérifier particulièrement le vert vif sur ivoire et le jaune avec texte sombre.
- Taille tactile minimale : 44 × 44 pt ; espacement suffisant entre les cellules OTP et les actions adjacentes.
- Supporter Dynamic Type/font scaling sans couper les titres, labels, boutons ou éléments de navigation ; tester au moins jusqu’à 200 % lorsque possible.
- Ne jamais transmettre un état uniquement par vert/rouge : ajouter icône, message et sémantique accessible.
- Ordre de focus logique, focus visible et navigation clavier pour React Native Web.
- Chaque icône actionnable reçoit un nom accessible ; les icônes décoratives sont masquées des lecteurs d’écran.
- Regrouper chaque champ avec son label, son aide et son erreur ; annoncer les erreurs et confirmations importantes.
- OTP : permettre le collage et l’autoremplissage, annoncer la position de chaque chiffre, ne pas déplacer le focus de manière imprévisible.
- Respecter la préférence « réduire les animations » ; aucune animation essentielle ne doit bloquer la tâche.
- Les skeletons ne doivent pas être lus comme du contenu ; annoncer le chargement une seule fois.
- Les toasts importants doivent être annoncés et rester assez longtemps ; une information critique doit aussi persister dans l’écran.
- Prévoir les libellés français plus longs, les langues RTL futures et les formats localisés de date, heure, distance et devise.
- Le fond texturé de terrain doit conserver une surface de contraste derrière les textes et ne pas contenir d’information indispensable.
- Tenir compte des safe areas, du clavier, du mode paysage accidentel et des tailles d’écran compactes.

## 14. Fichiers existants à réutiliser ou modifier lors d’une future implémentation

### À réutiliser

- `apps/mobile/src/app/_layout.tsx` : conserver comme racine Expo Router et futur point d’injection du thème, des polices et des providers.
- `apps/mobile/app.json` : conserver l’identité Expo, le schéma de deep link, l’orientation portrait et le routeur.
- `apps/mobile/tsconfig.json` : conserver les alias `@/*` et `@10in/*` pour organiser les fondations et composants.
- `apps/mobile/package.json` : conserver les scripts et dépendances existants ; l’étendre seulement après validation des bibliothèques nécessaires.
- `apps/mobile/src/app/index.tsx` : conserver le fichier de route, puis remplacer son contenu minimal uniquement pendant l’implémentation approuvée.
- `docs/design-references/*.png` : conserver comme source visuelle et base de QA comparative.

### À modifier ultérieurement

- `apps/mobile/src/app/_layout.tsx` : chargement des polices, provider de thème, couleur de fond et status bar.
- `apps/mobile/src/app/index.tsx` : adopter les primitives et composants du système au lieu du `StyleSheet` ad hoc actuel.
- `apps/mobile/app.json` : ajuster le comportement du thème seulement après décision sur le mode sombre ; ajouter les plugins Expo nécessaires aux polices/assets si retenus.
- `apps/mobile/package.json` : ajouter uniquement les bibliothèques validées pour polices, icônes et éventuellement gradients ; aucune n’est actuellement disponible explicitement.

### Nouveaux fichiers probables, à créer seulement lors de l’implémentation

- `apps/mobile/src/theme/` : couleurs primitives, rôles sémantiques, typographie, espacements, rayons, ombres et thème.
- `apps/mobile/src/components/ui/` : primitives et composants réutilisables.
- `apps/mobile/src/assets/fonts/` et `apps/mobile/src/assets/images/` : uniquement avec fichiers et licences confirmés.
- Un catalogue ou écran de démonstration des composants pour vérifier les variantes et états.

Les nombreux chemins mobiles mentionnés dans `README.md` (écrans d’authentification, profil, matchs, chat, notifications, etc.) ne figurent pas dans le dossier actuel et ne peuvent pas être listés comme fichiers à modifier.

## 15. Dépendances : constat et besoins à valider

Installé et directement exploitable : React Native, Expo, Expo Router, Expo Status Bar, React Native Safe Area Context et React Native Screens.

Non déclaré dans `apps/mobile/package.json` et donc à ne pas supposer disponible :

- chargeur de polices Expo et fichiers de police de marque ;
- bibliothèque d’icônes explicitement choisie ;
- composant de gradient ;
- bibliothèque d’animation ;
- Storybook ou catalogue UI ;
- outils de tests de composants et d’accessibilité.

La future implémentation devra d’abord vérifier ce qu’Expo 57 fournit réellement de façon transitive, puis déclarer explicitement chaque dépendance utilisée au lieu de s’appuyer sur une dépendance transitive.

## 16. Informations impossibles à déduire précisément

1. Les codes couleurs source, opacités et points exacts des gradients.
2. Les noms, fichiers, licences, poids et axes variables des deux familles typographiques.
3. Les tailles, interlignages, crénages et espacements de lettres exacts.
4. Les dimensions originales des frames mobiles et la grille Figma.
5. Les valeurs exactes de padding, rayons, bordures, ombres et élévations.
6. Les courbes, durées et comportements d’animation.
7. Les états hover/focus web et certains états pressés natifs.
8. Le mode sombre et le comportement système attendu malgré le réglage `automatic`.
9. Le jeu d’icônes original et l’épaisseur exacte de ses traits.
10. Les composants non représentés : modales, bottom sheets, menus, date/time pickers, chat, profil détaillé, notifications, badges et création de match.
11. Les règles de marque applicables aux photographies, textures de terrain et illustrations.
12. La direction de contenu finale : le nom du produit dans le dépôt est `10in`, tandis que les références affichent « Terrain Pulse » comme intitulé de concept.

## 17. Validation requise avant implémentation

- Confirmer la palette avec les valeurs source ou un fichier Figma.
- Fournir ou choisir les polices et vérifier leurs licences.
- Confirmer si le thème sombre est requis dès la première version.
- Choisir une bibliothèque d’icônes unique et un composant de gradient compatible Expo 57.
- Valider les tokens sur au moins un petit écran Android et un iPhone récent.
- Construire ensuite un catalogue des fondations et des états avant d’habiller les écrans métier.
