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
l'une en lime acide, l'autre en bleu électrique. Autour d'elles, une page
blanche, des cartes crème à coins ronds, plates, posées dessus, beaucoup d'air,
et les peintures à la brosse par-dessus tout. Le registre n'est pas celui d'une brochure imprimée :
c'est un atelier, pas une agence.

| Rôle | Valeur | Emploi |
|---|---|---|
| Fond (`--paper`) | `#ffffff` | fond général |
| Carte (`--carte`) | `#f1f2e9` | cartes, pilules secondaires |
| Blanc (`--sheet`) | `#ffffff` | libellé des boutons, pilules des tuiles |
| Encre | `#16160f` | texte, pied de page, boutons |
| Encre atténuée | `#5d5d54` | texte secondaire (6,6:1 sur le fond, 5,9:1 sur une carte) |
| Filet | `rgba(22,22,15,.12)` | séparations internes des cartes, pages légales |
| Lime | `#d4ff00` | bloc de contact, survols, pilules de temps |
| Bleu | `#4f46e6` | liens, puces des pages légales |
| Magenta, cyan, olive, orange | encres des brosses | étoiles des puces |
| Sur encre | `#b8b8b3` | texte du pied de page |
| Filet sur encre | `#33332c` | séparation du pied de page |

**Le fond est blanc, et ce sont les cartes qui prennent le papier.** Pendant
longtemps, c'était l'inverse : un papier crème, des feuilles blanches posées
dessus, et une ombre portée pour les en détacher, parce qu'une carte plus
claire que le fond ne se voit pas d'elle-même. Les rôles se sont inversés. La
page est blanche, les cartes sont des aplats crème, plats et sans ombre, et
une carte plus sombre que la page se voit sans aide. L'ombre n'a plus rien à
faire, et c'est elle qui partait : la mise en page y gagne tout son calme.

L'écart entre les deux teintes n'a pas bougé : **1,13**, le rapport qui
séparait l'ancien papier de l'ancienne feuille. C'est la même paire de
couleurs, seulement l'objet a changé de côté. `#f1f2e9` était le papier de la
page, c'est maintenant celui des cartes ; il valait `#e9ebe0` auparavant, et
ne doit pas remonter : un crème plus franc ferait des cartes des pavés.

`--paper` et `--sheet` valent tous deux le blanc, mais ils ne disent pas la
même chose : le premier est le fond, le second le blanc d'un libellé ou d'une
ligne survolée. Le jour où le fond reprend une teinte, il n'y a qu'une ligne à
changer.

Les quatre encres saturées des brosses (`magenta`, `cyan`, `olive`, `orange`)
sont recopiées en variables CSS depuis `brushes.js`. Elles servent aux étoiles
posées devant les titres : l'étoile d'un moment du déroulé est de la couleur
de la peinture d'à côté, et non d'une gamme d'interface parallèle. **Les deux listes
doivent rester égales** ; changer une encre dans le script veut dire la changer
dans la feuille de style.

### Les coins, le ressort

| Jeton | Valeur | Emploi |
|---|---|---|
| `--rond` | 24 px | cartes des métiers, tuiles des réalisations |
| `--rond-l` | 30 px | bloc de contact, pied de page |
| `--rond-s` | 14 px | encart de traduction |
| `--ressort` | `cubic-bezier(.34, 1.56, .64, 1)` | survol de ce qui se clique |
| `--ressort-duree` | 0,5 s | la même chose |

**Plus aucune ombre portée.** Une carte est un aplat, une pilule aussi. Les
jetons `--ombre` et `--ombre-basse` ont été retirés avec elles, et une ombre qui
reviendrait sur une carte demanderait d'abord de revenir sur le fond : elle ne
sert qu'à détacher une feuille plus claire que la page. Seules restent les
ombres nettes et décalées des nœuds de l'histoire, qui ne posent rien : ce sont
des tirages mal calés, comme la barre de chargement.

**Le ressort.** Ce qui se prend (bouton, pilule, bientôt tuile) grossit d'un
cran au survol, `scale(1.05)`, et dépasse un peu sa taille d'arrivée avant de
s'y poser : la courbe sort de l'intervalle 0-1, c'est voulu. La pilule vient à
la main. Il ne vaut **que pour ce qui se clique**, jamais pour une marque à la
brosse, qui se peint à sa place et ne rebondit pas (§6) : c'est là que le §6
proscrit le rebond, et il y reste proscrit. Le mouvement réduit l'annule, et la
chose garde sa taille.

### La règle du lime

Du lime en texte sur blanc donne **1,1:1 de contraste**. Il est illisible.
Il ne sert donc jamais de couleur de texte sur du clair. Il ne fonctionne que
comme aplat sous du noir, ou comme trait sur du noir :

- le bloc de contact, en aplat plein sous du texte à l'encre,
- le survol des liens de navigation, l'aplat de la langue courante, les pilules
  de temps de la page d'histoire,
- la devise, la bande et la pilule du pied de page, qui est en encre.

Le pied de page est le seul bloc sombre du site, et donc le seul endroit où le
lime tient à pleine intensité en couleur de texte. Si un jour on l'éclaircit,
le lime doit en sortir.

---

## 2. Typographie

Quatre polices, **hébergées dans `fonts/`**, jamais chez un tiers.

| | Police | Emploi |
|---|---|---|
| Titres | **Gabarito** 700 et 500 | `h1`, `h2`, `h3`, noms de projets, devise, boutons |
| Texte | **Figtree** 400 et 600 | tout le texte courant |
| Accroches | **Figtree** 300 | les grandes phrases d'accroche en corps d'affichage |
| Écriture | **Caveat** 600 | un seul endroit (voir plus bas) |
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

