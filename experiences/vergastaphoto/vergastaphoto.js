/* Vergasta Photo : la sphère des collections.

   Transcription de `src/lib/image-sphere/engine.ts` (dépôt photo), constantes
   comprises. Le portfolio la dessine avec three.js ; ici elle est en Canvas
   2D, et ce n'est pas une approximation. Chaque photo y est un plan qui fait
   toujours face à la caméra (son orientation est l'inverse de celle de la
   sphère) : projeté en perspective, un tel plan est un simple rectangle
   agrandi ou réduit. Le calcul ci-dessous donne donc la même image que le
   moteur WebGL, sans ses 150 Ko de bibliothèque.

   Le reste est repris tel quel : la sphère de rayon 180 (±40), la rotation
   lente sur deux axes, le glisser avec son inertie de 0,94, le survol qui
   grossit de 20 %, le clic qui amène la photo au centre sur 62 % de la
   hauteur et estompe les autres à 16 %, la légende des réglages, Échap pour
   revenir.

   Les 24 photos sont celles de la collection « Japon 2025 », réduites à
   480 pixels : à la taille d'une carte, le portfolio n'en montre pas plus. */

const RAYON = 180;
const PLAN = 50;
const AUTO_Y = 0.0005;
const AUTO_X = 0.0002;
const GLISSE = 0.2;
const SURVOL = 1.2;
const ECHELLE_EASE = 0.1;
const OPACITE_EASE = 0.12;
const INERTIE = 0.94;
const LANCER = 0.9;
const CLIC = 6;
const FOCUS_EASE = 0.14;
const FOCUS_DISTANCE = 300;
const FOCUS_FILL = 0.62;
const FOCUS_FILL_X = 0.88;
const ESTOMPE = 0.16;
const FOV = 25;
const CAMERA = 520;

// Fichier, focale, ouverture, vitesse, sensibilité : les champs du portfolio.
const PHOTOS = [
  ["DSCF0451.webp", "30.5 mm", "f/7.1", "1/80s", "ISO 125"],
  ["DSCF0454.webp", "50 mm", "f/4.8", "1/250s", "ISO 1250"],
  ["DSCF0457.webp", "50 mm", "f/4.8", "1/250s", "ISO 640"],
  ["DSCF0465.webp", "35.3 mm", "f/3.9", "1/250s", "ISO 640"],
  ["DSCF0491.webp", "43.2 mm", "f/13.0", "1/150s", "ISO 125"],
  ["DSCF0492.webp", "50 mm", "f/13.0", "1/75s", "ISO 125"],
  ["DSCF0494.webp", "28.7 mm", "f/13.0", "1/40s", "ISO 320"],
  ["DSCF0529.webp", "50 mm", "f/4.8", "1/40s", "ISO 3200"],
  ["DSCF0564.webp", "28.7 mm", "f/3.6", "1/30s", "ISO 400"],
  ["DSCF0566.webp", "28.7 mm", "f/3.6", "1/30s", "ISO 400"],
  ["DSCF0592.webp", "29.6 mm", "f/3.6", "1/250s", "ISO 1250"],
  ["DSCF0794.webp", "16 mm", "f/2.8", "1/50s", "ISO 125"],
  ["DSCF0802.webp", "16 mm", "f/2.8", "1/70s", "ISO 125"],
  ["DSCF0808.webp", "50 mm", "f/4.8", "1/680s", "ISO 125"],
  ["DSCF0824.webp", "37.4 mm", "f/8.0", "1/200s", "ISO 125"],
  ["DSCF0839.webp", "29.6 mm", "f/8.0", "1/350s", "ISO 125"],
  ["DSCF0896.webp", "29.6 mm", "f/3.6", "1/180s", "ISO 125"],
  ["DSCF0940.webp", "29.6 mm", "f/3.6", "1/60s", "ISO 125"],
  ["DSCF0995.webp", "48.6 mm", "f/4.8", "1/75s", "ISO 1000"],
  ["DSCF1005.webp", "23.4 mm", "f/3.4", "1/1250s", "ISO 125"],
  ["DSCF1026.webp", "50 mm", "f/4.8", "1/750s", "ISO 125"],
  ["DSCF1033.webp", "44.5 mm", "f/5.6", "1/480s", "ISO 125"],
  ["DSCF1122.webp", "50 mm", "f/4.8", "1/110s", "ISO 125"],
  ["DSCF1139.webp", "27.9 mm", "f/3.6", "1/250s", "ISO 125"],
];

