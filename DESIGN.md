# Direction artistique — Vergasta Digital

Ce document sert à reprendre le site sans en défaire la cohérence. Il dit ce
qu'on fait, et surtout ce qu'on ne fait pas et pourquoi.

Le site est statique : quatre pages HTML publiques, une page d'atelier non
référencée, deux feuilles de style, un script, des polices. Pas de build, pas de dépendance, pas de gestionnaire de paquets. On
édite les fichiers, on pousse, GitHub Pages sert.

---

## 1. D'où vient l'identité

Tout part de `logo_vergasta.png` : une croix suisse composée de deux barres,
l'une en lime acide, l'autre en bleu électrique. Le registre est celui du web
des années 2000, pas celui d'une brochure imprimée. Le reste du site en découle.

| Rôle | Valeur | Emploi |
|---|---|---|
| Papier | `#ffffff` | fond général |
| Encre | `#0a0a0a` | texte, filets structurants, pied de page |
| Encre atténuée | `#545454` | texte secondaire (7,4:1 sur blanc) |
| Filet | `#d7d7d7` | séparations légères |
| Lime | `#d4ff00` | surlignage, bandeaux, ombres portées |
| Bleu | `#4f46e6` | liens, puces |
| Grille | `rgba(10,10,10,.14)` | points du fond |

### La règle du lime

Du lime en texte sur blanc donne **1,1:1 de contraste**. Il est illisible.
Il ne sert donc jamais de couleur de texte. Il ne fonctionne que comme aplat
sous du noir, ou comme trait sur du noir :

- surlignage de la ligne de tableau survolée et des liens de navigation,
- bandeau de titre de l'encadré « Bon à savoir »,
- ombre portée du bouton,
- marques et devise du pied de page, qui est noir.

Le pied de page est noir précisément pour donner au lime un endroit où il tient
à pleine intensité. Si un jour on éclaircit ce bloc, le lime doit en sortir.

---

## 2. Typographie

Deux polices, **hébergées dans `fonts/`**, jamais chez un tiers.

| | Police | Emploi |
|---|---|---|
| Titres | **Jersey 25** (bitmap) | `h1`, `h2`, `h3`, marque, noms de projets, bouton, devise |
| Texte | **Archivo** (variable 400–600) | tout le reste |

Jersey 25 a été retenue après comparaison au rendu réel avec Pixelify Sans,
Silkscreen et DotGothic16. Silkscreen s'étale trop en grand corps, Pixelify est
trop ronde. Les accents français, `œ` compris, sont dessinés dans les trois,
mais il faut le revérifier avant tout changement de police : le sous-ensemble
`latin` couvre `U+0152-0153`, le reste des accents est dans `latin` et
`latin-ext`.

Les marches d'escalier de Jersey 25 sont faites des mêmes carrés que les
marques à la brosse. C'est ce qui tient le site ensemble ; une police
d'affichage lisse casserait ce lien.

`letter-spacing: 0.01em` sur les titres : une bitmap se resserre trop d'elle-même
en grand corps.

Pas d'italique : une bitmap n'en a pas. L'emphase passe par `<em>`, stylé en
surligneur lime.

### Pourquoi les polices ne viennent pas de Google

`privacy.html` promet qu'aucun outil tiers ne suit le visiteur. Un appel à
`fonts.googleapis.com` transmet l'adresse IP de chaque visiteur à Google à
chaque page vue, ce qui contredit cette promesse et pose un problème sous LPD
et RGPD. **Le site ne fait aujourd'hui aucune requête externe.** Quatre fichiers
`.woff2`, 108 Ko au total. Cette propriété est à préserver.

Pour ajouter une police, récupérer le CSS de Google avec un agent de navigateur
moderne, ne garder que les sous-ensembles `latin` et `latin-ext`, télécharger
les `.woff2` dans `fonts/`, et recopier les blocs `@font-face` en tête de
`styles.css` avec des chemins locaux.