**Caveat, l'écriture, ne sert qu'à la légende des réalisations.**
Elle tenait aussi le titre de l'encadré des conditions, retiré depuis ; elle n'en
prend pas d'autre. La légende est un commentaire en marge d'un contenu, pas du
contenu. Une écriture
manuscrite qui sert partout n'est plus une écriture, c'est une police de plus.

Pas d'italique : l'emphase passe par `<em>`, stylé en surligneur lime.

**Aucune capitale forcée dans les titres.** Les capitales interlettrées sont
réservées aux **libellés d'action** : boutons, pilules de renvoi, repères de
temps de l'histoire, pilules des tuiles de réalisation. C'est ce qui distingue une action
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

**Un paragraphe japonais s'écrit sur une seule ligne du HTML.** Le japonais
ne met pas d'espace entre les mots, mais le navigateur change tout retour à la
ligne du source en espace, y compris entre deux kanji : « 事業の内容と、
サイト » au lieu de « 事業の内容と、サイト ». La règle CSS qui devrait les
effacer n'est appliquée par aucun navigateur. Le défaut passait inaperçu en
petit corps ; il saute aux yeux dans les grandes phrases du déroulé, et les
vingt-neuf coupures de l'accueil et de l'histoire ont été recollées. Un
retour à la ligne reste permis là où une espace le serait aussi, contre un mot
latin (`Vergasta Digital は`).

### Pourquoi les polices ne viennent pas de Google

`privacy.html` promet qu'aucun outil tiers ne suit le visiteur. Un appel à
`fonts.googleapis.com` transmet l'adresse IP de chaque visiteur à Google à
chaque page vue, ce qui contredit cette promesse et pose un problème sous LPD
et RGPD. **Le site ne fait aujourd'hui aucune requête externe.** Quinze fichiers
`.woff2` dans `fonts/`, 332 Ko au total, dont 122 Ko qui ne sont chargés que
sur `/ja/`, et aucun n'est chargé s'il n'est pas employé dans la page. Cette
propriété est à préserver.

Figtree 300 est la dernière venue : deux fichiers de 16 Ko à eux deux, pour les
grandes accroches en graisse légère. Elle ne sert pas au texte courant, qui
reste en 400 : à 17 px, une graisse 300 s'efface sur un écran ordinaire.

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

**Un blanc uni, sans motif.** Six filets d'un pixel ont longtemps traversé la
page de haut en bas, au pas de la colonne de texte : les colonnes du gabarit,
laissées apparentes. Ils sont partis avec l'ombre des cartes. Sur une page
blanche, ils se lisaient comme du papier millimétré et disputaient l'œil aux
cartes, et le calme de la mise en page tient justement à ce que rien ne
bouge sous le contenu.

Le pas de 8 px de l'ancienne grille survit dans `--pas` : la barre de
chargement se cale dessus, et les tampons des brosses aussi.

---

## 4. Mise en page

Le site est une pile de **cartes crème posées sur une page blanche**. Chaque
bloc de contenu qui se tient tout seul devient une carte : aplat crème, coins
ronds, ni ombre ni bordure. Le reste, c'est du texte sur le blanc.

- `.wrap` : **62 rem de contenu**, gouttière de 1,5 rem qui passe à 4 rem
  au-delà de 800 px. La gouttière s'ajoute à la mesure au lieu d'être prise
  dessus (`max-width: calc(62rem + 2 * var(--gutter))`). La colonne valait
  66 rem : plus étroite, elle laisse plus de blanc de part et d'autre, et c'est
  ce blanc qui fait le calme de la page.
- L'en-tête suit la même colonne : la marque tombe sur la gouttière du
  contenu, et le dernier code de langue sur l'autre.
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
- Les filets (`1px solid --rule`) ne séparent plus que des lignes de texte :
  les trois moments du déroulé, le haut et le bas des chapitres de l'histoire,
  les sections des pages légales. Le dernier qui vivait dans une carte, entre
  deux lignes du tableau des réalisations, est parti avec le tableau. Plus
  aucune bordure fermée, plus aucun filet double.
- **Un filet en tête d'un bloc `.wrap` se dessine sur la largeur du contenu**,
  pas en bordure (`background: var(--filet-colonne)`). Une bordure y court sur
  les gouttières et dépasse la colonne de 4 rem de chaque côté : c'était le cas
  des deux filets qui encadrent les chapitres de l'histoire.
- Le corps de page est coupé à droite (`overflow-x: clip`). La coupe avait été
  posée pour l'entrée de la marque d'ouverture, qui débordait la fenêtre ; cette
  entrée n'existe plus (§6) et la coupe reste, comme garde-fou : rien ne doit
  pouvoir tirer la page de côté, en cinq langues et sur six pages. **Elle est
  posée sur le corps de page et pas sur la racine**, où elle ne change rien ;
  c'est vérifié.

### La page d'accueil

Elle ne suit pas la même partition que les pages intérieures, et c'est voulu :

1. **la scène** (`.scene`), qui prend toute la hauteur de la fenêtre, moins
   l'en-tête : l'accueil s'ouvre sur un écran, pas sur un
   paragraphe. Au milieu, centrés, la petite croix du logo, le titre en
   Gabarito 500 et une ligne en gras gris qui dit qui parle, reprise du titre
   de la page (« Atelier web à St-Imier ») plutôt qu'une formule de plus à
   traduire cinq fois. En bas, sur toute la largeur, **la fresque** peinte à
   la brosse (§6) ;
