/* ==========================================================================
   Vergasta Digital — marques à la brosse pixel
   --------------------------------------------------------------------------
   Une brosse est une petite forme tamponnée le long d'un chemin. Cinq nombres
   suffisent à passer d'un trait net à une projection lâche :

     spacing    écart entre deux tampons, en fraction de la taille du tampon
     jitter     dérive perpendiculaire au chemin
     scatter    déport radial libre, ce qui transforme un trait en nuage
     follow     0 le tampon garde son angle, 1 il pivote avec le chemin
     speedSize  la vitesse locale amincit le tampon

   Le tampon lui-même est une liste de carrés en coordonnées locales (-1..1),
   chacun avec sa propre opacité. Rien n'est importé : aucune image, aucune
   librairie.

   Canvas 2D et non WebGL : un tracé n'est qu'une série de fillRect alignés sur
   les axes, et fillRect donne des bords francs gratuitement. Des bords francs
   sont tout l'intérêt d'une brosse à pixels.

   L'aléa vient d'un hachage de l'indice du tampon, jamais de Math.random : une
   marque redessinée après un redimensionnement doit être identique, sinon elle
   se lit comme du bruit.

   Point de départ : le travail d'Arlan Marat sur les Pixel Brushes, licence
   MIT — https://www.arlan.me/vault/pixel-brushes
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   * Aléa déterministe
   * ------------------------------------------------------------------ */

  /** 0..1 à partir d'un entier. Même entrée, même marque, toujours. */
  function hash(n) {
    var s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return s - Math.floor(s);
  }

  /** Générateur graine pour les empreintes tirées une seule fois. */
  function seeded(seed) {
    var a = seed >>> 0;
    return function () {
      a += 0x6d2b79f5;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ------------------------------------------------------------------ *
   * Empreintes : les cellules qui composent un tampon
   * ------------------------------------------------------------------ */

  /** Un carré, l'empreinte par défaut. */
  var ONE = [{ x: 0, y: 0, s: 1, a: 1 }];

  /** Une file diagonale à opacité décroissante. Tamponnée le long d'un chemin,
   *  chaque marque pose une courte diagonale et les tampons successifs
   *  s'entrelacent en tissage. */
  function diagonal(n, fade) {
    var out = [];
    for (var i = 0; i < n; i++) {
      var t = i / Math.max(1, n - 1);
      out.push({ x: (t - 0.5) * 2, y: (t - 0.5) * 2, s: 1, a: 1 - t * fade });
    }
    return out;
  }

  /** Une barre verticale : se lit comme un peigne plutôt qu'un point. */
  function bar(n, s) {
    var out = [];
    for (var i = 0; i < n; i++) {
      out.push({ x: 0, y: (i / (n - 1) - 0.5) * 2, s: s, a: 1 });
    }
    return out;
  }

  /** Quelques carrés autour du centre. Décalages fixes, donc marque constante. */
  var CLUMP = [
    { x: -0.55, y: 0.15, s: 0.9, a: 1 },
    { x: 0.45, y: -0.5, s: 1.05, a: 0.92 },
    { x: 0.3, y: 0.6, s: 0.8, a: 0.85 }
  ];

  /** Un anneau creux : tube ou chaîne selon l'écartement. */
  function ring(n, phase) {
    var out = [];
    for (var i = 0; i < n; i++) {
      var a = phase + (i / n) * Math.PI * 2;
      out.push({ x: Math.cos(a), y: Math.sin(a), s: 0.85, a: 1 });
    }
    return out;
  }

  /** Une croix. Fixe elle donne une grille ; suivant le chemin, un rail. */
  function cross(arm) {
    var out = [{ x: 0, y: 0, s: 1, a: 1 }];
    for (var i = 1; i <= arm; i++) {
      var t = i / arm;
      var a = 1 - t * 0.5;
      out.push({ x: t, y: 0, s: 0.75, a: a });
      out.push({ x: -t, y: 0, s: 0.75, a: a });
      out.push({ x: 0, y: t, s: 0.75, a: a });
      out.push({ x: 0, y: -t, s: 0.75, a: a });
    }
    return out;
  }

  /** Un coin : cellules de taille décroissante, donc un nez et une queue.
   *  En suivant le chemin, cela se lit comme une plume calligraphique. */
  function wedge(n) {
    var out = [];
    for (var i = 0; i < n; i++) {
      var t = i / Math.max(1, n - 1);
      out.push({ x: (t - 0.5) * 2, y: 0, s: 1 - t * 0.7, a: 1 - t * 0.3 });
    }
    return out;
  }

  /** Un semis épars. Décalages tirés une seule fois, la projection est stable. */
  function cloud(n, rand) {
    var out = [];
    for (var i = 0; i < n; i++) {
      var a = rand() * Math.PI * 2;
      var r = Math.pow(rand(), 0.6);
      out.push({
        x: Math.cos(a) * r,
        y: Math.sin(a) * r,
        s: 0.5 + rand() * 0.7,
        a: 0.5 + rand() * 0.5
      });
    }
    return out;
  }

  /* ------------------------------------------------------------------ *
   * Le jeu de brosses, du plus serré au plus lâche
   * ------------------------------------------------------------------ */

  var BRUSHES = {
    /* trait net, tampons jointifs */
    trait: {
      spacing: 0.026, jitter: 0, scatter: 0, follow: 0, speedSize: 0,
      cells: ONE, size: 0.030, hueDrift: 0
    },
    /* carrés détachés : on voit le pixel */
    carres: {
      spacing: 0.195, jitter: 0, scatter: 0, follow: 0, speedSize: 0,
      cells: ONE, size: 0.055, hueDrift: 0
    },
    /* tissage : l'empreinte diagonale pivote avec la courbe */
    tissage: {
      spacing: 0.195, jitter: 0, scatter: 0, follow: 1, speedSize: 0,
      cells: diagonal(4, 0.55), size: 0.055, hueDrift: 0
    },
    /* ruban peigné, l'empreinte est une barre de trois cellules */
    peigne: {
      spacing: 0.170, jitter: 0.115, scatter: 0, follow: 1, speedSize: 0.563,
      cells: bar(3, 0.8), size: 0.055, hueDrift: 12
    },
    /* touffe : trois carrés groupés, jetés légèrement hors du trait */
    touffe: {
      spacing: 0.221, jitter: 0.030, scatter: 0.042, follow: 1, speedSize: 0.611,
      cells: CLUMP, size: 0.048, hueDrift: 0
    },
    /* projection dense */
    projection: {
      spacing: 0.400, jitter: 0.184, scatter: 0.042, follow: 1, speedSize: 0.563,
      cells: ONE, size: 0.075, hueDrift: 0
    },
    /* dérive : tampons jetés à une pleine largeur du chemin */
    derive: {
      spacing: 0.195, jitter: 0, scatter: 1.0, follow: 0, speedSize: 0,
      cells: ONE, size: 0.048, hueDrift: 0
    },
    /* plume : un coin qui suit la courbe */
    plume: {
      spacing: 0.114, jitter: 0.006, scatter: 0, follow: 1, speedSize: 0.35,
      cells: wedge(4), size: 0.062, hueDrift: 0
    },
    /* chaîne d'anneaux */
    anneaux: {
      spacing: 0.520, jitter: 0.040, scatter: 0, follow: 1, speedSize: 0.2,
      cells: ring(5, 0.4), size: 0.070, hueDrift: 0
    },
    /* semis : l'empreinte est déjà un nuage, le chemin l'étale */
    semis: {
      spacing: 0.480, jitter: 0.120, scatter: 0.30, follow: 0, speedSize: 0.5,
      cells: cloud(5, seeded(7)), size: 0.070, hueDrift: 0
    },
    /* croix régulières */
    croix: {
      spacing: 0.700, jitter: 0, scatter: 0, follow: 0, speedSize: 0,
      cells: cross(1), size: 0.055, hueDrift: 0
    }
  };

  /* ------------------------------------------------------------------ *
   * Chemins
   * ------------------------------------------------------------------ */

  /** Calcule t (abscisse curviligne 0..1) et v (vitesse locale 0..1). */
  function build(pts) {
    if (pts.length < 2) return [];
    var acc = [0];
    var total = 0;
    var i;
    for (i = 1; i < pts.length; i++) {
      total += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
      acc.push(total);
    }
    if (total <= 0) return [];
    var maxStep = 0;
    var steps = [];
    for (i = 0; i < pts.length; i++) {
      var p = pts[Math.max(0, i - 1)];
      var n = pts[Math.min(pts.length - 1, i + 1)];
      var d = Math.hypot(n.x - p.x, n.y - p.y);
      steps.push(d);
      if (d > maxStep) maxStep = d;
    }
    var out = [];
    for (i = 0; i < pts.length; i++) {
      out.push({
        x: pts[i].x,
        y: pts[i].y,
        t: acc[i] / total,
        v: maxStep > 0 ? steps[i] / maxStep : 0
      });
    }
    return out;
  }

  /** Spirale. La courbure change en permanence : une seule marque montre
   *  comment les tampons se comportent dans un virage serré et dans un large,
   *  et s'ils pivotent. Toutes les brosses se ressemblent sur une droite. */
  function spiral(cx, cy, rMax, turns, a0, steps) {
    var pts = [];
    for (var i = 0; i <= steps; i++) {
      var t = i / steps;
      // t^0.72 plutôt que linéaire : une spirale linéaire tasse ses tours au
      // centre et les marques s'agglutinent
      var r = rMax * Math.pow(t, 0.72);
      var a = a0 + t * turns * Math.PI * 2;
      pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
    }
    return build(pts);
  }

  /** Onde sinusoïdale, pour les bandes larges. */
  function wave(x0, y0, w, amp, cycles, steps) {
    var pts = [];
    for (var i = 0; i <= steps; i++) {
      var t = i / steps;
      pts.push({
        x: x0 + w * t,
        y: y0 + Math.sin(t * cycles * Math.PI * 2) * amp * (0.45 + 0.55 * Math.sin(t * Math.PI))
      });
    }
    return build(pts);
  }

  /** Le fil de la page d'histoire : une descente qui dérive à gauche et à
   *  droite dans son couloir.
   *
   *  Deux harmoniques de rapport irrationnel se superposent, donc le méandre
   *  ne se répète jamais sur la hauteur d'une page : une sinusoïde seule
   *  donnerait un ruban de papier peint, pas un fil posé à la main.
   *  L'enveloppe le ramène vers l'axe aux deux bouts, pour qu'il parte et
   *  finisse au milieu du couloir plutôt qu'en butée contre un bord.
   *
   *  `t0` et `t1` découpent une portion du même tracé. La position ne dépend
   *  que de `t`, jamais du découpage : deux portions consécutives se
   *  raccordent donc exactement, ce qui permet de changer de brosse en cours
   *  de route sans que le fil se casse. `ecart` décale toute la descente, en
   *  fraction de la largeur du couloir, pour la seconde passe mal calée.
   */
  function serpente(w, h, t0, t1, ecart, steps) {
    var pts = [];
    var cx = w * (0.5 + (ecart || 0));
    var amp = w * 0.40;
    var tours = Math.max(1.8, h / 560);
    for (var i = 0; i <= steps; i++) {
      var t = t0 + (t1 - t0) * (i / steps);
      var a = t * tours * Math.PI * 2;
      // trois harmoniques, dont deux de rapport irrationnel à la première
      var d = 0.55 * Math.sin(a)
        + 0.30 * Math.sin(a * 2.37 + 1.7)
        + 0.15 * Math.sin(a * 0.61 + 0.9);
      // une modulation lente ouvre certains virages et en referme d'autres :
      // sans elle tous les écarts auraient la même largeur
      var large = 0.72 + 0.28 * Math.sin(a * 0.41 + 2.2);
      pts.push({
        x: cx + d * amp * large * (0.45 + 0.55 * Math.sin(t * Math.PI)),
        y: h * t
      });
    }
    return build(pts);
  }

  /** Une portion du fil, prête à poser dans `MARKS`. Le nombre de points suit
   *  la longueur réelle de la portion : sinon un chapitre ajouté étirerait la
   *  même poignée de segments et le méandre s'angulerait.
   *
   *  Le fil est coupé en deux par le mot こだわり (voir plus bas) : `zone` dit
   *  de quel côté le brin descend, `r0` et `r1` la part qu'il occupe de ce
   *  côté-là. Les bornes réelles ne sont donc connues qu'à la mise en page,
   *  puisqu'elles dépendent de l'endroit où tombe le chapitre du mot, qui bouge
   *  d'une langue et d'une largeur à l'autre.
   *
   *  La fonction porte la portion qu'elle couvre, et la met à jour à chaque
   *  mesure. Le déroulé au défilement en a besoin pour convertir l'avancement
   *  du fil entier en avancement de ce brin-là. */
  function brin(zone, r0, r1, ecart) {
    var f = function (w, h, m) {
      var bornes = zone === "haut" ? [0, m.a] : [m.b, 1];
      var t0 = bornes[0] + (bornes[1] - bornes[0]) * r0;
      var t1 = bornes[0] + (bornes[1] - bornes[0]) * r1;
      f.part = [t0, t1];
      return serpente(w, h, t0, t1, ecart, Math.max(80, Math.round(h * (t1 - t0) / 3)));
    };
    f.part = [0, 1];
    return f;
  }

  /* ------------------------------------------------------------------ *
   * Le mot こだわり, écrit dans le couloir du fil
   *
   * Le fil descend, s'arrête à hauteur du chapitre où le mot se dit, l'écrit, et
   * repart dessous.
   * Le mot n'est pas une marque posée à côté du fil : c'est le fil, sur la
   * hauteur de quatre caractères. Même canevas, même encre, mêmes brosses,
   * même déroulé au défilement.
   *
   * Il est écrit de haut en bas, comme un titre japonais, et c'est ce qui rend
   * la chose possible : à l'horizontale, quatre kana demandent quatre fois la
   * largeur d'un caractère, et le couloir n'en fait qu'une. À la verticale, la
   * largeur du couloir donne la taille du caractère, et la page donne la
   * longueur.
   *
   * Ni Jersey 25 ni Archivo ne dessinent les kana, et servir la bitmap
   * japonaise pour quatre caractères coûterait 122 Ko dans les cinq langues.
   * Le mot revenait donc à la police du système, différente sur chaque machine,
   * et la seule page où il tombait juste était la japonaise. Tracé, il est le
   * même partout.
   *
   * Chaque trait est décrit par les quelques points où la main tourne, dans une
   * boîte unité (0..1, y vers le bas) propre au caractère. `axe` est l'abscisse
   * qui se pose sur l'axe du couloir : celle du corps du caractère, et non le
   * milieu de son encre, sinon le dakuten de だ pousserait tout le caractère à
   * gauche pour se faire de la place.
   * ------------------------------------------------------------------ */

  /** Une coordonnée de Catmull-Rom. La courbe passe par tous ses points de
   *  contrôle : on décrit un trait par ses tournants, pas par des poignées. */
  function cr(a, b, c, d, t) {
    var t2 = t * t;
    return 0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t2 +
      (3 * b - a - 3 * c + d) * t2 * t);
  }

  /** Densifie un trait. Deux points restent une droite : le dakuten n'a pas de
   *  courbure à retrouver. */
  function lisse(pts, parSegment) {
    var out = [];
    var i;
    if (pts.length < 2) return out;
    if (pts.length === 2) {
      return [
        { x: pts[0][0], y: pts[0][1] },
        { x: pts[1][0], y: pts[1][1] }
      ];
    }
    for (i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i > 0 ? i - 1 : 0];
      var p1 = pts[i];
      var p2 = pts[i + 1];
      var p3 = pts[i + 2 < pts.length ? i + 2 : pts.length - 1];
      for (var j = 0; j < parSegment; j++) {
        var t = j / parSegment;
        out.push({
          x: cr(p0[0], p1[0], p2[0], p3[0], t),
          y: cr(p0[1], p1[1], p2[1], p3[1], t)
        });
      }
    }
    out.push({ x: pts[pts.length - 1][0], y: pts[pts.length - 1][1] });
    return out;
  }

  /* Les quatre caractères, dans l'ordre des traits. C'est l'ordre d'écriture :
     こ ses deux traits, だ le ナ puis le こ du bas puis le dakuten, わ la barre
     puis la boucle, り le trait court puis le long. Le déroulé s'en sert tel
     quel, donc le mot s'écrit comme il s'écrit à la main. */
  var MOT = [
    /* こ */
    {
      axe: 0.45,
      traits: [
        [[0.09, 0.27], [0.35, 0.22], [0.59, 0.23], [0.82, 0.28]],
        [[0.13, 0.53], [0.24, 0.64], [0.41, 0.75], [0.61, 0.77], [0.80, 0.67]]
      ]
    },
    /* だ */
    {
      axe: 0.40,
      traits: [
        [[0.02, 0.31], [0.21, 0.27], [0.42, 0.30]],
        [[0.32, 0.08], [0.27, 0.29], [0.18, 0.51], [0.04, 0.73]],
        [[0.38, 0.49], [0.57, 0.45], [0.74, 0.49]],
        [[0.41, 0.62], [0.46, 0.73], [0.58, 0.80], [0.71, 0.77], [0.78, 0.69]],
        [[0.86, 0.12], [0.91, 0.25]],
        [[0.99, 0.10], [1.04, 0.23]]
      ]
    },
    /* わ */
    {
      axe: 0.38,
      traits: [
        [[0.21, 0.22], [0.18, 0.48], [0.20, 0.74]],
        [[0.04, 0.31], [0.28, 0.26], [0.50, 0.27], [0.67, 0.36],
         [0.73, 0.53], [0.64, 0.71], [0.48, 0.78], [0.38, 0.74],
         [0.45, 0.85], [0.67, 0.90]]
      ]
    },
    /* り */
    {
      axe: 0.46,
      traits: [
        [[0.28, 0.20], [0.22, 0.42], [0.26, 0.60]],
        [[0.68, 0.18], [0.70, 0.42], [0.64, 0.66], [0.50, 0.80], [0.36, 0.83]]
      ]
    }
  ];

  /* Le pas d'un caractère au suivant, en taille de caractère. Un peu plus de 1 :
     les kana ne remplissent pas leur carré, et sans ce jeu la queue de だ vient
     toucher la barre de わ. */
  var PAS = 1.08;

  /* Les nœuds des chapitres sont des carrés noirs posés sur l'axe du couloir,
     à la hauteur de chaque titre. Le mot descend entre deux d'entre eux, et ces
     deux gardes, en pixels, l'empêchent de finir sous l'un ou de commencer sur
     l'autre. */
  var GARDE_HAUT = 24;
  var GARDE_BAS = 28;

  /** Les traits du mot, une fois pour toutes, dans l'ordre d'écriture. Chaque
   *  trait est déjà placé dans la colonne : `x` compté depuis l'axe du couloir,
   *  `y` depuis le haut du premier caractère, les deux en taille de caractère.
   *  Chacun porte sa part de l'écriture, proportionnelle à sa longueur — sinon
   *  la pointe expédierait les longs traits pour s'attarder sur les deux barres
   *  du dakuten. */
  function colonne() {
    var out = [];
    var total = 0;
    var i;
    for (var c = 0; c < MOT.length; c++) {
      for (var s = 0; s < MOT[c].traits.length; s++) {
        var pts = lisse(MOT[c].traits[s], 12);
        var len = 0;
        for (i = 0; i < pts.length; i++) {
          pts[i].x -= MOT[c].axe;
          pts[i].y += c * PAS;
          if (i > 0) len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
        }
        out.push({ pts: pts, len: len });
        total += len;
      }
    }
    var acc = 0;
    for (i = 0; i < out.length; i++) {
      out[i].de = acc / total;
      acc += out[i].len;
      out[i].a = acc / total;
    }
    return out;
  }

  var COLONNE = colonne();

  /* La hauteur du mot, en taille de caractère : trois pas plus le carré du
     dernier caractère. */
  var HAUTEUR_MOT = (MOT.length - 1) * PAS + 1;

  /** Où le mot tombe dans le couloir, mesuré sur la page.
   *
   *  Rien n'est fixé d'avance : le chapitre du mot ne tombe pas à la même
   *  hauteur en allemand qu'en japonais, ni en 390 px qu'en 1440. Le mot occupe
   *  donc le couloir le long de son chapitre, entre les deux nœuds qui
   *  l'encadrent. Le caractère prend la largeur du couloir, à moins que la
   *  hauteur du chapitre ne suffise pas : il rapetisse alors plutôt que de
   *  déborder sur le chapitre suivant, et il se centre dans la place restante.
   *
   *  Renvoie les deux bornes `a` et `b` en fraction de la hauteur du canevas :
   *  le fil descend jusqu'à `a`, le mot occupe `a`→`b`, le fil repart de `b`. */
  function bandeDuMot(host, w, h) {
    var vide = { a: 0.55, b: 0.55, taille: 0, y: 0 };
    var chapitre = document.querySelector('[data-fil="mot"]');
    var fin = document.querySelector('[data-fil="fin"]');
    // Sans repère dans la page, le fil reste un fil : bande vide au milieu.
    if (!chapitre || !h) return vide;
    var repere = host.getBoundingClientRect();
    var haut = chapitre.getBoundingClientRect().top - repere.top + GARDE_HAUT;
    var butee = (fin ? fin.getBoundingClientRect().top - repere.top : h) - GARDE_BAS;
    var place = butee - haut;
    var taille = Math.min(w * 0.88, place / HAUTEUR_MOT);
    if (!(taille > 0)) return vide;
    var y = haut + (place - taille * HAUTEUR_MOT) / 2;
    return {
      a: Math.max(0, Math.min(1, y / h)),
      b: Math.max(0, Math.min(1, (y + taille * HAUTEUR_MOT) / h)),
      taille: taille,
      y: y
    };
  }

  /** Un trait du mot, replacé dans le couloir. `dx` et `dy` décalent une passe
   *  entière, en taille de caractère : c'est le décalage de la seconde couleur.
   *  Sortie de la boucle pour que chaque fonction capture son propre trait. */
  function traitDuMot(trait, dx, dy) {
    var f = function (w, h, m) {
      f.part = [
        m.a + (m.b - m.a) * trait.de,
        m.a + (m.b - m.a) * trait.a
      ];
      if (!m.taille) return [];
      var cx = w * 0.5 + (dx || 0) * m.taille;
      var oy = m.y + (dy || 0) * m.taille;
      var out = [];
      for (var i = 0; i < trait.pts.length; i++) {
        out.push({
          x: cx + trait.pts[i].x * m.taille,
          y: oy + trait.pts[i].y * m.taille
        });
      }
      return build(out);
    };
    f.part = [0, 0];
    return f;
  }

  /** Une passe sur le mot entier : une couche par trait, même brosse et même
   *  encre pour toutes.
   *
   *  `taille` est le seul réglage qui ne suive pas la règle du reste du site :
   *  la taille du tampon s'y mesure sur le petit côté du canevas, donc ici sur
   *  la largeur du couloir. Or le caractère rapetisse quand la place manque
   *  avant le chapitre suivant, et un tampon resté à la mesure du couloir
   *  empâterait aussitôt les kana. Elle se mesure donc sur le caractère. */
  function passeDuMot(couche) {
    var out = [];
    for (var i = 0; i < COLONNE.length; i++) {
      out.push({
        brush: couche.brush, ink: couche.ink, over: couche.over,
        alpha: couche.alpha, taille: couche.taille,
        path: traitDuMot(COLONNE[i], couche.dx, couche.dy)
      });
    }
    return out;
  }

  /** Arc de cercle. */
  function arc(cx, cy, r, a0, a1, steps) {
    var pts = [];
    for (var i = 0; i <= steps; i++) {
      var a = a0 + (a1 - a0) * (i / steps);
      pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
    }
    return build(pts);
  }

  /* ------------------------------------------------------------------ *
   * Rendu
   * ------------------------------------------------------------------ */

  function inkColor(ink, hueOffset, alpha) {
    var h = (((ink.h + hueOffset) % 360) + 360) % 360;
    return "hsl(" + h + " " + ink.s + "% " + ink.l + "% / " + alpha + ")";
  }

  /**
   * Tamponne `brush` le long de `path`.
   *
   * Noter l'alignement sur les pixels : chaque cellule doit tomber sur un pixel
   * entier du périphérique, sinon le navigateur lisse ses bords et les marques
   * virent au gris mou. La taille est arrondie et chaque origine plancherée, en
   * pixels périphérique. Le canvas est donc dessiné en espace périphérique, la
   * transformation remise à zéro, et non en pixels CSS.
   *
   * `opts.from` saute le dessin des tampons déjà posés sans sauter leur compte :
   * l'aléa vient de l'indice du tampon, donc la marche à vide doit passer par
   * chacun d'eux pour que le tampon suivant tombe exactement où il serait tombé
   * en repartant de zéro. Cela permet de prolonger un tracé sans effacer le
   * canevas ni le repeindre en entier à chaque image.
   */
  function stroke(ctx, path, brush, shortSide, opts) {
    if (path.length < 2) return;
    opts = opts || {};
    var dpr = opts.dpr || 1;
    var progress = opts.progress == null ? 1 : opts.progress;
    if (progress <= 0) return;
    var from = opts.from == null ? 0 : opts.from;
    if (from >= progress) return;
    var ink = opts.ink;
    var alphaMul = opts.alpha == null ? 1 : opts.alpha;
    if (alphaMul <= 0) return;

    // Taille du tampon en pixels PÉRIPHÉRIQUE, au moins 1.
    var base = Math.max(1, Math.round((opts.sizePx || brush.size * shortSide) * dpr));
    // L'écartement est exprimé en fraction de la taille du tampon : une brosse
    // plus grosse s'espace automatiquement dans la même proportion.
    var step = Math.max(1, base * Math.max(0.02, brush.spacing));

    var carry = 0;
    var idx = 0;

    for (var i = 1; i < path.length; i++) {
      var a = path[i - 1];
      var b = path[i];
      if (a.t > progress) break;

      var dx = (b.x - a.x) * dpr;
      var dy = (b.y - a.y) * dpr;
      var segLen = Math.hypot(dx, dy);
      if (segLen <= 0) continue;
      var ux = dx / segLen;
      var uy = dy / segLen;
      var ang = Math.atan2(uy, ux);

      var travelled = carry;
      while (travelled < segLen) {
        var f = travelled / segLen;
        var t = a.t + (b.t - a.t) * f;
        if (t > progress) break;

        if (t >= from) {
          var v = a.v + (b.v - a.v) * f;
          var px = a.x * dpr + dx * f;
          var py = a.y * dpr + dy * f;

          var h1 = hash(idx * 2.17);
          var h2 = hash(idx * 3.71 + 11.3);
          var h3 = hash(idx * 5.13 + 27.9);

          // jitter : perpendiculaire à la marche, le trait ondule sans se quitter
          if (brush.jitter > 0) {
            var j = (h1 - 0.5) * 2 * brush.jitter * base;
            px += -uy * j;
            py += ux * j;
          }
          // scatter : jet radial libre, c'est lui qui casse le trait en nuage
          if (brush.scatter > 0) {
            var sa = h2 * Math.PI * 2;
            var sr = h3 * brush.scatter * base;
            px += Math.cos(sa) * sr;
            py += Math.sin(sa) * sr;
          }

          // la vitesse amincit la marque, mais jamais jusqu'à rien : un tampon
          // arrondi à 0 px laisse un trou au lieu d'une zone claire
          var scale = brush.speedSize > 0 ? 1 - brush.speedSize * v * 0.55 : 1;
          var cell = Math.max(1, Math.round(base * scale * 0.5));

          var rot = brush.follow > 0 ? ang * brush.follow : 0;
          var cos = Math.cos(rot);
          var sin = Math.sin(rot);
          var hue = brush.hueDrift * t + (opts.hue || 0);

          for (var c = 0; c < brush.cells.length; c++) {
            var cellDef = brush.cells[c];
            var ox = cellDef.x * base * 0.5;
            var oy = cellDef.y * base * 0.5;
            var rx = ox * cos - oy * sin;
            var ry = ox * sin + oy * cos;
            var w = Math.max(1, Math.round(cell * cellDef.s));
            // plancher et non arrondi : les tampons voisins pavent exactement au
            // lieu de se recouvrir d'un pixel et de noircir la couture
            ctx.fillStyle = inkColor(ink, hue, cellDef.a * alphaMul);
            ctx.fillRect(
              Math.floor(px + rx - w / 2),
              Math.floor(py + ry - w / 2),
              w,
              w
            );
          }
        }

        idx++;
        travelled += step;
      }
      carry = travelled - segLen;
    }
  }

  /* ------------------------------------------------------------------ *
   * Encres
   *
   * Choisies pour un papier chaud : des teintes rabattues, de la gamme d'un
   * imprimeur plutôt que d'un écran.
   * ------------------------------------------------------------------ */

  var INKS = {
    /* Les deux barres de la croix du logo. Le lime est illisible sur blanc :
       il ne sert que dans le pied de page, qui est noir. */
    lime: { h: 70, s: 100, l: 50 },
    bleu: { h: 243, s: 76, l: 59 },
    /* Le reste de la gamme, saturé pour tenir sur du blanc. */
    magenta: { h: 330, s: 100, l: 59 },
    cyan: { h: 193, s: 100, l: 42 },
    olive: { h: 75, s: 100, l: 33 },
    orange: { h: 25, s: 100, l: 47 },
    encre: { h: 0, s: 0, l: 6 }
  };

  /* ------------------------------------------------------------------ *
   * Les marques posées dans la page
   *
   * Chacune est une pile de couches. Deux couches d'encres différentes sur le
   * même chemin donnent le décalage d'un tirage en deux passes.
   * ------------------------------------------------------------------ */

  var MARKS = {
    /* Ouverture : deux spirales décalées, bleu et magenta, comme une épreuve
       imprimée en deux couleurs mal calées. */
    ouverture: [
      {
        brush: "peigne", ink: "bleu",
        path: function (w, h) {
          return spiral(w * 0.5, h * 0.5, Math.min(w, h) * 0.40, 2.15, -Math.PI * 0.55, 900);
        }
      },
      {
        brush: "projection", ink: "magenta", alpha: 0.85, delay: 220,
        path: function (w, h) {
          return spiral(w * 0.52, h * 0.48, Math.min(w, h) * 0.34, 1.85, -Math.PI * 0.15, 700);
        }
      }
    ],

    /* Métier : tissage cyan sur un arc. L'empreinte diagonale pivote avec la
       courbe et les tampons s'entrelacent. */
    metier: [
      {
        brush: "tissage", ink: "cyan", over: { size: 0.115, spacing: 0.85 },
        path: function (w, h) {
          return arc(w * 0.5, h * 0.72, Math.min(w, h) * 0.36, Math.PI * 1.05, Math.PI * 2.05, 400);
        }
      }
    ],

    /* Déroulé : dérive olive, les tampons quittent le chemin. */
    deroule: [
      {
        brush: "derive", ink: "olive", over: { size: 0.10, spacing: 0.45, scatter: 0.55 },
        path: function (w, h) {
          return wave(w * 0.12, h * 0.5, w * 0.76, h * 0.26, 1.25, 320);
        }
      }
    ],

    /* Réalisations : carrés nets en spirale, magenta. Le plus serré du lot. */
    realisations: [
      {
        brush: "carres", ink: "magenta", over: { size: 0.115, spacing: 0.80 },
        path: function (w, h) {
          return spiral(w * 0.5, h * 0.5, Math.min(w, h) * 0.36, 1.9, -Math.PI * 0.4, 500);
        }
      }
    ],

    /* Écrire : anneaux orange, un coin qui suit la courbe. */
    contact: [
      {
        brush: "anneaux", ink: "orange", over: { size: 0.145, spacing: 1.15 },
        path: function (w, h) {
          return arc(w * 0.5, h * 0.35, Math.min(w, h) * 0.34, Math.PI * 0.15, Math.PI * 1.15, 400);
        }
      }
    ],

    /* Notre histoire : la plume ouvre la spirale, la touffe la double en
       retard. Deux brosses qui ne servent nulle part ailleurs en tête de page,
       pour que l'ouverture de l'histoire ne se confonde pas avec celle de
       l'accueil. */
    histoire: [
      {
        brush: "plume", ink: "cyan", over: { size: 0.072, spacing: 0.14 },
        path: function (w, h) {
          return spiral(w * 0.5, h * 0.5, Math.min(w, h) * 0.39, 2.05, -Math.PI * 0.35, 800);
        }
      },
      {
        brush: "touffe", ink: "orange", alpha: 0.8, delay: 200,
        over: { size: 0.058, spacing: 0.30 },
        path: function (w, h) {
          return spiral(w * 0.53, h * 0.47, Math.min(w, h) * 0.30, 1.7, -Math.PI * 0.05, 600);
        }
      }
    ],

    /* Le fil de la page d'histoire. Un seul tracé, découpé en brins qui changent
       de brosse en descendant : la plume ouvre, les carrés détachent, la dérive
       part en morceaux, puis le mot こだわり s'écrit, et de l'autre côté le
       tissage se resserre et la touffe finit. Le fil garde la même encre d'un
       bout à l'autre, sinon ce ne serait plus un fil mais six traits ; c'est la
       texture qui change, pas l'identité.

       **Le mot est un brin comme les autres.** Il n'est pas posé à côté du fil,
       il est le fil sur la hauteur de quatre caractères : le méandre s'arrête à
       hauteur de l'encadré, le mot s'écrit de haut en bas dans le couloir, et le
       méandre repart dessous. La plume l'écrit, seule brosse du jeu dont le
       tampon s'amincit en fin de course, donc la seule qui pose une attaque et
       une levée ; sans elle les kana se liraient comme du tube.

       Aucun retard ici, contrairement aux autres marques : le fil se déroule au
       défilement (voir AU_DEFILEMENT), et ce sont les portions qui donnent
       l'ordre. Le mot ne s'écrit que lorsque la lecture y arrive, dans l'ordre
       des traits, et le brin du bas attend que le mot soit fini.

       Une passe de croix bleues suit sur toute la longueur, mot compris, décalée
       d'un poil : le tirage en deux couleurs mal calées de l'ouverture.

       Le canevas est haut et étroit, et `size` se mesure sur le petit côté :
       la taille des tampons suit donc la largeur du couloir, jamais la
       longueur de la page. Le nombre de tampons, lui, croît avec la hauteur,
       ce qui est exactement ce qu'on veut d'un fil. */
    fil: [
      {
        brush: "plume", ink: "magenta", over: { size: 0.115, spacing: 0.12 },
        path: brin("haut", 0, 0.34, 0)
      },
      {
        brush: "carres", ink: "magenta",
        over: { size: 0.115, spacing: 0.44, jitter: 0.10 },
        path: brin("haut", 0.33, 0.68, 0)
      },
      {
        brush: "derive", ink: "magenta",
        over: { size: 0.10, spacing: 0.34, scatter: 0.90 },
        path: brin("haut", 0.67, 1, 0)
      }
    ].concat(passeDuMot({
      brush: "plume", ink: "magenta", taille: 0.135, over: { spacing: 0.13 }
    }), [
      {
        brush: "tissage", ink: "magenta",
        over: { size: 0.10, spacing: 0.46 },
        path: brin("bas", 0, 0.52, 0)
      },
      {
        brush: "touffe", ink: "magenta",
        over: { size: 0.105, spacing: 0.36, scatter: 0.14 },
        path: brin("bas", 0.51, 1, 0)
      },
      {
        brush: "croix", ink: "bleu", alpha: 0.7,
        over: { size: 0.09, spacing: 1.4 },
        path: brin("haut", 0, 1, 0.075)
      }
    ], passeDuMot({
      brush: "croix", ink: "bleu", alpha: 0.7, taille: 0.105, dx: 0.075, dy: 0.05,
      over: { spacing: 1.4 }
    }), [
      {
        brush: "croix", ink: "bleu", alpha: 0.7,
        over: { size: 0.09, spacing: 1.4 },
        path: brin("bas", 0, 1, 0.075)
      }
    ]),

    /* Croix encre, pour les pages légales. */
    legal: [
      {
        brush: "croix", ink: "encre", over: { size: 0.13, spacing: 1.5 },
        path: function (w, h) {
          return spiral(w * 0.5, h * 0.5, Math.min(w, h) * 0.34, 1.6, -Math.PI * 0.6, 400);
        }
      }
    ],

    /* Bande de pied de page : sur fond noir, la seule place où le lime
       du logo tient à pleine intensité. */
    bande: [
      {
        brush: "semis", ink: "lime", over: { size: 0.30, spacing: 0.55, hueDrift: 0 },
        path: function (w, h) {
          return wave(w * 0.01, h * 0.5, w * 0.98, h * 0.30, 2.5, 700);
        }
      },
      {
        brush: "croix", ink: "bleu", alpha: 0.9, delay: 260,
        over: { size: 0.26, spacing: 1.6 },
        path: function (w, h) {
          return wave(w * 0.01, h * 0.5, w * 0.98, h * 0.22, 2.5, 700);
        }
      }
    ]
  };

  /* ------------------------------------------------------------------ *
   * Montage
   * ------------------------------------------------------------------ */

  var DRAW_MS = 1100;

  /* Les marques qui se déroulent au défilement au lieu d'entrer en scène d'un
     coup. Le fil de la page d'histoire est le seul, et pour une raison de
     mesure : les autres marques tiennent dans un carré qu'on embrasse d'un
     regard, lui est aussi long que le bloc des chapitres. Le dessiner d'un
     coup à l'entrée dans le champ, ce serait le peindre presque entièrement
     hors de l'écran, et n'en montrer jamais le tracé. Le mot こだわり en fait
     partie : il s'écrit à son tour, quand la lecture arrive dessus. */
  var AU_DEFILEMENT = { fil: true };

  /* La pointe du fil se tient à cette fraction de la hauteur de la fenêtre,
     donc un peu sous la ligne de lecture.

     Ce réglage décide si le déroulé se voit ou non, et il se règle par le bas,
     pas par le haut. Trop près de 1, la pointe colle au bord inférieur de
     l'écran : le fil est déjà tracé partout où l'œil se pose, il ne reste
     qu'une bande de rien du tout en bas de la fenêtre, et le déroulé passe
     pour absent. Un premier essai à 0,9 se lisait exactement comme un fil
     dessiné d'avance. Il faut laisser sous la pointe une part visible de
     l'écran encore vierge pour que l'avancée se remarque. */
  var POINTE = 0.62;

  /* Ce qu'une marque a besoin de savoir de la page autour d'elle, mesuré à
     chaque mise en page et passé à ses chemins. Le fil est le seul dans ce cas :
     il lui faut la hauteur à laquelle l'encadré tombe, pour y écrire le mot. */
  var MESURES = { fil: bandeDuMot };

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  /** Une brosse et les réglages de sa couche, fusionnés une fois pour toutes.
   *  C'était refait à chaque image auparavant. */
  function brosse(layer) {
    var base = BRUSHES[layer.brush];
    if (!base) return null;
    if (!layer.over) return base;
    var out = {};
    var k;
    for (k in base) if (Object.prototype.hasOwnProperty.call(base, k)) out[k] = base[k];
    for (k in layer.over) if (Object.prototype.hasOwnProperty.call(layer.over, k)) out[k] = layer.over[k];
    return out;
  }

  function mount(host) {
    var nom = host.getAttribute("data-mark");
    var layers = MARKS[nom];
    if (!layers) return;

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // En mouvement réduit, le fil ne se déroule pas : il est posé entier.
    var defile = AU_DEFILEMENT[nom] === true && !reduced;
    var canvas = document.createElement("canvas");
    canvas.style.cssText = "display:block;width:100%;height:100%";
    host.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var brosses = [];
    for (var b = 0; b < layers.length; b++) brosses.push(brosse(layers[b]));

    var chemins = [];
    var raf = 0;
    var start = 0;
    var running = false;
    var done = false;
    var onScreen = false;
    var hidden = false;
    var dpr = 1;
    var pose = 0;      // fraction du fil déjà déroulée
    var mesure = null; // ce que la marque a mesuré de la page autour d'elle

    function layout() {
      var w = host.clientWidth;
      var h = host.clientHeight;
      if (!w || !h) return false;
      // Un écran se contente de 2. L'impression a besoin de bien plus : la
      // carte de visite force 4, ce qui met les tampons au-dessus de 300 dpi
      // une fois la marque réduite à sa taille en millimètres.
      var force = parseFloat(host.getAttribute("data-dpr"));
      dpr = force > 0 ? force : Math.min(window.devicePixelRatio || 1, 2);
      var bw = Math.round(w * dpr);
      var bh = Math.round(h * dpr);
      var change = canvas.width !== bw || canvas.height !== bh;
      if (change) {
        canvas.width = bw;
        canvas.height = bh;
      }
      // Les chemins ne dépendent que de la taille et de ce que la marque mesure
      // autour d'elle : les recalculer à chaque image d'un déroulé coûterait des
      // milliers de points pour rien. La mesure est prise une fois pour toutes
      // les couches, et c'est elle qui fixe les portions de chacune.
      if (change || !chemins.length) {
        mesure = MESURES[nom] ? MESURES[nom](host, w, h) : null;
        chemins = [];
        for (var i = 0; i < layers.length; i++) {
          chemins.push(layers[i].path(w, h, mesure));
        }
      }
      return true;
    }

    function effacer() {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    /** La taille de tampon d'une couche, en pixels, quand elle ne suit pas la
     *  règle ordinaire du petit côté. Zéro veut dire « la règle ordinaire » :
     *  `stroke` retombe alors sur `size`. */
    function tampon(i) {
      return layers[i].taille && mesure ? layers[i].taille * mesure.taille : 0;
    }

    function draw(elapsed) {
      effacer();
      var short = Math.min(host.clientWidth, host.clientHeight);
      for (var i = 0; i < layers.length; i++) {
        if (!brosses[i]) continue;
        var began = layers[i].delay || 0;
        var p = reduced
          ? 1
          : easeOut(Math.min(1, Math.max(0, (elapsed - began) / DRAW_MS)));
        if (p <= 0) continue;
        stroke(ctx, chemins[i], brosses[i], short, {
          progress: p,
          dpr: dpr,
          ink: INKS[layers[i].ink] || INKS.encre,
          alpha: layers[i].alpha == null ? 1 : layers[i].alpha,
          sizePx: tampon(i)
        });
      }
    }

    /* ---------------------------------------------------------------- *
     * Le fil qui se déroule au défilement
     *
     * L'avancement ne redescend jamais. Un fil qu'on déroule ne se
     * rembobine pas, et surtout : le canevas n'est jamais effacé entre deux
     * images, donc remonter demanderait de repeindre toute la hauteur à
     * chaque cran de molette. C'est exactement ce que `from` permet
     * d'éviter.
     * ---------------------------------------------------------------- */

    function avance() {
      var r = host.getBoundingClientRect();
      if (!r.height) return 0;
      var fenetre = window.innerHeight || document.documentElement.clientHeight || 0;
      return Math.min(1, Math.max(0, (fenetre * POINTE - r.top) / r.height));
    }

    /** Prolonge le tracé de `de` à `a`, sans rien effacer. `from` saute le
     *  dessin des tampons déjà posés sans sauter leur compte : l'aléa vient de
     *  l'indice du tampon, donc la marche à vide doit passer par chacun d'eux
     *  pour que le suivant tombe où il serait tombé depuis zéro. */
    function prolonger(de, a) {
      var short = Math.min(host.clientWidth, host.clientHeight);
      for (var i = 0; i < layers.length; i++) {
        if (!brosses[i]) continue;
        // Un brin ne couvre qu'une portion du fil : l'avancement du fil entier
        // se convertit en avancement de ce brin-là avant d'aller à `stroke`.
        var part = layers[i].path.part || [0, 1];
        var etendue = Math.max(0.0001, part[1] - part[0]);
        var haut = Math.min(1, Math.max(0, (a - part[0]) / etendue));
        var bas = Math.min(1, Math.max(0, (de - part[0]) / etendue));
        if (haut <= bas) continue;
        stroke(ctx, chemins[i], brosses[i], short, {
          progress: haut,
          from: bas,
          dpr: dpr,
          ink: INKS[layers[i].ink] || INKS.encre,
          alpha: layers[i].alpha == null ? 1 : layers[i].alpha,
          sizePx: tampon(i)
        });
      }
    }

    function derouler() {
      raf = 0;
      var p = avance();
      if (p <= pose) return;
      prolonger(pose, p);
      pose = p;
    }

    function auDefilement() {
      if (!raf) raf = requestAnimationFrame(derouler);
    }

    function lastDelay() {
      var max = 0;
      for (var i = 0; i < layers.length; i++) max = Math.max(max, layers[i].delay || 0);
      return max;
    }

    function tick(now) {
      if (!running) return;
      var elapsed = now - start;
      draw(elapsed);
      if (elapsed > lastDelay() + DRAW_MS) {
        // Une fois posée, la marque est une image fixe : la boucle s'arrête
        // plutôt que de brûler des images sur un dessin terminé.
        done = true;
        running = false;
        return;
      }
      raf = requestAnimationFrame(tick);
    }

    function sync() {
      var should = onScreen && !hidden;
      if (defile) {
        if (should) {
          window.addEventListener("scroll", auDefilement, { passive: true });
          auDefilement();
        } else {
          window.removeEventListener("scroll", auDefilement);
          cancelAnimationFrame(raf);
          raf = 0;
        }
        return;
      }
      if (!should) {
        running = false;
        cancelAnimationFrame(raf);
        return;
      }
      if (done || running) return;
      if (reduced) {
        draw(Infinity);
        done = true;
        return;
      }
      running = true;
      start = performance.now();
      raf = requestAnimationFrame(tick);
    }

    /* La brosse prend la main. Les marques décoratives n'en font rien, mais une
       marque qui remplace du texte a besoin de le dire : sa boîte ne prend sa
       place qu'ici, et le texte de repli passe alors en lecture d'écran seule.
       Sans script, ou si le canevas manque, la classe n'arrive jamais : le mot
       reste écrit et rien ne réserve de place à côté de lui. La mesure vient
       après, sinon on mesurerait une boîte qui n'a pas encore sa taille. */
    host.classList.add("mark--pose");
    if (!layout()) {
      host.classList.remove("mark--pose");
      return;
    }

    new ResizeObserver(function () {
      var acquis = pose;
      if (!layout()) return;
      if (defile) {
        // Le canevas repart vide après un redimensionnement, et le méandre a
        // changé de largeur : on repose d'un coup tout ce qui était déroulé.
        effacer();
        pose = 0;
        prolonger(0, acquis);
        pose = acquis;
        auDefilement();
        return;
      }
      // Une marque terminée se repeint complète : un redimensionnement n'est
      // pas une seconde entrée en scène.
      if (done) draw(Infinity);
    }).observe(host);

    new IntersectionObserver(
      function (entries) {
        for (var i = 0; i < entries.length; i++) {
          if (entries[i].isIntersecting) {
            onScreen = true;
            sync();
            return;
          }
        }
        onScreen = false;
        sync();
      },
      { rootMargin: "120px" }
    ).observe(host);

    document.addEventListener("visibilitychange", function () {
      hidden = document.hidden;
      sync();
    });
  }

  /* ------------------------------------------------------------------ *
   * Barre de chargement
   * ------------------------------------------------------------------
   * Le site est fait de pages complètes : cliquer un lien fait attendre le
   * visiteur devant la page qu'il quitte, sans rien qui bouge. La barre occupe
   * cette attente, et c'est la même brosse que le reste du site qui la peint :
   * un trait tamponné de gauche à droite, en deux passes mal calées comme la
   * spirale d'ouverture. Ni fuseau, ni pourcentage, ni dégradé.
   *
   * Elle sert deux moments, réglés différemment :
   *
   *   au clic, elle avance sur la page qui part et reste à l'écran tant que le
   *   navigateur va chercher la suivante. Rien avant ATTENTE : sur une
   *   navigation courte, l'écran se remplace avant, et un éclair de couleur
   *   juste avant ne serait qu'un raté ;
   *
   *   à l'arrivée, elle paraît tout de suite et traverse l'écran en PLANCHER
   *   millisecondes au minimum. Ce site se charge en bien moins que ATTENTE :
   *   une barre qui ne durerait que le temps réel du chargement ne serait
   *   jamais visible une seule fois. La durée plancher lui donne le temps de
   *   traverser, et elle assume alors ce qu'elle est : une transition
   *   d'arrivée, pas une jauge.
   *
   * Le remplissage n'est pas une mesure : rien, dans une page servie en un
   * bloc, ne dit où en est le téléchargement. C'est une montée asymptotique
   * qui approche un plafond sans jamais l'atteindre, et seule la fin du
   * chargement pousse le trait jusqu'au bout. Une barre qui bluffe une mesure
   * précise ment ; une barre qui ralentit dit seulement « ça vient ».
   * ------------------------------------------------------------------ */

  /* Ce qui change d'une navigation à l'autre, ce sont les deux brosses et les
     deux encres. La géométrie, elle, ne bouge pas : une barre qui changerait
     aussi de place ou d'épaisseur ne se reconnaîtrait plus d'une fois sur
     l'autre.

     Le lime ne peut pas servir ici, la barre est posée sur du blanc : les huit
     variantes tirent dans la gamme saturée, celle des marques sur papier.

     `part` donne la taille du tampon en fraction de la hauteur de la barre. Sur
     sept pixels tout se joue au pixel près : le rail en occupe trois, l'ombre
     deux, et il reste un pixel de jeu entre les deux. */
  var VARIANTES = [
    {
      rail: { brush: "carres", ink: "bleu", part: 0.86, over: { spacing: 0.50, jitter: 0.13 } },
      ombre: { brush: "projection", ink: "magenta", part: 0.52, over: { spacing: 0.58, jitter: 0.26, scatter: 0.08, speedSize: 0 } }
    },
    {
      rail: { brush: "trait", ink: "cyan", part: 0.80, over: { spacing: 0.30, jitter: 0.10 } },
      ombre: { brush: "carres", ink: "orange", part: 0.46, over: { spacing: 1.20, jitter: 0.20 } }
    },
    {
      rail: { brush: "peigne", ink: "magenta", part: 0.66, over: { spacing: 0.22, hueDrift: 0 } },
      ombre: { brush: "carres", ink: "cyan", part: 0.36, over: { spacing: 1.10, jitter: 0.24 } }
    },
    {
      rail: { brush: "plume", ink: "olive", part: 0.92, over: { spacing: 0.22 } },
      ombre: { brush: "semis", ink: "cyan", part: 0.46, over: { spacing: 0.90, scatter: 0.22 } }
    },
    {
      rail: { brush: "tissage", ink: "orange", part: 0.70, over: { spacing: 0.40 } },
      ombre: { brush: "carres", ink: "bleu", part: 0.40, over: { spacing: 1.05, jitter: 0.30 } }
    },
    {
      rail: { brush: "touffe", ink: "encre", part: 0.62, over: { spacing: 0.45, scatter: 0.05 } },
      ombre: { brush: "croix", ink: "magenta", part: 0.36, over: { spacing: 1.60 } }
    },
    {
      rail: { brush: "carres", ink: "cyan", part: 0.90, over: { spacing: 0.90, jitter: 0.16 } },
      ombre: { brush: "trait", ink: "bleu", part: 0.40, over: { spacing: 0.35 } }
    },
    {
      rail: { brush: "projection", ink: "bleu", part: 0.84, over: { spacing: 0.42, jitter: 0.16, scatter: 0.05 } },
      ombre: { brush: "anneaux", ink: "olive", part: 0.52, over: { spacing: 1.30 } }
    }
  ];

  /* Le retard de l'ombre sur le rail, en fraction du trajet. */
  var RETARD = 0.05;

  /** Les deux couches d'une variante, prêtes pour `stroke`. */
  function couches(v) {
    return [
      { passe: v.rail, lag: 0, alpha: 1, y: 0.34, amp: 0.08 },
      { passe: v.ombre, lag: RETARD, alpha: 0.85, y: 0.74, amp: 0.12 }
    ];
  }

  /** Le chemin de la barre : une onde très basse, une crête tous les 220 px
   *  environ. Un trait rigoureusement droit ne montrerait rien de la brosse :
   *  elles se ressemblent toutes sur une droite. */
  function trace(w, y, amp) {
    return wave(0, y, w, amp, Math.max(1, w / 220), Math.max(48, Math.round(w / 3)));
  }

  /** La variante d'une navigation.
   *
   *  `history.length` avance d'un cran à chaque page ouverte dans l'onglet : la
   *  série tourne donc d'elle-même, sans rien écrire nulle part. Ce n'est pas
   *  `Math.random` : le tirage doit tenir pendant tout le tracé, sinon la barre
   *  changerait de brosse à chaque image. */
  function variante() {
    var n = 1;
    try {
      n = window.history.length || 1;
    } catch (e) {
      n = 1;
    }
    return VARIANTES[n % VARIANTES.length];
  }

  var MONTEE = 1500;   // constante de temps de la montée, en millisecondes
  var PLAFOND = 0.93;  // la montée seule ne dépasse jamais cette fraction
  var FIN_MS = 280;    // course jusqu'au bout après une vraie attente
  var PLANCHER = 700;  // durée minimale du trait, de l'apparition au bout
  var TENUE = 90;      // temps où la barre pleine reste lisible
  var SORTIE = 320;    // fondu de sortie, doit valoir la transition CSS
  var ATTENTE = 120;   // rien à l'écran avant ce délai : pas de clignotement
  var GARDE = 400;     // en mouvement réduit, la barre n'est qu'un signal
                       // d'attente : rien ne paraît avant ce délai
  var ABANDON = 20000; // navigation qui n'aboutit pas : on retire la barre

  /** Adoucie aux deux bouts. Sur un trait qui traverse l'écran d'un coup, une
   *  sortie cubique file puis rampe : elle a l'air de caler avant la fin. */
  function easeInOut(t) {
    return t * t * (3 - 2 * t);
  }

  function barre() {
    var host = document.createElement("div");
    host.className = "chargement";
    host.setAttribute("aria-hidden", "true");
    var canvas = document.createElement("canvas");
    canvas.style.cssText = "display:block;width:100%;height:100%";
    host.appendChild(canvas);
    document.body.insertBefore(host, document.body.firstChild);

    var ctx = canvas.getContext("2d");
    if (!ctx) return null;

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var dpr = 1;
    var w = 0;
    var h = 0;
    var jeu = couches(variante()); // les deux passes du tracé en cours
    var paths = [];

    var raf = 0;
    var minuteurs = [];
    var phase = "repos";    // repos, montee (on attend la page), course (fin du trait)
    var visible = false;    // la barre est à l'écran
    var depart = 0;         // horodatage du début de la montée
    var garde = 0;          // délai demandé avant l'apparition
    var apparu = 0;         // horodatage de l'apparition à l'écran
    var course = 0;         // horodatage du début de la course finale
    var duree = FIN_MS;     // durée de la course finale
    var pose = 0;           // fraction déjà peinte sur le canevas
    var atteint = 0;        // fraction atteinte au moment de la course finale

    function differer(fn, ms) {
      minuteurs.push(setTimeout(fn, ms));
    }

    function purger() {
      for (var i = 0; i < minuteurs.length; i++) clearTimeout(minuteurs[i]);
      minuteurs = [];
    }

    /** Mesure le canevas. Renvoie vrai si la géométrie a changé. */
    function layout() {
      var nw = host.clientWidth;
      var nh = host.clientHeight;
      var ndpr = Math.min(window.devicePixelRatio || 1, 2);
      if (!nw || !nh) return false;
      if (nw === w && nh === h && ndpr === dpr) return false;
      w = nw;
      h = nh;
      dpr = ndpr;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      chemins();
      return true;
    }

    function chemins() {
      paths = [];
      for (var i = 0; i < jeu.length; i++) paths.push(trace(w, h * jeu[i].y, h * jeu[i].amp));
    }

    function effacer() {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pose = 0;
    }

    /** Prolonge le tracé de `pose` jusqu'à `p`. Le canevas n'est jamais effacé
     *  entre deux images : seuls les tampons nouveaux sont posés. */
    function peindre(p) {
      if (p <= pose) return;
      for (var i = 0; i < jeu.length; i++) {
        var layer = jeu[i];
        var passe = layer.passe;
        var brush = BRUSHES[passe.brush];
        if (!brush || !paths[i]) continue;
        var merged = {};
        var k;
        for (k in brush) if (Object.prototype.hasOwnProperty.call(brush, k)) merged[k] = brush[k];
        for (k in passe.over) if (Object.prototype.hasOwnProperty.call(passe.over, k)) merged[k] = passe.over[k];
        // le retard est repris dans l'échelle : à p = 1 les deux passes
        // touchent le bout, sinon l'ombre s'arrêterait avant le bord
        var etale = function (x) {
          return Math.min(1, Math.max(0, (x - layer.lag) / (1 - layer.lag)));
        };
        stroke(ctx, paths[i], merged, Math.min(w, h), {
          progress: etale(p),
          from: etale(pose),
          dpr: dpr,
          ink: INKS[passe.ink],
          alpha: layer.alpha,
          sizePx: h * passe.part
        });
      }
      pose = p;
    }

    function montrer() {
      if (visible) return;
      visible = true;
      apparu = performance.now();
      host.classList.remove("chargement--sortie");
      host.classList.add("chargement--visible");
    }

    function repos() {
      purger();
      cancelAnimationFrame(raf);
      raf = 0;
      phase = "repos";
      visible = false;
      host.classList.remove("chargement--visible", "chargement--sortie");
      effacer();
    }

    function tick(now) {
      raf = 0;
      if (phase === "repos") return;
      if (layout()) {
        // le canevas repart vide après un redimensionnement : on repeint d'un
        // coup tout ce qui était déjà acquis
        var acquis = pose;
        effacer();
        peindre(acquis);
      }
      if (phase === "course") {
        var f = Math.min(1, (now - course) / duree);
        // une vraie course finale se termine sèchement, un trait qui traverse
        // tout l'écran d'un coup demande une courbe adoucie aux deux bouts
        var e = duree > FIN_MS ? easeInOut(f) : easeOut(f);
        peindre(atteint + (1 - atteint) * e);
        if (f >= 1) return;
      } else {
        // montée asymptotique : elle approche le plafond sans jamais l'atteindre
        peindre(PLAFOND * (1 - Math.exp(-(now - depart) / MONTEE)));
      }
      raf = requestAnimationFrame(tick);
    }

    function relancer() {
      if (!raf && phase !== "repos") raf = requestAnimationFrame(tick);
    }

    /* --- interface ------------------------------------------------- */

    /** Une navigation commence. Sans effet si une autre est déjà en attente.
     *  `attente` est le délai avant que la barre paraisse. */
    function ouvrir(attente) {
      if (phase === "montee") return;
      repos();
      // la variante est arrêtée ici, pour tout le tracé
      jeu = couches(variante());
      chemins();
      phase = "montee";
      // en mouvement réduit la barre ne fait pas la traversée d'arrivée : elle
      // ne sort que si l'attente est réelle, et le délai de garde le décide
      garde = reduced ? Math.max(attente || 0, GARDE) : attente || 0;
      depart = performance.now();
      differer(function () {
        if (phase !== "montee") return;
        layout();
        if (!w || !h) return;
        montrer();
        if (reduced) {
          // pas de montée : le trait se pose entier et attend
          peindre(PLAFOND);
          return;
        }
        relancer();
      }, garde);
      // une navigation qui n'aboutit pas laisserait la barre en plan
      differer(fermer, ABANDON);
    }

    /** La page est chargée. La barre finit son trait puis s'efface. */
    function fermer() {
      if (phase !== "montee") return;
      purger();
      if (!visible) {
        // Le chargement s'est terminé avant que la barre paraisse. Au clic
        // c'est tant mieux : la page suivante prend la main. À l'arrivée, sur
        // un site qui se charge en quelques millisecondes, ce serait ne jamais
        // rien montrer, donc on la fait paraître pour qu'elle traverse l'écran
        // une fois. Sauf en mouvement réduit : un trait qui paraît et disparaît
        // aussitôt n'est qu'un clignotement.
        if (garde > 0) {
          repos();
          return;
        }
        layout();
        if (!w || !h) {
          repos();
          return;
        }
        montrer();
      }
      phase = "course";
      if (reduced) {
        peindre(1);
        differer(repos, TENUE);
        return;
      }
      atteint = pose;
      course = performance.now();
      // durée plancher : après une vraie attente il ne reste qu'à solder le
      // trait, mais quand la page est déjà là le trait doit avoir le temps de
      // traverser l'écran. Sinon on ne le verrait jamais.
      duree = Math.max(FIN_MS, PLANCHER - (course - apparu));
      relancer();
      differer(function () {
        host.classList.add("chargement--sortie");
        differer(repos, SORTIE);
      }, duree + TENUE);
    }

    layout();
    window.addEventListener("resize", function () {
      if (phase === "repos" && !visible) layout();
    });

    return { ouvrir: ouvrir, fermer: fermer, repos: repos };
  }

  /** Un lien qui va réellement remplacer le document courant. */
  function navigue(a, e) {
    if (e.defaultPrevented || e.button !== 0) return false;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
    if (!a || !a.href || a.hasAttribute("download")) return false;
    if (a.target && a.target !== "_self") return false;
    var url;
    try {
      url = new URL(a.href, location.href);
    } catch (err) {
      return false;
    }
    // mailto:, tel: et les autres protocoles n'emportent pas la page
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    if (url.origin !== location.origin) return false;
    // une ancre dans la page courante ne recharge rien
    if (url.href.split("#")[0] === location.href.split("#")[0]) return false;
    return true;
  }

  function chargement() {
    // la page d'atelier sert à imprimer une carte : pas de barre
    if (document.body.classList.contains("atelier")) return;
    var b = barre();
    if (!b) return;
    var quitte = false; // un lien a été suivi : cette page ne nous intéresse plus

    // Le document courant. La barre paraît tout de suite, sans le délai de
    // garde du clic : ce site se charge en bien moins de temps que ce délai,
    // et une barre qu'on n'a jamais l'occasion de voir ne sert à rien. C'est la
    // durée plancher qui lui donne le temps de traverser l'écran.
    if (document.readyState !== "complete") {
      b.ouvrir(0);
      window.addEventListener("load", function () {
        // le visiteur a cliqué avant la fin du chargement : la page qu'il
        // attend n'est plus celle-ci, la barre n'a pas à annoncer une arrivée
        if (!quitte) b.fermer();
      });
    }

    document.addEventListener("click", function (e) {
      var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
      if (!a || !navigue(a, e)) return;
      quitte = true;
      // au clic, le délai de garde tient : sur une navigation courte la page
      // suivante prend la main avant, et la barre d'arrivée fait le travail
      b.ouvrir(ATTENTE);
    });

    // retour arrière depuis le cache du navigateur : la page est déjà là,
    // la barre laissée en plan par le départ n'a plus lieu d'être
    window.addEventListener("pageshow", function (e) {
      if (e.persisted) b.repos();
    });
    window.addEventListener("pagehide", b.repos);
  }

  function init() {
    chargement();
    // les marques ont besoin des deux observateurs, la barre non
    if (!window.ResizeObserver || !window.IntersectionObserver) return;
    var hosts = document.querySelectorAll("[data-mark]");
    for (var i = 0; i < hosts.length; i++) mount(hosts[i]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
