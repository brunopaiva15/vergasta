/* Mes Échéances : des fiches qui changent de couleur à mesure que les jours
   passent.

   L'app est en Flutter : rien ne s'en copie, tout est retranscrit. Les seuils
   sont ceux de `urgency.dart` (rouge à trois jours ou moins, orange jusqu'à
   trente, vert au-delà), les quatre listes ceux de `deadline_bucket.dart`
   (en retard, cette semaine jusqu'à sept jours, à venir, historique), le
   geste celui du `Dismissible` de `binder_document_cards.dart` : on tire la
   fiche vers la gauche, l'action rapide se découvre dessous, et passé le
   seuil elle s'exécute.

   Le curseur des jours est la seule pièce qui n'existe pas dans l'app, où
   c'est le calendrier qui avance. Il fait en quelques secondes ce que l'app
   fait en un mois.

   Les fiches, leurs textes et leurs couleurs d'action sont écrits dans la
   page, dans sa langue ; ce module ne fait que compter. */

const COULEURS = { critique: "#d32f2f", alerte: "#ff9800", normal: "#4caf50" };
const SEUIL = 0.38; // part de la largeur à tirer pour déclencher l'action

function urgence(jours) {
  if (jours <= 3) return COULEURS.critique;
  if (jours <= 30) return COULEURS.alerte;
  return COULEURS.normal;
}

function seau(jours) {
  if (jours < 0) return "retard";
  if (jours <= 7) return "semaine";
  return "avenir";
}

export function monte(scene, { calme }) {
  const d = scene.dataset;
  const curseur = scene.querySelector(".me-temps input");
  const sortie = scene.querySelector(".me-temps output");
  const liste = scene.querySelector(".me-fiches");
  const modeles = [...liste.children].map((li) => li.cloneNode(true));
  const comptes = {};
  for (const el of scene.querySelectorAll("[data-seau]")) comptes[el.dataset.seau] = el.querySelector(".me-compte");
  const historiqueDepart = Number(comptes.historique.textContent) || 0;
  let classees = 0;

  function libelle(jours) {
    if (jours < 0) return d.retard;
    if (jours === 0) return d.aujourdhui;
    return d.jours.replace("{n}", jours);
  }

  function accorde() {
    const passe = Number(curseur.value);
    sortie.value = d.passe.replace("{n}", passe);
    const n = { retard: 0, semaine: 0, avenir: 0 };
    for (const li of liste.children) {
      if (li.classList.contains("part")) continue;
      const jours = Number(li.dataset.jours) - passe;
      li.querySelector(".me-papier").style.setProperty("--urgence", urgence(jours));
      li.querySelector(".me-pastille").textContent = libelle(jours);
      n[seau(jours)] += 1;
    }
    comptes.retard.textContent = n.retard;
    comptes.semaine.textContent = n.semaine;
    comptes.avenir.textContent = n.avenir;
    comptes.historique.textContent = historiqueDepart + classees;
  }

  function remet() {
    liste.replaceChildren(...modeles.map((m) => m.cloneNode(true)));
    classees = 0;
    curseur.value = "0";
    for (const li of liste.children) branche(li);
    accorde();
  }

  function classe(li) {
    classees += 1;
    li.classList.add("part");
    accorde();
    const fin = () => {
      li.remove();
      // Quand tout est classé, la pile se remet en place, jours compris.
      if (!liste.children.length) setTimeout(remet, 1200);
    };
    if (calme) fin();
    else setTimeout(fin, 320);
  }

  function branche(li) {
    const papier = li.querySelector(".me-papier");
    let depart = null;
    let dx = 0;
    papier.addEventListener("pointerdown", (e) => {
      depart = e.clientX;
      dx = 0;
      papier.classList.add("tire");
      try { papier.setPointerCapture(e.pointerId); } catch (err) { /* sans capture */ }
    });
    papier.addEventListener("pointermove", (e) => {
      if (depart === null) return;
      dx = Math.min(0, e.clientX - depart);
      papier.style.transform = `translateX(${dx}px)`;
    });
    const lache = () => {
      if (depart === null) return;
      depart = null;
      papier.classList.remove("tire");
      papier.style.transform = "";
      if (-dx > papier.offsetWidth * SEUIL) classe(li);
    };
    papier.addEventListener("pointerup", lache);
    papier.addEventListener("pointercancel", lache);
  }

  for (const li of liste.children) branche(li);
  curseur.addEventListener("input", accorde);
  accorde();

  return { demarre() {}, arrete() {} };
}