export function monte(scene, { calme }) {
  const toile = document.createElement("canvas");
  toile.setAttribute("aria-hidden", "true");
  scene.prepend(toile);
  const g = toile.getContext("2d");
  const legende = scene.querySelector(".sphere-legende");
  const dossier = new URL("./photos/", import.meta.url);

  const tanDemi = Math.tan((FOV * Math.PI) / 360);
  let w = 1, h = 1, dpr = 1;

  const plans = PHOTOS.map(([fichier, focale, ouverture, vitesse, iso]) => {
    const img = new Image();
    img.decoding = "async";
    const plan = {
      img, pret: false, aspect: 1, survol: false,
      opacite: 0, focus: 0, echelle: 0.8,
      exif: [focale, ouverture, vitesse, iso].filter(Boolean).join(" · "),
      // La même répartition que le moteur : un angle, un azimut, un rayon.
      home: (() => {
        const phi = (Math.random() * 2 - 1) * Math.PI;
        const theta = Math.random() * Math.PI * 2;
        const r = RAYON + (Math.random() - 0.5) * 80;
        return [r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi)];
      })(),
      monde: [0, 0, 0],
      ecran: null,
    };
    img.onload = () => {
      plan.pret = true;
      plan.aspect = (img.naturalWidth || 1) / (img.naturalHeight || 1);
      if (!actif) peins();
    };
    img.src = new URL(fichier, dossier).href;
    return plan;
  });

  let rotX = 0, rotY = 0, courX = 0, courY = 0, baseX = 0, baseY = 0;
  let tire = false, departX = 0, departY = 0, basX = 0, basY = 0;
  let velX = 0, velY = 0, dernierDX = 0, dernierDY = 0;
  let souris = null;
  let focus = null;
  let raf = 0;
  let actif = false;
  let avant = 0;

  function mesure() {
    const r = scene.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.max(1, r.width);
    h = Math.max(1, r.height);
    toile.width = Math.round(w * dpr);
    toile.height = Math.round(h * dpr);
  }

  // La rotation de la sphère, dans l'ordre d'Euler de three.js (XYZ) : on
  // tourne d'abord autour de y, puis autour de x.
  function tourne(p, ax, ay) {
    const [x, y, z] = p;
    const cy = Math.cos(ay), sy = Math.sin(ay);
    const x1 = x * cy + z * sy;
    const z1 = -x * sy + z * cy;
    const cx = Math.cos(ax), sx = Math.sin(ax);
    return [x1, y * cx - z1 * sx, y * sx + z1 * cx];
  }

  function echelleFocus(aspect) {
    const vueH = 2 * FOCUS_DISTANCE * tanDemi;
    const vueW = vueH * (w / h);
    return Math.min((vueH * FOCUS_FILL) / PLAN, (vueW * FOCUS_FILL_X) / (PLAN * Math.max(aspect, 0.01)));
  }

  function projette(plan) {
    const [x, y, z] = plan.monde;
    const d = CAMERA - z;
    if (d <= 1) return null;
    const k = h / 2 / (d * tanDemi);
    const ph = PLAN * plan.echelle * k;
    const pw = ph * plan.aspect;
    const sx = w / 2 + x * k;
    const sy = h / 2 - y * k;
    return [sx - pw / 2, sy - ph / 2, pw, ph];
  }

  function vise() {
    if (!souris) return null;
    // Le premier plan touché, du plus proche au plus lointain.
    const ordre = plans.filter((p) => p.pret && p.ecran).sort((a, b) => b.monde[2] - a.monde[2]);
    for (const p of ordre) {
      const [x, y, pw, ph] = p.ecran;
      if (souris[0] >= x && souris[0] <= x + pw && souris[1] >= y && souris[1] <= y + ph) return p;
    }
    return null;
  }

  function accordeLegende() {
    if (!focus) {
      scene.classList.remove("a-une-photo");
      return;
    }
    legende.textContent = focus.exif;
    scene.classList.toggle("a-une-photo", Boolean(focus.exif));
  }

  function avance(pas) {
    if (!tire && (velX || velY)) {
      rotY += velY * pas;
      rotX += velX * pas;
      const f = Math.pow(INERTIE, pas);
      velX *= f;
      velY *= f;
      if (Math.abs(velX) < 0.01) velX = 0;
      if (Math.abs(velY) < 0.01) velY = 0;
    }
    if (!calme) {
      baseY += AUTO_Y * pas;
      baseX += AUTO_X * pas;
    }
    const lisse = (e) => (calme ? 1 : 1 - Math.pow(1 - e, pas));
    courX += (rotX - courX) * lisse(GLISSE);
    courY += (rotY - courY) * lisse(GLISSE);
    const ax = baseX + courX * 0.002;
    const ay = baseY + courY * 0.002;

    const cible = !tire && !focus ? vise() : null;
    for (const p of plans) p.survol = p === cible;

    const centre = [0, 0, CAMERA - FOCUS_DISTANCE];
    for (const p of plans) {
      if (!p.pret) continue;
      const f = p.focus + ((p === focus ? 1 : 0) - p.focus) * lisse(FOCUS_EASE);
      p.focus = f;
      const m = tourne(p.home, ax, ay);
      p.monde = [m[0] + (centre[0] - m[0]) * f, m[1] + (centre[1] - m[1]) * f, m[2] + (centre[2] - m[2]) * f];
      const zEchelle = 0.8 + p.monde[2] / 2000;
      let but = p.survol ? zEchelle * SURVOL : zEchelle;
      but += (echelleFocus(p.aspect) - but) * f;
      p.echelle += (but - p.echelle) * lisse(ECHELLE_EASE);
      const voulue = focus ? ESTOMPE + (1 - ESTOMPE) * f : 1;
      p.opacite += (voulue - p.opacite) * lisse(OPACITE_EASE);
    }
  }

  function peins() {
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    g.imageSmoothingQuality = "high";
    const ordre = plans
      .filter((p) => p.pret)
      .sort((a, b) => (a.focus > 0.5) - (b.focus > 0.5) || a.monde[2] - b.monde[2]);
    for (const p of ordre) {
      p.ecran = projette(p);
      if (!p.ecran || p.opacite <= 0.002) continue;
      g.globalAlpha = Math.min(1, p.opacite);
      g.drawImage(p.img, ...p.ecran);
    }
    g.globalAlpha = 1;
  }

  function cadre(now) {
    raf = 0;
    if (!actif) return;
    const pas = Math.min(3, (now - avant) / (1000 / 60));
    avant = now;
    avance(pas);
    peins();
    raf = requestAnimationFrame(cadre);
  }

  /* Le geste --------------------------------------------------------- */

  const local = (e) => {
    const r = scene.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };

  scene.addEventListener("pointerdown", (e) => {
    tire = true;
    departX = basX = e.clientX;
    departY = basY = e.clientY;
    velX = velY = dernierDX = dernierDY = 0;
    try { scene.setPointerCapture(e.pointerId); } catch (err) { /* sans capture */ }
  });

  scene.addEventListener("pointermove", (e) => {
    souris = local(e);
    if (!tire) return;
    const dx = e.clientX - departX;
    const dy = e.clientY - departY;
    // Glisser à droite révèle la gauche, comme le globe du portfolio.
    rotY += dx;
    rotX += dy;
    dernierDX = dx;
    dernierDY = dy;
    departX = e.clientX;
    departY = e.clientY;
  });

  const lache = (e) => {
    if (!tire) return;
    tire = false;
    velY = calme ? 0 : dernierDX * LANCER;
    velX = calme ? 0 : dernierDY * LANCER;
    if (Math.hypot(e.clientX - basX, e.clientY - basY) <= CLIC) {
      velX = velY = 0;
      souris = local(e);
      const touche = vise();
      focus = focus ? (touche === focus ? null : touche) : touche;
      accordeLegende();
    }
  };
  scene.addEventListener("pointerup", lache);
  scene.addEventListener("pointercancel", () => { tire = false; });
  scene.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") souris = null; });

  const echap = (e) => {
    if (e.key === "Escape" && focus) {
      focus = null;
      accordeLegende();
    }
  };

  const suit = new ResizeObserver(() => { mesure(); peins(); });

  return {
    demarre() {
      if (actif) return;
      actif = true;
      suit.observe(scene);
      mesure();
      window.addEventListener("keydown", echap);
      avant = performance.now();
      raf = requestAnimationFrame(cadre);
    },
    arrete() {
      actif = false;
      suit.disconnect();
      window.removeEventListener("keydown", echap);
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    },
  };
}
