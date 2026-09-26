/* Stellar Rebirth : les sept tableaux du prologue.

   `scenes.js` est le fichier du site du roman, copié sans une ligne changée :
   ce sont les mêmes peintres que l'application de lecture et la bande-annonce,
   aux mêmes valeurs. Il n'y a ici que l'horloge.

   Dans l'application, la progression d'un tableau vient du pouce du lecteur ;
   sur le site, du défilement. Ici, dans une scène de la taille d'une carte,
   elle vient du temps : un tableau se trace en quatre secondes et demie,
   reste posé, puis laisse la place au suivant. Un clic passe au suivant sans
   attendre. En mouvement réduit, chaque tableau est posé fini, et c'est le
   clic seul qui tourne les pages. */

import "./scenes.js?v=1";

const ENCRE = [0xff, 0xf9, 0xef];
const TRACE = 4500;
const POSE = 2600;

export function monte(scene, { calme }) {
  const { Pen, SEVEN } = window.SRScenes;
  const toile = scene.querySelector("canvas");
  const titres = scene.querySelector(".prologue-titres");
  const lignes = [...titres.children];
  const ctx = toile.getContext("2d");

  let n = 0;
  let debut = 0;
  let raf = 0;
  let actif = false;
  let dernierT = -1;

  function peins(t) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = toile.clientWidth;
    const h = toile.clientHeight;
    if (!w || !h) return;
    const px = Math.round(w * dpr);
    const py = Math.round(h * dpr);
    if (toile.width !== px || toile.height !== py) {
      toile.width = px;
      toile.height = py;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    SEVEN[n][1](new Pen(ctx, w, h, ENCRE), t);
    dernierT = t;
  }

  function montreTitre() {
    titres.classList.add("a-tourne");
    lignes.forEach((li, i) => li.classList.toggle("est-la", i === n));
  }

  function cadre(now) {
    raf = 0;
    if (!actif) return;
    const e = now - debut;
    const t = calme ? 1 : Math.min(1, e / TRACE);
    if (Math.abs(t - dernierT) >= 0.004 || t === 1) peins(t);
    if (!calme && e > TRACE + POSE) {
      n = (n + 1) % SEVEN.length;
      debut = now;
      montreTitre();
    }
    if (!calme) raf = requestAnimationFrame(cadre);
  }

  scene.addEventListener("click", () => {
    n = (n + 1) % SEVEN.length;
    debut = performance.now();
    dernierT = -1;
    montreTitre();
    if (calme) peins(1);
  });

  // Un redimensionnement repeint le tableau là où il en était.
  new ResizeObserver(() => {
    const t = dernierT;
    dernierT = -1;
    peins(calme ? 1 : Math.max(0, t));
  }).observe(toile);

  return {
    demarre() {
      if (actif) return;
      actif = true;
      debut = performance.now();
      dernierT = -1;
      if (calme) peins(1);
      else raf = requestAnimationFrame(cadre);
    },
    arrete() {
      actif = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    },
  };
}
