/* Yamanote 3D : l'écran au-dessus des portes.

   La peinture, la rotation des pages et le train simulé sont dans `ecran.js`,
   compilé depuis `entree.ts` (voir l'en-tête de ce fichier). Ici, seulement
   le branchement dans la page : le canevas, et les deux pilules qui tirent un
   incident. Elles ne sont prenables qu'en pleine voie, comme dans le jeu, où
   ni l'arrêt d'urgence ni la coupure ne partent d'une rame à quai. */

import { monte as monteEcran } from "./ecran.js?v=1";

export function monte(scene, { calme }) {
  const toile = scene.querySelector("canvas");
  const ecran = monteEcran(toile, calme);
  const carte = scene.closest(".xp");
  const boutons = [...carte.querySelectorAll("[data-incident]")];

  const accorde = () => {
    const libre = ecran.libre();
    for (const b of boutons) b.setAttribute("aria-disabled", String(!libre));
  };

  for (const b of boutons) {
    b.addEventListener("click", () => {
      if (ecran.incident(b.dataset.incident)) accorde();
    });
  }

  let veille = 0;
  return {
    demarre() {
      ecran.demarre();
      accorde();
      if (!veille) veille = window.setInterval(accorde, 500);
    },
    arrete() {
      ecran.arrete();
      window.clearInterval(veille);
      veille = 0;
    },
  };
}
