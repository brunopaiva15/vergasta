/* ==========================================================================
   Vergasta Digital
   --------------------------------------------------------------------------
   Choix de la langue. Trois règles, dans cet ordre :

   1. un choix explicite, fait en cliquant sur FR / EN / DE / IT / JA, gagne
      toujours. Il est conservé dans le stockage local ;
   2. sans choix enregistré, la langue du navigateur décide, une seule fois par
      session. Le marqueur de session évite qu'un visiteur qui se promène d'une
      version à l'autre soit ramené de force à chaque page ;
   3. si rien ne correspond, la page reste telle quelle.

   Le script ne calcule aucun chemin : les adresses des cinq versions sont déjà
   dans la tête de la page, en <link rel="alternate" hreflang>. Une seule source
   pour les adresses, et rien à retoucher ici si l'arborescence bouge.

   Sans JavaScript, la page est identique et le sélecteur reste un jeu de liens
   qui fonctionnent : seule la détection automatique disparaît.

   Rien ne sort de l'appareil du visiteur. Aucune requête, aucun cookie.
   ========================================================================== */

(function () {
  'use strict';

  var CLE = 'vergasta-langue';
  var MARQUEUR = 'vergasta-langue-auto';

  var courante = (document.documentElement.getAttribute('lang') || 'fr')
    .toLowerCase().slice(0, 2);

  // Les cinq versions de la page courante, lues dans la tête. On n'en retient
  // que le chemin, rebranché sur l'hôte courant : les liens alternes portent
  // l'adresse de production, et sans cela une prévisualisation locale se
  // ferait renvoyer sur vergasta.ch. Le site est servi à la racine du domaine
  // (voir CNAME), donc le chemin suffit.
  var versions = {};
  var alternes = document.head.querySelectorAll('link[rel="alternate"][hreflang]');
  for (var i = 0; i < alternes.length; i++) {
    var code = (alternes[i].getAttribute('hreflang') || '').toLowerCase();
    if (code && code !== 'x-default') {
      versions[code] = new URL(alternes[i].href).pathname;
    }
  }

  // Le stockage peut être refusé (navigation privée verrouillée, réglage strict).
  // Dans ce cas on ne mémorise rien et le site marche quand même.
  function lire(depot, cle) {
    try {
      return window[depot].getItem(cle);
    } catch (e) {
      return null;
    }
  }

  function ecrire(depot, cle, valeur) {
    try {
      window[depot].setItem(cle, valeur);
    } catch (e) {
      /* tant pis */
    }
  }

  function preferee() {
    var demandees = (navigator.languages && navigator.languages.length)
      ? navigator.languages
      : [navigator.language || ''];
    for (var i = 0; i < demandees.length; i++) {
      var code = String(demandees[i]).toLowerCase().slice(0, 2);
      if (versions[code]) return code;
    }
    return null;
  }

  function aller(code) {
    if (!code || code === courante || !versions[code]) return;
    // replace et non assign : le bouton retour doit ramener d'où l'on vient,
    // pas rejouer la redirection en boucle.
    location.replace(versions[code] + location.search + location.hash);
  }

  // En file://, location.replace sur un chemin absolu sort de l'arborescence.
  // Un aperçu local se sert d'un serveur, la détection s'y comporte comme en
  // production ; ouverte à la main, la page reste simplement dans sa langue.
  if (location.protocol === 'http:' || location.protocol === 'https:') {
    var choisie = lire('localStorage', CLE);

    if (choisie && versions[choisie]) {
      aller(choisie);
    } else if (!choisie && !lire('sessionStorage', MARQUEUR)) {
      ecrire('sessionStorage', MARQUEUR, '1');
      aller(preferee());
    }
  }

  // Cliquer sur une langue vaut choix explicite, y compris depuis le lien vers
  // l'original français des pages légales : sans cela, le visiteur y serait
  // renvoyé vers sa propre langue à l'arrivée.
  document.addEventListener('DOMContentLoaded', function () {
    var liens = document.querySelectorAll('[data-langue]');
    for (var i = 0; i < liens.length; i++) {
      liens[i].addEventListener('click', function () {
        ecrire('localStorage', CLE, this.getAttribute('data-langue'));
      });
    }
  });
})();
