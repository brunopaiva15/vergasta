/* Axolot : le décodage corrompu, dans la silhouette de l'axolotl.

   Le moteur est celui de l'app (`moteur.js`), recopié sans changement. Ici,
   la mise en scène de l'écran de chargement : la pastille sombre, le masque
   du logo, une graine tirée au hasard et les touches de couleur vive. Un clic
   relance un autre décodage, sur une autre graine. En mouvement réduit, le
   moteur pose l'image fixe qu'il prévoit pour ce cas (`renderStill`). */

import "./moteur.js?v=1";

export function monte(scene, { calme }) {
  const hote = scene.querySelector(".axolot-mosh");
  let moteur = null;
  let actif = false;

  function nouveau() {
    if (moteur) moteur.destroy();
    moteur = window.AxolotDatamosh.create(hote, 1 + Math.floor(Math.random() * 9999));
    if (!moteur.ok) {
      moteur = null;
      return;
    }
    if (calme) moteur.renderStill();
    else if (actif) moteur.start();
  }

  scene.addEventListener("click", nouveau);

  return {
    demarre() {
      actif = true;
      if (!moteur) nouveau();
      else if (!calme) moteur.start();
    },
    arrete() {
      actif = false;
      if (moteur) moteur.stop();
    },
  };
}
