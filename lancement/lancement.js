/* La sortie d'Auxine : le pot sort de terre, cligne de l'œil comme à
   l'ouverture de l'app (auxine/launch.js, mêmes images, mêmes temps), et une
   gerbe de feuilles et de confettis part de ses feuilles. Une fois, à l'entrée
   dans le champ. Ensuite le pot cligne de temps en temps, et un clic sur lui
   relance la gerbe.

   Aucune requête hors du domaine, aucun stockage, aucun Math.random pour ce
   qui reste à l'écran : la gerbe est tirée d'un générateur à graine. En
   mouvement réduit, rien ne bouge : le pot est posé, sans gerbe ni clin
   d'œil. Sans JavaScript, la carte est la même, immobile. */
(function () {
  "use strict";

  var carte = document.querySelector(".lancement-carte");
  if (!carte) return;
  var hote = carte.querySelector(".lancement-pot");
  var toile = carte.querySelector(".lancement-confettis");
  var pot = hote && hote.querySelector(".pot");
  if (!hote || !toile || !pot || !toile.getContext) return;
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  /* ---------------------------------------------------------------- *
   * Le clin d'œil : trois images posées sur l'œil droit du pot
   * ---------------------------------------------------------------- */

  // La zone de l'œil dans l'image du pot, de 1024 px (auxine/launch.js).
  var OEIL = [497, 614, 176, 176];
  var base = pot.src.replace(/pot\.webp(\?.*)?$/, "");
  var clins = ["clin_50.webp", "clin_85.webp", "clin_100.webp"].map(function (f) {
    var img = new Image();
    img.src = base + f;
    img.alt = "";
    img.style.cssText =
      "left:" + (OEIL[0] / 10.24) + "%;top:" + (OEIL[1] / 10.24) + "%;" +
      "width:" + (OEIL[2] / 10.24) + "%;height:" + (OEIL[3] / 10.24) + "%;visibility:hidden";
    hote.appendChild(img);
    return img;
  });
  // Les temps de l'app, rapportés au début du clin.
  var CLIN = [[0, 0], [40, 1], [80, 2], [240, 1], [280, 0], [320, -1]];

  /* ---------------------------------------------------------------- *
   * Courbes
   * ---------------------------------------------------------------- */

  function borne(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function sortie(t) { return 1 - Math.pow(1 - t, 3); }
  // L'élastique de l'app, pour le pot qui se ramasse et se redresse.
  function elastique(t) {
    if (t <= 0 || t >= 1) return t;
    var p = 0.4;
    return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * 2 * Math.PI / p) + 1;
  }
  // Un petit dépassement pour la sortie de terre.
  function ressort(t) {
    var c = 1.9;
    return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
  }

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
   * Le pot
   * ---------------------------------------------------------------- */

  var debutPot = null; // sortie de terre
  var debutClin = null;
  var rafPot = 0;

  function cadrePot(now) {
    rafPot = 0;
    var entree = 1, presse = 0;
    if (debutPot !== null) {
      var e = now - debutPot;
      entree = ressort(borne(e / 620));
      if (e < 620) hote.style.opacity = String(borne(e / 180));
      else hote.style.opacity = "";
    }
    var image = -1;
    if (debutClin !== null) {
      var c = now - debutClin;
      CLIN.forEach(function (s) { if (c >= s[0]) image = s[1]; });
      // Le pot se ramasse pendant le clin, puis se redresse en élastique.
      presse = sortie(borne(c / 90)) * (1 - elastique(borne((c - 240) / 520)));
      if (c > 800) debutClin = null;
    }
    clins.forEach(function (img, i) { img.style.visibility = i === image ? "visible" : "hidden"; });
    var s = 0.55 + 0.45 * entree;
    hote.style.transform =
      "translateY(" + ((1 - entree) * 18).toFixed(2) + "%) " +
      "scale(" + (s * (1 + 0.035 * presse)).toFixed(4) + "," + (s * (1 - 0.05 * presse)).toFixed(4) + ")";
    if ((debutPot !== null && now - debutPot < 700) || debutClin !== null) {
      rafPot = requestAnimationFrame(cadrePot);
    } else {
      debutPot = null;
      hote.style.transform = "";
    }
  }

  function animerPot() {
    if (!rafPot) rafPot = requestAnimationFrame(cadrePot);
  }

  function cligner(delai) {
    setTimeout(function () {
      debutClin = performance.now();
      animerPot();
    }, delai || 0);
  }

  /* ---------------------------------------------------------------- *
   * La gerbe
   * ---------------------------------------------------------------- */

  // Les couleurs de l'app : les verts des feuilles du pot, puis le jaune,
  // l'orange, le bleu et le lilas des blocs de la page d'Auxine, et du blanc.
  var VERTS = ["#48e06f", "#2fc95b", "#8af0a3"];
  var VIFS = ["#ffe14d", "#ff7b45", "#5db7ff", "#b9a3ff", "#ffffff"];
  var ctx = toile.getContext("2d");
  var pieces = [];
  var rafGerbe = 0;
  var tirage = 1;
  var dpr = 1;

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
    // Le repère est celui du canevas, qui déborde de la carte.
    var c = toile.getBoundingClientRect();
    var p = hote.getBoundingClientRect();
    // Le départ : le haut des feuilles du pot.
    var ox = p.left - c.left + p.width * 0.52;
    var oy = p.top - c.top + p.height * 0.28;
    var echelle = Math.max(0.7, Math.min(1.2, c.width / 1000));
    var n = Math.round(90 * Math.max(0.6, echelle));
    for (var i = 0; i < n; i++) {
      var feuille = i % 3 === 0;
      // Surtout vers le haut et vers la droite, où est le texte.
      var angle = -Math.PI / 2 + (hasard() - 0.32) * Math.PI * 0.95;
      var v = (380 + hasard() * 620) * echelle;
      pieces.push({
        x: ox + (hasard() - 0.5) * 20,
        y: oy + (hasard() - 0.5) * 12,
        vx: Math.cos(angle) * v * (0.7 + hasard() * 0.9),
        vy: Math.sin(angle) * v,
        rot: hasard() * Math.PI * 2,
        vr: (hasard() - 0.5) * 12,
        flot: hasard() * Math.PI * 2,
        taille: (feuille ? 9 + hasard() * 7 : 5 + hasard() * 5) * echelle,
        feuille: feuille,
        couleur: feuille
          ? VERTS[Math.floor(hasard() * VERTS.length)]
          : VIFS[Math.floor(hasard() * VIFS.length)],
        vie: 0,
        duree: 2.2 + hasard() * 1.4
      });
    }
    if (!rafGerbe) {
      dernier = performance.now();
      rafGerbe = requestAnimationFrame(cadreGerbe);
    }
  }

  var dernier = 0;

  function dessinerFeuille(p) {
    var l = p.taille, h = p.taille * 0.48;
    ctx.beginPath();
    ctx.moveTo(-l, 0);
    ctx.quadraticCurveTo(0, -h * 1.6, l, 0);
    ctx.quadraticCurveTo(0, h * 1.6, -l, 0);
    ctx.fill();
    // La nervure, comme sur les feuilles de l'icône.
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = Math.max(1, l * 0.12);
    ctx.beginPath();
    ctx.moveTo(-l * 0.8, 0);
    ctx.lineTo(l * 0.85, 0);
    ctx.stroke();
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
      // Les feuilles planent, les confettis tombent plus franchement.
      var freinage = p.feuille ? 2.6 : 1.9;
      p.vx -= p.vx * freinage * dt;
      p.vy -= p.vy * freinage * dt;
      p.vy += (p.feuille ? 420 : 620) * dt;
      p.flot += dt * (p.feuille ? 3 : 6);
      p.x += (p.vx + Math.sin(p.flot) * (p.feuille ? 38 : 18)) * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      var reste = p.duree - p.vie;
      if (reste <= 0 || p.y > hauteur + 30) {
        pieces.splice(i, 1);
        continue;
      }
      ctx.setTransform(dpr, 0, 0, dpr, p.x * dpr, p.y * dpr);
      ctx.rotate(p.rot);
      ctx.globalAlpha = borne(reste / 0.5);
      ctx.fillStyle = p.couleur;
      if (p.feuille) {
        dessinerFeuille(p);
      } else {
        // Un confetti vu de biais : sa largeur bat avec la rotation.
        var w = p.taille * (0.35 + 0.65 * Math.abs(Math.cos(p.flot)));
        ctx.fillRect(-w / 2, -p.taille * 0.35, w, p.taille * 0.7);
      }
    }
    ctx.globalAlpha = 1;
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

  // Un clin d'œil de temps en temps, tant que la carte est à l'écran.
  function prochainClin() {
    clearTimeout(minuterie);
    if (!visible || document.hidden) return;
    minuterie = setTimeout(function () {
      cligner();
      prochainClin();
    }, 4200 + (tirage % 3) * 900);
  }

  function entrer() {
    vu = true;
    hote.style.opacity = "0";
    debutPot = performance.now();
    animerPot();
    setTimeout(gerbe, 380);
    cligner(900);
    prochainClin();
  }

  hote.addEventListener("click", function () {
    cligner();
    gerbe();
  });

  if (!window.IntersectionObserver) return;
  // Le pot attend l'entrée dans le champ pour sortir de terre.
  hote.style.opacity = "0";
  new IntersectionObserver(function (entrees) {
    visible = entrees[0].isIntersecting;
    if (visible && !vu) entrer();
    else prochainClin();
  }, { threshold: 0.35 }).observe(carte);

  document.addEventListener("visibilitychange", prochainClin);
  window.addEventListener("resize", function () { if (!rafGerbe) mesurer(); });
})();
