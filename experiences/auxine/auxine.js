/* Auxine : le pot qui sort de terre, cligne de l'œil et lance sa gerbe.

   Le même code que la bannière de sortie (`lancement/lancement.js`), rendu à
   une scène : mêmes images, mêmes temps de clin que l'écran d'ouverture de
   l'app, même gerbe tirée d'un générateur à graine. Il vit ici en copie pour
   que la page ne dépende pas de la bannière, qui partira après l'événement.

   Deux écarts, tous deux dus au cadre : la gerbe reste dans la scène au lieu
   de déborder de la carte, et le pot ressort de terre à chaque retour à
   l'écran plutôt qu'une seule fois. En mouvement réduit, le pot est posé et
   un clic le fait seulement cligner. */

// La zone de l'œil dans l'image du pot, de 1024 px (auxine/launch.js).
const OEIL = [497, 614, 176, 176];
// Les temps de l'app, rapportés au début du clin.
const CLIN = [[0, 0], [40, 1], [80, 2], [240, 1], [280, 0], [320, -1]];
// Les verts des feuilles du pot, puis le jaune, l'orange, le bleu et le lilas
// des blocs de la page d'Auxine, et du blanc.
const VERTS = ["#48e06f", "#2fc95b", "#8af0a3"];
const VIFS = ["#ffe14d", "#ff7b45", "#5db7ff", "#b9a3ff", "#ffffff"];

