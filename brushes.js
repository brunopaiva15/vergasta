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
   */
  function stroke(ctx, path, brush, shortSide, opts) {
    if (path.length < 2) return;
    opts = opts || {};
    var dpr = opts.dpr || 1;
    var progress = opts.progress == null ? 1 : opts.progress;
    if (progress <= 0) return;
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
    brique: { h: 16, s: 64, l: 40 },
    ocre: { h: 38, s: 62, l: 44 },
    bleu: { h: 213, s: 44, l: 38 },
    sapin: { h: 154, s: 36, l: 31 },
    prune: { h: 328, s: 30, l: 40 },
    ardoise: { h: 220, s: 12, l: 32 }
  };

  /* ------------------------------------------------------------------ *
   * Les marques posées dans la page
   *
   * Chacune est une pile de couches. Deux couches d'encres différentes sur le
   * même chemin donnent le décalage d'un tirage en deux passes.
   * ------------------------------------------------------------------ */

  var MARKS = {
    /* Ouverture : deux spirales décalées, brique et ocre, comme une épreuve
       imprimée en deux couleurs mal calées. */
    ouverture: [
      {
        brush: "peigne", ink: "brique",
        path: function (w, h) {
          return spiral(w * 0.5, h * 0.5, Math.min(w, h) * 0.40, 2.15, -Math.PI * 0.55, 900);
        }
      },
      {
        brush: "projection", ink: "ocre", alpha: 0.85, delay: 220,
        path: function (w, h) {
          return spiral(w * 0.52, h * 0.48, Math.min(w, h) * 0.34, 1.85, -Math.PI * 0.15, 700);
        }
      }
    ],

    /* Métier : tissage bleu sur un arc. L'empreinte diagonale pivote avec la
       courbe et les tampons s'entrelacent. */
    metier: [
      {
        brush: "tissage", ink: "bleu", over: { size: 0.115, spacing: 0.85 },
        path: function (w, h) {
          return arc(w * 0.5, h * 0.72, Math.min(w, h) * 0.36, Math.PI * 1.05, Math.PI * 2.05, 400);
        }
      }
    ],

    /* Déroulé : dérive verte, les tampons quittent le chemin. */
    deroule: [
      {
        brush: "derive", ink: "sapin", over: { size: 0.10, spacing: 0.45, scatter: 0.55 },
        path: function (w, h) {
          return wave(w * 0.12, h * 0.5, w * 0.76, h * 0.26, 1.25, 320);
        }
      }
    ],

    /* Réalisations : carrés nets en spirale, prune. Le plus serré du lot. */
    realisations: [
      {
        brush: "carres", ink: "prune", over: { size: 0.115, spacing: 0.80 },
        path: function (w, h) {
          return spiral(w * 0.5, h * 0.5, Math.min(w, h) * 0.36, 1.9, -Math.PI * 0.4, 500);
        }
      }
    ],

    /* Écrire : plume ocre, un coin qui suit la courbe. */
    contact: [
      {
        brush: "anneaux", ink: "ocre", over: { size: 0.145, spacing: 1.15 },
        path: function (w, h) {
          return arc(w * 0.5, h * 0.35, Math.min(w, h) * 0.34, Math.PI * 0.15, Math.PI * 1.15, 400);
        }
      }
    ],

    /* Anneaux ardoise, pour les pages légales. */
    legal: [
      {
        brush: "croix", ink: "ardoise", over: { size: 0.13, spacing: 1.5 },
        path: function (w, h) {
          return spiral(w * 0.5, h * 0.5, Math.min(w, h) * 0.34, 1.6, -Math.PI * 0.6, 400);
        }
      }
    ],

    /* Bande de pied de page : une onde longue dont la teinte glisse de la
       brique vers l'ocre au fil du tracé. */
    bande: [
      {
        brush: "semis", ink: "brique", over: { size: 0.30, spacing: 0.55, hueDrift: 26 },
        path: function (w, h) {
          return wave(w * 0.01, h * 0.5, w * 0.98, h * 0.30, 2.5, 700);
        }
      },
      {
        brush: "croix", ink: "ocre", alpha: 0.7, delay: 260,
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

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function mount(host) {
    var layers = MARKS[host.getAttribute("data-mark")];
    if (!layers) return;

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var canvas = document.createElement("canvas");
    canvas.style.cssText = "display:block;width:100%;height:100%";
    host.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var raf = 0;
    var start = 0;
    var running = false;
    var done = false;
    var onScreen = false;
    var hidden = false;
    var dpr = 1;

    function layout() {
      var w = host.clientWidth;
      var h = host.clientHeight;
      if (!w || !h) return false;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      var bw = Math.round(w * dpr);
      var bh = Math.round(h * dpr);
      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw;
        canvas.height = bh;
      }
      return true;
    }

    function draw(elapsed) {
      var w = host.clientWidth;
      var h = host.clientHeight;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var short = Math.min(w, h);

      for (var i = 0; i < layers.length; i++) {
        var layer = layers[i];
        var brush = BRUSHES[layer.brush];
        if (!brush) continue;
        if (layer.over) {
          var merged = {};
          for (var k in brush) if (Object.prototype.hasOwnProperty.call(brush, k)) merged[k] = brush[k];
          for (var o in layer.over) if (Object.prototype.hasOwnProperty.call(layer.over, o)) merged[o] = layer.over[o];
          brush = merged;
        }
        var began = layer.delay || 0;
        var p = reduced
          ? 1
          : easeOut(Math.min(1, Math.max(0, (elapsed - began) / DRAW_MS)));
        if (p <= 0) continue;
        stroke(ctx, layer.path(w, h), brush, short, {
          progress: p,
          dpr: dpr,
          ink: INKS[layer.ink] || INKS.brique,
          alpha: layer.alpha == null ? 1 : layer.alpha
        });
      }
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

    if (!layout()) return;

    new ResizeObserver(function () {
      if (!layout()) return;
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

  function init() {
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
