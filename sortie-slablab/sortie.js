/* La sortie de Slab Lab : le ciel tramé de la vitrine peint dans la carte,
   un compte à rebours jusqu'au 1er décembre 2026, et Moussouris qui tombe sur
   son slab. À l'atterrissage, une gerbe de confettis carrés, aux couleurs
   des postes du labo, part du slab, comme quand une carte décroche un 10.
   Ensuite Moussouris sautille de temps en temps, et un clic sur lui relance
   la gerbe.

   Aucune requête hors du domaine, aucun stockage, aucun Math.random pour ce
   qui reste à l'écran : la gerbe est tirée d'un générateur à graine. En
   mouvement réduit, le ciel est peint et le compte affiché, mais rien ne
   bouge. Sans JavaScript, la carte est la même, bleue et immobile, avec sa
   date écrite en toutes lettres. */
(function () {
  "use strict";

  var bloc = document.querySelector(".sortie");
  if (!bloc) return;
  var carte = bloc.querySelector(".sortie-carte");
  var ciel = bloc.querySelector(".sortie-ciel");
  var toile = bloc.querySelector(".sortie-confettis");
  var hote = bloc.querySelector(".sortie-mascotte");

  /* ---------------------------------------------------------------- *
   * Le compte à rebours
   * ---------------------------------------------------------------- */

  // Les jours se comptent en dates du calendrier du visiteur, pas en
  // tranches de 24 heures : le 30 novembre au soir, c'est « demain ».
  (function compter() {
    var d = (bloc.getAttribute("data-date") || "").split("-");
    if (d.length !== 3) return;
    var sortie = new Date(+d[0], +d[1] - 1, +d[2]);
    var maintenant = new Date();
    var aujourdhui = new Date(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate());
    var jours = Math.round((sortie - aujourdhui) / 86400000);
    var pastille = bloc.querySelector("[data-sortie-compte]");
    var texte;
    if (jours > 1) texte = bloc.getAttribute("data-compte").replace("{n}", jours);
    else if (jours === 1) texte = bloc.getAttribute("data-veille");
    else if (jours === 0) texte = bloc.getAttribute("data-jour");
    else texte = bloc.getAttribute("data-sorti");
    if (pastille && texte) {
      pastille.textContent = texte;
      pastille.hidden = false;
    }
    // Une fois le jeu sorti, la date au futur ne se lit plus juste.
    var ligne = bloc.querySelector(".sortie-date");
    if (jours <= 0 && ligne && bloc.getAttribute("data-titre-sorti")) {
      ligne.textContent = bloc.getAttribute("data-titre-sorti");
    }
  })();

  /* ---------------------------------------------------------------- *
   * Le ciel : sky() de tools/store_screenshots/compose.html, comme sur
   * la vitrine (slablab/vitrine.js), avec des halos posés pour une carte
   * large et basse.
   * ---------------------------------------------------------------- */

  function peindreCiel() {
    if (!ciel || !ciel.getContext) return;
    var box = ciel.getBoundingClientRect();
    var P = innerWidth < 600 ? 6 : 8;
    var cols = Math.ceil(box.width / P), rows = Math.ceil(box.height / P);
    if (!cols || !rows) return;
    ciel.width = cols;
    ciel.height = rows;
    var ctx = ciel.getContext("2d");
    var etroit = innerWidth < 900;
    var halos = etroit
      ? [[cols * 0.25, rows * 0.15, cols * 0.28], [cols * 0.7, rows * 0.62, cols * 0.3]]
      : [[cols * 0.12, rows * 0.4, rows * 0.32], [cols * 0.5, rows * 0.55, rows * 0.36], [cols * 0.86, rows * 0.35, rows * 0.3]];
    var img = ctx.createImageData(cols, rows);
    var pal = {
      b: [0x3b, 0x86, 0xd9], // bleu
      l: [0x9a, 0xd1, 0xff], // halo
      d: [0x23, 0x51, 0x8f]  // lointain
    };
    for (var y = 0; y < rows; y++) {
      for (var x = 0; x < cols; x++) {
        var pres = Infinity;
        for (var h = 0; h < halos.length; h++) {
          var o = halos[h];
          pres = Math.min(pres, Math.hypot(x + 0.5 - o[0], (y + 0.5 - o[1]) / 1.5) / o[2]);
        }
        var impair = (x + y) % 2 === 0;
        var c = pal.b;
        if (pres < 1 || (pres < 1.1 && impair)) c = pal.l;
        else if (pres > 2.05 || (pres > 1.9 && impair)) c = pal.d;
        var i = (y * cols + x) * 4;
        img.data[i] = c[0];
        img.data[i + 1] = c[1];
        img.data[i + 2] = c[2];
        img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  var minuterieCiel = 0;
  peindreCiel();
  window.addEventListener("resize", function () {
    clearTimeout(minuterieCiel);
    minuterieCiel = setTimeout(peindreCiel, 120);
  });

  if (!carte || !toile || !hote || !toile.getContext) return;
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  /* ---------------------------------------------------------------- *
   * Courbes et hasard à graine
   * ---------------------------------------------------------------- */

  function borne(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  function graine(n) {
    var a = n >>> 0;
    return function () {
      a += 0x6d2b79f5;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------------------------------------------------------------- *
   * Moussouris
   * ---------------------------------------------------------------- */

  // Une animation à la fois : une chute (l'entrée) ou un saut.
  var anim = null; // { type, debut }
  var raf = 0;

  // La hauteur d'un saut, en fraction de la hauteur de la mascotte, et
  // l'écrasement à l'atterrissage, en ressort.
  function cadre(now) {
    raf = 0;
    if (!anim) return;
    var t = now - anim.debut;
    var y = 0, sx = 1, sy = 1, fini = false;
    if (anim.type === "chute") {
      // Il tombe du haut de la carte, en accélérant.
      var c = borne(t / 420);
      y = -(1 - c * c) * 0.9;
      if (t < 420) hote.style.opacity = String(borne(t / 120));
      else hote.style.opacity = "";
      var a = t - 420;
      if (a > 0) {
        var r = Math.exp(-a / 140) * Math.cos(a / 38);
        sx = 1 + 0.14 * r;
        sy = 1 - 0.16 * r;
        y = 0;
      }
      if (a > 0 && !anim.gerbe) {
        anim.gerbe = true;
        gerbe();
      }
      fini = a > 700;
    } else {
      // Un saut : il se ramasse, décolle, retombe et s'écrase un peu.
      if (t < 90) {
        var p = t / 90;
        sx = 1 + 0.1 * p;
        sy = 1 - 0.12 * p;
      } else if (t < 450) {
        var v = (t - 90) / 360;
        y = -0.16 * 4 * v * (1 - v);
        sx = 0.95;
        sy = 1.06;
      } else {
        var b = t - 450;
        var q = Math.exp(-b / 110) * Math.cos(b / 34);
        sx = 1 + 0.1 * q;
        sy = 1 - 0.12 * q;
        fini = b > 520;
      }
    }
    // Le pixel art garde ses pixels : le déplacement se cale sur la
    // grille d'un pixel de l'art.
    var pas = hote.clientWidth / 29;
    var dy = Math.round((y * hote.clientHeight) / pas) * pas;
    hote.style.transform =
      "translateY(" + dy.toFixed(1) + "px) scale(" + sx.toFixed(3) + "," + sy.toFixed(3) + ")";
    if (fini) {
      anim = null;
      hote.style.transform = "";
    } else {
      raf = requestAnimationFrame(cadre);
    }
  }

  function lancer(type) {
    anim = { type: type, debut: performance.now(), gerbe: false };
    if (!raf) raf = requestAnimationFrame(cadre);
  }

  /* ---------------------------------------------------------------- *
   * La gerbe : des confettis carrés, sans rotation (le pixel art ne
   * tourne pas), et quelques étincelles en croix, comme celles du ciel.
   * ---------------------------------------------------------------- */

  // Les couleurs du labo : cyan Vérifier, rose Noter, orange Sceller, l'or
  // de l'argent, le vert d'action, le holo, le violet du rare, et le crème.
  var COULEURS = ["#2fc6e8", "#ff5fb8", "#ff9a3c", "#ffc23a", "#3fd15a", "#39d8ff", "#b86bff", "#fff8e7"];
  var ETINCELLES = ["#ffe38a", "#ffffff"];
  var ctx = toile.getContext("2d");
  var pieces = [];
  var rafGerbe = 0;
  var tirage = 1;
  var dpr = 1;
  var dernier = 0;

  function mesurer() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.round(toile.clientWidth * dpr);
    var h = Math.round(toile.clientHeight * dpr);
    if (toile.width !== w || toile.height !== h) {
      toile.width = w;
      toile.height = h;
    }
  }

  function gerbe() {
    mesurer();
    var hasard = graine(tirage++ * 7919);
    var c = toile.getBoundingClientRect();
    var m = hote.getBoundingClientRect();
    // Le départ : l'étiquette du slab, sous les pattes de Moussouris.
    var ox = m.left - c.left + m.width * 0.5;
    var oy = m.top - c.top + m.height * 0.58;
    var echelle = Math.max(0.7, Math.min(1.2, c.width / 1000));
    var n = Math.round(80 * Math.max(0.6, echelle));
    for (var i = 0; i < n; i++) {
      var etincelle = i % 6 === 0;
      // Surtout vers le haut et vers la droite, où est le texte.
      var angle = -Math.PI / 2 + (hasard() - 0.3) * Math.PI * 0.95;
      var v = (380 + hasard() * 640) * echelle;
      pieces.push({
        x: ox + (hasard() - 0.5) * 30,
        y: oy + (hasard() - 0.5) * 12,
        vx: Math.cos(angle) * v * (0.7 + hasard() * 0.9),
        vy: Math.sin(angle) * v,
        flot: hasard() * Math.PI * 2,
        // Des tailles en pixels pleins, multiples d'un pixel d'art.
        taille: Math.round((etincelle ? 3 : 2 + Math.floor(hasard() * 2)) * 2 * echelle) * 2,
        etincelle: etincelle,
        couleur: etincelle
          ? ETINCELLES[Math.floor(hasard() * ETINCELLES.length)]
          : COULEURS[Math.floor(hasard() * COULEURS.length)],
        vie: 0,
        duree: 2 + hasard() * 1.4
      });
    }
    if (!rafGerbe) {
      dernier = performance.now();
      rafGerbe = requestAnimationFrame(cadreGerbe);
    }
  }

  function cadreGerbe(now) {
    var dt = Math.min(0.05, (now - dernier) / 1000);
    dernier = now;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, toile.width, toile.height);
    var hauteur = toile.height / dpr;
    for (var i = pieces.length - 1; i >= 0; i--) {
      var p = pieces[i];
      p.vie += dt;
      p.vx -= p.vx * 2 * dt;
      p.vy -= p.vy * 2 * dt;
      p.vy += 640 * dt;
      p.flot += dt * 5;
      p.x += (p.vx + Math.sin(p.flot) * 16) * dt;
      p.y += p.vy * dt;
      var reste = p.duree - p.vie;
      if (reste <= 0 || p.y > hauteur + 30) {
        pieces.splice(i, 1);
        continue;
      }
      // En fin de course, ils clignotent au lieu de s'estomper : un fondu
      // n'existe pas dans une palette de pixel art.
      if (reste < 0.5 && Math.floor(reste * 16) % 2 === 0) continue;
      var u = p.taille / 3;
      var x = Math.round(p.x / 2) * 2;
      var y = Math.round(p.y / 2) * 2;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = p.couleur;
      if (p.etincelle) {
        // Une croix de trois pixels sur trois, comme l'étincelle du ciel.
        ctx.fillRect(x - u / 2, y - u * 1.5, u, u * 3);
        ctx.fillRect(x - u * 1.5, y - u / 2, u * 3, u);
      } else {
        // Un confetti carré qui bat entre carré et bande, par pas.
        var plat = Math.cos(p.flot) > 0.3 ? 1 : 0.5;
        var w = Math.max(2, Math.round((p.taille * plat) / 2) * 2);
        ctx.fillRect(x - w / 2, y - p.taille / 2, w, p.taille);
        ctx.fillStyle = "rgba(26,15,10,0.35)";
        ctx.fillRect(x - w / 2, y + p.taille / 2 - 2, w, 2);
      }
    }
    if (pieces.length) {
      rafGerbe = requestAnimationFrame(cadreGerbe);
    } else {
      rafGerbe = 0;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, toile.width, toile.height);
    }
  }

  /* ---------------------------------------------------------------- *
   * Mise en route
   * ---------------------------------------------------------------- */

  var vu = false;
  var visible = false;
  var minuterie = 0;

  // Un saut de temps en temps, tant que la carte est à l'écran.
  function prochainSaut() {
    clearTimeout(minuterie);
    if (!visible || document.hidden) return;
    minuterie = setTimeout(function () {
      if (!anim) lancer("saut");
      prochainSaut();
    }, 4600 + (tirage % 3) * 800);
  }

  function entrer() {
    vu = true;
    lancer("chute");
    prochainSaut();
  }

  hote.addEventListener("click", function () {
    lancer("saut");
    setTimeout(gerbe, 120);
  });

  if (!window.IntersectionObserver) return;
  // Moussouris attend l'entrée dans le champ pour tomber sur son slab.
  hote.style.opacity = "0";
  new IntersectionObserver(function (entrees) {
    visible = entrees[0].isIntersecting;
    if (visible && !vu) entrer();
    else prochainSaut();
  }, { threshold: 0.35 }).observe(carte);

  document.addEventListener("visibilitychange", prochainSaut);
  window.addEventListener("resize", function () { if (!rafGerbe) mesurer(); });
})();
