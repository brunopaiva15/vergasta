/* La barre de défilement d'Auxine : une plante grimpante.
   La barre du système est retirée ; à sa place, une tige pousse le long du
   bord droit à mesure qu'on descend dans la page, ses feuilles s'ouvrent au
   passage, et une fleur éclot quand on arrive en bas. Sur un écran à souris,
   on la tire ou on la touche comme une barre ordinaire. */
(function () {
  var ns = 'http://www.w3.org/2000/svg';
  var style = document.createElement('style');
  style.textContent =
    'html{scrollbar-width:none}html::-webkit-scrollbar,body::-webkit-scrollbar{display:none;width:0;height:0}' +
    '#liane{position:fixed;top:0;right:0;bottom:0;width:34px;z-index:60;pointer-events:none}' +
    '#liane svg{display:block;width:100%;height:100%;overflow:visible}' +
    '#liane .feuille{transform-box:fill-box;transition:transform .45s cubic-bezier(.34,1.56,.64,1)}' +
    '#liane .fleur{transform-box:fill-box;transform-origin:50% 50%;transition:transform .6s cubic-bezier(.34,1.56,.64,1)}' +
    '@media (pointer:fine){#liane{pointer-events:auto;cursor:grab}#liane.tire{cursor:grabbing}}' +
    '@media (max-width:760px){#liane{width:22px}}' +
    '@media (prefers-reduced-motion:reduce){#liane .feuille,#liane .fleur{transition:none}}';
  document.head.appendChild(style);

  var box, svg, tige, feuilles = [], fleur, longueur = 0;

  function monter() {
    box = document.createElement('div');
    box.id = 'liane';
    box.setAttribute('aria-hidden', 'true');
    svg = document.createElementNS(ns, 'svg');
    box.appendChild(svg);
    document.body.appendChild(box);
    dessiner();
    suivre();
    addEventListener('scroll', suivre, { passive: true });
    addEventListener('resize', function () { dessiner(); suivre(); });
    new ResizeObserver(suivre).observe(document.body);
    tirer();
  }

  // La tige : une onde lente qui descend tout l'écran, et les feuilles tous
  // les 58 points, d'un côté puis de l'autre.
  function dessiner() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    feuilles = [];
    var w = box.clientWidth, h = innerHeight, cx = w / 2 + 1, d = '';
    for (var y = -12; y <= h + 12; y += 6) {
      var x = cx + Math.sin(y / 52) * w * 0.17 + Math.sin(y / 23 + 1) * w * 0.05;
      d += (y === -12 ? 'M' : 'L') + x.toFixed(1) + ' ' + y;
    }
    tige = document.createElementNS(ns, 'path');
    tige.setAttribute('d', d);
    tige.setAttribute('fill', 'none');
    tige.setAttribute('stroke', '#2a7447');
    tige.setAttribute('stroke-width', w > 26 ? 3 : 2.4);
    tige.setAttribute('stroke-linecap', 'round');
    svg.appendChild(tige);
    longueur = tige.getTotalLength();
    tige.setAttribute('stroke-dasharray', longueur);

    var taille = w > 26 ? 1 : 0.72;
    for (var l = 34, i = 0; l < longueur - 20; l += 58, i++) {
      var p = tige.getPointAtLength(l), q = tige.getPointAtLength(l + 2);
      var angle = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI;
      var cote = i % 2 ? 1 : -1;
      var g = document.createElementNS(ns, 'g');
      g.setAttribute('transform', 'translate(' + p.x + ' ' + p.y + ') rotate(' + (angle + cote * 62) + ') scale(' + taille + ')');
      var f = document.createElementNS(ns, 'path');
      f.setAttribute('class', 'feuille');
      f.setAttribute('d', 'M0 0C3-6 12-8 17-1C12 6 3 5 0 0Z');
      f.setAttribute('fill', i % 3 === 2 ? '#74cf95' : '#358354');
      f.style.transformOrigin = '0 50%';
      f.style.transform = 'scale(0)';
      g.appendChild(f);
      svg.appendChild(g);
      feuilles.push({ el: f, a: l });
    }

    // La fleur du bout, qui n'éclot qu'au bas de la page.
    fleur = document.createElementNS(ns, 'g');
    fleur.setAttribute('class', 'fleur');
    for (var k = 0; k < 5; k++) {
      var petale = document.createElementNS(ns, 'ellipse');
      petale.setAttribute('cx', 0); petale.setAttribute('cy', -5); petale.setAttribute('rx', 3.6); petale.setAttribute('ry', 5.2);
      petale.setAttribute('fill', '#ff7b45');
      petale.setAttribute('transform', 'rotate(' + k * 72 + ')');
      fleur.appendChild(petale);
    }
    var coeur = document.createElementNS(ns, 'circle');
    coeur.setAttribute('r', 3); coeur.setAttribute('fill', '#ffe14d');
    fleur.appendChild(coeur);
    var pointe = document.createElementNS(ns, 'g');
    pointe.appendChild(fleur);
    svg.appendChild(pointe);
    fleur.style.transform = 'scale(0)';
    fleur.pointe = pointe;
    fleur.taille = taille;
  }

  function avancee() {
    var max = document.documentElement.scrollHeight - innerHeight;
    return max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 1;
  }

  // La tige pousse avec la lecture : une pousse dès le haut, toute la hauteur en bas.
  function suivre() {
    if (!tige) return;
    var pousse = longueur * (0.08 + 0.92 * avancee());
    tige.setAttribute('stroke-dashoffset', longueur - pousse);
    feuilles.forEach(function (f) { f.el.style.transform = f.a < pousse - 6 ? 'scale(1)' : 'scale(0)'; });
    var bout = tige.getPointAtLength(Math.max(0, pousse));
    fleur.pointe.setAttribute('transform', 'translate(' + bout.x + ' ' + bout.y + ') scale(' + fleur.taille + ')');
    fleur.style.transform = avancee() > 0.985 ? 'scale(1)' : 'scale(0)';
  }

  // Sur un écran à souris, la liane se tire comme une barre de défilement.
  function tirer() {
    var actif = false;
    function aller(e) {
      var max = document.documentElement.scrollHeight - innerHeight;
      scrollTo({ top: Math.min(1, Math.max(0, e.clientY / innerHeight)) * max, behavior: 'instant' });
    }
    box.addEventListener('pointerdown', function (e) {
      actif = true; box.classList.add('tire'); box.setPointerCapture(e.pointerId); aller(e); e.preventDefault();
    });
    box.addEventListener('pointermove', function (e) { if (actif) aller(e); });
    function lacher() { actif = false; box.classList.remove('tire'); }
    box.addEventListener('pointerup', lacher);
    box.addEventListener('pointercancel', lacher);
  }

  if (document.body) monter(); else document.addEventListener('DOMContentLoaded', monter);
})();
