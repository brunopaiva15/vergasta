/* ==========================================================================
   Vergasta Digital
   --------------------------------------------------------------------------
   L'âge écrit dans la page « Notre histoire ».

   Le nombre est dans le HTML, juste le jour où la page a été écrite : sans
   JavaScript la phrase se lit normalement, elle prend seulement un an de
   retard au prochain anniversaire. Ce script le recalcule à l'ouverture, à
   partir de la date de naissance portée par l'élément, pour que la phrase
   reste vraie sans que personne ait à y repasser.

   La date est en AAAA-MM-JJ et les composantes sont lues à la main : passer
   la chaîne à `new Date()` la ferait interpréter en UTC, ce qui décale d'un
   jour à l'ouest de Greenwich, exactement le jour de l'anniversaire.

   Le nombre est le même dans les cinq langues : le script ne touche qu'au
   texte de l'élément, jamais à la phrase qui l'entoure.

   Rien ne sort de l'appareil : aucune requête, aucun stockage.
   ========================================================================== */

(function () {
  'use strict';

  var hotes = document.querySelectorAll('[data-ne-le]');
  if (!hotes.length) return;

  var maintenant = new Date();
  var anCourant = maintenant.getFullYear();
  var moisCourant = maintenant.getMonth() + 1;
  var jourCourant = maintenant.getDate();

  for (var i = 0; i < hotes.length; i++) {
    var parts = (hotes[i].getAttribute('data-ne-le') || '').split('-');
    if (parts.length !== 3) continue;

    var an = parseInt(parts[0], 10);
    var mois = parseInt(parts[1], 10);
    var jour = parseInt(parts[2], 10);
    if (!an || !mois || !jour) continue;

    var age = anCourant - an;
    // l'anniversaire de l'année en cours n'est pas encore passé
    if (moisCourant < mois || (moisCourant === mois && jourCourant < jour)) age--;

    // une horloge déréglée ne doit pas écrire une absurdité dans la phrase
    if (age > 0 && age < 130) hotes[i].textContent = String(age);
  }
})();
