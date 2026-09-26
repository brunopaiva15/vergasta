/* Custom To Lylia : le logo qui suit le curseur du regard.

   Le script de l'accueil de la boutique (`index.php`), recopié : où que soit
   le curseur dans la page, le logo s'incline vers lui, jusqu'à 25 degrés,
   selon l'écart à son centre rapporté à la taille de la fenêtre. La boutique
   l'appelle « eye-tracking ». Sur un écran tactile, pas de curseur à suivre :
   le logo respire, en CSS (voir `experiences.css`).

   Le seul ajout est d'arrêter l'écoute quand la scène n'est pas à l'écran. */

export function monte(scene, { calme }) {
  const logo = scene.querySelector(".ctl-logo");
  const tactile = "ontouchstart" in window || navigator.maxTouchPoints > 0;

  function suit(e) {
    const r = logo.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    const max = 25;
    const ry = (dx / window.innerWidth) * max;
    const rx = -(dy / window.innerHeight) * max;
    logo.style.transform = `perspective(1000px) rotateY(${ry}deg) rotateX(${rx}deg)`;
  }

  let actif = false;
  return {
    demarre() {
      if (actif || tactile || calme) return;
      actif = true;
      document.addEventListener("mousemove", suit);
    },
    arrete() {
      actif = false;
      document.removeEventListener("mousemove", suit);
    },
  };
}