---

## 3. Le fond

Une grille d'un point d'un pixel tous les huit, en `radial-gradient` sur le
`body`. Assez présente pour se lire comme du papier millimétré, assez discrète
pour passer sous du texte courant. Le pas de 8 px est repris dans `--pas`.

---

## 4. Mise en page

- `.wrap` : 68 rem au maximum, gouttière de 1,5 rem qui passe à 3,5 rem au-delà
  de 800 px.
- `.slab` : le bloc de base. Au-delà de 800 px, deux colonnes, le titre de
  section dans une marge de 13 rem, le contenu à droite. Le titre est `sticky`
  et suit la lecture de la section, comme une note portée dans la marge d'un
  manuscrit. C'est le seul `position: sticky` du site : il n'y a pas d'en-tête
  collant.
- `--measure` : 34 rem. Toute colonne de texte courant s'y limite. La largeur
  vide à droite est une marge voulue, pas un oubli.
- Les séparations structurantes sont des **filets doubles** (`3px double`), les
  séparations internes des filets simples.

---

## 5. Composants

**Bouton.** Bloc noir, bordure de 2 px, ombre portée nette en lime décalée de
5 px. Au survol le bloc se déplace de 3 px et l'ombre se rétracte à 2 px : il
s'enfonce au lieu de s'allumer. Pas d'arrondi, pas de dégradé, pas de flèche.

**Encadré `.aside`.** Bordure franche de 2 px et bandeau de titre lime en
négatif de marge, comme une fenêtre d'époque. Il sert à porter une information
réelle et vérifiable, pas un argument : son contenu actuel vient directement
des CGV.

**Index `.index`.** Les réalisations sont un vrai `<table>` avec en-têtes, pas
des cartes. Ligne surlignée en lime au survol. Sous 640 px, les en-têtes
disparaissent et chaque ligne devient un bloc.

**Navigation.** Liens en casse normale, aplat lime et bordure noire au survol.

---

## 6. Les marques à la brosse

`brushes.js`, sans dépendance. Une brosse est une petite forme tamponnée le
long d'un chemin ; cinq nombres suffisent à passer d'un trait net à une
projection lâche.

| Nombre | Effet |
|---|---|
| `spacing` | écart entre tampons, **en fraction de la taille du tampon** |
| `jitter` | dérive perpendiculaire au chemin |
| `scatter` | déport radial libre : c'est lui qui casse un trait en nuage |
| `follow` | 0 le tampon garde son angle, 1 il pivote avec le chemin |
| `speedSize` | la vitesse locale amincit le tampon |

Le tampon est une liste de carrés en coordonnées locales `-1..1`, chacun avec
son opacité.

### Trois pièges vérifiés à l'usage

1. **`spacing` est une fraction, pas une distance.** Agrandir un tampon sans
   ouvrir l'écartement conserve exactement le même taux de recouvrement.
   Quatre marques sont sorties illisibles pour cette raison avant réglage.
2. **L'aléa ne doit jamais venir de `Math.random`.** Il vient d'un hachage de
   l'indice du tampon. Sinon une marque redessinée après un redimensionnement
   change, et se lit comme du bruit.
3. **Chaque cellule est plancherée sur un pixel entier du périphérique.** Sans
   cela le navigateur lisse les bords et les marques virent au gris mou. C'est
   aussi la raison du Canvas 2D plutôt que WebGL : `fillRect` donne des bords
   francs gratuitement, et des bords francs sont tout l'intérêt d'une brosse à
   pixels.

### Encres

Le lime disparaît sur blanc, donc les marques posées sur le fond blanc
utilisent une gamme saturée : `bleu`, `magenta`, `cyan`, `olive`, `orange`,
`encre`. `lime` et `bleu` sont réservés à la bande du pied de page, qui est
sur noir.

### Ajouter une marque