2. la **bannière d'Auxine** (voir plus bas) ;
3. **l'accroche** (`.accroche`) : la phrase qui dit ce que fait l'atelier,
   posée en très grand (jusqu'à 2,9 rem) et en Figtree 300 sur toute la
   colonne, à l'encre pleine, comme le « Construis autant de LEGO… » de
   BlockAbo ; puis les deux sorties, le formulaire et le renvoi vers les
   réalisations. C'est une phrase d'affichage, pas un paragraphe de lecture :
   la mesure large (une quarantaine de signes par ligne) y est voulue. Elle
   n'a pas de montée d'arrivée, étant sous la ligne de flottaison ;
4. les **réalisations**, une grille de tuiles, chacune au fond de son projet ;
5. les quatre **cartes** des métiers, en bento ;
6. le **déroulé**, trois grandes phrases séparées par des filets ;
7. le **bloc de contact**, seule carte en aplat lime, coupée en deux :
   l'invitation à écrire, et les engagements ;
8. le **pied de page**, carte d'encre détachée des bords de la fenêtre :
   la devise, l'adresse et le formulaire, puis les liens en colonnes.

**La hauteur de la scène** vaut `100svh` moins l'en-tête, et non
`100vh` : la barre d'adresse d'un téléphone ne pousse pas la fresque hors de
l'écran. La hauteur de l'en-tête y est écrite en dur (`--entete` : 84 px sur
une ligne à partir de 950 px, 111 px sur deux lignes, 119 px sous 360 px),
faute de pouvoir la lire en CSS : elle a été mesurée, et **elle se remesure si
l'en-tête change**. Avec elle, la fresque ferme exactement le premier écran à
1440 × 900, 1280 × 720, 1024 × 768 et 390 × 844. Sur un écran bas, c'est le
titre qui rapetisse (son corps est plafonné par la hauteur de la fenêtre,
`min(5.6vw, 7.2vh)`) et le blanc au-dessus de lui qui cède, jamais le
paysage.

**La scène n'a pas de largeur maximale** : la fresque va d'un bord à l'autre
de l'écran, quelle que soit sa largeur.
Elle était arrêtée à 1 600 px, et un écran de 1920 ou 2560 px la montrait
posée au milieu d'une marge blanche. Sa hauteur vaut un tiers de celle de
l'écran, entre 10 et 36 rem : sur un grand écran, le paysage grandit avec lui.
Le texte, lui, reste dans la colonne, et **se centre dans l'espace laissé
au-dessus de la fresque** (deux marges automatiques) : sur un grand écran, le
titre ne descend plus se coller au paysage sous un grand vide.

Un seul bloc de couleur, le contact, et un bloc sombre
pour finir. Entre eux, du blanc et des cartes crème.

**Les réalisations passent avant les métiers**, comme la grille des sets
passe chez BlockAbo avant les prix et le « Comment ça marche » : on montre
d'abord, on explique ensuite. Elles répondent tout de suite au titre (des
sites et des applications pour les entreprises d'ici : voilà lesquels), et
les textes des métiers, qui citent Disque Bleu, Axolot ou Custom To Lylia, se
lisent ensuite comme des renvois à des tuiles déjà vues. Le pied de page range
ses liens dans le même ordre.

### L'exception : la sortie d'Auxine

Pour la sortie d'Auxine sur l'App Store, une carte verte est posée **juste
sous la fresque**, premier bloc après la scène, sur les pages d'accueil française, anglaise, allemande et
italienne. Le japonais n'en a pas, pour la même raison que ses réalisations ne listent
pas Auxine : l'app n'existe pas dans cette langue.

C'est un événement, et c'est **voulu hors charte** : la carte ne parle pas la
langue de Vergasta mais celle d'Auxine (`auxine/styles.css`). Le vert de son
écran d'ouverture et ses deux disques pâles, la Bricolage Grotesque, la pilule
blanche, le pot en 3D qui dépasse de la carte, et un rebond. Le pot sort de
terre, cligne de l'œil comme dans l'app, et une gerbe de feuilles et de
confettis part de ses feuilles et déborde de la carte. Il recligne toutes les
cinq secondes environ, et un clic sur lui relance la gerbe. Rien de cela ne
vaut ailleurs dans le site, et rien ne doit en déteindre sur le reste.

Ce qui tient quand même : **aucune requête hors du domaine** (la police, le pot
et ses trois images de clin d'œil sont servis depuis `lancement/`, la police
en instance statique 800, pas en variable), rien sans JavaScript ne manque, et
en mouvement réduit le pot est posé, sans gerbe ni clin d'œil.

Tout vit dans `lancement/`, avec sa propre estampille (`?v=1`) : la feuille et
le script ne sont appelés que par les quatre pages d'accueil. Pour retirer la
bannière, enlever le bloc `.lancement` et les deux appels de tête dans ces
quatre pages, puis le dossier.

---

## 5. Composants

**La carte.** L'objet de base du site, et il n'y en a qu'un : aplat crème
(`--carte`), coins ronds, **ni ombre ni bordure**. Il sert aux quatre métiers,
aux tuiles des réalisations, à l'encart de traduction des pages légales, à
l'encadré japonais de l'histoire, et, en aplat d'une autre couleur, au bloc de
contact (lime), au pied de page (encre) et aux tuiles des réalisations (la
teinte pâle de chaque projet). Ce qui change d'un emploi à
l'autre, c'est le rayon (§1), la couleur et le rembourrage, jamais le principe.
**Pas de bordure sur une carte** : c'est la teinte qui la pose, et une bordure
autour d'un aplat en fait une boîte.

**Bouton.** Pilule d'encre, plate, libellé en capitales interlettrées à
0,82 rem. Au survol elle grossit d'un cran sur le ressort (§1) : elle ne
s'allume pas, elle ne change pas de couleur. Pas de flèche, pas de dégradé.
Les capitales sont ce qui distingue une action d'un titre sans la souligner
(§2). Dans le bloc de contact, qui est lime, le bouton reste une pilule
d'encre et son libellé passe au lime.

**Les deux sorties `.opening-actions`.** Le formulaire et le renvoi vers les
réalisations, sur une ligne, sous l'accroche. Même paire et même hiérarchie
qu'en bas de la page d'histoire : une pilule d'encre, puis une pilule crème
qui prend l'aplat lime au survol, et les deux grossissent sur le ressort. Elles étaient toutes deux en bas de page ; le
visiteur qui sait déjà ce qu'il veut n'a plus à traverser l'accueil. Leurs
libellés sont ceux que la page porte déjà ailleurs, pas des formules de plus à
traduire cinq fois.

**Étoile pixel.** La puce du site, en `mask-image` sur un SVG de neuf carrés :
une croix et quatre coins. Elle sert devant les
trois moments du déroulé et dans les listes des
pages légales. Sa couleur est celle de l'encre de la brosse voisine (§1). C'est
un masque et non une image, donc une seule ressource pour toutes les couleurs.

**Cartes des métiers `.trades`.** Les quatre métiers sont un `<dl>`, chaque
paire groupée dans un `<div class="trade">`, sur une carte crème. **Un bento**
de trois colonnes au-delà de 1000 px, comme le « Pourquoi louer » de BlockAbo :
une carte étroite et une large, puis une large et une étroite. Deux colonnes
égales alignaient quatre pavés de même taille, ce que le §7 appelle une grille
de cartes identiques. En dessous, une seule colonne.

**Les largeurs suivent la longueur des textes, et c'est ce qui a fixé l'ordre.**
Sur chaque ligne, le texte le plus long prend la carte large : les
applications sur la première, les projets créatifs sur la seconde. Les
boutiques en ligne sont donc passées après les projets créatifs, dans les cinq
langues ; dans l'ordre d'avant, la carte large de la seconde ligne portait le
texte le plus court et la carte étroite d'à côté descendait deux fois plus bas.

**Une petite marque à la brosse en tête de chaque carte**, 3,5 rem, là où une
fiche de service porterait une icône : une arche de carrés magenta pour les
sites, une spirale tissée cyan pour les applications, une boucle projetée
orange pour les projets créatifs, un peigne olive en vague pour les boutiques
(`metier-sites`, `metier-applis`, `metier-creatifs`, `metier-boutiques` dans
`brushes.js`). Un geste et une encre par métier, jamais deux fois les mêmes, et
**jamais un pictogramme** : une vitrine, un téléphone ou un sac dessinés à la
brosse ne diraient rien de plus que le titre juste dessous, et feraient des
quatre cartes le jeu de cartes de service que le §7 proscrit. La marque remplace
l'étoile pixel qui précédait les titres.

Elle est posée **dans le `dt`**, au-dessus du nom du métier : un groupe de `<dl>`
n'admet que des `dt` et des `dd`, et c'est le seul endroit valide. Elle est
`aria-hidden`, donc le titre se lit seul.

Ce sont des fiches, pas des cartes de service : pas de numérotation, pas
d'icône, pas de bouton en pied, et surtout pas quatre fois le même contenu sous
quatre titres différents (voir §7). Les noms de projets sont en `<b>` (600,
encre pleine) pour donner des points d'accroche à la lecture rapide. Une
cinquième entrée demande de reprendre le bento et d'ajouter une marque.

**Déroulé `.run-through`.** Les trois moments du projet, à la manière du
« Comment ça marche » de BlockAbo : trois grandes phrases en Figtree 300, entre
1,2 et 1,55 rem, à l'encre pleine, empilées dans l'ordre où elles se passent et
séparées par un filet. Ils ont été trois colonnes de texte courant ; en grand
corps, ils se lisent comme trois temps d'une promesse plutôt que comme une
notice. La colonne s'arrête à 46 rem, filets compris : en pleine largeur, une
phrase de ce corps passerait les quatre-vingt-dix signes par ligne.

**Une grande étoile à la place du numéro.** BlockAbo ouvre chaque étape par un
grand « 1. », « 2. », « 3. » en graisse légère ; ici c'est une étoile pixel de
2,25 rem (1,75 rem sur un téléphone), une encre par moment, magenta, cyan puis
olive. Pas de numéros : ce sont trois moments, pas trois étapes numérotées
(voir §7). L'étoile vaut à toutes les largeurs : sur un téléphone, où la
lecture se fait à la verticale, c'est elle et le filet qui disent où un moment
finit et où le suivant commence.

Le filet est posé au-dessus de chaque moment sauf le premier : il sépare, il
ne ferme rien, comme partout ailleurs (§4).

**Encadré `.aside`.** La carte « Bon à savoir », sous le déroulé, a été
retirée des cinq langues. Ses règles restent dans `styles.css` sans être
appelées : les retirer demanderait de relever l'estampille dans les vingt-six
pages (§7 bis) pour du code mort, et elles resservent telles quelles si
l'encadré revient.

**Réalisations `.projets`.** Une grille de tuiles, comme la collection de
BlockAbo : trois colonnes au-delà de 1000 px, deux au-delà de 640 px, une en
dessous, et chaque projet sur sa carte. Les réalisations ont été un
`<table>`, défendu parce que les données étaient tabulaires ; mais on ne les
compare pas ligne à ligne, on les parcourt, et une liste de fiches le dit mieux.
Le balisage est une `<ul>`, chaque projet un `<li>` dont le nom est un `h3`
sous le titre de section. La légende reste écrite à la main, au-dessus.

**La tuile.** L'icône en tête, puis le nom, le genre et l'année (reliés par une
virgule, la virgule japonaise en japonais), et en pied les sorties : l'adresse
du site en pilule, ou les pilules des magasins. `margin-top: auto` sur le nom
pousse le texte vers le bas, de sorte que deux tuiles voisines alignent leurs
noms quelle que soit la hauteur de l'autre.

**Toute la tuile se prend.** Le lien du nom s'étend sur la carte entière par un
pseudo-élément (`::after`, `inset: 0`), et la tuile grossit sur le ressort au
survol (`scale(1.03)`, un cran de moins que les pilules : c'est une surface, pas
un bouton). Pour un projet à plusieurs liens, le lien de la tuile est le
premier, le site quand il y en a un. Les pilules des magasins et les marques de
presse sont posées au-dessus (`z-index: 1`) et restent des liens à part : un
clic sur « App Store » mène à l'App Store, pas au site. Le focus clavier dessine
le contour sur la tuile entière (`:has(:focus-visible)`), pas sur le seul nom.

**Chaque tuile prend le fond de son projet.** Une teinte pâle de sa couleur,
relevée sur son icône ou sur le `theme-color` de son site : vert pour Auxine,
bleu roi pour Stellar Rebirth, violet pour Axolot, vert tendre pour Yamanote,
bleu ciel pour Disque Bleu, orange pour Mes Échéances, rouge pour BDPokéCards.
Les deux marques en noir et blanc prennent un gris froid (F. Da Silva) et un
papier chaud (Vergasta Photo), et Custom To Lylia un dégradé violet-bleu, parce
que sa marque en est un. **Pâle, et jamais la couleur pleine** : le nom reste à
l'encre et le genre au gris, lisibles comme sur le crème, et les pilules
blanches se détachent encore. La teinte passe par une variable (`--fond`),
posée sur `data-projet`, le nom du fichier d'icône ; une tuile sans teinte
garde le crème. Un nouveau projet reçoit la sienne, relevée de la même façon.

**La pilule de pied est blanche sur le fond de la tuile et passe à l'encre au survol de la
tuile**, comme le « Choisir » de BlockAbo. Quand elle n'est pas un lien (la
simple adresse d'un projet à un seul lien), c'est le survol de la tuile qui la
noircit ; quand elle en est un, c'est le survol de la pilule elle-même. Le
libellé est en capitales interlettrées, y compris l'adresse : c'est une pilule
de renvoi (§2).

**Les tuiles larges** (`.projet--large`) prennent deux colonnes. Elles ne
servent qu'à faire tomber les lignes pleines : dix projets en français, donc
Auxine, le plus récent, et Disque Bleu, qui porte la presse, en large, pour
douze cases en quatre lignes de trois. L'anglais, l'allemand et l'italien en
listent neuf, trois lignes pleines sans tuile large. Le japonais n'en liste
qu'un, qui prend la ligne entière plutôt que de rester dans le coin d'une
grille vide. Sur deux colonnes, `grid-auto-flow: dense` bouche le trou qu'une
tuile large laisserait au bout d'une ligne ; l'ordre de lecture reste celui du
HTML. **Changer le nombre de projets d'une langue veut dire recompter** : la
règle, c'est que le nombre de cases soit un multiple de trois.

**Icône de projet `.projet-icone`.** 3 rem, coins arrondis à 12 px, comme une
icône d'application. La moitié de ces marques sont des carrés pleins, et un
carré vif à angles droits serait le seul objet du site à ne pas avoir les coins
ronds du §1 ; sur les marques détourées, le rayon ne rogne que du vide. Elle ne
grandit pas au-delà de 3 rem : plusieurs n'existent qu'en 32 ou 48 px et
s'amolliraient. Les photographies ou captures des projets, qui rempliraient la
tuile comme les photos de sets chez BlockAbo, sont une étape à venir.

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
- **Vergasta Photo est pris à son `.ico` et non à son SVG**, bien que le second
  soit vectoriel, parce que le SVG porte un `@media (prefers-color-scheme:
  dark)` qui repeint le monogramme en `#fafafa`. Un SVG chargé dans une `<img>`
  lit cette règle sur le réglage du système du visiteur et non sur la page qui
  l'affiche : sur notre papier clair, la marque disparaîtrait chez qui a son
  système en sombre. Le `.ico` porte le même dessin en 16, 32 et 48 px, sans
  cette règle, et détouré comme ses voisins ; l'`apple-touch-icon`, plus défini,
  est une tuile blanche qui se verrait sur le fond de la carte.

  Ce site a d'abord été pris à un favicon qui n'était pas le sien : celui livré
  par défaut avec Astro, sa tuile noire à la lettre blanche. **Un site qui
  répond `/favicon.ico` ne l'a pas forcément choisi**, et c'est la vérification
  à faire avant de reprendre une marque — un `<meta name="generator">` dans la
  tête suffit à mettre la puce à l'oreille ;
- **BDPokéCards n'existe qu'en 32 px.** Son site ne publie pas d'icône plus
  grande, et une marque agrandie vaut mieux qu'une marque redessinée.

**Bloc de contact `.contact-body`.** La dernière carte de la page, un cran plus
grande que les autres, et la seule en aplat lime : tout y est à l'encre pleine
(du gris sur du lime ne se lit pas). Elle est **coupée en deux**, comme
l'encart des prix de BlockAbo : à gauche (`.contact-ecrire`), l'invitation à
écrire et le bouton ; à droite (`.contact-engagements`), trois engagements
sous le titre « Nos engagements », chacun sous une étoile à l'encre. Un filet
d'encre à 20 % les sépare, vertical à deux colonnes, horizontal en pile.

**Les engagements sont repris de ce que le site dit déjà, jamais inventés pour
la carte**, à peine resserrés pour tenir sur deux lignes : le devis détaillé
(CGV, « Devis et commande »), l'adresse de test (le déroulé) et la correction
gratuite des bugs d'origine pendant la garantie (CGV, « Garantie et
maintenance »). **Le site ne promet pas la propriété du code source** : ni ici,
ni dans le déroulé, d'où la phrase qui la promettait a été retirée. Chaque
langue reprend la formulation de
ses propres CGV. Si les conditions changent, la carte change avec elles. Le
délai de réponse n'y figure pas : il est déjà dans le paragraphe d'à côté, et
le répéter à dix centimètres se lisait comme du remplissage. Rien de ce qui
n'est pas compris (l'hébergement, le nom de domaine) n'y est laissé entendre.

