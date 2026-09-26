/* Disque Bleu : le disque de l'application, qu'on tourne du doigt.

   Transcription de `lib/widgets/parking_disc_painter.dart` (dépôt disquebleu),
   peintre par peintre et dans le même ordre de calques :

     1. le fond blanc du disque, fixe ;
     2. la durée autorisée, un secteur orange à 40 %, fixe lui aussi : il part
        de la flèche et remonte dans le sens inverse des aiguilles ;
     3. le cadran, qui tourne : graduations, heures 13 à 24 au bord, 1 à 12
        en grand, chacune retournée pour se lire la tête en bas ;
     4. le couvercle bleu, percé de la fenêtre en croissant, avec les trois
        libellés, la flèche et le carré P.

   Toutes les cotes sont en fractions du rayon, comme dans l'app ; elles sont
   recopiées avec leurs valeurs. Le geste aussi : l'angle sous le doigt donne
   l'heure (un tour, douze heures), le lancer continue sur une simulation de
   frottement de coefficient 0,15, et le passage de chaque demi-heure fait
   un cran, que le téléphone rend en vibration là où il le sait.

   Ce qui change : l'app affiche la confirmation au début du stationnement,
   ici elle vient au relâchement. L'heure qu'elle donne suit la règle suisse
   de l'app (`_calculateDiscSettingTime`, un pas de 30 minutes) : toujours la
   demi-heure suivante, jamais celle en cours. */

const BLEU = "#1565c0";
const ORANGE = "rgba(255, 152, 0, 0.4)";
const LIBELLES = ["Ankunftszeit", "Heure d'arrivée", "Ora d'arrivo"];
const DUREE_H = 1; // Suisse : 60 minutes (country.dart)
const FROTTEMENT = 0.15;
const POLICE = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

/** L'heure de Suisse à l'ouverture, en heures décimales. */
function heureDeSuisse() {
  try {
    const p = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Zurich", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(new Date());
    const h = Number(p.find((x) => x.type === "hour").value);
    const m = Number(p.find((x) => x.type === "minute").value);
    if (Number.isFinite(h + m)) return h + m / 60;
  } catch (e) {
    /* sans fuseaux, l'heure locale */
  }
  const d = new Date();
  return d.getHours() + d.getMinutes() / 60;
}

/** L'heure à régler : la demi-heure suivante (parking_service.dart). */
function heureAReguler(h) {
  let heure = Math.floor(h);
  let minute = Math.round((h - heure) * 60);
  if (minute === 60) { heure += 1; minute = 0; }
  let suivante = (Math.floor(minute / 30) + 1) * 30;
  if (suivante >= 60) { suivante -= 60; heure += 1; }
  heure %= 24;
  return `${String(heure).padStart(2, "0")}:${String(suivante).padStart(2, "0")}`;
}

function normalise(h) {
  const n = h % 24;
  return n < 0 ? n + 24 : n;
}

