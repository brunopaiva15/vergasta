// Slab Lab : la vitrine. Le ciel tramé, le HUD qui tourne en idle, et une
// révélation jouable : les sous-notes sortent du même tirage que dans le jeu
// (packages/game_core/lib/src/grading.dart, profil moderne, avec DIVINE
// 100+++ comme pour les cartes d'une commande), et la révélation suit celle
// de la refonte du 7 nov. 2026 (reveal_stage.dart) : sous-notes en couleur,
// rayons derrière un 9 ou un 10, tampon et confettis pour un 10. Les textes
// viennent de la page (#textes), en français ou en anglais.
(() => {
  'use strict';
  const T = JSON.parse(document.getElementById('textes').textContent);
  const $ = (id) => document.getElementById(id);
  const calme = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmt = new Intl.NumberFormat(T.lang === 'fr' ? 'fr-CH' : 'en-US', { maximumFractionDigits: 0 });
  const argentTexte = (n) => (T.lang === 'fr' ? `${fmt.format(n)} $` : `$${fmt.format(n)}`);
  const nb = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => o[k]);
  const attendre = (ms) => new Promise((r) => setTimeout(r, calme ? Math.min(ms, 60) : ms));

  // Ce qu'on garde pour ce visiteur seulement : l'argent du HUD, l'heure de
  // son passage, les objectifs, le son. Tout est facultatif.
  const memoire = {
    lire(k, d) { try { const v = localStorage.getItem('slablab.' + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    ecrire(k, v) { try { localStorage.setItem('slablab.' + k, JSON.stringify(v)); } catch { /* navigation privée */ } },
  };

  // ── Le ciel ────────────────────────────────────────────────────────────
  // Bleu, halos clairs, plus sombre loin d'eux, bords tramés : sky() de
  // tools/store_screenshots/compose.html, au pixel près.
  const C = { blue: '#3b86d9', light: '#9ad1ff', dark: '#23518f' };
  const ciel = $('ciel');
  function peindreCiel() {
    const box = ciel.getBoundingClientRect();
    const P = innerWidth < 600 ? 6 : 8;
    const cols = Math.ceil(box.width / P), rows = Math.ceil(box.height / P);
    if (!cols || !rows) return;
    ciel.width = cols; ciel.height = rows;
    const ctx = ciel.getContext('2d');
    const etroit = innerWidth < 900;
    const halos = etroit
      ? [[cols * 0.75, rows * 0.12, cols * 0.34], [cols * 0.3, rows * 0.55, cols * 0.5]]
      : [[cols * 0.28, rows * 0.42, rows * 0.42], [cols * 0.76, rows * 0.5, rows * 0.36]];
    const img = ctx.createImageData(cols, rows);
    const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const pal = { b: rgb(C.blue), l: rgb(C.light), d: rgb(C.dark) };
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let near = Infinity;
        for (const [hx, hy, hr] of halos) near = Math.min(near, Math.hypot(x + 0.5 - hx, (y + 0.5 - hy) / 1.5) / hr);
        const odd = (x + y) % 2 === 0;
        let c = pal.b;
        if (near < 1 || (near < 1.1 && odd)) c = pal.l;
        else if (near > 2.05 || (near > 1.9 && odd)) c = pal.d;
        const i = (y * cols + x) * 4;
        img.data[i] = c[0]; img.data[i + 1] = c[1]; img.data[i + 2] = c[2]; img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }
  let resizeT;
  peindreCiel();
  addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(peindreCiel, 120); });

  // ── Le son ─────────────────────────────────────────────────────────────
  // Les sons du jeu (assets/audio/sfx), joués seulement après un geste.
  const sonBouton = $('son');
  let sonActif = memoire.lire('son', true);
  let audio = null;
  const tampons = {};
  function majSon() {
    sonBouton.setAttribute('aria-pressed', String(sonActif));
    sonBouton.querySelector('.avec').hidden = !sonActif;
    sonBouton.querySelector('.sans').hidden = sonActif;
  }
  majSon();
  sonBouton.addEventListener('click', () => { sonActif = !sonActif; memoire.ecrire('son', sonActif); majSon(); });
  const base = new URL('.', document.querySelector('script[src*="vitrine.js"]').src).href;
  function preparerAudio() {
    if (audio || !window.AudioContext) return;
    audio = new AudioContext();
    for (const n of ['stamp_1', 'stamp_2', 'stamp_3', 'stamp_4', 'grade_low_1', 'grade_five_1', 'grade_seven_1',
      'grade_nine_1', 'grade_ten', 'flawless', 'ungradable', 'reveal_open_1', 'sale_1']) charger(n);
  }
  // DIVINE a son propre son, long (27 s) : chargé seulement s'il tombe.
  function charger(n) {
    if (!audio || tampons[n]) return;
    tampons[n] = fetch(`${base}sons/${n}.mp3`).then((r) => r.arrayBuffer()).then((b) => audio.decodeAudioData(b)).catch(() => null);
  }
  async function jouer(n, gain = 0.7) {
    if (!sonActif || !audio) return;
    const buf = await tampons[n];
    if (!buf) return;
    const src = audio.createBufferSource();
    const g = audio.createGain();
    g.gain.value = gain;
    src.buffer = buf;
    src.connect(g).connect(audio.destination);
    src.start();
  }

  // ── Le HUD : l'argent tourne, même page fermée ─────────────────────────
  const argentEl = $('argent'), debitEl = $('debit'), hud = $('argent-hud');
  let argent = memoire.lire('argent', 0);
  let notees = memoire.lire('notees', 0);
  const debit = () => 60 + 30 * Math.min(notees, 40); // $ par minute
  function majHud() {
    argentEl.textContent = argentTexte(Math.floor(argent));
    debitEl.textContent = nb(T.debit, { argent: argentTexte(debit()) });
  }
  // Le retour : l'argent gagné pendant l'absence, plafonné à huit heures.
  const vu = memoire.lire('vu', 0);
  if (vu && argent > 0) {
    const min = Math.min((Date.now() - vu) / 60000, 8 * 60);
    if (min >= 1) {
      const gain = Math.floor(min * debit());
      argent += gain;
      setTimeout(() => toast(T.absence, nb(T.absenceTexte, { argent: argentTexte(gain) })), 900);
    }
  }
  majHud();
  let dernier = performance.now();
  setInterval(() => {
    const t = performance.now();
    argent += ((t - dernier) / 60000) * debit();
    dernier = t;
    majHud();
    memoire.ecrire('argent', Math.floor(argent));
    memoire.ecrire('vu', Date.now());
  }, 1000);

  // ── Le bandeau de succès ───────────────────────────────────────────────
  const toastEl = $('toast');
  let toastT;
  function toast(tete, texte) {
    $('toast-tete').textContent = tete;
    $('toast-texte').textContent = texte;
    toastEl.classList.add('vu');
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove('vu'), 3200);
  }

  // ── Les objectifs ──────────────────────────────────────────────────────
  // Comme la bande d'objectif du labo : trois, une étoile chacun, puis le
  // dernier, qui ne se remplit jamais tout à fait.
  let etape = memoire.lire('objectif', 0);
  let meilleure = memoire.lire('meilleure', 0);
  function avancement(i) {
    if (i === 0) return Math.min(notees, 3);
    if (i === 1) return meilleure >= 9 ? 1 : 0;
    if (i === 2) return meilleure >= 10 ? 1 : 0;
    return 0;
  }
  function majObjectif(celebrer) {
    while (etape < 3 && avancement(etape) >= T.objectifs[etape].but) {
      if (celebrer) { toast(T.succes, T.objectifs[etape].succes); jouer('sale_1', 0.5); }
      etape++;
    }
    memoire.ecrire('objectif', etape);
    const o = T.objectifs[etape];
    $('objectif-nom').textContent = o.nom;
    const barre = $('objectif-barre');
    if (etape === 3) {
      $('objectif-compte').textContent = T.bientot;
      barre.style.setProperty('--v', '86%');
      barre.parentElement.classList.add('vivante');
    } else {
      $('objectif-compte').textContent = `${avancement(etape)}/${o.but}`;
      barre.style.setProperty('--v', `${(avancement(etape) / o.but) * 100}%`);
    }
    document.querySelectorAll('#etoiles use').forEach((u, i) => u.setAttribute('href', `${base}pixels.svg#${i < etape ? 'etoile' : 'etoile-vide'}`));
  }
  majObjectif(false);

  // ── Le tirage, porté de grading.dart ──────────────────────────────────
  function gauss() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  // Profil moderne, avec la préparation d'un labo bien équipé (+0,3, le
  // maximum du jeu). DIVINE 100+++ : une carte sur 100 000, comme dans une
  // commande, le seul endroit du jeu où il peut sortir.
  const PROFIL = { mean: 8.7 + 0.3, condition: 1.4, spread: 0.5, perfect: 0.6, flawless: 0.005, ungradable: 1 / 11000, divine: 1 / 100000 };
  const demi = (v) => Math.min(10, Math.max(1, Math.round(v * 2) / 2));
  function tirage() {
    if (Math.random() < PROFIL.ungradable) return { notes: [0, 0, 0, 0], note: 0, parfait: false, zero: true };
    if (Math.random() < PROFIL.divine) return { notes: [100, 100, 100, 100], note: 10, parfait: true, divin: true, zero: false };
    const condition = PROFIL.mean + gauss() * PROFIL.condition;
    const sous = () => { const v = demi(condition + gauss() * PROFIL.spread); return v < 10 ? v : (Math.random() < PROFIL.perfect ? 10 : 9.5); };
    const notes = [sous(), sous(), sous(), sous()];
    if (notes.every((v) => v === 10) && Math.random() >= PROFIL.flawless) notes[Math.floor(Math.random() * 4)] = 9.5;
    const moy = notes.reduce((a, b) => a + b) / 4;
    const entier = Math.floor(moy);
    const arrondi = moy - entier >= 0.75 ? entier + 1 : entier;
    const plafond = Math.floor(Math.min(...notes) + 1);
    const note = Math.max(1, Math.min(10, Math.min(arrondi, plafond)));
    return { notes, note, parfait: notes.every((v) => v === 10), zero: false };
  }
  const NOMS = { 10: 'GEM MINT', 9: 'MINT', 8: 'NM-MINT', 7: 'NEAR MINT', 6: 'EX-MINT', 5: 'EXCELLENT', 4: 'VG-EX', 3: 'VERY GOOD', 2: 'GOOD', 1: 'POOR' };
  const ETIQ = { 10: 'GEM MT', 9: 'MINT', 8: 'NM-MT', 7: 'NM', 6: 'EX-MT', 5: 'EX', 4: 'VG-EX', 3: 'VG', 2: 'GOOD', 1: 'PR' };
  const nomNote = (r) => (r.zero ? 'UNGRADABLE' : r.divin ? 'DIVINE' : r.parfait ? 'PERFECT' : NOMS[r.note]);
  const etiqNote = (r) => (r.zero ? 'UNGRADABLE' : r.divin ? 'DIVINE' : r.parfait ? 'PERFECT' : ETIQ[r.note]);
  const texteNote = (r) => (r.zero ? '0' : r.divin ? '100+++' : r.parfait ? '10+' : String(r.note));
  const mot = (r) => r.zero ? T.mots.zero : r.divin ? T.mots.divin : r.parfait ? T.mots.parfait : r.note >= 7 ? T.mots[r.note]
    : r.note >= 4 ? T.mots.moyen : r.note >= 2 ? T.mots.bas : T.mots['1'];
  const prix = (r) => (r.zero ? 5 : r.divin ? 250000 : r.parfait ? 25000 : Math.round(40 * 2 ** (r.note - 6) * (0.9 + Math.random() * 0.2)));
  const formatNote = (v) => (v === 0 ? '0' : Number.isInteger(v) ? String(v) : String(v).replace('.', T.lang === 'fr' ? ',' : '.'));

  // ── La révélation ──────────────────────────────────────────────────────
  const etabli = $('etabli'), slab = $('slab'), fenetre = $('fenetre'), carteImg = $('carte');
  const tuiles = [...document.querySelectorAll('[data-note]')];
  const noter = $('noter');
  let revelee = false;
  let indice = 0;
  let enCours = false;
  const num = (n) => String(n).padStart(3, '0');
  function montrerCarte(i) {
    const [n, nom] = T.cartes[i];
    carteImg.src = `${base}cartes/${T.lang}/S1-${num(n)}.webp`;
    carteImg.alt = nb(T.alt, { nom, num: num(n) });
    $('et-nom').textContent = `${nom} #${num(n)}`;
    $('et-desc').textContent = T.attente;
    $('et-cert').textContent = 'CERT. ———————';
    $('et-note').textContent = '?';
    $('et-note').classList.remove('long');
    tuiles.forEach((t) => { t.textContent = '?'; t.parentElement.classList.remove('divin'); });
    $('verdict-titre').innerHTML = '&nbsp;';
    $('verdict-titre').classList.remove('zero', 'tampon', 'divin', 'bas');
    $('verdict-info').textContent = T.pret;
    $('verdict-mot').innerHTML = '&nbsp;';
    etabli.classList.remove('neuf', 'dix', 'parfait', 'zero');
    $('confettis').innerHTML = '';
    // la suivante, en avance
    const [n2] = T.cartes[(i + 1) % T.cartes.length];
    new Image().src = `${base}cartes/${T.lang}/S1-${num(n2)}.webp`;
  }
  function etincelles(nombre, couleur) {
    const zone = $('explosion');
    zone.innerHTML = '';
    for (let k = 0; k < nombre; k++) {
      const a = (k / nombre) * Math.PI * 2 + Math.random() * 0.5;
      const r = 36 + Math.random() * 18;
      const s = document.createElement('span');
      s.className = 'etincelle';
      s.style.cssText = `left:${50 + Math.cos(a) * r}%;top:${42 + Math.sin(a) * r * 0.8}%;--t:${3 + Math.floor(Math.random() * 3)};color:${couleur};animation-delay:${Math.random() * 0.3}s`;
      s.innerHTML = `<svg><use href="${base}pixels.svg#etincelle"/></svg>`;
      zone.appendChild(s);
    }
  }
  // Les confettis d'un 10, aux couleurs des menus (_ConfettiPainter).
  const COULEURS = ['--check', '--grade', '--seal', '--action', '--money', '--rare', '--holo'];
  function confettis() {
    if (calme) return;
    const zone = $('confettis');
    zone.innerHTML = '';
    const h = zone.clientHeight + 40;
    for (let k = 0; k < 70; k++) {
      const i = document.createElement('i');
      i.style.cssText = `--x:${(Math.random() * 100).toFixed(1)}%;--w:${(9 + Math.random() * 6).toFixed(1)}px;`
        + `--c:var(${COULEURS[k % COULEURS.length]});--d:${(1.6 + Math.random() * 1.4).toFixed(2)}s;--r:${(Math.random() * 0.5).toFixed(2)}s;`
        + `--s:${((Math.random() - 0.5) * 80).toFixed(0)}px;--h:${h}px;--t:${((Math.random() - 0.5) * 1440).toFixed(0)}deg`;
      zone.appendChild(i);
    }
  }
  function relancer(el, cls) { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); }

  async function reveler() {
    if (enCours) return;
    enCours = true;
    preparerAudio();
    if (audio && audio.state === 'suspended') audio.resume();
    noter.disabled = true;
    const r = tirage();
    if (r.divin) charger('divine');
    $('verdict-info').textContent = T.notation;
    jouer('reveal_open_1', 0.5);
    relancer(fenetre, 'scanne');
    await attendre(950);
    for (let k = 0; k < 4; k++) {
      const t = tuiles[k];
      t.textContent = formatNote(r.notes[k]);
      t.parentElement.classList.toggle('divin', r.notes[k] >= 100);
      relancer(t, 'frappe');
      jouer(`stamp_${k + 1}`, 0.75);
      await attendre(r.parfait && k === 3 ? 900 : 430);
    }
    await attendre(260);
    const noteEl = $('et-note');
    noteEl.textContent = texteNote(r);
    noteEl.classList.toggle('long', texteNote(r).length > 3);
    relancer(noteEl, 'frappe');
    $('et-desc').textContent = etiqNote(r);
    $('et-cert').textContent = `CERT. ${String(Math.floor(Math.random() * 1e8)).padStart(8, '0')}`;
    const titre = $('verdict-titre');
    titre.textContent = `${nomNote(r)} ${texteNote(r)}`;
    titre.classList.toggle('zero', r.zero);
    titre.classList.toggle('bas', !r.zero && r.note < 9);
    titre.classList.toggle('divin', !!r.divin);
    const [n, nom] = T.cartes[indice];
    $('verdict-info').textContent = `${nom} #${num(n)} · ${T.rarete} · ${T.cert} ${$('et-cert').textContent.slice(6)}`;
    $('verdict-mot').textContent = mot(r);

    const flash = $('flash');
    if (r.zero) {
      etabli.classList.add('zero');
      jouer('ungradable', 0.8);
    } else if (r.parfait) {
      etabli.classList.add('dix', 'parfait');
      if (!calme) { relancer(flash, 'aveugle'); relancer(etabli, 'secoue'); }
      etincelles(18, '#ffe38a');
      confettis();
      jouer(r.divin ? 'divine' : 'flawless', 0.9);
    } else if (r.note === 10) {
      etabli.classList.add('dix');
      relancer(titre, 'tampon');
      if (!calme) { relancer(flash, 'eclair'); relancer(etabli, 'secoue'); }
      etincelles(12, '#ffe38a');
      confettis();
      jouer('grade_ten', 0.9);
    } else if (r.note === 9) {
      etabli.classList.add('neuf');
      etincelles(6, '#ffffff');
      jouer('grade_nine_1', 0.8);
    } else {
      jouer(r.note >= 7 ? 'grade_seven_1' : r.note >= 5 ? 'grade_five_1' : 'grade_low_1', 0.7);
    }

    // La vente : le slab part, l'argent monte dans le HUD.
    const p = prix(r);
    await attendre(700);
    const vente = $('vente');
    vente.textContent = nb(T.vendu, { argent: `+${argentTexte(p)}` });
    relancer(vente, 'vole');
    argent += p;
    notees++;
    if (!r.zero) meilleure = Math.max(meilleure, r.divin ? 12 : r.parfait ? 11 : r.note);
    memoire.ecrire('notees', notees);
    memoire.ecrire('meilleure', meilleure);
    majHud();
    relancer(hud, 'gagne');
    majObjectif(true);
    noter.textContent = T.suivante;
    noter.disabled = false;
    revelee = true;
    enCours = false;
  }
  // Un seul bouton, l'action qui fait avancer : NOTER, puis CARTE SUIVANTE.
  noter.addEventListener('click', () => {
    if (!revelee) { reveler(); return; }
    revelee = false;
    indice = (indice + 1) % T.cartes.length;
    montrerCarte(indice);
    noter.textContent = T.noter;
  });
  montrerCarte(0);

  // L'inclinaison du slab sous le doigt (lib/src/widgets/tilt.dart).
  if (!calme) {
    const cadre = slab.parentElement;
    cadre.addEventListener('pointermove', (e) => {
      const b = cadre.getBoundingClientRect();
      const x = (e.clientX - b.left) / b.width - 0.5, y = (e.clientY - b.top) / b.height - 0.5;
      slab.style.setProperty('--ry', `${(x * 14).toFixed(1)}deg`);
      slab.style.setProperty('--rx', `${(-y * 10).toFixed(1)}deg`);
    });
    cadre.addEventListener('pointerleave', () => { slab.style.setProperty('--ry', '0deg'); slab.style.setProperty('--rx', '0deg'); });
  }

  // ── La promesse ────────────────────────────────────────────────────────
  const compris = $('compris');
  compris.addEventListener('click', () => {
    relancer($('grande-etoile'), 'saute');
    compris.textContent = T.merci;
    preparerAudio();
    jouer('sale_1', 0.5);
    setTimeout(() => { compris.textContent = T.compris; }, 1800);
  });
})();