Le décompte annoncé par la légende se compte langue par langue, car les
listes ne portent pas les mêmes projets : Auxine ne figure qu'à la liste
française, qui compte dix projets quand l'anglais, l'allemand et l'italien en
comptent neuf, et la liste japonaise ne porte que Yamanote 3D. Stellar Rebirth
ouvre la liste dans les quatre langues latines et ne figure pas à la liste
japonaise, pour la même raison que les autres : il ne s'adresse pas à ce
lecteur-là.

**Mention de presse `.press`.** Dans la tuile de Disque Bleu, entre le genre et
les pilules des magasins. Elle se lit d'un trait, « Apparu sur » suivi des six
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
survolée du tableau passait au lime et faisait perdre aux marques leurs
réserves blanches. Aucune des six ne s'appuie sur du blanc : celui de Watson est enfermé dans son propre bloc noir. Six cadres dans
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

**La ligne se replie quand la tuile est trop étroite, et c'est voulu.** Six
marques côte à côte ne tiennent pas sur une seule ligne d'une tuile simple sans
descendre à une hauteur où plus aucune ne se lit. Elle a été tenue de force sur
une ligne, les six marques empilées en biseau comme des coupures posées les unes
sur les autres : de chaque marque il ne restait qu'une tranche, et six tranches
de mots coupés font du bruit, pas une pile. Ce que le calage en haut de case a
réglé du côté de l'entrée voisine, le repli le règle ici : la ligne prend deux
rangs quand il le faut.