1. Poser `<div class="mark" data-mark="nom" aria-hidden="true"></div>` dans le
   HTML, et lui donner une taille en CSS.
2. Ajouter une entrée `nom` dans `MARKS`, comme une pile de couches
   `{ brush, ink, path, over, alpha, delay }`.
3. Regarder le rendu agrandi et régler `spacing` avant tout le reste.

Les marques se dessinent à l'entrée dans le champ de vision puis **la boucle
s'arrête** : une image fixe ne mérite pas d'images par seconde.
`prefers-reduced-motion` peint directement l'état final. Les hôtes sont des
boîtes vides décoratives : **sans JavaScript la page est identique, sans trou.**

---

## 7. Ce qu'on ne fait pas

Le site a été audité contre les signatures visuelles de génération automatique
documentées en 2026, puis nettoyé. Ces choses sont proscrites :

- indigo `#4f46e5` **en couleur d'interface par défaut**. Ici il vient du logo
  et sert aux liens ; ce n'est pas la même chose qu'un bouton indigo par défaut
  sur fond blanc,
- Inter, Poppins, Montserrat, Space Grotesk,
- libellés en petites majuscules interlettrées au-dessus des titres,
- monospace décoratif, coordonnées GPS,
- bandes de chiffres clés, surtout inventés,
- numérotation `01 / 02 / 03` des services ou des étapes,
- grilles de trois cartes identiques,
- boutons pilules, flèches `↗`, point coloré en fin de titre,
- en-tête collant en verre dépoli, dégradés, ombres diffuses,
- mode sombre par défaut, néon sur noir.

### Textes

- **Aucun tiret cadratin.** Deux-points, parenthèses, ou deux phrases.
- Pas de parallélisme négatif (« ce n'est pas X, c'est Y »), pas de triades
  rythmées, pas de chiffres inventés.
- Écrire ce qui est vrai et vérifiable : l'adresse, les vrais projets cités en
  preuve, les conditions réelles reprises des CGV.

### Typographie française

- Apostrophes courbes `’`, jamais `'`.
- Espace fine insécable `&#8239;` avant `:` `;` `?` `!`.
- Guillemets français `« »`.
- Accents sur les capitales.

---

## 8. Vérifications avant de pousser

- rendu en 1440 px et 390 px, accueil et une page légale,
- états de survol : navigation, ligne de tableau, bouton,
- JavaScript coupé : aucun trou dans la mise en page,
- aucune requête vers un domaine tiers,
- console sans erreur.

---

## 9. La carte de visite

`carte-de-visite.html` avec `carte.css`. Page d'atelier, liée depuis nulle part
et en `noindex`. Ce n'est pas une protection : qui connaît l'adresse l'ouvre.

Format fini 85 × 55 mm, fond perdu de 3 mm par côté donc un fichier de
91 × 61 mm, zone de sécurité à 4 mm du trait de coupe. Tout est en millimètres :
un millimètre CSS vaut 1/25,4 de pouce, les cotes à l'écran sont les cotes
imprimées. La règle `@page` fait sortir deux pages exactement à la cote.

Points à ne pas défaire :

- `print-color-adjust: exact` sur les cartes, sinon le recto sort blanc.
- La bande du recto déborde de 1 mm sous le bord : la coupe doit tomber dans la
  marque, jamais sur son bord.
- Son canevas porte `data-dpr="4"`, sans quoi elle sortirait à 96 dpi.
- La grille du verso est en millimètres. En pixels elle grossissait avec la
  résolution de sortie.
- Plaque blanche de 3 mm sous le code QR : la grille traversait sa zone de
  silence et gênait la lecture.
- Le QR est un tracé figé. Pour changer l'adresse, le regénérer et vérifier
  qu'il se relit.

Un navigateur exporte en RVB, jamais en CMJN. Le lime et le bleu sont hors
gamut CMJN : en quadri ils perdent de l'éclat, un ton direct est la seule
réponse si cet éclat compte.
