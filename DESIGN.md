# Direction artistique — Vergasta Digital

Ce document sert à reprendre le site sans en défaire la cohérence. Il dit ce
qu'on fait, et surtout ce qu'on ne fait pas et pourquoi.

Le site est statique : quatre pages publiques en cinq langues, une page
d'atelier non référencée, deux feuilles de style, deux scripts, des polices,
plus `robots.txt` et `sitemap.xml`. Pas de build, pas de dépendance, pas de
gestionnaire de paquets. On édite les fichiers, on pousse, GitHub Pages sert.

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
| Texte | **Archivo**, instances statiques 400 / 500 / 600 | tout le reste |

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

### Le japonais

Jersey 25 et Archivo ne dessinent que le latin, et leurs `unicode-range` le
disent : sur `/ja/`, le navigateur descend d'un cran dans la pile pour tout
caractère japonais. **Jersey 25 reste en tête de la pile** : la marque, les noms
de projets et les chiffres sont en latin et gardent leurs marches d'escalier.

Les **titres** tombent alors sur **x8y12pxDenkiChip**, une bitmap japonaise de
[x0y0pxFreeFont](https://github.com/hicchicc/x8y12pxDenkiChip), sous SIL OFL 1.1.
Un seul fichier, `fonts/denkichip-japonais.woff2`, 36 Ko, servi depuis le
domaine comme les autres et préchargé dans les quatre pages `/ja/`. Son
`unicode-range` se limite aux blocs japonais (`U+3000-30FF`, `U+4E00-9FFF`, les
formes verticales et pleine chasse), pour qu'elle ne prenne jamais la main sur
du latin. La licence est recopiée dans `fonts/denkichip-OFL.txt` : l'OFL demande
que le texte accompagne le fichier redistribué.

**Ce que DenkiChip ne dessine pas.** La fonte implémente les kanji des quatre
premières années scolaires, 640 signes, plus les kana au complet ; les cinquième
et sixième années sont annoncées par l'auteur mais pas encore publiées. Un kanji
absent tombe de lui-même sur la police système, dans le titre même : `一般取引条件`
sort avec `一`, `取` et `引` en points et `般条件` en gothique. La ligne mixte est
assumée, comme elle l'était déjà entre le latin et le japonais. Avant de récrire
un titre japonais, vérifier la liste des kanji implémentés, publiée dans le
README amont (`実装漢字一覧`).

Le **texte courant** garde les polices du système (Hiragino, Yu Gothic, Meiryo) :
héberger un jeu de kanji complet et lisible en petit corps coûterait quelques
centaines de kilo-octets, et la promesse du §2 sur le poids passe avant l'unité
typographique sur une seule des cinq versions.

Deux réglages suivent de là, dans la feuille de style : `line-height` à 1,3 sur
les titres, parce qu'une bitmap latine se cale sur 1 mais que les kanji rendus
par la police système touchent la ligne suivante ; et des mesures rouvertes sur
les `h1`, parce que l'unité `ch` vaut la largeur du zéro de Jersey 25 alors
qu'un kana en occupe deux, ce qui coupait les titres japonais deux fois trop
tôt.

### Pourquoi les polices ne viennent pas de Google

`privacy.html` promet qu'aucun outil tiers ne suit le visiteur. Un appel à
`fonts.googleapis.com` transmet l'adresse IP de chaque visiteur à Google à
chaque page vue, ce qui contredit cette promesse et pose un problème sous LPD
et RGPD. **Le site ne fait aujourd'hui aucune requête externe.** Neuf fichiers
`.woff2`, 152 Ko au total, dont 36 Ko qui ne sont chargés que sur `/ja/`. Cette
propriété est à préserver.

Pour ajouter une police, récupérer le CSS de Google avec un agent de navigateur
moderne, ne garder que les sous-ensembles `latin` et `latin-ext`, télécharger
les `.woff2` dans `fonts/`, et recopier les blocs `@font-face` en tête de
`styles.css` avec des chemins locaux.

**Jamais de police variable.** Chromium ne sait pas incorporer une instance
variable dans un PDF : il la remplace par des glyphes Type 3, sans programme de
police, et les imprimeurs rejettent le fichier. Demander un poids à la fois à
Google (`wght@400`, puis `wght@500`) : demandés ensemble, il renvoie la police
variable.

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

**Bloc `.trades`.** Les quatre métiers sont un `<dl>`, chaque paire groupée dans
un `<div class="trade">`. Au-delà de 1080 px, deux colonnes de deux entrées :
les gouttières sont des paddings et les séparations des bordures, de sorte que
le filet vertical et le filet horizontal se croisent net au centre du bloc,
comme une double page. En dessous, une seule colonne et le filet repasse à
l'horizontale. Ce ne sont pas des cartes : pas de fond, pas de bordure fermée,
pas de numérotation. Les noms de projets sont en `<b>` (600, encre pleine) pour
donner des points d'accroche à la lecture rapide, quatre paragraphes d'affilée
se lisant mal sans repères. Ajouter une cinquième entrée casse le carré : il
faut alors reprendre les `nth-child` de la grille.

**Index `.index`.** Les réalisations sont un vrai `<table>` avec en-têtes, pas
des cartes. Ligne surlignée en lime au survol. Sous 640 px, les en-têtes
disparaissent et chaque ligne devient un bloc.

**Navigation.** Liens en casse normale, aplat lime et bordure noire au survol.

**Sélecteur de langue `.lang-nav`.** Cinq codes à deux lettres dans la police
d'affichage, posés à droite de la navigation, séparés par un filet simple
au-delà de 800 px. La version courante porte l'aplat lime et la bordure noire :
c'est le même geste que le survol, tenu en permanence. Pas de menu déroulant,
pas de drapeau. À cinq entrées une liste ouverte se lit d'un coup d'œil, elle
fonctionne sans JavaScript, et un drapeau désigne un pays, pas une langue.

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

### La barre de chargement

Le site est fait de pages complètes : cliquer un lien fait attendre le visiteur
devant la page qu'il quitte, sans que rien ne bouge. La barre occupe cette
attente, et c'est la même brosse que partout ailleurs qui la peint. Sept pixels
de haut, tout en haut de la fenêtre, deux passes mal calées comme la spirale
d'ouverture : un rail posé haut, une ombre jetée dessous et en retard d'un poil,
comme l'ombre portée du bouton ramenée à l'échelle.

Elle sert deux moments : au clic elle avance sur la page qui part et reste à
l'écran pendant que le navigateur va chercher la suivante ; à l'arrivée elle
reprend là où le document en est et se termine au chargement complet. Le
deuxième moment ne se voit qu'à partir d'une certaine lenteur, et c'est voulu :
tant que rien n'a paru au bout de 120 ms, la navigation est terminée avant que
la barre existe, et elle ne paraît pas du tout. Une barre qui clignote à chaque
page est pire que pas de barre.

**Le remplissage n'est pas une mesure.** Rien, dans une page servie en un bloc,
ne dit où en est le téléchargement. La montée est asymptotique : elle approche
93 % sans jamais les atteindre, et seule la fin du chargement pousse le trait
jusqu'au bout. Une barre qui bluffe un pourcentage précis ment ; une barre qui
ralentit dit seulement « ça vient ».

**Le tracé change à chaque navigation.** Huit variantes, deux brosses et deux
encres chacune, dans la gamme saturée : la barre est sur du blanc, le lime n'y
tiendrait pas. Ce qui change, ce sont les brosses et les encres, jamais la
géométrie : une barre qui changerait aussi de place ou d'épaisseur ne se
reconnaîtrait plus d'une fois sur l'autre. La variante se lit dans
`history.length`, qui avance d'un cran à chaque page ouverte dans l'onglet : la
série tourne donc d'elle-même, sans rien écrire nulle part, et **sans
`Math.random`**, qui redonnerait un tirage différent à chaque image. La règle du
§6 tient toujours : le tirage est arrêté au début du tracé et vaut pour tout le
tracé.

Quatre points à ne pas défaire :

- **le canevas n'est jamais effacé entre deux images.** `stroke` prend un `from`
  qui saute le dessin des tampons déjà posés sans sauter leur compte : l'aléa
  vient de l'indice du tampon, donc la marche à vide doit passer par chacun
  d'eux pour que le suivant tombe exactement où il serait tombé en repartant de
  zéro. Un redimensionnement, lui, repeint tout d'un coup ;
- **la barre est `fixed`, ce n'est pas un en-tête collant.** Elle ne recouvre
  rien, elle ne dure pas, et le §4 tient : le seul `position: sticky` du site
  reste le titre de section ;
- **elle apparaît sans transition et disparaît en fondu.** L'attente doit se
  signaler tout de suite, sa fin ne doit pas claquer. La durée du fondu est
  écrite deux fois, dans `styles.css` et dans `brushes.js` (`SORTIE`) : les deux
  vont ensemble ;
- **un clic qui ne remplace pas le document ne la lance pas** : lien externe,
  `target="_blank"`, `download`, `mailto:`, ancre dans la page, clic milieu,
  clic avec une touche de modification. Une navigation qui n'aboutit pas la
  retire au bout de vingt secondes.

Elle ne demande rien à personne : aucune requête, aucune clé de stockage, rien
qui sorte de l'appareil. La promesse du §2 tient. `prefers-reduced-motion` pose
le trait entier sans montée, et **sans JavaScript l'élément n'existe pas**. La
page d'atelier, qui sert à imprimer une carte, n'en a pas.

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
- barre de chargement : cliquer un lien interne la lance, un lien externe non,
  et elle s'efface après l'arrivée sans rien laisser derrière,
- JavaScript coupé : aucun trou dans la mise en page, le sélecteur de langue
  reste un jeu de liens qui fonctionnent, et la barre n'existe pas,
- aucune requête vers un domaine tiers,
- console sans erreur,
- si une page publique a été ajoutée ou renommée, `sitemap.xml` la suit (voir §10),
- si un texte a bougé, les cinq versions ont bougé ensemble (voir §11), et le
  rendu allemand et japonais a été regardé : ce sont les deux qui débordent.

---

## 9. La carte de visite

`carte-de-visite.html` avec `carte.css`. Page d'atelier, liée depuis nulle part
et en `noindex`. Ce n'est pas une protection : qui connaît l'adresse l'ouvre.

Cotes prises sur le gabarit de l'imprimeur, et non sur une règle générale :
marge perdue 88 × 58 mm, coupe 85 × 55 mm, sécurité 82 × 52 mm. Soit 1,5 mm de
fond perdu par côté, moitié moins que les 3 mm usuels. Le contenu se tient à
4 mm de la coupe, bien plus prudent que le minimum exigé.

Tout est en millimètres : un millimètre CSS vaut 1/25,4 de pouce, les cotes à
l'écran sont les cotes imprimées.

Points à ne pas défaire :

- `print-color-adjust: exact` sur les cartes, sinon le recto sort blanc.
- La bande du recto déborde sous le bord : la coupe doit tomber dans la marque,
  jamais sur son bord.
- Son canevas porte `data-dpr="4"`, sans quoi elle sortirait à 96 dpi.
- La grille du verso est en millimètres. En pixels elle grossissait avec la
  résolution de sortie.
- Plaque blanche de 3 mm sous le code QR : la grille traversait sa zone de
  silence et gênait la lecture.
- Le QR est un tracé figé. Pour changer l'adresse, le regénérer et vérifier
  qu'il se relit.

Deux limites du PDF produit par un navigateur, connues et acceptées :

- **Cote.** Chromium quantifie la taille de page au pixel CSS entier, donc le
  fichier sort à 87,88 × 57,83 mm au lieu de 88 × 58. Aucune unité CSS n'y
  change rien. Il reste 1,44 mm de fond perdu sur les 1,5 demandés, largement
  au-delà de la tolérance de coupe.
- **Couleur.** Un navigateur exporte en RVB, jamais en CMJN. Le lime et le bleu
  sont hors gamut CMJN : en quadri ils perdent de l'éclat, un ton direct est la
  seule réponse si cet éclat compte.

---

## 10. Référencement

Rien de tout cela ne se voit à l'écran, et c'est justement pour ça que ça se
perd facilement en refondant une page. La surface tient en quatre points.

**`robots.txt`.** Tout est autorisé, et il pointe vers le plan du site.
`carte-de-visite.html` n'y est **pas** en `Disallow`, volontairement : un robot
qui n'a pas le droit d'ouvrir la page ne lit pas non plus sa balise `noindex`,
donc l'adresse peut malgré tout finir listée. C'est la balise qui la tient à
l'écart, pas `robots.txt`.

**`sitemap.xml`.** Les quatre pages publiques dans les cinq langues, soit vingt
adresses, rien d'autre. Ses `<loc>` doivent correspondre exactement aux
`<link rel="canonical">` des pages : deux adresses concurrentes pour une même
page, c'est le moyen le plus simple de diviser son propre référencement.
Ajouter une page publique veut donc dire trois gestes, pas un : la page, son
canonique, sa ligne dans le plan. Les correspondances entre versions ne sont
pas répétées dans le plan : elles vivent dans les `hreflang` de chaque page,
et une seule déclaration vaut mieux que deux qui divergent.

**Les `hreflang`.** Chaque page porte les six liens `rel="alternate"` : les cinq
langues plus `x-default`, qui pointe sur le français. Ils doivent être
**réciproques et absolus** : si `/en/terms.html` déclare `/de/terms.html`, la
page allemande doit déclarer la page anglaise en retour, sinon un moteur ignore
tout le groupe. C'est aussi de ces liens que `lang.js` tire les adresses des
autres versions, ce qui fait d'eux la seule source à tenir à jour.

**Les balises de tête.** Chaque page publique porte un titre, une description
écrite depuis son contenu réel, un canonique absolu, `robots` en `index,
follow`, un jeu Open Graph complet et `twitter:card`. L'image de partage est le
logo, en `summary` et non en `summary_large_image` : le fichier fait 435 × 520,
une carte large l'étirerait. Une vraie bannière 1200 × 630 serait mieux, mais
elle reste à dessiner.

**Les données structurées.** Un bloc `application/ld+json` dans la tête de
l'accueil, en `@graph` : `ProfessionalService`, `WebSite`, `WebPage`. C'est ce
qui dit à un moteur où se trouve l'atelier, alors que la page ne fait que
l'écrire en toutes lettres. Deux règles pour l'entretenir :

- **chaque valeur doit exister ailleurs sur le site**, mentions légales ou
  contenu de l'accueil. Le balisage ne sert pas à affirmer ce que les pages ne
  disent pas, et une adresse divergente vaut mieux absente que fausse ;
- **pas de coordonnées GPS, pas d'horaires, pas de fourchette de prix
  inventés.** Ils sont facultatifs, et le §7 vaut aussi pour ce qui ne se lit
  pas.

Le balisage cite le domaine `vergasta.ch` et l'adresse du formulaire, mais ce
sont des chaînes de caractères dans du JSON : **aucune requête n'en part**, et
la propriété du §2 tient toujours.

Après la mise en ligne, deux gestes qui ne se font pas depuis le dépôt :
déclarer le site à la Google Search Console et y déposer `sitemap.xml`, et faire
de même sur Bing Webmaster Tools. Sans cela l'indexation arrive quand même, mais
sans aucun retour sur ce qui est réellement indexé.

---

## 11. Les cinq langues

Français, anglais, allemand, italien, japonais. Le français reste à la racine :
ses adresses ne bougent pas, les liens déjà donnés tiennent. Les quatre autres
vivent dans `/en/`, `/de/`, `/it/`, `/ja/`, avec les mêmes noms de fichiers.
Vingt pages, quatre par langue.

Ce sont des **pages complètes, pas des textes injectés au chargement**. Une
traduction posée par JavaScript n'a pas d'adresse propre : elle ne se partage
pas, ne s'indexe pas, et disparaît si le script échoue. Le prix en est la
duplication du gabarit, payée à chaque modification.

### Modifier un texte

Un texte se modifie **dans les cinq langues à la fois**, ou dans aucune. Une
version qui prend de l'avance sur les autres est pire qu'une version absente :
le visiteur ne peut pas savoir laquelle est à jour. Le contenu est le même
partout, à trois exceptions près, toutes trois voulues :

- l'allemand suit l'**orthographe suisse** : jamais de `ß`, toujours `ss` ;
- les pages légales non françaises portent un encart `.legal-note` disant que
  la version française fait foi, avec un lien vers elle. Un texte contractuel
  traduit doit dire lequel prime ;
- le numéro d'identification change de sigle selon la langue : IDE, UID, IDI.
  C'est la même entreprise et le même numéro.

La typographie française du §7 (espace fine insécable, guillemets `« »`) ne
s'applique **qu'au français**. L'anglais, l'allemand et l'italien collent la
ponctuation haute ; le japonais a ses propres signes, `「」` et `、`.

### La détection automatique

`lang.js`, chargé en fin de tête et **sans `defer`** : il doit trancher avant
que la page s'affiche, sinon le visiteur voit passer la mauvaise langue. Trois
règles, dans cet ordre :

1. un choix explicite, fait en cliquant sur un des cinq codes, gagne toujours.
   Il est conservé dans le stockage local sous `vergasta-langue` ;
2. sans choix enregistré, `navigator.languages` décide, **une seule fois par
   session**. Le marqueur de session est ce qui permet ensuite d'aller lire une
   autre version sans être ramené de force à chaque page ;
3. si rien ne correspond, la page reste telle quelle.

Trois points à ne pas défaire :

- **le script ne calcule aucun chemin.** Il lit les `hreflang` de la tête, dont
  il ne garde que le chemin, rebranché sur l'hôte courant : sinon un aperçu
  local se ferait renvoyer sur vergasta.ch. Le site est servi à la racine du
  domaine, voir `CNAME` ;
- **`location.replace`, jamais `assign`**, sinon le bouton retour rejoue la
  redirection en boucle ;
- **tout lien de langue porte `data-langue`**, y compris celui de l'encart de
  traduction vers l'original français. Sans lui, un visiteur venu de la version
  allemande serait renvoyé à l'allemand en arrivant sur la page française.

Rien ne sort de l'appareil : aucune requête, aucun cookie, une seule clé de
stockage local, déclarée dans `privacy.html`. La propriété du §2 tient toujours.

### Ce que le balisage ne dit pas

`knowsLanguage` et `availableLanguage` des données structurées restent à `fr`
dans les cinq versions. Le site est traduit ; l'atelier ne promet pas pour
autant de répondre à une demande en cinq langues. Le §10 demande que chaque
valeur soit vraie, et celle-là ne le serait pas. À corriger le jour où elle le
devient, et pas avant.