Chaque marque est un lien vers l'article, sans couleur ni soulignement : c'est
la marque entière qui se prend.

Les six fichiers, `logo_journaldujura.svg`, `logo_arcinfo.svg`,
`logo_watson.png`, `logo_nouvelliste.svg`, `logo_lacote.svg` et
`logo_ajour.svg`, sont servis d'ici comme les polices. Un appel aux serveurs
des journaux leur donnerait l'adresse IP de chaque visiteur, ce que le §2 et
`privacy.html` interdisent. Ce sont les fichiers officiels, repris tels quels :
un logo ne se redessine pas, et si Watson est en PNG c'est qu'il ne publie pas
de SVG. La liste japonaise ne porte que Yamanote 3D, donc Disque Bleu n'y
figure pas et la mention n'existe que dans les quatre autres langues.

**Pied de page.** La dernière carte, en encre, détachée des bords de la
fenêtre par une marge, avec le même rayon que le bloc de contact. C'est le seul
bloc sombre du site, et donc le seul endroit où le lime tient en couleur de
texte (§1). La bande peinte à la brosse le traverse en tête.

Il a la mise en page du pied de BlockAbo, gardée dans sa carte d'encre : en
haut, deux colonnes, la devise en lime et en grand corps d'un côté, de l'autre
l'adresse de l'atelier en Figtree 300 et la pilule du formulaire, lime à
libellé d'encre ; dessous, les liens en colonnes sous un petit titre blanc,
deux sur un téléphone, quatre cases au-delà de 800 px dont deux occupées ; en
bas, le droit d'auteur sous un filet. Les liens prennent l'aplat lime au
survol, et la page courante est écrite en blanc, sans lien.

