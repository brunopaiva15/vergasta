/* BDPokéCards : la carte qui s'incline et prend la lumière.

   `resources/js/card-stage.js` (dépôt shop_pokemon_v2), recopié : à la
   souris, la carte suit le pointeur sur toute la scène, jusqu'à 10 degrés en
   hauteur et 14 en largeur, et le reflet glisse avec lui ; au doigt, elle
   pivote sous le doigt posé dessus ; sur un écran tactile, elle pivote une
   fois d'elle-même pour montrer qu'elle bouge. En mouvement réduit, elle ne
   bouge pas.

   La carte n'est pas une carte Pokémon : les visuels de la boutique viennent
   de l'API TCGdex et appartiennent à leurs ayants droit. Elle porte Kardo, la
   mascotte de la boutique, redessiné pixel pour pixel depuis son fichier
   (`carte.svg`). */

const MAX_X = 10;
const MAX_Y = 14;

export function monte(scene, { calme }) {
  const carte = scene.querySelector(".bd-carte");
  const survolable = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  let cadre = null;
  let doigt = null;
  let montre = false;

  const pose = (x, y) => {
    scene.style.setProperty("--tilt-x", `${((0.5 - y) * 2 * MAX_X).toFixed(2)}deg`);
    scene.style.setProperty("--tilt-y", `${((x - 0.5) * 2 * MAX_Y).toFixed(2)}deg`);
    scene.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
    scene.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);
  };

  const incline = (x, y) => {
    if (cadre !== null) cancelAnimationFrame(cadre);
    cadre = requestAnimationFrame(() => {
      cadre = null;
      scene.classList.add("is-tilting");
      pose(x, y);
    });
  };

  const depuis = (e, zone) => {
    const r = zone.getBoundingClientRect();
    incline(
      Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)),
      Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)),
    );
  };

  const remet = () => {
    if (cadre !== null) cancelAnimationFrame(cadre);
    cadre = null;
    scene.classList.remove("is-tilting", "is-glinting");
    ["--tilt-x", "--tilt-y", "--gx", "--gy"].forEach((n) => scene.style.removeProperty(n));
  };

  if (!calme) {
    scene.addEventListener("pointermove", (e) => {
      if (e.pointerType === "mouse" && survolable) depuis(e, scene);
    });
    scene.addEventListener("pointerleave", (e) => {
      if (e.pointerType === "mouse") remet();
    });
    carte.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse") return;
      doigt = e.pointerId;
      try { carte.setPointerCapture(e.pointerId); } catch (err) { /* sans capture */ }
      depuis(e, carte);
    });
    carte.addEventListener("pointermove", (e) => {
      if (e.pointerId === doigt) depuis(e, carte);
    });
    const lache = (e) => {
      if (e.pointerId !== doigt) return;
      doigt = null;
      remet();
    };
    carte.addEventListener("pointerup", lache);
    carte.addEventListener("pointercancel", lache);
    carte.addEventListener("lostpointercapture", lache);
  }

  // Sur un écran tactile, rien ne dit que la carte bouge : elle pivote une
  // fois, la première fois qu'elle paraît.
  function montreQuElleBouge() {
    if (montre || survolable || calme) return;
    montre = true;
    const pas = [[0.85, 0.3], [0.15, 0.7]];
    pas.forEach(([x, y], i) => {
      setTimeout(() => {
        if (doigt !== null) return;
        scene.classList.add("is-glinting");
        pose(x, y);
      }, 700 + i * 650);
    });
    setTimeout(() => { if (doigt === null) remet(); }, 700 + pas.length * 650);
  }

  return {
    demarre: montreQuElleBouge,
    arrete() {},
  };
}
