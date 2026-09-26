/* Le chargeur de la page des expériences.

   Chaque scène porte `data-xp`, le nom de son module dans ce dossier. Rien
   n'est chargé d'avance : un module n'est demandé que lorsque sa scène
   approche de l'écran, et une scène ne tourne que tant qu'elle y est. Huit
   animations qui tourneraient en même temps hors de la vue coûteraient pour
   rien, et la page resterait lourde à ouvrir sur un téléphone.

   Un module exporte `monte(scene, reglages)` et rend `{ demarre, arrete }`.
   Les textes qu'une scène affiche sont écrits dans la page, dans sa langue,
   jamais dans le module : c'est ce qui permet d'avoir cinq pages complètes et
   un seul code (§11 de DESIGN.md).

   Aucune requête hors du domaine, aucun stockage. En mouvement réduit, chaque
   scène reçoit `calme` et se tient à une image posée, ou ne bouge que sous la
   main. */

const VERSION = "2";
const calme = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const langue = document.documentElement.lang || "fr";

const montees = new Map();

async function monter(scene) {
  if (montees.has(scene)) return montees.get(scene);
  const nom = scene.dataset.xp;
  const promesse = import(`./${nom}/${nom}.js?v=${VERSION}`)
    .then((module) => module.monte(scene, { calme, langue }))
    .catch((erreur) => {
      // Une scène qui ne se monte pas reste à sa couleur ; les autres tournent.
      console.error(`Expérience ${nom} :`, erreur);
      return null;
    });
  montees.set(scene, promesse);
  return promesse;
}

const scenes = [...document.querySelectorAll("[data-xp]")];

if ("IntersectionObserver" in window) {
  // Le module se demande un peu avant l'arrivée à l'écran, pour être prêt.
  const approche = new IntersectionObserver((entrees) => {
    for (const e of entrees) {
      if (!e.isIntersecting) continue;
      approche.unobserve(e.target);
      monter(e.target);
    }
  }, { rootMargin: "400px 0px" });

  // Et il ne tourne que tant que la scène est visible.
  const vue = new IntersectionObserver((entrees) => {
    for (const e of entrees) {
      monter(e.target).then((xp) => {
        if (!xp) return;
        if (e.isIntersecting && !document.hidden) xp.demarre();
        else xp.arrete();
      });
    }
  }, { threshold: 0.15 });

  for (const scene of scenes) {
    approche.observe(scene);
    vue.observe(scene);
  }

  // Un onglet masqué arrête tout ; au retour, l'observateur relance ce qui
  // est à l'écran.
  document.addEventListener("visibilitychange", () => {
    for (const scene of scenes) {
      const p = montees.get(scene);
      if (!p) continue;
      p.then((xp) => {
        if (!xp) return;
        if (document.hidden) {
          xp.arrete();
          return;
        }
        const r = scene.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight) xp.demarre();
      });
    }
  });
} else {
  for (const scene of scenes) monter(scene).then((xp) => xp && xp.demarre());
}