**Aucun texte n'a été écrit pour lui**, et c'est ce qui lui évite une
traduction de plus en cinq langues : la devise, l'adresse (celle des mentions
légales), le libellé du bouton, les entrées de la navigation (sans « Contact »,
que la pilule remplace juste au-dessus) et le nom des pages légales existaient
déjà. Les deux titres de colonne sont le nom de l'atelier et l'étiquette que la
navigation légale portait déjà pour la lecture d'écran (« Pages légales »,
« Legal pages », « 法的情報 »…). Une colonne de plus demandera un titre, et
donc cinq traductions.

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

**Encadré `.kodawari`.** Une carte, comme celles des métiers, mais elle porte le
mot japonais et sa transcription en tête.
Aucune des polices latines ne dessine les kana : hors de `/ja/`, le mot revient
à la police du système, et c'est voulu. Servir ici PixelMplus12 obligerait à
charger 122 Ko dans les cinq langues pour un seul mot.

**L'accroche de l'histoire** (`.opening-body`), sous le titre, est en Figtree
300 à l'encre pleine, entre 1,15 et 1,4 rem : la même voix légère que
l'accroche de l'accueil, un cran plus bas, parce que c'est un chapeau et non
une phrase d'affichage.

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

**En-tête.** Celui de BlockAbo : la marque à gauche, deux pilules à droite,
et en plus les cinq langues au bout de la ligne. Les deux pilules sont les deux
actions de l'atelier : « Notre histoire », en crème et lime au survol, et
« Remplir le formulaire », à l'encre ; libellés en capitales interlettrées
comme toute action (§2), et le ressort au survol. Sur la page d'histoire, sa
pilule est la page courante : un `<span class="is-current">`, sans aplat, avec
un filet, comme la langue courante n'est pas un lien.

**Il ne colle pas en haut de l'écran**, contrairement à celui de BlockAbo : le
§7 proscrit l'en-tête collant, et la page est plus calme sans une barre qui la
suit. Il n'y a toujours aucun `position: sticky` dans le site.

