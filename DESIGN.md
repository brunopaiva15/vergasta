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

**Mention de presse `.press`.** Troisième ligne de la cellule d'un projet, sous
les liens de magasin. Elle se lit d'un trait, « Apparu sur » suivi des trois
marques, qui tiennent la place des noms : c'est le logo du journal qui fait la
preuve, et le recomposer dans nos polices reviendrait à le citer de mémoire.
Aucune virgule entre les deux premières marques : les cadres séparent déjà, et
une virgule posée contre un filet se lit comme une salissure. L'alternative
textuelle rend les noms à la lecture d'écran, donc la phrase reste entière sans
les images.

Chaque logo est posé dans un cadre blanc à filet franc de 2 px, comme un
timbre. C'est le survol qui l'exige : la ligne passe au lime, et une marque
dessinée pour du papier blanc y perd ses réserves blanches. Les trois marques
n'ont pas la même hauteur, 1,25 rem, 0,9 rem et 1,08 rem, parce que le Journal
du Jura porte un pavé de deux lignes, ArcInfo un mot d'un seul niveau et Watson
un bloc noir plein : à hauteur égale les deux dernières écrasent la première.
Les cadres, eux, font les mêmes 2 rem hors tout, le rembourrage rattrapant la
différence, sans quoi la ligne porterait trois timbres de trois séries. Ces
hauteurs sont réglées pour que la ligne entière tienne dans la colonne des
projets sans pousser celles du type et de l'année, en allemand compris, où
« Erschienen in » est le plus long des quatre débuts.

Chaque timbre est un lien vers l'article, sans couleur ni soulignement : c'est
le cadre entier qui se prend. L'ombre portée en encre le dit, et elle se
rétracte au survol comme celle du bouton, donc le timbre s'enfonce. En encre et
non en lime : la ligne survolée est déjà lime, et une ombre lime y disparaîtrait.

Les quatre fichiers, `logo_journaldujura.svg`, `logo_arcinfo.svg`,
`logo_watson.png` et `logo_nouvelliste.svg`, sont servis d'ici comme les
polices. Un appel aux serveurs des journaux leur donnerait l'adresse IP de
chaque visiteur, ce que le §2 et
`privacy.html` interdisent. Ce sont les fichiers officiels, repris tels quels :
un logo ne se redessine pas, et si Watson est en PNG c'est qu'il ne publie pas
de SVG. Le tableau japonais ne liste que Yamanote 3D, donc Disque Bleu n'y
figure pas et la mention n'existe que dans les quatre autres langues.

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

Le repère de temps de chaque chapitre porte l'aplat lime et la bordure noire,
comme la langue courante du sélecteur : un survol tenu en permanence. Ce ne sont
pas des numéros d'étape (voir §7), ce sont des dates et des mots.

**Encadré `.kodawari`.** Bordure franche et bandeau de titre, comme
« Bon à savoir », mais le bandeau porte le mot japonais et sa transcription.
Ni Jersey 25 ni Archivo ne dessinent les kana : hors de `/ja/`, le mot revient à
la police du système, et c'est voulu. Servir ici PixelMplus12 obligerait à
charger 122 Ko dans les cinq langues pour un seul mot.

**Les deux sorties `.story-sorties`.** Le bouton et le lien vers les
réalisations tiennent sur une seule ligne et se lisent comme une paire, dans la
même police d'affichage. Le second reste plat, sans bloc noir ni ombre portée,
et prend au survol l'aplat lime et la bordure noire de la navigation. C'est la
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

**Navigation.** Liens en casse normale, aplat lime et bordure noire au survol.
Cinq entrées depuis l'ajout de « Notre histoire ». La page courante y est un
`<span class="is-current">` et non un lien, comme dans le sélecteur de langue.

**Sélecteur de langue `.lang-nav`.** Cinq codes à deux lettres dans la police
d'affichage, posés à droite de la navigation, séparés par un filet simple
au-delà de 800 px. La version courante porte l'aplat lime et la bordure noire :
c'est le même geste que le survol, tenu en permanence. Pas de menu déroulant,
pas de drapeau. À cinq entrées une liste ouverte se lit d'un coup d'œil, elle
fonctionne sans JavaScript, et un drapeau désigne un pays, pas une langue.

**Barre de défilement.** Ramenée à un filet de 6 px, rail transparent pour
laisser passer la grille, curseur en `--rule` qui passe à `--ink-soft` au
survol. Rectangle plein, sans arrondi, comme les autres filets. Déclarée deux
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

Le lime disparaît sur blanc, donc les marques posées sur le fond blanc
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

Les scripts et les feuilles de style sont appelés avec `?v=3`. Ce n'est pas
décoratif.

GitHub Pages sert ses fichiers derrière un CDN, avec `cache-control:
max-age=14400`. Le HTML d'une page se renouvelle vite, mais `brushes.js` et
`styles.css` restent jusqu'à **quatre heures** dans le cache de bord. Après une
mise en ligne, le visiteur reçoit donc le nouveau HTML avec l'ancien script, et
un rechargement forcé n'y change rien : le `no-cache` d'un navigateur ne
traverse pas le CDN. Le cas s'est produit, et il s'est lu comme une
fonctionnalité qui ne marchait pas.

Un cache se contourne par l'adresse. La requête porte la chaîne de requête,
donc `brushes.js?v=4` est une autre entrée de cache que `brushes.js?v=3` et
part chercher le fichier à la source.

**Changer un de ces cinq fichiers veut donc dire deux gestes, pas un** : le
fichier, puis l'estampille dans les vingt-six pages qui l'appellent. Elle est
la même partout, un simple entier, et vaut pour tous les fichiers à la fois :
une estampille par fichier serait plus fine et cinq fois plus facile à oublier.

Les polices n'en portent pas. Elles ne changent pas, et quand elles changent
c'est leur nom qui change, ce qui suffit. Les images et `favicon.ico` non plus,
pour la même raison.

---

## 8. Vérifications avant de pousser

- rendu en 1440 px et 390 px, accueil et une page légale,
- états de survol : navigation, ligne de tableau, bouton,
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
