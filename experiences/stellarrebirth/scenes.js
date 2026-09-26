/* ─────────────────────────────────────────────────────────────────────────
   Les sept scènes du prologue, portées telles quelles depuis l'application.

   Ce fichier ne réinvente rien. C'est la troisième transcription des mêmes
   peintres : `lib/features/reader/scenes/sr_scene.dart` les dessine à
   l'écran, `tools/video/scenes.py` les rejoue pour la bande-annonce, et
   celle-ci les rejoue pour la page. Mêmes positions des cinq galaxies, même
   spirale à deux bras, même étoile à quatre branches, mêmes rampes de
   progression, aux mêmes valeurs.

   Ce qui change est l'horloge. Dans l'application, la progression vient du
   pouce du lecteur ; dans le film, du temps qui passe ; ici, du défilement.
   ───────────────────────────────────────────────────────────────────────── */

(() => {
  "use strict";

  // ── Le ciel, identique à `_Sky` ────────────────────────────────────────
  const ZETA = [0.500, 0.26];
  const ALPHA = [0.130, 0.68];
  const BETA = [0.375, 0.76];
  const GAMMA = [0.625, 0.76];
  const DELTA = [0.870, 0.68];
  const RING = [[ALPHA, "ALPHA"], [BETA, "BETA"], [GAMMA, "GAMMA"], [DELTA, "DELTA"]];

  const ramp = (t, a, b) => Math.min(Math.max((t - a) / (b - a), 0), 1);
  const TAU = Math.PI * 2;

  /** Le trait, dans la boîte de la scène. Une seule encre, un seul calque. */
  class Pen {
    constructor(ctx, w, h, ink) {
      this.ctx = ctx;
      this.bx = 0;
      this.by = 0;
      this.bw = w;
      this.bh = h;
      this.unit = w;
      this.lw = Math.max(1, this.unit * 0.0031);
      this.ink = ink;
    }

    ton(alpha) {
      return `rgba(${this.ink[0]}, ${this.ink[1]}, ${this.ink[2]}, ${Math.min(Math.max(alpha, 0), 1)})`;
    }

    at(f) {
      return [this.bx + f[0] * this.bw, this.by + f[1] * this.bh];
    }

    trace(points, alpha, width) {
      if (points.length < 2) return;
      const c = this.ctx;
      c.beginPath();
      c.moveTo(points[0][0], points[0][1]);
      for (let i = 1; i < points.length; i++) c.lineTo(points[i][0], points[i][1]);
      c.strokeStyle = this.ton(alpha);
      c.lineWidth = width || this.lw;
      c.lineJoin = "round";
      c.lineCap = "round";
      c.stroke();
    }

    disque(centre, r, alpha) {
      const c = this.ctx;
      c.beginPath();
      c.arc(centre[0], centre[1], r, 0, TAU);
      c.fillStyle = this.ton(alpha);
      c.fill();
    }

    // ── le vocabulaire ───────────────────────────────────────────────────

    /** Une spirale à deux bras, tracée de son cœur vers l'extérieur. */
    galaxy(centre, radius, { grown = 1, alive = 1, spin = 0 } = {}) {
      if (grown <= 0 || alive <= 0) return;
      const steps = 44;
      const turns = 1.55 * grown;
      for (let arm = 0; arm < 2; arm++) {
        const pts = [];
        for (let i = 0; i <= steps; i++) {
          const u = i / steps;
          const a = u * turns * TAU + arm * Math.PI + spin;
          const r = radius * (0.14 + 0.86 * u);
          pts.push([centre[0] + Math.cos(a) * r, centre[1] + Math.sin(a) * r * 0.58]);
        }
        this.trace(pts, alive * 0.9);
      }
      this.disque(centre, radius * 0.075, alive);
    }

    /** L'étoile à quatre branches de la couverture, creusée à la taille. */
    sparkle(centre, radius, thin = 0.26, alpha = 1) {
      if (radius <= 0 || alpha <= 0) return;
      const [cx, cy] = centre;
      const r = radius;
      const k = radius * thin * 0.35;
      const c = this.ctx;
      c.beginPath();
      c.moveTo(cx, cy - r);
      c.quadraticCurveTo(cx + k, cy - k, cx + r, cy);
      c.quadraticCurveTo(cx + k, cy + k, cx, cy + r);
      c.quadraticCurveTo(cx - k, cy + k, cx - r, cy);
      c.quadraticCurveTo(cx - k, cy - k, cx, cy - r);
      c.closePath();
      c.fillStyle = this.ton(alpha);
      c.fill();
    }

    /** Les étoiles d'une galaxie, qui s'allument ou s'éteignent une à une. */
    stars(centre, radius, lit, count = 5) {
      for (let i = 0; i < count; i++) {
        const share = Math.min(Math.max(lit * count - i, 0), 1);
        if (share <= 0) continue;
        const a = i * 2.399;
        const r = radius * (0.7 + 0.55 * (((i * 37) % 10) / 10));
        this.sparkle(
          [centre[0] + Math.cos(a) * r, centre[1] + Math.sin(a) * r * 0.62],
          radius * 0.17 * share, 0.26, 0.85 * share);
      }
    }

    /** Un trait qui s'étend au lieu d'apparaître. */
    thread(a, b, extent, { alpha = 0.4, dashed = false, width = null } = {}) {
      if (extent <= 0) return;
      const end = [a[0] + (b[0] - a[0]) * extent, a[1] + (b[1] - a[1]) * extent];
      if (!dashed) {
        this.trace([a, end], alpha, width);
        return;
      }
      const step = 7 * this.unit / 360;
      const total = Math.hypot(end[0] - a[0], end[1] - a[1]);
      if (total === 0) return;
      const dx = (end[0] - a[0]) / total;
      const dy = (end[1] - a[1]) / total;
      for (let d = 0; d < total; d += step * 2) {
        const e = Math.min(d + step, total);
        this.trace([[a[0] + dx * d, a[1] + dy * d], [a[0] + dx * e, a[1] + dy * e]],
                   alpha, width);
      }
    }

    /** Des capitales espacées, comme sur la couverture. */
    label(centre, text, show, { frac = 0.0264, tracking = 1.8, dy = 0, alpha = 0.62 } = {}) {
      if (show <= 0) return;
      const c = this.ctx;
      const px = Math.max(8, this.unit * frac);
      c.font = `${px}px "Instrument Serif", Georgia, "Times New Roman", serif`;
      c.textBaseline = "alphabetic";
      c.fillStyle = this.ton(alpha * show);
      const tr = tracking / 360 * this.unit;
      const chars = [...text];
      const widths = chars.map((ch) => c.measureText(ch).width);
      const total = widths.reduce((a, b) => a + b, 0) + tr * (chars.length - 1);
      let x = centre[0] - total / 2;
      const y = centre[1] + dy;
      chars.forEach((ch, i) => {
        c.fillText(ch, x, y);
        x += widths[i] + tr;
      });
    }

    name(centre, radius, text, show) {
      this.label(centre, text, show, { dy: radius * 0.72 + 6 * this.unit / 360 });
    }

    the_four(grown, named, stars = 1, alive = null) {
      const r = this.unit * 0.082;
      for (const [pos, lbl] of RING) {
        const a = alive ? alive(lbl) : 1;
        const c = this.at(pos);
        this.galaxy(c, r, { grown, alive: a });
        const lit = Math.min(Math.max((a - 0.32) / 0.68, 0), 1) * stars;
        this.stars(c, r, lit);
        this.name(c, r, lbl, named * (0.35 + 0.65 * a));
      }
    }

    arc(centre, radius, start, sweep, alpha, width) {
      const c = this.ctx;
      c.beginPath();
      c.arc(centre[0], centre[1], radius, start, start + sweep);
      c.strokeStyle = this.ton(alpha);
      c.lineWidth = width || this.lw;
      c.lineCap = "round";
      c.stroke();
    }
  }

  // ═══ LES SEPT SCÈNES ═══════════════════════════════════════════════════

  function empire(p, t) {
    const zr = p.unit * 0.125;
    p.galaxy(p.at(ZETA), zr, { grown: ramp(t, 0.02, 0.32), spin: 0.4 });
    p.name(p.at(ZETA), zr, "ZETA", ramp(t, 0.30, 0.45));
    for (const [pos] of RING) {
      p.thread(p.at(ZETA), p.at(pos), ramp(t, 0.28, 0.62), { alpha: 0.22 });
    }
    p.the_four(ramp(t, 0.2, 0.55), ramp(t, 0.5, 0.75), ramp(t, 0.55, 0.9));
  }

  function fall(p, t) {
    const zr = p.unit * 0.125;
    p.galaxy(p.at(ZETA), zr, { spin: 0.4 });
    p.name(p.at(ZETA), zr, "ZETA", 0.8);
    p.thread(p.at(ZETA), p.at(GAMMA), ramp(t, 0.10, 0.45), { alpha: 0.75 });
    const dying = 1 - ramp(t, 0.42, 0.85);
    p.the_four(1, 1, 1, (l) => (l === "GAMMA" ? 0.12 + 0.88 * dying : 1));
  }

  function war(p, t) {
    const zr = p.unit * 0.125;
    const cracked = ramp(t, 0.62, 0.90);
    p.galaxy(p.at(ZETA), zr, { alive: 1 - cracked * 0.75, spin: 0.4 });
    for (const lbl of ["ALPHA", "BETA", "DELTA"]) {
      const pos = RING.find(([, n]) => n === lbl)[0];
      p.thread(p.at(pos), p.at(ZETA), ramp(t, 0.12, 0.58), { alpha: 0.62 });
    }
    p.the_four(1, 1, 1, (l) => (l === "GAMMA" ? 0.12 : 1));
    if (cracked > 0) {
      const c = p.at(ZETA);
      const bends = [0.34, -0.30, 0.26, -0.20];
      const pts = [[c[0] - zr * 0.72, c[1]]];
      bends.forEach((b, i) => {
        const u = (i + 1) / bends.length;
        pts.push([c[0] - zr * 0.72 + zr * 1.44 * u * cracked, c[1] + zr * b * 0.42]);
      });
      p.trace(pts, cracked, p.lw * 1.55);
    }
  }

  function union(p, t) {
    const zr = p.unit * 0.125;
    p.galaxy(p.at(ZETA), zr, { alive: 0.55, spin: 0.4 });
    const pts = [p.at(ALPHA), p.at(ZETA), p.at(DELTA), p.at(GAMMA), p.at(BETA), p.at(ALPHA)];
    const drawn = ramp(t, 0.10, 0.70) * (pts.length - 1);
    for (let i = 0; i < pts.length - 1; i++) {
      p.thread(pts[i], pts[i + 1], Math.min(Math.max(drawn - i, 0), 1), { alpha: 0.5 });
    }
    p.the_four(1, 1, 1, (l) => (l === "GAMMA" ? 0.12 : 1));
    const lyra = ramp(t, 0.60, 0.85);
    if (lyra > 0) {
      const b = p.at(BETA);
      p.sparkle([b[0], b[1] - p.unit * 0.1], p.unit * 0.032 * lyra, 0.24, lyra);
    }
    const mark = ramp(t, 0.68, 0.92);
    if (mark > 0) {
      p.label([p.bx + p.bw / 2, p.by + p.bh * 0.47], "AN 0", mark,
              { frac: 0.0333, tracking: 3, alpha: 0.85 });
    }
  }

  function rebirth(p, t) {
    const give = ramp(t, 0.18, 0.72);
    const centre = [p.bx + p.bw / 2, p.by + p.bh * 0.42];
    for (let ring = 0; ring < 4; ring++) {
      const r = p.unit * (0.06 + ring * 0.045) * (0.4 + 0.6 * give);
      p.arc(centre, r, ring * 1.1 + give * 2.4, Math.PI * 1.35,
            0.30 + 0.35 * give, p.lw * 0.9);
    }
    const rise = Math.min(1, give * 1.6);
    p.thread(p.at(BETA), centre, rise, { alpha: 0.45 });
    p.thread(centre, p.at(GAMMA), ramp(t, 0.40, 0.85), { alpha: 0.45 });
    p.the_four(1, 1, 1, (l) => (l === "GAMMA" ? 0.12 + 0.88 * ramp(t, 0.45, 0.9) : 1));
    const gone = ramp(t, 0.62, 0.90);
    if (gone < 1) {
      const b = p.at(BETA);
      const frm = [b[0], b[1] - p.unit * 0.1];
      p.sparkle([frm[0] + (centre[0] - frm[0]) * rise, frm[1] + (centre[1] - frm[1]) * rise],
                p.unit * 0.032 * (1 - gone), 0.24, 1 - gone);
    }
  }

  function archive(p, t) {
    const centre = [p.bx + p.bw / 2, p.by + p.bh * 0.46];
    const radius = p.unit * 0.19;
    const marks = 28;
    const missing = new Set([3, 4, 11, 19, 20]);
    const drawn = ramp(t, 0.08, 0.68) * marks;
    for (let i = 0; i < marks; i++) {
      const share = Math.min(Math.max(drawn - i, 0), 1);
      if (share <= 0) continue;
      const a = -Math.PI / 2 + (i / marks) * TAU;
      const dx = Math.cos(a);
      const dy = Math.sin(a);
      const gone = missing.has(i);
      const out = radius + p.unit * (gone ? 0.018 : 0.05) * share;
      p.trace([[centre[0] + dx * radius, centre[1] + dy * radius],
               [centre[0] + dx * out, centre[1] + dy * out]],
              (gone ? 0.16 : 0.8) * share, p.lw * (gone ? 0.9 : 1.27));
    }
    const look = ramp(t, 0.55, 0.90);
    for (let i = 0; i < 3; i++) {
      const a = Math.PI / 2 + (i - 1) * 0.38;
      const dx = Math.cos(a);
      const dy = Math.sin(a);
      p.thread([centre[0] + dx * p.unit * 0.34, centre[1] + dy * p.unit * 0.34],
               [centre[0] + dx * radius, centre[1] + dy * radius],
               look, { alpha: 0.32, dashed: true });
    }
  }

  function corruption(p, t) {
    const centre = [p.bx + p.bw / 2, p.by + p.bh * 0.44];
    for (let ring = 0; ring < 4; ring++) {
      p.arc(centre, p.unit * (0.06 + ring * 0.045), ring * 1.1, Math.PI * 1.35,
            0.5 - ring * 0.06, p.lw * 0.9);
    }
    const creep = ramp(t, 0.15, 0.85);
    if (creep > 0) {
      const pts = [centre];
      for (let i = 1; i <= 40; i++) {
        const u = (i / 40) * creep;
        pts.push([centre[0] + Math.sin(u * 7.5) * p.unit * 0.09 * u,
                  centre[1] + u * p.bh * 0.42]);
      }
      p.trace(pts, 0.85, p.lw * 1.36);
    }
    const reached = ramp(t, 0.60, 0.95);
    if (reached > 0) {
      const head = [centre[0], p.by + p.bh * 0.86];
      const alpha = 0.35 + 0.5 * reached;
      const c = p.ctx;
      c.beginPath();
      c.arc(head[0], head[1], p.unit * 0.028, 0, TAU);
      c.strokeStyle = p.ton(alpha);
      c.lineWidth = p.lw * 1.1;
      c.stroke();
      const x0 = head[0] - p.unit * 0.06;
      const y0 = p.by + p.bh * 0.99;
      const cx = head[0];
      const cy = p.by + p.bh * 0.90;
      const x1 = head[0] + p.unit * 0.06;
      c.beginPath();
      c.moveTo(x0, y0);
      c.quadraticCurveTo(cx, cy, x1, y0);
      c.strokeStyle = p.ton(alpha);
      c.lineWidth = p.lw * 1.1;
      c.stroke();
    }
  }

  // Les sept, dans l'ordre du prologue, et sous le nom que la page leur donne.
  //
  // Les titres sont écrits dans `index.html`, pas ici : une machine qui lit la
  // page sans exécuter le script n'y voyait que le mot « Prologue » et un
  // bouton. Ce fichier ne garde donc que les peintres, et la page les appelle
  // par leur clé, dans `data-scene`. Une seule table, dans les deux sens : la
  // clé manquante se voit tout de suite, puisque la toile reste vide.
  const SEVEN = [
    ["empire", empire],
    ["chute", fall],
    ["guerre", war],
    ["union", union],
    ["renaissance", rebirth],
    ["archives", archive],
    ["rite", corruption],
  ];

  window.SRScenes = { Pen, SEVEN, PEINTRES: Object.fromEntries(SEVEN) };
})();