**Les cinq entrées de l'ancienne navigation sont descendues dans le pied de
page** (§5, pied de page), où elles se retrouvent en colonnes sur chaque page.
« Contact » a disparu : les deux pilules du formulaire, en haut et en bas, le
remplacent. Les deux libellés existaient déjà dans chaque langue.

**Une ligne à partir de 950 px, deux en dessous.** La ligne unique ne tient
qu'à partir de 950 px en allemand, la langue la plus longue ; c'est mesuré. En
dessous, `.masthead` devient une grille : la marque et les cinq langues sur la
première ligne, les deux pilules dessous. Le groupe de queue passe en
`display: contents` pour que les pilules et les langues deviennent des cases de
cette grille sans toucher au HTML. Sur un téléphone, les pilules perdent un cran
de corps et de rembourrage pour tenir côte à côte, et un de plus sous 360 px ;
à 320 px, l'allemand et l'italien les renvoient quand même sur deux lignes, ce
qui est accepté plutôt que de réduire encore un libellé d'action.

**Rien ne se replie derrière un bouton**, ni ici ni ailleurs. Les langues
restent une liste ouverte, qui se lit d'un coup d'œil et fonctionne sans
JavaScript.

**Les langues tombent sur la gouttière.** Les codes de langue sont des
pilules invisibles au repos, mais leur rembourrage compte : sans marge négative,
le dernier code s'écarterait de la gouttière de huit pixels, alors que la
marque, elle, tombe dessus.

**Sélecteur de langue `.lang-nav`.** Cinq codes à deux lettres dans la bitmap,
posés à droite des pilules, séparés par un filet simple à partir de 950 px.
Le filet ne sépare les langues des pilules que lorsque les deux
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

Le lime disparaît sur du clair, donc les marques posées sur la page
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
que la brosse trace, et rien d'autre**, avec une seule exception, voulue : les
pales des éoliennes de la fresque, qui tournent (voir plus bas). Elles tournent
sur place ; elles ne voyagent pas, ne rebondissent pas, ne changent pas de
couleur, et la règle vaut pour tout le reste.

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
reste de flou, décalés de 0,1 à 0,42 seconde. Sur l'accueil, ce sont la
croix, le titre et la ligne de la scène qui montent. C'est la page qui arrive, pas la
marque. Celle-là est bien neutralisée à l'impression et en mouvement réduit.

**La coupe latérale du corps de page reste** (`overflow-x: clip`, §4). Elle
avait été posée pour l'entrée hors cadre de la marque ; elle ne coûte rien et
tient toujours la page à sa largeur, en cinq langues et sur six pages.

### Sous 1000 px, la marque ferme l'ouverture

Cette règle ne vaut plus que pour la page d'histoire : l'accueil a remplacé sa
spirale par la fresque, posée sous le titre à toutes les largeurs.

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

### La fresque de l'accueil

`fresque` est la seule marque qui prenne toute la largeur de la fenêtre. C'est
le Jura vu de St-Imier : trois crêtes qui s'étagent, un soleil, et les
éoliennes du Mont-Soleil. Elle tient la place que BlockAbo donne à une
photographie en bas de son premier écran, mais peinte, avec les brosses et les
encres de tout le site.

**Les crêtes.** `crete` superpose trois harmoniques lentes, la plus haute à
peine marquée : le Jura plissé fait de longues croupes arrondies, pas des pics.
La brosse se resserre à mesure que la crête approche : une dérive cyan en
semis pour le lointain, qui se lit comme une brume ; un peigne bleu pour la
crête du milieu, le Mont-Soleil ; une touffe olive pour le premier plan. Sous
chacune, une ou deux passes plus claires et plus lâches lui donnent un
volume, une épaisseur de forêt, là où un trait seul ne ferait qu'une ligne.

**L'abscisse est mesurée en hauteurs de canevas depuis le milieu**, pas en
fraction de la largeur. Le paysage garde donc ses proportions à toutes les
largeurs : un téléphone en montre le centre, un grand écran la chaîne entière,
et ni l'un ni l'autre ne tasse ou n'étire les collines. C'est la même raison
que pour le fil (`size` sur le petit côté), appliquée au chemin.

**Le soleil** est haut dans le ciel, loin à droite du titre : un disque cerné
à la plume orange, garni d'une spirale de carrés plus claire, et doublé d'un
contour magenta décalé d'un poil (le tirage en deux couleurs mal calées des
autres marques). **Pas de rayons** : ils ont été essayés, et un soleil à
rayons se lit comme un pictogramme, pas comme une peinture ; il sort de la
direction artistique. Il a d'abord été la spirale de l'ancienne marque
d'ouverture, en deux passes orange et magenta, qui se lisait comme une pelote
plutôt que comme un soleil. `soleil()` donne son centre et son rayon, en
hauteurs de canevas ; sur un écran étroit il rentre vers le milieu pour rester
dans le cadre.

**Les éoliennes** sont plantées sur la crête du milieu (`creteY` donne la
hauteur de la crête sans construire le chemin, et `crete` passe par la même
fonction, donc elles tombent toujours dessus). Chaque pièce, mât ou pale, est
sa propre couche : une brosse ne trace qu'un chemin continu, et sans cela le
pinceau relierait les éoliennes entre elles. Elles sont une marque à part
(`eoliennes`), posée sur son propre calque exactement sur la fresque, pour la
raison qui suit. Elles sont en carrés à l'encre,
pas en trait : un trait noir fin se lisait comme un pictogramme posé sur une
peinture. **Une éolienne est dans le cadre en entier ou n'y est pas** : coupée
par le bord de l'écran, elle se lisait comme un accident. Sur un téléphone il
en reste une.