export function monte(scene, { calme }) {
  const toile = document.createElement("canvas");
  toile.setAttribute("aria-hidden", "true");
  scene.prepend(toile);
  const g = toile.getContext("2d");
  const confirmation = scene.dataset.libelle || "";

  let heure = heureDeSuisse();
  let w = 0, h = 0, dpr = 1;
  let R = 0, cx = 0, cy = 0;

  /* ------------------------------------------------------------------ *
   * La mise en page de l'app : rayon et centre (LayoutBuilder)
   * ------------------------------------------------------------------ */

  function mesure() {
    const r = scene.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width;
    h = r.height;
    toile.width = Math.round(w * dpr);
    toile.height = Math.round(h * dpr);
    // Le disque ne dépasse pas 96 % de la largeur, et le contenu visible
    // (du haut des libellés au bas du P) tient dans 1,9 rayon de haut.
    R = Math.max(1, Math.min((w * 0.96) / 2, h / 1.9));
    // Le centre du disque remonte de 0,63 R pour centrer ce contenu.
    cx = w / 2;
    cy = h / 2 - R * 0.63;
  }

  /* ------------------------------------------------------------------ *
   * Les peintres
   * ------------------------------------------------------------------ */

  function secteur() {
    // _HighlightPainter : de la flèche (en bas, π/2), à rebours.
    const balayage = -(DUREE_H * 30 * Math.PI) / 180;
    g.save();
    g.beginPath();
    g.arc(cx, cy, R - 2, 0, Math.PI * 2);
    g.clip();
    g.beginPath();
    g.moveTo(cx, cy);
    g.arc(cx, cy, R * 1.3, Math.PI / 2, Math.PI / 2 + balayage, balayage < 0);
    g.closePath();
    g.fillStyle = ORANGE;
    g.fill();
    g.lineWidth = 1;
    g.strokeStyle = ORANGE;
    g.stroke();
    g.restore();
  }

  function cadran() {
    // _HoursPainter, dans le repère tourné du disque.
    const r = R - 1;
    const angle = ((heure % 12) * 30 * Math.PI) / 180 + Math.PI;
    g.save();
    g.translate(cx, cy);
    g.rotate(angle);
    g.strokeStyle = "#000";
    g.lineCap = "round";
    for (let i = 0; i < 24; i++) {
      const pleine = i % 2 === 0;
      const deg = pleine ? -((i / 2 + 1) * 30) - 90 : -((i - 1) / 2 * 30 + 15) - 90;
      const a = (deg * Math.PI) / 180;
      g.lineWidth = r * (pleine ? 0.025 : 0.012);
      g.beginPath();
      g.moveTo(r * 0.52 * Math.cos(a), r * 0.52 * Math.sin(a));
      g.lineTo(r * 0.42 * Math.cos(a), r * 0.42 * Math.sin(a));
      g.stroke();
    }
    g.fillStyle = "#000";
    g.textAlign = "center";
    g.textBaseline = "middle";
    const heures = (de, a, rayon, corps) => {
      g.font = `bold ${corps}px ${POLICE}`;
      for (let n = de; n <= a; n++) {
        const h12 = n <= 12 ? n : n - 12;
        const deg = -(h12 * 30) - 90;
        const rad = (deg * Math.PI) / 180;
        g.save();
        g.translate(rayon * Math.cos(rad), rayon * Math.sin(rad));
        g.rotate(rad + Math.PI / 2 + Math.PI);
        g.fillText(String(n), 0, 0);
        g.restore();
      }
    };
    heures(13, 24, r * 0.87, r * 0.085);
    heures(1, 12, r * 0.69, r * 0.22);
    g.restore();
  }

  function fenetre() {
    // _buildCrescentWindow, cote pour cote.
    const haut = R * 0.42;
    const demiLargeur = R * 0.92;
    const basY = cy + R * 0.98;
    const fleche = R * 0.14;
    const a = (44 * Math.PI) / 180;
    const rayonBas = (demiLargeur ** 2 + fleche ** 2) / (2 * fleche);
    const centreBasY = basY + fleche - rayonBas;
    const dy = rayonBas - fleche;
    const p = new Path2D();
    p.arc(cx, cy, haut, Math.PI - a, a, true);
    p.arc(cx, centreBasY, rayonBas, Math.atan2(dy, demiLargeur), Math.atan2(dy, -demiLargeur), false);
    p.closePath();
    return p;
  }

  function couvercle(fondu) {
    const p = new Path2D();
    p.rect(0, 0, w, h);
    p.addPath(fenetre());
    g.fillStyle = BLEU;
    g.fill(p, "evenodd");

    const flecheTaille = R * 0.12;
    const pointe = cy + R * 0.35 - R * 0.1;

    // Les trois libellés, qui s'effacent devant la confirmation.
    if (fondu < 1) {
      const corps = R * 0.11;
      const interligne = corps * 1.3;
      const y0 = pointe - flecheTaille - interligne * LIBELLES.length;
      g.font = `600 ${corps}px ${POLICE}`;
      g.textAlign = "center";
      g.textBaseline = "top";
      g.fillStyle = `rgba(255,255,255,${1 - fondu})`;
      if ("letterSpacing" in g) g.letterSpacing = "0.5px";
      LIBELLES.forEach((t, i) => g.fillText(t, cx, y0 + i * interligne));
      if ("letterSpacing" in g) g.letterSpacing = "0px";
    }

    // La confirmation : le libellé, puis l'heure dans une pastille blanche.
    if (fondu > 0 && dernierReglage) {
      const corpsHeure = R * 0.2;
      g.font = `bold ${corpsHeure}px ${POLICE}`;
      const lw = g.measureText(dernierReglage).width;
      const pw = lw + R * 0.12;
      const ph = corpsHeure * 1.2 + R * 0.04;
      const bas = pointe - flecheTaille - R * 0.05;
      const top = bas - ph;
      g.fillStyle = `rgba(255,255,255,${fondu})`;
      g.beginPath();
      g.roundRect(cx - pw / 2, top, pw, ph, ph / 2);
      g.fill();
      g.fillStyle = `rgba(21,101,192,${fondu})`;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(dernierReglage, cx, top + ph / 2 + corpsHeure * 0.04);
      g.font = `500 ${R * 0.09}px ${POLICE}`;
      g.textBaseline = "bottom";
      g.fillStyle = `rgba(255,255,255,${0.9 * fondu})`;
      g.fillText(confirmation, cx, top - R * 0.03);
    }

    // La flèche, pointe en bas.
    g.fillStyle = "#fff";
    g.beginPath();
    g.moveTo(cx, pointe + flecheTaille);
    g.lineTo(cx - flecheTaille / 2, pointe);
    g.lineTo(cx + flecheTaille / 2, pointe);
    g.closePath();
    g.fill();

    // Le carré P, sous la fenêtre.
    const cote = R * 0.42;
    const y = cy + R * 0.92 + R * 0.22;
    g.strokeStyle = "#fff";
    g.lineWidth = R * 0.015;
    g.strokeRect(cx - cote / 2, y, cote, cote);
    g.font = `bold ${cote * 0.7}px ${POLICE}`;
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.fillText("P", cx, y + cote / 2 + cote * 0.03);
  }

  let fondu = 0;
  function peins() {
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    g.fillStyle = "#fff";
    g.beginPath();
    g.arc(cx, cy, R - 1, 0, Math.PI * 2);
    g.fill();
    secteur();
    cadran();
    couvercle(fondu);
  }

  /* ------------------------------------------------------------------ *
   * Le geste : rotation au doigt, élan, crans
   * ------------------------------------------------------------------ */

  let angleAvant = null;
  let echantillons = [];
  let cran = null;
  let elan = null; // { x0, v, t0 }
  let dernierReglage = "";
  let confirmeA = 0; // instant où la confirmation a commencé à paraître
  let raf = 0;
  let actif = false;

  const vibre = (ms) => {
    if (navigator.vibrate) {
      try { navigator.vibrate(ms); } catch (e) { /* refusé : tant pis */ }
    }
  };

  function passeCran(fort) {
    const pas = Math.floor(heure * 2);
    if (cran !== null && pas !== cran) vibre(fort ? 12 : 6);
    cran = pas;
  }

  function position(e) {
    const r = scene.getBoundingClientRect();
    return [e.clientX - r.left - cx, e.clientY - r.top - cy];
  }

  scene.addEventListener("pointerdown", (e) => {
    elan = null;
    fondu = 0;
    dernierReglage = "";
    const [x, y] = position(e);
    angleAvant = Math.atan2(y, x);
    echantillons = [[performance.now(), e.clientX, e.clientY, x, y]];
    cran = Math.floor(heure * 2);
    try { scene.setPointerCapture(e.pointerId); } catch (err) { /* sans capture */ }
    anime();
  });

  scene.addEventListener("pointermove", (e) => {
    if (angleAvant === null) return;
    const [x, y] = position(e);
    const angle = Math.atan2(y, x);
    let delta = angle - angleAvant;
    if (delta > Math.PI) delta -= 2 * Math.PI;
    if (delta < -Math.PI) delta += 2 * Math.PI;
    heure = normalise(heure + (delta * 6) / Math.PI);
    angleAvant = angle;
    const t = performance.now();
    echantillons.push([t, e.clientX, e.clientY, x, y]);
    while (echantillons.length > 2 && t - echantillons[0][0] > 100) echantillons.shift();
    passeCran(true);
    anime();
  });

  const lache = () => {
    if (angleAvant === null) return;
    angleAvant = null;
    // La vitesse du doigt, projetée sur la tangente, rapportée à l'anneau des
    // heures (0,75 R) plutôt qu'à la distance réelle du doigt : c'est ce que
    // fait l'app, pour qu'un geste tiré tout droit lance quand même le disque.
    let v = 0;
    const a = echantillons[0];
    const b = echantillons[echantillons.length - 1];
    const dt = (b[0] - a[0]) / 1000;
    if (dt > 0.008) {
      const vx = (b[1] - a[1]) / dt;
      const vy = (b[2] - a[2]) / dt;
      const d = Math.hypot(b[3], b[4]);
      if (d > 10) {
        const vt = vy * (b[3] / d) - vx * (b[4] / d);
        v = ((vt / (R * 0.75)) * 6) / Math.PI * 1.1;
      }
    }
    if (!calme && Math.abs(v) > 0.1 && performance.now() - b[0] < 80) {
      elan = { x0: heure, v, t0: performance.now() };
    } else {
      regle();
    }
    anime();
  };
  scene.addEventListener("pointerup", lache);
  scene.addEventListener("pointercancel", lache);

  // Au clavier : les flèches tournent d'une demi-heure, comme un cran.
  scene.addEventListener("keydown", (e) => {
    const sens = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1 }[e.key];
    if (!sens) return;
    e.preventDefault();
    elan = null;
    heure = normalise(heure + sens * 0.5);
    regle();
    anime();
  });

  function regle() {
    elan = null;
    dernierReglage = heureAReguler(heure);
    confirmeA = performance.now();
    scene.setAttribute("aria-valuetext", dernierReglage);
  }

  function cadre(now) {
    raf = 0;
    let encore = angleAvant !== null;
    if (elan) {
      // FrictionSimulation : x(t) = x0 + v (k^t - 1) / ln k, v(t) = v k^t.
      const t = (now - elan.t0) / 1000;
      const k = FROTTEMENT;
      heure = normalise(elan.x0 + (elan.v * (Math.pow(k, t) - 1)) / Math.log(k));
      passeCran(false);
      if (Math.abs(elan.v * Math.pow(k, t)) < 0.02) regle();
      else encore = true;
    }
    if (dernierReglage) {
      // 500 ms pour paraître, trois secondes à l'écran, 500 ms pour partir.
      const t = now - confirmeA;
      fondu = calme
        ? (t < 3500 ? 1 : 0)
        : t < 500 ? t / 500 : t < 3500 ? 1 : Math.max(0, 1 - (t - 3500) / 500);
      if (t < 4000) encore = true;
      else dernierReglage = "";
    } else {
      fondu = 0;
    }
    peins();
    if (encore && actif) raf = requestAnimationFrame(cadre);
  }

  function anime() {
    if (!raf && actif) raf = requestAnimationFrame(cadre);
  }

  const suit = new ResizeObserver(() => {
    mesure();
    peins();
  });

  scene.setAttribute("aria-valuetext", heureAReguler(heure));

  return {
    demarre() {
      if (actif) return;
      actif = true;
      suit.observe(scene);
      mesure();
      peins();
    },
    arrete() {
      actif = false;
      suit.disconnect();
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    },
  };
}
