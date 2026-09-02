# Direction artistique — Vergasta Digital

Ce document sert à reprendre le site sans en défaire la cohérence. Il dit ce
qu'on fait, et surtout ce qu'on ne fait pas et pourquoi.

Le site est statique : cinq pages publiques en cinq langues, une page
d'atelier non référencée, deux feuilles de style, trois scripts, des polices,
plus `robots.txt` et `sitemap.xml`. Pas de build, pas de dépendance, pas de
gestionnaire de paquets. On édite les fichiers, on pousse, GitHub Pages sert.

---

## 1. D'où vient l'identité

Tout part de `logo_vergasta.png` : une croix suisse composée de deux barres,
l'une en lime acide, l'autre en bleu électrique. Autour d'elles, un papier
crème, des cartes blanches à coins ronds posées dessus, et les peintures à la
brosse par-dessus tout. Le registre n'est pas celui d'une brochure imprimée :
c'est un atelier, pas une agence.

| Rôle | Valeur | Emploi |
|---|---|---|
| Papier | `#f1f2e9` | fond général |
| Feuille | `#ffffff` | cartes |
| Encre | `#16160f` | texte, pied de page, boutons |
| Encre atténuée | `#5d5d54` | texte secondaire (5,9:1 sur le papier) |
| Filet | `#d5d7c9` | séparations internes des cartes |
| Colonnes | `rgba(22,22,15,.055)` | les six filets verticaux du fond |
| Lime | `#d4ff00` | bandeau, bloc de contact, survols, pilules de temps |
| Bleu | `#4f46e6` | liens, puces des pages légales |
| Magenta, cyan, olive, orange | encres des brosses | étoiles des puces |
| Sur encre | `#b8b8b3` | texte du pied de page |
| Filet sur encre | `#33332c` | séparation du pied de page |

Le papier n'est pas le blanc de l'écran. C'est ce qui permet aux **cartes**
blanches de se détacher au lieu de se fondre dans le fond : elles sont posées
sur la page, elles n'en font pas partie. C'est tout le principe de la mise en
page (§4), et ça ne marche que si le fond est teinté.

Il est tiré vers le blanc autant qu'il peut l'être sans casser ce principe. Il
valait `#e9ebe0`, un crème franc ; il vaut `#f1f2e9`, la même teinte à un cran
du blanc. Entre le papier et la feuille il reste un rapport de **1,13**, contre
1,21 auparavant : l'écart s'est resserré et c'est **l'ombre portée** qui prend
le relais de la teinte pour poser les cartes. C'est la limite basse. Un cran
plus clair encore et il n'y a plus de papier, seulement des rectangles blancs
sur du blanc, avec une ombre pour tout indice.

Le texte, lui, y gagne : l'encre atténuée passe de 5,5:1 à 5,9:1 sur le fond.

Les quatre encres saturées des brosses (`magenta`, `cyan`, `olive`, `orange`)
sont recopiées en variables CSS depuis `brushes.js`. Elles servent aux étoiles
posées devant les titres : l'étoile d'une carte est de la couleur de la
peinture d'à côté, et non d'une gamme d'interface parallèle. **Les deux listes
doivent rester égales** ; changer une encre dans le script veut dire la changer
dans la feuille de style.

### Les coins, les ombres

| Jeton | Valeur | Emploi |
|---|---|---|
| `--rond` | 24 px | cartes des métiers, encadré des conditions |
| `--rond-l` | 30 px | tableau, bloc de contact, pied de page |
| `--rond-s` | 14 px | ligne de tableau survolée, encart de traduction |
| `--ombre` | deux couches, 20 px de flou à 24 px de décalage | les cartes |
| `--ombre-basse` | la même, moitié moins haute | boutons, encart de traduction |

L'ombre est **portée par la carte, pas dessinée autour d'elle** : une seule
teinte, celle de l'encre à 5 % puis à 50 % sur une seconde couche remontée de
24 px. C'est ce qui la fait lire comme une feuille posée sur une table plutôt
que comme un rectangle avec un contour flou. Deux couches et pas trois, et
jamais de halo coloré.

### La règle du lime

Du lime en texte sur blanc donne **1,1:1 de contraste**. Il est illisible.
Il ne sert donc jamais de couleur de texte sur du clair. Il ne fonctionne que
comme aplat sous du noir, ou comme trait sur du noir :

- le bandeau défilant et le bloc de contact, tous deux en aplat plein sous du
  texte à l'encre,
- le survol des liens de navigation, l'aplat de la langue courante, les pilules
  de temps de la page d'histoire,
- la devise et les marques du pied de page, qui est en encre.

Le pied de page est le seul bloc sombre du site, et donc le seul endroit où le
lime tient à pleine intensité en couleur de texte. Si un jour on l'éclaircit,
le lime doit en sortir.

---

## 2. Typographie

Quatre polices, **hébergées dans `fonts/`**, jamais chez un tiers.

| | Police | Emploi |
|---|---|---|
| Titres | **Gabarito** 700 et 500 | `h1`, `h2`, `h3`, noms de projets, devise, bandeau, boutons |
| Texte | **Figtree** 400 et 600 | tout le texte courant |
| Écriture | **Caveat** 600 | deux endroits, pas plus (voir plus bas) |
| Signature | **Jersey 25** (bitmap) | la marque de l'en-tête et les cinq codes de langue |

Gabarito est une géométrique ronde et serrée : elle porte un titre de six mots
sans le rendre criard, et ses bas de casse tiennent la comparaison avec les
capitales, ce qui a permis de sortir les titres des capitales forcées. Figtree
tient le texte courant à 17 px sur 1,75 sans se fatiguer.

`letter-spacing: -0.025em` sur les titres, `-0.035em` sur le titre de
l'accueil : une géométrique en grand corps s'ouvre d'elle-même, et il faut ce
cran de moins pour que le mot reste un mot.

**Jersey 25 reste, mais elle ne parle plus partout.** La bitmap tenait tous les
titres du site ; elle est maintenant réduite à la marque et aux codes de
langue. La raison de sa présence n'a pas changé : ses marches d'escalier sont
faites des mêmes carrés que les marques à la brosse, et c'est ce qui relie
l'écriture à la peinture. Mais un site entier écrit en bitmap se lit comme une
console, et ce n'est pas ce qu'est cet atelier. Elle vaut comme signature, pas
comme voix.

**Caveat, l'écriture, sert à deux endroits et pas à un troisième** : la légende
du tableau des réalisations, et le titre de l'encadré des conditions. Les deux
sont des commentaires en marge d'un contenu, pas du contenu. Une écriture
manuscrite qui sert partout n'est plus une écriture, c'est une police de plus.

Pas d'italique : l'emphase passe par `<em>`, stylé en surligneur lime.

**Aucune capitale forcée dans les titres.** Les capitales interlettrées sont
réservées aux **libellés d'action** : boutons, pilules de renvoi, repères de
temps de l'histoire, en-têtes du tableau. C'est ce qui distingue une action
d'un titre sans avoir à la souligner ni à lui coller une flèche. Le §7 proscrit
les libellés en petites capitales **au-dessus des titres** ; c'est autre chose,
et ça n'a pas bougé.

### Le japonais