**Les éoliennes tournent, tout le temps.** C'est la seule marque du site qui ne
devienne pas une image fixe une fois peinte. Les couches qui portent `tourne`
(une vitesse en radians par seconde) sont recalculées à chaque image à l'angle
du moment ; les autres gardent leur chemin. Seules les pales tournent, le mât
reste planté. Un tour en six secondes environ, dans le sens des aiguilles
d'une montre comme une éolienne vue de face, et chaque rotor à sa propre
allure (±9 %) et depuis son propre angle : trois rotors synchrones se liraient
comme un motif, pas comme un parc.

Ce qu'il ne faut pas défaire :

- **le calque est séparé de la fresque.** À chaque image, seul ce calque est
  effacé et repeint, douze courts segments ; les collines, des milliers de
  tampons, restent peintes une fois. Repeindre la fresque entière à chaque
  image coûterait pour rien ;
- **le rotor démarre en douceur** : il prend sa vitesse en une seconde et
  demie après la pose du dernier tampon, comme une éolienne qui se lance,
  au lieu de partir d'un coup ;
- **il s'arrête hors de l'écran et quand l'onglet est masqué**, et reprend à
  l'angle où il était : le pas de temps est plafonné à 50 ms, donc une pause
  ne se rattrape pas d'un bond. Mesuré à 1920 px en densité 2 : soixante images
  par seconde, sans image lente ;
- **en mouvement réduit, elles ne tournent pas** : elles sont peintes d'un
  coup et restent immobiles, comme le reste.

**L'ordre de pose est celui d'une main qui peint un paysage** : le soleil et le
lointain d'abord, puis le milieu, le premier plan, et les éoliennes en dernier.
Chaque couche part de la gauche. La dernière est posée en un peu plus de deux
secondes. À 1920 px et en densité 2, le dessin tient soixante images par
seconde, sans image lente : c'est mesuré.

**Sans JavaScript**, la fresque est un blanc sous le titre. C'est le seul endroit du site où l'absence de script laisse une
surface vide de cette taille ; la composition tient (un titre centré sur un
écran blanc), et c'est pourquoi on l'a gardée plutôt
que d'ajouter un mécanisme de détection. Si la fresque grandit encore, la
question se reposera.

### Ajouter une marque

1. Poser `<div class="mark" data-mark="nom" aria-hidden="true"></div>` dans le
   HTML, et lui donner une taille en CSS.
2. Ajouter une entrée `nom` dans `MARKS`, comme une pile de couches
   `{ brush, ink, path, over, alpha, delay }`.
3. Regarder le rendu agrandi et régler `spacing` avant tout le reste.

Il n'y a rien d'autre à écrire : la marque n'a pas d'entrée en scène, elle se
peint à sa place.

Les marques se dessinent à l'entrée dans le champ de vision puis **la boucle
s'arrête** : une image fixe ne mérite pas d'images par seconde. L'exception est
une couche qui porte `tourne` (les pales des éoliennes) : sa marque continue de
tourner tant qu'elle est à l'écran.
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
comme une ombre portée ramenée à l'échelle.

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
  rien, elle ne dure pas, et le §4 tient : il n'y a aucun `position: sticky`
  dans le site ;
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
- numérotation `01 / 02 / 03` des services ou des étapes. Le déroulé a pris
  la forme du « Comment ça marche » de BlockAbo, grandes phrases et filets,
  mais pas ses grands numéros : une étoile les remplace,
- **grilles de cartes identiques.** La carte est devenue l'objet de base du
  site (§5), ce qui déplace cette règle sans l'abolir : ce qui est proscrit,
  c'est le jeu de cartes **interchangeables**, trois ou quatre fois le même
  contenu sous un titre différent, avec icône, titre court et bouton en pied.
  Les quatre métiers y échappent par construction : chacun porte un texte qui
  lui est propre et cite des projets réels, aucun ne porte d'icône ni de
  bouton (la marque en tête est un geste de brosse, pas un pictogramme, et
  chacune est différente), et le bento leur donne deux largeurs alternées,
  précisément pour qu'on ne puisse pas les lire comme une grille,
- flèches `↗`, point coloré en fin de titre,
- **en-tête collant** en verre dépoli, dégradés de couleur, **ombres diffuses
  et colorées**. Les cartes n'ont plus d'ombre du tout (§1) ; une ombre teintée
  de la couleur de l'objet, ou une lueur, reste proscrite à plus forte
  raison,
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

Les scripts et les feuilles de style sont appelés avec `?v=31`. Ce n'est pas
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
- sous 1000 px, sur la page d'histoire, la marque de l'ouverture est
  **après** le texte et le titre tombe juste sous l'en-tête, dans les cinq
  langues (voir §6),
- la scène de l'accueil : la fresque ferme le premier écran à 1440 × 900,
  1280 × 720 et 390 × 844, la fresque se peint de gauche à droite sans
  éolienne coupée par le bord, et **la page ne se laisse pas tirer de côté**
  (§4, §6),
- états de survol : navigation, tuile de réalisation qui grossit et dont la
  pilule passe à l'encre, pilules de magasin et marques de presse qui mènent à
  leur propre lien et non au projet, cartes,
  bouton sur ses deux fonds (blanc et bloc lime), pilules qui grossissent sur
  le ressort et restent immobiles en mouvement réduit, marques de presse, qui
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
  texte de l'ouverture ne monte pas, les éoliennes
  ne tournent pas, et rien d'autre ne bouge,
- les éoliennes tournent sur l'accueil, s'arrêtent quand la scène sort de
  l'écran et reprennent à leur angle quand elle revient,
- l'en-tête tient sur une ligne à 950 px et au-delà dans les cinq langues,
  et en dessous sur deux lignes, les langues sur celle de la marque et les
  deux pilules côte à côte, de 360 px à 949 px (voir §5) ; si sa hauteur a
  changé, `--entete` a été remesuré (§4),
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