const borne = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const sortie = (t) => 1 - Math.pow(1 - t, 3);
// L'élastique de l'app, pour le pot qui se ramasse et se redresse.
function elastique(t) {
  if (t <= 0 || t >= 1) return t;
  const p = 0.4;
  return Math.pow(2, -10 * t) * Math.sin(((t - p / 4) * 2 * Math.PI) / p) + 1;
}
// Un petit dépassement pour la sortie de terre.
function ressort(t) {
  const c = 1.9;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
}
function graine(n) {
  let a = n >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function monte(scene, { calme }) {
  const hote = scene.querySelector(".xp-pot");
  const pot = hote.querySelector(".pot");
  const toile = document.createElement("canvas");
  toile.setAttribute("aria-hidden", "true");
  scene.appendChild(toile);
  const ctx = toile.getContext("2d");

  const base = pot.src.replace(/pot\.webp(\?.*)?$/, "");
  const clins = ["clin_50.webp", "clin_85.webp", "clin_100.webp"].map((f) => {
    const img = new Image();
    img.src = base + f;
    img.alt = "";
    img.style.cssText =
      `left:${OEIL[0] / 10.24}%;top:${OEIL[1] / 10.24}%;` +
      `width:${OEIL[2] / 10.24}%;height:${OEIL[3] / 10.24}%;visibility:hidden`;
    hote.appendChild(img);
    return img;
  });

  /* Le pot ---------------------------------------------------------- */

  let debutPot = null;
  let debutClin = null;
  let rafPot = 0;

  function cadrePot(now) {
    rafPot = 0;
    let entree = 1;
    let presse = 0;
    if (debutPot !== null) {
      const e = now - debutPot;
      entree = ressort(borne(e / 620));
      hote.style.opacity = e < 620 ? String(borne(e / 180)) : "";
    }
    let image = -1;
    if (debutClin !== null) {
      const c = now - debutClin;
      CLIN.forEach((s) => { if (c >= s[0]) image = s[1]; });
      if (!calme) presse = sortie(borne(c / 90)) * (1 - elastique(borne((c - 240) / 520)));
      if (c > 800) debutClin = null;
    }
    clins.forEach((img, i) => { img.style.visibility = i === image ? "visible" : "hidden"; });
    const s = 0.55 + 0.45 * entree;
    hote.style.transform =
      `translateY(${((1 - entree) * 18).toFixed(2)}%) ` +
      `scale(${(s * (1 + 0.035 * presse)).toFixed(4)},${(s * (1 - 0.05 * presse)).toFixed(4)})`;
    if ((debutPot !== null && now - debutPot < 700) || debutClin !== null) {
      rafPot = requestAnimationFrame(cadrePot);
    } else {
      debutPot = null;
      hote.style.transform = "";
    }
  }

  const animerPot = () => { if (!rafPot) rafPot = requestAnimationFrame(cadrePot); };
  let attenteClin = 0;
  function cligner(delai) {
    clearTimeout(attenteClin);
    attenteClin = setTimeout(() => {
      debutClin = performance.now();
      animerPot();
    }, delai || 0);
  }

  /* La gerbe -------------------------------------------------------- */

  let pieces = [];
  let rafGerbe = 0;
  let tirage = 1;
  let dpr = 1;
  let dernier = 0;

  function mesurer() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(toile.clientWidth * dpr);
    const h = Math.round(toile.clientHeight * dpr);
    if (toile.width !== w || toile.height !== h) {
      toile.width = w;
      toile.height = h;
    }
  }

  function gerbe() {
    mesurer();
    const hasard = graine(tirage++ * 7919);
    const c = toile.getBoundingClientRect();
    const p = hote.getBoundingClientRect();
    // Le départ : le haut des feuilles du pot.
    const ox = p.left - c.left + p.width * 0.52;
    const oy = p.top - c.top + p.height * 0.28;
    const echelle = Math.max(0.55, Math.min(1, c.width / 700));
    const n = Math.round(80 * Math.max(0.6, echelle));
    for (let i = 0; i < n; i++) {
      const feuille = i % 3 === 0;
      const angle = -Math.PI / 2 + (hasard() - 0.5) * Math.PI * 0.95;
      const v = (300 + hasard() * 520) * echelle;
      pieces.push({
        x: ox + (hasard() - 0.5) * 20,
        y: oy + (hasard() - 0.5) * 12,
        vx: Math.cos(angle) * v * (0.7 + hasard() * 0.9),
        vy: Math.sin(angle) * v,
        rot: hasard() * Math.PI * 2,
        vr: (hasard() - 0.5) * 12,
        flot: hasard() * Math.PI * 2,
        taille: (feuille ? 9 + hasard() * 7 : 5 + hasard() * 5) * echelle,
        feuille,
        couleur: feuille ? VERTS[Math.floor(hasard() * VERTS.length)] : VIFS[Math.floor(hasard() * VIFS.length)],
        vie: 0,
        duree: 2.2 + hasard() * 1.4,
      });
    }
    if (!rafGerbe) {
      dernier = performance.now();
      rafGerbe = requestAnimationFrame(cadreGerbe);
    }
  }

  function dessinerFeuille(p) {
    const l = p.taille;
    const h = p.taille * 0.48;
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
    const dt = Math.min(0.05, (now - dernier) / 1000);
    dernier = now;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, toile.width, toile.height);
    const hauteur = toile.height / dpr;
    for (let i = pieces.length - 1; i >= 0; i--) {
      const p = pieces[i];
      p.vie += dt;
      // Les feuilles planent, les confettis tombent plus franchement.
      const freinage = p.feuille ? 2.6 : 1.9;
      p.vx -= p.vx * freinage * dt;
      p.vy -= p.vy * freinage * dt;
      p.vy += (p.feuille ? 420 : 620) * dt;
      p.flot += dt * (p.feuille ? 3 : 6);
      p.x += (p.vx + Math.sin(p.flot) * (p.feuille ? 38 : 18)) * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      const reste = p.duree - p.vie;
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
        const w = p.taille * (0.35 + 0.65 * Math.abs(Math.cos(p.flot)));
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

  /* Mise en route --------------------------------------------------- */

  let actif = false;
  let minuterie = 0;
  let sorti = false;

  function prochainClin() {
    clearTimeout(minuterie);
    if (!actif || calme) return;
    minuterie = setTimeout(() => {
      cligner();
      prochainClin();
    }, 4200 + (tirage % 3) * 900);
  }

  hote.addEventListener("click", () => {
    cligner();
    if (!calme) gerbe();
  });

  return {
    demarre() {
      if (actif) return;
      actif = true;
      if (!calme && !sorti) {
        sorti = true;
        hote.style.opacity = "0";
        debutPot = performance.now();
        animerPot();
        setTimeout(gerbe, 380);
        cligner(900);
      }
      prochainClin();
    },
    arrete() {
      actif = false;
      clearTimeout(minuterie);
      // Hors de l'écran, le pot rentre en terre : il en ressortira au retour.
      if (!calme && !rafGerbe) sorti = false;
    },
  };
}