Aucune des quatre polices ne dessine le japonais, et leurs `unicode-range` le
disent : sur `/ja/`, le navigateur descend d'un cran dans la pile pour tout
caractère japonais. **Les polices latines restent en tête de la pile** : la
marque, les noms de projets et les chiffres sont en latin et gardent leur
dessin, Jersey 25 comprise avec ses marches d'escalier.

Les **titres** tombent alors sur **PixelMplus12 Bold**, une bitmap japonaise
tirée des M+ FONTS ([PixelMplus](https://github.com/itouhiro/PixelMplus)), sous
M+ FONT LICENSE : usage, copie et redistribution libres, licence recopiée dans
`fonts/pixelmplus-LICENSE.txt`. Un seul fichier,
`fonts/pixelmplus12-japonais.woff2`, servi depuis le domaine comme les autres et
préchargé dans les quatre pages `/ja/`. Son `unicode-range` se limite aux blocs
japonais (`U+3000-30FF`, `U+4E00-9FFF`, `U+FF01-FF60`, `U+FFE5`), pour qu'elle
ne prenne jamais la main sur du latin.

Le gras, et pas la graisse normale : ses traits de deux points tiennent le
registre des marches d'escalier de Jersey 25, là où la normale s'amincit à un
point et se lit comme un gothique fin à côté du titre latin. Elle est déclarée
en `font-weight: 400` : c'est la seule graisse servie, et les titres du site
sont en 400.

**Le sous-ensemble.** La fonte complète pèse 258 Ko : elle couvre les niveaux 1
et 2 de JIS X 0208, soit 6355 kanji, dont la seconde moitié ne sert jamais. Le
fichier servi est ramené aux kana, à la ponctuation japonaise et aux 2965 kanji
du niveau 1, plus `珈琲` qui n'est qu'au niveau 2 et figure dans une réalisation.
122 Ko. Un titre japonais ordinaire est donc dessiné en entier : c'est ce qui
compte, un kanji manquant retombant au milieu du mot sur le gothique du système.
Pour régénérer le fichier après un changement de version — le niveau 1 se
construit hors ligne, le codec `euc_jp` de Python le contient déjà :

```python
lvl1 = {bytes([0xA0 + ku, 0xA0 + ten]).decode('euc_jp', 'ignore')
        for ku in range(16, 48) for ten in range(1, 95)}
# + les blocs U+3000-30FF, U+FF01-FF60, U+FFE5 et les kanji hors niveau 1
# utilisés dans ja/*.html, puis pyftsubset --flavor=woff2 --layout-features=
```

Le **texte courant** garde les polices du système (Hiragino, Yu Gothic, Meiryo) :
une bitmap de douze points ne se lit pas à 17 px, et les 122 Ko ne se justifient
que pour les titres. La ligne latine reste mixte, elle : `Vergasta Digital` dans
un titre japonais sort en Jersey 25.

Deux réglages suivent de là, dans la feuille de style : `line-height` à 1,3 sur
les titres, parce qu'une bitmap latine se cale sur 1 mais que les kanji occupent
toute la hauteur du corps et touchent la ligne suivante ; et des mesures
rouvertes sur les `h1`, parce que l'unité `ch` vaut la largeur du zéro de
Jersey 25 alors qu'un kana en occupe deux, ce qui coupait les titres japonais
deux fois trop tôt.

### Pourquoi les polices ne viennent pas de Google

`privacy.html` promet qu'aucun outil tiers ne suit le visiteur. Un appel à
`fonts.googleapis.com` transmet l'adresse IP de chaque visiteur à Google à
chaque page vue, ce qui contredit cette promesse et pose un problème sous LPD
et RGPD. **Le site ne fait aujourd'hui aucune requête externe.** Neuf fichiers
`.woff2`, 238 Ko au total, dont 122 Ko qui ne sont chargés que sur `/ja/`. Cette
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

**Les colonnes du gabarit, laissées apparentes.** Six filets d'un pixel qui
traversent la page de haut en bas, au pas de la colonne de texte
(`74rem / 6`), en `repeating-linear-gradient` sur le `body`, centrés sur la
page. Ils passent **derrière les cartes** et donc jamais sous un paragraphe :
c'est ce qui les distingue de la grille de points d'avant, qui se lisait comme
du papier millimétré sous chaque ligne de texte.

Sous 800 px, la colonne fait toute la largeur, les filets n'ont plus rien à
dire et le fond redevient uni.

Le pas de 8 px de l'ancienne grille survit dans `--pas` : la barre de
chargement se cale dessus, et les tampons des brosses aussi.

---

## 4. Mise en page

Le site est une pile de **cartes posées sur un papier teinté**. Chaque bloc de
contenu qui se tient tout seul devient une carte : feuille blanche, coins
ronds, ombre portée, pas de bordure. Le reste, c'est du texte sur le papier.

- `.wrap` : 74 rem au maximum, gouttière de 1,5 rem qui passe à 4 rem au-delà
  de 800 px.
- `--air` : la respiration verticale d'une section, en haut et en bas.
  3,75 rem, 6,5 rem au-delà de 800 px. **Une seule mesure pour tout le site** :
  si la page doit s'ouvrir davantage, c'est là que ça se règle, et nulle part
  ailleurs. Les pages intérieures s'y calent aussi.
- `.slab` : le bloc de base. Le titre de section est posé **en tête**, la
  marque à sa gauche, et le contenu prend toute la colonne dessous. Il vivait
  dans une marge de 13 rem, collé au défilement, comme une note portée dans la
  marge d'un manuscrit ; il tenait la lecture, mais il coûtait un quart de la
  largeur à chaque section. **Il n'y a plus aucun `position: sticky` dans le
  site**, et plus aucun filet entre les sections : ce sont les cartes qui
  découpent la page, et l'espace qui sépare.
- `--measure` : 36 rem. Toute colonne de texte courant s'y limite.
- Les seuls filets qui restent sont **internes aux cartes** (`1px solid
  --rule`) : entre deux lignes du tableau, entre deux conditions. Plus aucune
  bordure fermée, plus aucun filet double.
- Le corps de page est coupé à droite (`overflow-x: clip`). La coupe avait été
  posée pour l'entrée de la marque d'ouverture, qui débordait la fenêtre ; cette
  entrée n'existe plus (§6) et la coupe reste, comme garde-fou : rien ne doit
  pouvoir tirer la page de côté, en cinq langues et sur six pages. **Elle est
  posée sur le corps de page et pas sur la racine**, où elle ne change rien ;
  c'est vérifié.

### La page d'accueil

Elle ne suit pas la même partition que les pages intérieures, et c'est voulu :

1. **l'ouverture**, sur le papier, qui réserve `min(78vh, 42rem)` : l'accueil
   s'ouvre sur un écran, pas sur un paragraphe. Le titre et les deux sorties à
   gauche, la marque à la brosse à droite. Sous 1000 px, où il n'y a plus deux
   colonnes, la marque passe **après les deux sorties** : voir §6 ;
2. **le bandeau défilant**, lime, pleine largeur ;
3. les quatre **cartes** des métiers, en bento ;
4. le **déroulé** en trois colonnes, puis la carte des conditions sur toute la
   largeur ;
5. le **tableau** des réalisations, posé sur une grande carte ;
6. le **bloc de contact**, seule carte en aplat lime ;
7. le **pied de page**, carte d'encre détachée des bords de la fenêtre.

Deux blocs de couleur seulement, le bandeau et le contact, et un bloc sombre
pour finir. Entre eux, du papier et des feuilles blanches.

---

## 5. Composants

**La carte.** L'objet de base du site, et il n'y en a qu'un : feuille blanche,
coins ronds, ombre portée, **pas de bordure**. Il sert aux quatre métiers, à
l'encadré des conditions, au tableau des réalisations, à l'encart de traduction
des pages légales, à l'encadré japonais de l'histoire et au pied de page. Ce qui change d'un emploi à l'autre, c'est le rayon (§1) et le
rembourrage, jamais le principe. **Une bordure sur une carte annule l'ombre** :
les deux disent la même chose, et ensemble elles font une boîte.

**Bouton.** Pilule d'encre, libellé en capitales interlettrées à 0,82 rem. Au
survol elle se soulève de deux pixels et son ombre s'allonge : elle ne
s'allume pas, elle ne change pas de couleur. Pas de flèche, pas de dégradé.
Les capitales sont ce qui distingue une action d'un titre sans la souligner
(§2). Dans le bloc de contact, qui est lime, le bouton reste une pilule
d'encre et son libellé passe au lime.

**Les deux sorties `.opening-actions`.** Le formulaire et le renvoi vers les
réalisations, sur une ligne, sous l'accroche. Même paire et même hiérarchie
qu'en bas de la page d'histoire : une pilule pleine, puis une pilule à filet
qui prend l'aplat lime au survol. Elles étaient toutes deux en bas de page ; le
visiteur qui sait déjà ce qu'il veut n'a plus à traverser l'accueil. Leurs
libellés sont ceux que la page porte déjà ailleurs, pas des formules de plus à
traduire cinq fois.

**Bandeau défilant `.ribbon`.** Une bande lime en travers, sous l'ouverture, où
la devise passe en boucle, séparée par l'étoile pixel. Une copie de la devise
passe en quinze secondes. **Seize copies identiques, et la piste avance d'une
seule copie par tour** : quand elle revient à zéro, la copie suivante est
exactement là où était la précédente, donc la boucle ne se voit pas. Il y en
avait six, et la piste avançait de moitié ; ça ne tient que si trois copies
couvrent la fenêtre, soit 800 px, et sur un écran d'ordinateur le lime
restait nu sur la droite pendant la seconde moitié de chaque tour avant de
sauter en arrière. Quinze copies devant le point de reprise couvrent 3 900 px
dans la langue la plus courte. Le nombre 16 est écrit dans `styles.css` et
dans les cinq pages d'accueil : les deux vont ensemble. Il est
`aria-hidden` : la devise est déjà portée par le pied de page, et seize fois
le même mot ne va pas à la lecture d'écran. `prefers-reduced-motion`
l'arrête, et il reste une bande lime.

**Étoile pixel.** La puce du site, en `mask-image` sur un SVG de neuf carrés :
une croix et quatre coins. Elle sert devant les titres des métiers, devant les
trois moments du déroulé, entre deux passages du bandeau et dans les listes des
pages légales. Sa couleur est celle de l'encre de la brosse voisine (§1). C'est
un masque et non une image, donc une seule ressource pour toutes les couleurs.

**Cartes des métiers `.trades`.** Les quatre métiers sont un `<dl>`, chaque
paire groupée dans un `<div class="trade">`, sur une carte. **Un bento** :
six colonnes, et des cartes de largeurs inégales, 3 et 3 sur la première ligne,
2 et 4 sur la seconde. Les largeurs suivent la longueur des textes. Deux
colonnes égales alignaient quatre pavés de même taille, ce que le §7 appelle
une grille de cartes identiques.

Ce sont des fiches, pas des cartes de service : pas de numérotation, pas
d'icône, pas de bouton en pied, et surtout pas quatre fois le même contenu sous
quatre titres différents (voir §7). Les noms de projets sont en `<b>` (600,
encre pleine) pour donner des points d'accroche à la lecture rapide. Une
cinquième entrée demande de reprendre les largeurs du bento et d'ajouter une
couleur d'étoile.

**Déroulé `.run-through`.** Les trois moments du projet sont trois colonnes
lues de gauche à droite au-delà de 900 px, chacune ouverte par une étoile
olive, et la carte des conditions passe dessous sur toute la largeur. Ils
étaient trois paragraphes empilés avec l'encadré en marge. Pas de numéros : ce
sont trois moments, pas trois étapes numérotées (voir §7).

**L'étoile vaut à toutes les largeurs.** Elle n'a longtemps vécu que dans la
requête à 900 px, avec les colonnes : en dessous, les trois moments
redevenaient trois paragraphes à la file, et plus rien ne disait où l'un
finissait ni où le suivant commençait. C'est pourtant sur un téléphone que la
colonne unique en a le plus besoin, puisque la lecture s'y fait à la verticale
et que le blanc entre deux paragraphes est le seul repère. Elle est donc posée
partout, un peu plus petite en pile (0,8 rem contre 0,95 rem).

**Encadré `.aside`.** La carte des conditions, sous le déroulé, ses cinq
entrées rangées en colonnes. Son titre est écrit à la main (§2) : c'est une
note posée en marge, pas une clause de plus. Il sert à porter une information
réelle et vérifiable, pas un argument : son contenu vient directement des CGV.
Le filet est posé au-dessus de chaque entrée, la première comprise, sans quoi
la première colonne serait la seule à commencer sans trait.

**Index `.index`.** Les réalisations sont un `<table>` posé sur une carte : le
balisage reste tabulaire, parce que les données le sont, un projet, un genre,
une année. La présentation, elle, ne l'est plus. **Les entrées se rangent en
deux colonnes au-delà de 900 px**, chacune en bloc, et le genre et l'année
tombent en fin d'entrée, reliés par une virgule. C'est exactement la forme que
le tableau prenait déjà sous 640 px : elle vaut maintenant à toutes les
largeurs, et une seule mise en page vaut mieux que deux qui divergent. La
légende est écrite à la main.

Les en-têtes tombent avec les colonnes qu'ils nommaient. Un en-tête « Projet »
posé sur une colonne qui porte deux projets côte à côte ne nomme plus rien, et
dans un bloc le nom, le genre et l'année se lisent d'eux-mêmes. Les mesures des
colonnes du type et de l'année (13 rem, 5 rem) tombent avec eux.

**La ligne survolée prend le papier de la page** : sur la carte blanche, elle
ressort en creux, coins arrondis, sans aplat de couleur. Elle a été surlignée en
lime plein, puis inversée en noir ; les deux sautaient à la figure sur une
entrée haute de quatre lignes. L'entrée se cale en haut de sa case et ne s'y
étire pas : deux entrées voisines n'ont pas la même hauteur, et sans ce calage
le creux de la plus courte descendrait jusqu'au bas de la plus longue.

**Le filet est posé au-dessus de chaque entrée, jamais en dessous.** Un filet
sépare deux lignes (§4) ; sous la dernière il ne sépare plus rien, et il ferme
le tableau d'un trait à quelques millimètres du bord de la carte, où deux traits
parallèles se lisent comme une bordure ratée. Posé au-dessus, il ne peut pas s'y
trouver, et la règle vaut pour les deux colonnes à la fois là où une exception
sur la dernière entrée aurait manqué le bas de la première colonne. Ce sont donc
les deux entrées de tête qui n'en portent pas, et non la seule première.

**Icône de projet `.projet-icone`.** Chaque entrée porte à gauche la marque de
son projet, sur la ligne du nom, dans un carré de 1,5 rem. L'adresse, les
magasins et la mention de presse s'alignent sur le nom et non sous l'icône :
la cellule est une grille de deux colonnes, l'icône dans la première, tout le
reste dans la seconde.

**Les coins sont arrondis à 6 px.** La moitié de ces marques sont des carrés
pleins — icônes d'application, pavés de couleur — et un carré vif à angles
droits serait le seul objet du site à ne pas avoir les coins ronds du §1. Sur
les marques détourées, le rayon ne se voit pas : il ne rogne que du vide.

Les dix fichiers sont servis d'ici, comme les polices et les logos de presse.
Un appel aux serveurs des projets leur donnerait l'adresse IP de chaque
visiteur, ce que le §2 et `privacy.html` interdisent. Ce sont les fichiers
officiels de chaque projet, repris tels quels : le favicon du site quand il y en
a un, l'icône de l'application quand le projet n'est qu'une application. Trois
choix méritent d'être notés, parce qu'ils ne se relisent pas dans les fichiers :

- **Axolot est servi en PNG alors que le site publie un SVG.** Ce SVG n'en est
  pas un : c'est un PNG encodé en base64 dans une enveloppe SVG, 46 Ko pour les
  pixels que `favicon-96x96.png` porte en 5. Prendre le SVG aurait coûté neuf
  fois le poids pour exactement la même image ;
- **Vergasta Photo est pris à son `favicon.ico` et non à son `favicon.svg`**,
  bien que le second soit vectoriel. Les deux ne portent pas le même dessin :
  le `.ico` est la marque telle qu'un onglet la montre, la lettre blanche
  détourée d'une tuile noire avec son accent magenta, quand le SVG n'en garde
  que la lettre, pleine et sans tuile. C'est la tuile qu'on reconnaît, et c'est
  elle qui répond aux autres icônes carrées de la liste. Le SVG avait de toute
  façon un défaut qui l'écartait : il porte un `@media (prefers-color-scheme:
  dark)` qui repeint la marque en blanc, et un SVG chargé dans une `<img>` lit
  cette règle sur le réglage du système du visiteur, pas sur la page qui
  l'affiche. Sur notre papier clair, la marque disparaissait purement et
  simplement chez qui a son système en sombre ;
- **BDPokéCards n'existe qu'en 32 px.** Son site ne publie pas d'icône plus
  grande, et une marque agrandie vaut mieux qu'une marque redessinée.

**Bloc de contact `.contact-body`.** La dernière carte de la page, un cran plus
grande que les autres, et la seule en aplat lime : texte à l'encre pleine (du
gris sur du lime ne se lit pas), bouton à droite et centré sur les deux
paragraphes au-delà de 900 px.

Le décompte annoncé par la légende se compte langue par langue, car les
tableaux ne portent pas les mêmes lignes : Bruit CH n'étant pas publiée en
italien, la version italienne en reste à neuf projets quand les quatre autres
passent à dix, et le tableau japonais ne liste que Yamanote 3D. Stellar Rebirth
ouvre la liste dans les quatre langues latines et ne figure pas au tableau
japonais, pour la même raison que les autres : il ne s'adresse pas à ce
lecteur-là.

**Ligne des magasins `.stores`.** Deuxième ligne de la cellule, sous le nom,
là où les projets à adresse posent leur `.host`. Elle reprend les mesures de
ses liens, 0,85 rem sur 1,4, au lieu d'hériter celles du tableau. Sans cela le
bloc garderait un montant de 17 px sur 1,65 et réserverait une ligne de 28 px à
des liens qui n'en font que 15 : le demi-interligne creusait sous le nom un
vide de 12,6 px, contre 7,8 px sur les lignes à adresse, dont le bloc porte
déjà sa propre taille. Deux deuxièmes lignes du même tableau ne peuvent pas
tomber à des hauteurs différentes.

**Mention de presse `.press`.** Troisième ligne de l'entrée d'un projet, sous
les liens de magasin. Elle se lit d'un trait, « Apparu sur » suivi des six
marques, qui tiennent la place des noms : c'est le logo du journal qui fait la
preuve, et le recomposer dans nos polices reviendrait à le citer de mémoire.
Aucune virgule entre les marques : une virgule posée entre deux logos se lit
comme une salissure. L'alternative textuelle rend les noms à la lecture
d'écran, donc la phrase reste entière sans les images.

**Les marques sont désaturées et posées en demi-teinte, et reprennent leur
encre au survol.** C'est le traitement ordinaire d'une barre de presse, et il
vaut ici pour une raison qui lui est propre : six logos à pleine couleur, dont
deux pavés rouges et un bloc noir, tenaient dans l'entrée plus de place que le
nom du projet qu'ils servaient à prouver. En gris, ils redeviennent ce qu'ils
sont, une preuve posée en petit sous le nom.

Elles ont porté un cadre blanc à filet fin, comme des timbres, tant que la ligne
survolée passait au lime et faisait perdre aux marques leurs réserves blanches.
Le survol prend le papier crème depuis, et aucune des six ne s'appuie sur du
blanc : celui de Watson est enfermé dans son propre bloc noir. Six cadres dans
une colonne deux fois plus étroite qu'avant faisaient six objets de plus à
lire ; ils tombent avec la raison qui les tenait.

Les six marques n'ont pas toutes la même hauteur : 1,15 rem pour le Journal du
Jura, 0,98 rem pour Watson et 0,82 rem pour ArcInfo, Le Nouvelliste, La Côte et
Ajour. Le Journal du Jura porte un pavé de deux lignes, Watson un bloc noir
plein et les quatre autres des signatures horizontales : à hauteur égale les
dernières écraseraient la première. Ajour tient dans les mêmes 0,82 rem que ses
voisines bien que la virgule rouge de sa marque monte au-dessus des lettres et
descende sous la ligne de pied : c'est le mot, pas le dessin qui l'accompagne,
qui doit peser autant que « La Côte » à côté.

**La ligne se replie quand la colonne est trop courte, et c'est voulu.** À deux
colonnes, six marques côte à côte ne tiennent pas sur une seule ligne sans
descendre à une hauteur où plus aucune ne se lit. Elle a été tenue de force sur
une ligne, les six marques empilées en biseau comme des coupures posées les unes
sur les autres : de chaque marque il ne restait qu'une tranche, et six tranches
de mots coupés font du bruit, pas une pile. Ce que le calage en haut de case a
réglé du côté de l'entrée voisine, le repli le règle ici : la ligne prend deux
rangs quand il le faut sans allonger personne d'autre.

Chaque marque est un lien vers l'article, sans couleur ni soulignement : c'est
la marque entière qui se prend.

Les six fichiers, `logo_journaldujura.svg`, `logo_arcinfo.svg`,
`logo_watson.png`, `logo_nouvelliste.svg`, `logo_lacote.svg` et
`logo_ajour.svg`, sont servis d'ici comme les polices. Un appel aux serveurs
des journaux leur donnerait l'adresse IP de chaque visiteur, ce que le §2 et
`privacy.html` interdisent. Ce sont les fichiers officiels, repris tels quels :
un logo ne se redessine pas, et si Watson est en PNG c'est qu'il ne publie pas
de SVG. Le tableau japonais ne liste que Yamanote 3D, donc Disque Bleu n'y
figure pas et la mention n'existe que dans les quatre autres langues.

**Pied de page.** La dernière carte, en encre, détachée des bords de la
fenêtre par une marge, avec le même rayon que le bloc de contact. C'est le seul
bloc sombre du site, et donc le seul endroit où le lime tient en couleur de
texte (§1) : la devise y est en lime et en grand corps. La bande peinte à la
brosse le traverse en tête.

**Le fil de `story.html`.** La page « Notre histoire » range ses chapitres le
long d'un trait à la brosse tiré sur toute la hauteur du bloc, qui dérive à
gauche et à droite dans un couloir posé à gauche du texte. Le fil **est** la
séparation entre les chapitres : c'est pour cela qu'aucun filet ne passe entre
eux, deux séparations pour la même charnière en faisant une de trop.

Chaque chapitre pose un nœud carré à ombre portée lime, le même geste que le
bouton, et le dernier est plus gros parce que le fil s'arrête là. Les nœuds
sont sur l'**axe** du couloir, pas sur le fil : le fil les recoupe en
descendant, tantôt en plein dessus, tantôt à côté. Ce sont les épingles qui
tiennent le fil, pas des points de passage obligés, et c'est ce qui autorise le
tracé à être libre. Les caler sur la courbe demanderait au CSS de connaître une
géométrie calculée en JavaScript, donc de sauter d'un chapitre à l'autre sur
une page sans script.

Les deux mesures du couloir, `--fil` et `--fil-jeu`, sont des variables parce
qu'elles servent trois fois : largeur du canevas, retrait de la colonne de
texte, position des nœuds. Elles bougent ensemble ou pas du tout. Le couloir
passe de 3 rem à `clamp(6.5rem, 8vw, 9rem)` au-delà de 800 px : l'amplitude de
la dérive et la taille des tampons se mesurent toutes deux sur cette largeur,
donc le fil de bureau est le même fil agrandi, et non un fil plus lâche.

Le repère de temps de chaque chapitre est une pilule lime en capitales
interlettrées, comme les libellés d'action (§2). Ce ne sont pas des numéros
d'étape (voir §7), ce sont des dates et des mots.

**Encadré `.kodawari`.** Une carte, comme « Bon à savoir », mais elle porte le
mot japonais et sa transcription en tête.
Aucune des polices latines ne dessine les kana : hors de `/ja/`, le mot revient
à la police du système, et c'est voulu. Servir ici PixelMplus12 obligerait à
charger 122 Ko dans les cinq langues pour un seul mot.

**Les deux sorties `.story-sorties`.** Le bouton et le lien vers les
réalisations tiennent sur une seule ligne et se lisent comme une paire, dans le
même corps. Le second est une pilule à filet, qui prend l'aplat lime au
survol. C'est la
hiérarchie qui distingue les deux, pas deux traitements sans rapport. Un petit
lien souligné en bleu posé sous un filet, comme au premier jet, se lisait comme
un reste de page plutôt que comme une sortie.

**L'âge, et `age.js`.** L'histoire s'ouvre sur « j'ai *n* ans ». Le nombre est
écrit dans le HTML, juste le jour où la page a été écrite, et le script le
recalcule à l'ouverture à partir de la date portée par `data-ne-le`. Sans
JavaScript la phrase se lit normalement : elle prend seulement un an de retard
au prochain anniversaire, ce qui vaut mieux qu'un trou. Le nombre est le même
dans les cinq langues, donc le script ne touche qu'au texte de l'élément et
jamais à la phrase qui l'entoure. La date est découpée à la main plutôt que
passée à `new Date()`, qui l'interpréterait en UTC et décalerait d'un jour à
l'ouest de Greenwich, exactement le jour de l'anniversaire. Aucune requête,
aucun stockage : la propriété du §2 tient.

**Navigation.** Liens en casse normale, pilule lime au survol. Cinq entrées
depuis l'ajout de « Notre histoire ». La page courante y est un
`<span class="is-current">` et non un lien, comme dans le sélecteur de langue.
Le corps et les gouttières sont réglés au pixel près : la marque, les cinq
entrées et les cinq langues tiennent sur une ligne de 66 rem en français, qui
est la version la plus longue. Y toucher fait tomber la navigation sur une
seconde ligne.

**L'en-tête sous 1280 px.** Cette ligne unique ne tient qu'à partir de 1280 px.
En dessous, la coupe est choisie plutôt que subie : `.masthead` devient une
grille de deux lignes, la marque à gauche et les cinq langues à droite sur la
première, la navigation sur toute la largeur sur la seconde. Le groupe de queue
passe en `display: contents` pour que ses deux navigations deviennent des cases
de cette grille, ce qui évite de toucher au HTML des vingt-six pages.

Avant cela, l'enroulement du `flex` cassait où il pouvait : sur un téléphone,
la marque, puis la navigation coupée en deux, puis les langues, quatre lignes
et deux cents pixels de haut avant le premier mot de la page, soit le quart
d'un écran. Il en reste cent cinquante, et l'ouverture de l'accueil tient
maintenant sur le premier écran, ses deux sorties comprises.

**Rien ne se replie derrière un bouton**, ni ici ni ailleurs. À cinq entrées,
une liste ouverte se lit d'un coup d'œil et fonctionne sans JavaScript : c'est
déjà la raison qui vaut pour le sélecteur de langue, et elle vaut deux fois
pour une navigation de cinq mots.

**Les libellés tombent sur la gouttière.** Les pilules de la navigation sont
invisibles au repos, mais leur rembourrage compte : sans marge négative sur les
deux navigations, le premier libellé rentrait de douze pixels sur la gouttière
et le dernier code de langue s'en écartait d'autant, alors que la marque et le
titre de la page, eux, tombent dessus. C'est le même décalage optique que
celui des marques à la brosse (`-0,35 rem` sur `.slab-mark`). La seule pilule
visible au repos, celle de la page courante, déborde donc la gouttière du
rembourrage : c'est un alinéa négatif, et il vaut mieux que cinq libellés
décalés.

**Sélecteur de langue `.lang-nav`.** Cinq codes à deux lettres dans la bitmap,
posés à droite de la navigation, séparés par un filet simple à partir de
1280 px. Le filet ne sépare les langues de la navigation que lorsque les deux
se suivent sur la même ligne ; en grille, les langues sont posées au bout de la
ligne de la marque, et un filet à leur gauche couperait la marque de son propre
en-tête.
La version courante porte la pilule lime : c'est le même geste que le survol,
tenu en permanence. Pas de menu déroulant, pas de drapeau. À cinq entrées une
liste ouverte se lit d'un coup d'œil, elle fonctionne sans JavaScript, et un
drapeau désigne un pays, pas une langue.

**Barre de défilement.** Ramenée à un filet de 6 px, rail transparent pour
laisser passer le fond, curseur en `--rule` qui passe à `--ink-soft` au
survol. Déclarée deux
fois — `scrollbar-width` / `scrollbar-color` pour Firefox,
`::-webkit-scrollbar` pour Chrome, Edge et Safari. Elle n'est jamais masquée :
c'est le seul repère de position dans une page longue.

---

## 6. Les marques à la brosse

`brushes.js`, sans dépendance. Une brosse est une petite forme tamponnée le
long d'un chemin ; cinq nombres suffisent à passer d'un trait net à une
projection lâche.

Le point de départ est le travail d'Arlan Marat sur les
[Pixel Brushes](https://www.arlan.me/vault/pixel-brushes), sous licence MIT. Le
remerciement est porté en bas de la section « Propriété intellectuelle » des
mentions légales, dans les cinq langues, et en tête de `brushes.js`.

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

Le lime disparaît sur du clair, donc les marques posées sur le papier
utilisent une gamme saturée : `bleu`, `magenta`, `cyan`, `olive`, `orange`,
`encre`. `lime` et `bleu` sont réservés à la bande du pied de page, qui est
sur noir.

### Le fil de l'histoire

`fil` est la seule marque qui ne tienne pas dans un carré : son hôte est un
couloir haut et étroit, aussi long que le bloc des chapitres. Trois points en
découlent.

**Le méandre ne se répète jamais.** `serpente` superpose trois harmoniques dont
deux sont dans un rapport irrationnel à la première, et module lentement leur
amplitude, de sorte que certains virages s'ouvrent et d'autres se referment.
Une sinusoïde seule donnerait un ruban de papier peint sur deux mètres de page ;
il faut ces quatre fréquences pour qu'un œil arrête d'y trouver la répétition.
Une enveloppe ramène le tracé vers l'axe aux deux bouts, pour qu'il parte et
finisse au milieu du couloir plutôt qu'en butée contre un bord. Rien de tout
cela ne passe par `Math.random` : la règle du §6 vaut, un redimensionnement doit
redonner le même fil.

**La brosse change en cours de route, l'encre non.** `brin(t0, t1)` découpe une
portion du même tracé, et la position ne dépend que de `t` : deux portions
consécutives se raccordent donc exactement, à un cheveu de recouvrement près.
Cinq brins descendent la page, `plume`, `carres`, `derive`, `tissage`, `touffe`,
tous en magenta, avec des retards croissants qui font descendre le dessin comme
une main qui trace. Une passe de croix bleues repasse ensuite sur toute la
longueur, décalée d'un poil : le tirage en deux couleurs mal calées de
l'ouverture. **Cinq brosses, une seule encre** : c'est la texture qui change,
pas l'identité. Cinq encres donneraient cinq traits, plus un fil.

**Le fil se déroule au défilement.** C'est la seule marque du site dans ce cas,
et c'est une question de mesure : les autres tiennent dans un carré qu'on
embrasse d'un regard, lui est aussi long que le bloc des chapitres. Le dessiner
d'un coup à l'entrée dans le champ, ce serait le peindre presque entièrement
hors de l'écran et n'en montrer jamais le tracé. Sa pointe se tient à `POINTE`,
un peu sous la ligne de lecture.

**Ce réglage se règle par le bas, pas par le haut**, et c'est le seul piège du
déroulé. Trop près de 1, la pointe colle au bord inférieur de l'écran : le fil
est déjà tracé partout où l'œil se pose, il ne reste qu'une bande de rien du
tout en bas de la fenêtre, et le déroulé passe pour absent. Un premier essai à
0,9 se lisait exactement comme un fil dessiné d'avance. Il faut laisser sous la
pointe une part visible de l'écran encore vierge pour que l'avancée se
remarque, d'où les 0,62 actuels.

Trois points à ne pas défaire :

- **l'avancement ne redescend jamais.** Un fil qu'on déroule ne se rembobine
  pas, et surtout le canevas n'est jamais effacé entre deux images : remonter
  demanderait de repeindre toute la hauteur à chaque cran de molette. C'est
  exactement ce que `from` évite, comme pour la barre de chargement ;
- **les chemins sont calculés une fois par mise en page**, pas à chaque image.
  Un déroulé recalculerait sinon des milliers de points par image pour rien ;
- **`prefers-reduced-motion` ne reçoit pas le déroulé.** Le fil y est posé
  entier à l'entrée dans le champ, comme les autres marques. Un tracé qui suit
  le défilement est précisément ce dont ce réglage ne veut pas.

Un redimensionnement repeint d'un coup ce qui était déjà déroulé, et pas plus :
ce n'est pas une seconde entrée en scène.

**`size` se mesure sur le petit côté du canevas**, donc ici sur la largeur du
couloir : la taille des tampons suit le couloir, jamais la longueur de la page.
C'est le nombre de tampons qui croît avec la hauteur, ce qui est exactement ce
qu'on demande à un fil. Le nombre de points du chemin suit la même règle, à la
longueur de chaque brin, sinon un chapitre ajouté étirerait la même poignée de
segments et le méandre s'angulerait.

### L'entrée en scène

Il n'y en a pas. **La marque se peint à sa place, et c'est tout.**

Elle a longtemps eu un geste d'arrivée par-dessus le tracé. L'ouverture de
l'accueil venait du haut à droite, hors cadre, et revenait à sa place en
tournant d'un demi-tour sur elle-même ; les autres marques se dépliaient sur
place, couchées en arrière et de biais, la couleur montée d'un cran. Les deux
gestes finissaient de la même façon, en dépassant la position d'arrivée d'un
degré ou deux pour y revenir : un **rebond**, qui donnait à un tampon de
peinture le poids d'un objet qui retombe.

Deux mouvements se disputaient le même moment. La brosse pose déjà ses tampons
un par un le long de la spirale, et **ce déroulé est le geste** : il dit qu'une
main peint, ce qu'aucune rotation ne dira jamais. Le lui faire faire pendant que
la forme entière voyage, tourne et rebondit, c'est peindre sur un support qui
bouge : ni l'un ni l'autre ne se lit, et le rebond finit par raconter une
matière (un objet, une masse, un ressort) qui n'est pas celle d'une peinture.

Reste le dessin seul, à sa place, dès la première image. **Ce qui bouge est ce
que la brosse trace, et rien d'autre.**

Ce qu'il ne faut pas ramener :

- **ni trajet, ni rotation, ni dépliage en perspective.** La marque est là où
  elle se peint. Une marque qui traverse l'écran avant de se poser oblige à
  regarder le déplacement plutôt que le tracé ;
- **ni rebond, ni dépassement de la position d'arrivée.** C'est ce point-là qui
  a été demandé nommément, et c'est le plus facile à laisser revenir : il suffit
  d'une courbe d'accélération qui sort de l'intervalle 0-1 ;
- **ni montée de saturation.** La couleur d'une encre est celle de l'encre.

Conséquences dans le code, toutes des suppressions. `brushes.js` ne pose plus
rien sur l'hôte : la classe `mark--pose` n'existe plus, ni les images-clés
`pose-marque` et `pose-ouverture`, ni les variables `--vient-x` et `--vient-y`.
Il n'y a donc plus rien à neutraliser à l'impression, sur la page d'atelier qui
tire la carte de visite, ni en mouvement réduit : ces trois cas recevaient une
`animation: none` qui n'a plus d'objet.

**Ce qui reste de mouvement sur l'ouverture** est la montée du titre, de
l'accroche et des sorties (`arrivee`) : un demi-centimètre vers le haut et un
reste de flou, décalés de 0,1 à 0,42 seconde. C'est la page qui arrive, pas la
marque. Celle-là est bien neutralisée à l'impression et en mouvement réduit.

**La coupe latérale du corps de page reste** (`overflow-x: clip`, §4). Elle
avait été posée pour l'entrée hors cadre de la marque ; elle ne coûte rien et
tient toujours la page à sa largeur, en cinq langues et sur six pages.

### Sous 1000 px, la marque ferme l'ouverture

Au-delà de 1000 px, l'ouverture a deux colonnes et la marque tient dans la
seconde : elle ne coûte pas une ligne au texte. En dessous il n'y a plus qu'une
colonne, et la marque était posée **en tête**, au-dessus du titre.

Sur un téléphone elle y prenait une bande à elle seule : 168 px de haut, 244 en
comptant les blancs, soit près du tiers de l'écran, dont la moitié gauche
restait du papier vide. Le titre n'arrivait qu'au milieu du premier écran et
les deux sorties passaient sous la ligne de flottaison. La page d'histoire
avait le même défaut, 220 px avant de lire « Notre histoire ».

Sous 1000 px la marque passe donc **en dernier** dans l'ouverture, après les
deux sorties sur l'accueil, après l'accroche sur la page d'histoire. La page
s'ouvre sur son titre, et la marque referme la scène. Le blanc qu'elle laisse à
sa gauche est celui qui sépare de toute façon l'ouverture de ce qui suit, donc
il ne se lit plus comme un trou. Le titre de l'accueil monte de 396 à 200 px,
celui de l'histoire de 372 à 200 px.

Une spirale, si c'est la signature de l'atelier, n'a pas à être lue avant la
phrase qui dit ce que l'atelier fait.

C'est `order: 1` sur la marque et une colonne `flex` sur l'ouverture, pas un
déplacement dans le HTML : la marque reste le premier enfant dans les dix pages
concernées, donc elle reste ce que la grille de 1000 px place en colonne 2, et
le balisage ne bouge pas. Elle est `aria-hidden`, donc son rang dans l'ordre de
lecture ne regarde personne.

### Ajouter une marque

1. Poser `<div class="mark" data-mark="nom" aria-hidden="true"></div>` dans le
   HTML, et lui donner une taille en CSS.
2. Ajouter une entrée `nom` dans `MARKS`, comme une pile de couches
   `{ brush, ink, path, over, alpha, delay }`.
3. Regarder le rendu agrandi et régler `spacing` avant tout le reste.

Il n'y a rien d'autre à écrire : la marque n'a pas d'entrée en scène, elle se
peint à sa place.

Les marques se dessinent à l'entrée dans le champ de vision puis **la boucle
s'arrête** : une image fixe ne mérite pas d'images par seconde.
`prefers-reduced-motion` peint directement l'état final. Les hôtes sont des
boîtes vides décoratives : **sans JavaScript la page est identique, sans trou.**

Une exception, listée dans `AU_DEFILEMENT` : le fil de `story.html`, qui se
déroule à la lecture. Voir ci-dessous.

### La barre de chargement

Le site est fait de pages complètes : cliquer un lien fait attendre le visiteur
devant la page qu'il quitte, sans que rien ne bouge. La barre occupe cette
attente, et c'est la même brosse que partout ailleurs qui la peint. Sept pixels
de haut, tout en haut de la fenêtre, deux passes mal calées comme la spirale
d'ouverture : un rail posé haut, une ombre jetée dessous et en retard d'un poil,
comme l'ombre portée du bouton ramenée à l'échelle.

Elle sert deux moments, et les deux ne se règlent pas pareil.

**Au clic**, elle avance sur la page qui part et reste à l'écran pendant que le
navigateur va chercher la suivante. Rien ne paraît avant 120 ms : sur une
navigation courte la page suivante prend la main avant, et un éclair de couleur
juste avant que l'écran se remplace ne serait qu'un raté.

**À l'arrivée**, elle paraît tout de suite et traverse l'écran en 700 ms au
minimum. C'est le point à comprendre avant d'y toucher : **ce site se charge en
bien moins que ces 120 ms.** Une barre honnête, qui ne durerait que le temps
réel du chargement, ne serait jamais visible une seule fois. La durée plancher
lui donne le temps de traverser, et elle assume ce qu'elle est alors : une
transition d'arrivée, pas une jauge. Sur une vraie attente, elle,
la course finale reprend sa durée sèche de 280 ms, parce qu'il n'y a plus rien à
donner à voir : le trait est déjà passé sous les yeux du visiteur.

**Le remplissage n'est pas une mesure.** Rien, dans une page servie en un bloc,
ne dit où en est le téléchargement. La montée est asymptotique : elle approche
93 % sans jamais les atteindre, et seule la fin du chargement pousse le trait
jusqu'au bout. Une barre qui bluffe un pourcentage précis ment ; une barre qui
ralentit dit seulement « ça vient ». Les deux courbes suivent cette logique :
sortie cubique pour solder une vraie attente, courbe adoucie aux deux bouts pour
la traversée d'arrivée, qu'une sortie cubique ferait filer puis ramper.

**Le tracé change à chaque navigation.** Huit variantes, deux brosses et deux
encres chacune, dans la gamme saturée : la barre est sur du papier clair, le
lime n'y tiendrait pas. Ce qui change, ce sont les brosses et les encres, jamais la
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

**`prefers-reduced-motion` ne reçoit pas la traversée d'arrivée.** Elle n'existe
que pour être regardée, et c'est précisément ce dont ce réglage ne veut pas. La
barre y redevient ce qu'elle serait sur une connexion lente : rien pendant
400 ms, puis le trait entier posé d'un coup, sans montée, retiré à l'arrivée de
la page. Un chargement ordinaire ne montre donc rien du tout.

Elle ne demande rien à personne : aucune requête, aucune clé de stockage, rien
qui sorte de l'appareil. La promesse du §2 tient, et **sans JavaScript l'élément
n'existe pas**. La page d'atelier, qui sert à imprimer une carte, n'en a pas.

---

## 7. Ce qu'on ne fait pas

Le site a été audité contre les signatures visuelles de génération automatique
documentées en 2026, puis nettoyé. Ces choses sont proscrites :

- indigo `#4f46e5` **en couleur d'interface par défaut**. Ici il vient du logo
  et sert aux liens ; ce n'est pas la même chose qu'un bouton indigo par défaut
  sur fond blanc,
- Inter, Poppins, Montserrat, Space Grotesk. Gabarito et Figtree sont des
  géométriques comme Poppins, et le rappel a son intérêt : ce qui est proscrit,
  c'est **la police par défaut d'un gabarit**, celle qu'on ne choisit pas.
  Celles-ci ont été comparées au rendu réel, et Figtree tient le texte courant
  là où Poppins, dessinée pour de l'affichage, fatigue à 17 px,
- libellés en petites majuscules interlettrées au-dessus des titres,
- monospace décoratif, coordonnées GPS,
- bandes de chiffres clés, surtout inventés,
- numérotation `01 / 02 / 03` des services ou des étapes. Le déroulé est en
  trois colonnes depuis la refonte, et il n'en porte toujours pas,
- **grilles de cartes identiques.** La carte est devenue l'objet de base du
  site (§5), ce qui déplace cette règle sans l'abolir : ce qui est proscrit,
  c'est le jeu de cartes **interchangeables**, trois ou quatre fois le même
  contenu sous un titre différent, avec icône, titre court et bouton en pied.
  Les quatre métiers y échappent par construction : chacun porte un texte qui
  lui est propre et cite des projets réels, aucun ne porte d'icône ni de
  bouton, et le bento leur donne trois largeurs différentes, précisément pour
  qu'on ne puisse pas les lire comme une grille,
- flèches `↗`, point coloré en fin de titre,
- **en-tête collant** en verre dépoli, dégradés de couleur, **ombres diffuses
  et colorées**. L'ombre des cartes est une ombre portée grise, à une seule
  teinte, celle de l'encre : elle dit qu'une feuille est posée sur une table.
  Une ombre teintée de la couleur de l'objet, ou une lueur, est autre chose,
- **mode sombre par défaut, néon sur noir.** Le site est sur papier clair, du
  premier au dernier bloc de texte. Le pied de page est le seul bloc sombre, et
  pour une raison qui n'est pas une mode : le lime du logo n'existe à pleine
  intensité que là (voir §1). Ce n'est pas un thème sombre, c'est un aplat.

### Textes

- **Aucun tiret cadratin.** Deux-points, parenthèses, ou deux phrases.
- **Aucun deux-points dans `story.html`**, dans les cinq langues. La règle
  ci-dessus vaut pour les pages qui décrivent ou qui règlent ; le deux-points
  y annonce une liste ou une précision et se lit bien. Dans un récit à la
  première personne, il revient toutes les trois phrases et sonne rédigé. Deux
  phrases font le même travail sans le tic. Les autres pages le gardent.
- Pas de définition en fragments nominaux enchaînés (« Le refus de X. Le soin
  porté à Y, sauf le jour où Z. »). C'est la tournure d'un texte écrit pour
  faire joli, et elle s'entend. Une phrase simple et complète, ou rien.
- Pas de chute assénée en phrase courte (« La passion était là. Elle n'est
  jamais repartie. »). Dire ce qui s'est passé suffit.
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

## 7 bis. L'estampille de cache

Les scripts et les feuilles de style sont appelés avec `?v=16`. Ce n'est pas
décoratif.

GitHub Pages sert ses fichiers derrière un CDN, avec `cache-control:
max-age=14400`. Le HTML d'une page se renouvelle vite, mais `brushes.js` et
`styles.css` restent jusqu'à **quatre heures** dans le cache de bord. Après une
mise en ligne, le visiteur reçoit donc le nouveau HTML avec l'ancien script, et
un rechargement forcé n'y change rien : le `no-cache` d'un navigateur ne
traverse pas le CDN. Le cas s'est produit, et il s'est lu comme une
fonctionnalité qui ne marchait pas.

Un cache se contourne par l'adresse. La requête porte la chaîne de requête,
donc `brushes.js?v=11` est une autre entrée de cache que `brushes.js?v=10` et
part chercher le fichier à la source.

**Changer un de ces cinq fichiers veut donc dire deux gestes, pas un** : le
fichier, puis l'estampille dans les vingt-six pages qui l'appellent. Elle est
la même partout, un simple entier, et vaut pour tous les fichiers à la fois :
une estampille par fichier serait plus fine et cinq fois plus facile à oublier.

Les polices n'en portent pas. Elles ne changent pas, et quand elles changent
c'est leur nom qui change, ce qui suffit. Les images, les icônes de projet et
`favicon.ico` non plus, pour la même raison.

---

## 8. Vérifications avant de pousser

- rendu en 1440 px et 390 px, accueil et une page légale,
- sous 1000 px, la marque de l'ouverture est **après** le texte et le titre
  tombe juste sous l'en-tête, sur l'accueil comme sur la page d'histoire, dans
  les cinq langues (voir §6),
- l'entrée de la marque d'ouverture : elle vient du haut à droite, revient à sa
  place en s'enroulant, finit nette, et **la page ne se laisse pas tirer de
  côté pendant ce temps** (§4, §6),
- états de survol : navigation, ligne de tableau qui passe au papier, cartes,
  bouton sur ses deux fonds (papier et bloc lime), marques de presse, qui
  passent du gris à leur encre,
- barre de chargement : cliquer un lien interne la lance, un lien externe non,
  et elle s'efface après l'arrivée sans rien laisser derrière,
- « Notre histoire » : le fil se déroule en descendant et sa pointe reste en
  bas de la fenêtre, remonter ne l'efface pas, il se repeint entier après un
  redimensionnement, et l'âge de la première phrase est celui du jour,
- JavaScript coupé : aucun trou dans la mise en page, le sélecteur de langue
  reste un jeu de liens qui fonctionnent, la barre n'existe pas, et l'âge écrit
  dans le HTML reste lisible,
- aucune requête vers un domaine tiers,
- console sans erreur,
- mouvement réduit : la marque est peinte d'un coup au lieu d'être tracée, le
  texte de l'ouverture ne monte pas, le bandeau ne défile plus, et rien d'autre
  ne bouge,
- la navigation tient sur une ligne en français à 1280 px et au-delà, et en
  dessous l'en-tête tient sur deux lignes dans les cinq langues, de 320 px à
  1279 px, sans que les langues descendent et sans qu'un libellé quitte la
  gouttière (voir §5),
- si un script ou une feuille servie a changé, l'estampille `?v=` a été
  incrémentée dans les vingt-six pages (voir §7 bis), sans quoi la
  modification restera invisible en ligne pendant quatre heures,
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

**`sitemap.xml`.** Les cinq pages publiques dans les cinq langues, soit
vingt-cinq adresses, rien d'autre. Ses `<loc>` doivent correspondre exactement aux
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
l'écrire en toutes lettres. `story.html` en porte un second, plus court : un
`AboutPage` rattaché aux **mêmes `@id`** que l'accueil, `#site` et `#atelier`,
avec la personne en `mainEntity`. Un seul atelier, décrit à plusieurs endroits :
les `@id` sont ce qui l'empêche d'en devenir plusieurs. Pas de date de
naissance dans le balisage, alors même que la page en porte une dans
`data-ne-le` : la phrase a besoin d'un âge, un moteur n'a pas besoin d'une date
d'anniversaire. Les pages légales, elles, n'en portent pas. Deux règles pour
l'entretenir :

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
Vingt-cinq pages, cinq par langue.

Les noms de fichiers sont en anglais dans les cinq langues, `story.html`
comprise : c'est une adresse, pas un texte, et cinq jeux d'adresses par page
seraient cinq occasions de diverger.

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
