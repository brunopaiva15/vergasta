/* L'ouverture d'Auxine, comme dans l'app (lib/app/launch_splash.dart) : le pot
   sur le vert, un clin d'œil, puis l'ouverture de Twitter — la silhouette du
   pot se ramasse, puis s'ouvre jusqu'à découvrir la page. Mêmes durées, mêmes
   courbes, même contour (lib/app/launch_silhouette.dart).
   Une fois par visite : changer de langue ne la rejoue pas. Un clic saute le
   clin d'œil ; « réduire les animations » la ramène à un fondu. */
(function () {
  var KEY = 'auxine-ouverture';
  try { if (sessionStorage.getItem(KEY)) return; sessionStorage.setItem(KEY, '1'); } catch (e) {}
  var ASSETS = 'https://raw.githubusercontent.com/brunopaiva15/plant/9581a3e0a3c84a6c4b7883f5c8f090ed5db6077d/assets/splash/';
  var GREEN = '#459765', PAPER = '#fffbf4', SIZE = 160;
  // La zone de l'œil dans l'image du pot, de 1024 px.
  var EYE = [497, 614, 176, 176];
  var SILHOUETTE = 'M109.2 17.0 L118.6 17.0 L118.9 17.3 L121.4 17.3 L121.7 17.7 L125.2 18.0 L125.5 18.3 L126.7 18.3 L127.0 18.6 L130.5 18.6 L131.1 18.3 L130.8 18.3 L129.5 19.5 L128.9 20.8 L128.6 22.7 L128.0 23.9 L128.0 24.8 L127.7 25.2 L127.0 27.7 L126.4 28.6 L126.1 30.2 L122.7 37.3 L120.2 41.1 L117.3 44.2 L117.0 44.2 L114.5 46.4 L111.4 48.0 L110.8 48.0 L109.5 48.6 L108.6 48.6 L108.3 48.9 L106.7 48.9 L106.4 49.2 L100.2 49.2 L99.8 48.9 L98.0 48.9 L97.7 48.6 L96.4 48.6 L96.1 48.3 L92.7 47.7 L86.4 45.2 L85.5 47.7 L85.5 48.6 L85.2 48.9 L84.5 52.3 L83.9 53.6 L83.9 54.5 L83.6 54.8 L83.6 55.5 L82.7 57.7 L82.7 58.6 L82.0 59.8 L81.4 65.5 L81.7 65.8 L85.5 65.8 L85.8 66.1 L93.0 66.1 L93.3 66.4 L101.1 66.7 L101.4 67.0 L106.4 67.3 L106.7 67.7 L108.6 67.7 L108.9 68.0 L110.5 68.0 L110.8 68.3 L112.3 68.3 L112.7 68.6 L115.5 68.9 L115.8 69.2 L116.7 69.2 L117.0 69.5 L118.0 69.5 L119.2 70.2 L121.1 70.5 L125.2 72.3 L126.1 73.0 L128.3 75.5 L128.6 77.7 L128.9 78.0 L128.9 83.6 L128.6 83.9 L128.6 86.1 L128.3 86.4 L128.0 88.3 L127.0 89.8 L125.2 91.7 L120.5 94.2 L119.8 94.2 L118.6 94.8 L118.6 95.8 L118.3 96.1 L118.3 98.3 L118.0 98.6 L118.0 100.8 L117.7 101.1 L117.7 103.3 L117.3 103.6 L117.3 105.8 L117.0 106.1 L117.0 108.3 L116.7 108.6 L116.7 110.8 L116.4 111.1 L116.4 113.3 L116.1 113.6 L116.1 115.8 L115.8 116.1 L115.8 118.3 L115.5 118.6 L115.5 120.8 L115.2 121.1 L114.8 125.5 L114.5 125.8 L114.5 127.7 L114.2 128.0 L114.2 129.8 L113.9 130.2 L113.6 133.6 L112.7 135.5 L112.7 136.1 L110.8 138.6 L108.6 140.2 L107.0 140.8 L106.4 141.4 L103.3 142.3 L102.3 143.0 L100.2 143.3 L97.7 144.2 L96.1 144.2 L95.8 144.5 L94.2 144.5 L93.9 144.8 L92.3 144.8 L92.0 145.2 L89.5 145.2 L89.2 145.5 L85.8 145.5 L85.5 145.8 L74.5 145.8 L74.2 145.5 L68.0 145.2 L67.7 144.8 L65.8 144.8 L65.5 144.5 L61.1 143.9 L60.8 143.6 L57.7 143.0 L56.7 142.3 L53.6 141.4 L53.0 140.8 L51.4 140.2 L49.2 138.6 L47.7 136.7 L47.3 135.5 L46.7 134.5 L46.7 133.9 L46.4 133.6 L46.4 132.0 L46.1 131.7 L46.1 130.2 L45.8 129.8 L45.5 125.8 L45.2 125.5 L45.2 123.3 L44.8 123.0 L44.8 121.1 L44.5 120.8 L44.5 118.6 L44.2 118.3 L44.2 116.1 L43.9 115.8 L43.9 113.6 L43.6 113.3 L43.6 111.1 L43.3 110.8 L43.3 108.6 L43.0 108.3 L43.0 106.1 L42.7 105.8 L42.7 103.6 L42.3 103.3 L42.3 101.1 L42.0 100.8 L42.0 98.6 L41.7 98.3 L41.7 96.1 L41.4 95.8 L41.4 94.8 L41.1 94.5 L39.5 94.2 L35.8 92.3 L34.8 91.7 L32.3 88.9 L31.7 87.3 L31.7 86.4 L31.4 86.1 L31.4 83.9 L31.1 83.6 L31.1 78.0 L31.4 77.7 L31.4 76.4 L32.0 74.8 L34.8 72.3 L38.9 70.5 L39.5 70.5 L40.8 69.8 L41.7 69.8 L42.0 69.5 L43.0 69.5 L43.3 69.2 L44.2 69.2 L44.5 68.9 L45.8 68.9 L46.1 68.6 L47.3 68.6 L47.7 68.3 L49.2 68.3 L49.5 68.0 L51.1 68.0 L51.4 67.7 L53.3 67.7 L53.6 67.3 L58.6 67.0 L58.9 66.7 L66.7 66.4 L67.0 66.1 L74.2 66.1 L74.5 65.8 L75.5 65.8 L75.8 65.5 L75.8 64.2 L76.1 63.9 L76.1 61.1 L76.4 60.8 L76.4 59.5 L76.7 59.2 L76.7 58.0 L77.3 56.7 L77.3 55.8 L77.0 55.5 L76.4 56.1 L71.4 58.6 L70.8 58.6 L68.6 59.5 L67.7 59.5 L67.3 59.8 L66.1 59.8 L65.8 60.2 L60.8 60.2 L60.5 59.8 L58.3 59.5 L53.9 57.0 L50.5 53.6 L47.3 49.2 L43.6 41.7 L42.3 40.5 L42.0 40.5 L43.9 40.5 L46.4 39.2 L48.0 38.9 L48.9 38.3 L50.8 38.0 L53.3 37.0 L54.2 37.0 L54.5 36.7 L56.1 36.7 L56.4 36.4 L63.3 36.4 L63.6 36.7 L64.5 36.7 L64.8 37.0 L66.4 37.3 L70.8 39.8 L74.5 43.6 L78.9 50.2 L79.5 49.2 L80.5 44.5 L80.8 44.2 L81.7 40.8 L83.3 39.5 L85.2 39.5 L85.5 39.2 L85.8 38.0 L86.4 37.0 L86.4 36.4 L87.7 34.2 L87.7 33.6 L88.3 32.3 L92.3 26.1 L96.4 22.0 L98.6 20.5 L103.3 18.3 L104.2 18.3 L104.5 18.0 L106.7 17.7 L107.0 17.3 L108.9 17.3Z';
  var reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  // Rien de la page ne paraît avant le pot.
  var style = document.createElement('style');
  style.textContent = 'html.ouverture{background:' + GREEN + '}html.ouverture body>*:not(#ouverture){visibility:hidden}' +
    '#ouverture{position:fixed;inset:0;z-index:1000;cursor:pointer}#ouverture svg{position:absolute;inset:0;width:100%;height:100%}' +
    '#ouverture .pot{position:absolute;left:50%;top:50%;width:' + SIZE + 'px;height:' + SIZE + 'px;margin:-' + SIZE / 2 + 'px 0 0 -' + SIZE / 2 + 'px;will-change:transform,opacity}' +
    '#ouverture .pot img{position:absolute;display:block}';
  document.head.appendChild(style);
  root.classList.add('ouverture');

  function cubic(x1, y1, x2, y2) {
    return function (t) {
      if (t <= 0 || t >= 1) return t;
      var a = 0, b = 1, x, m;
      for (var i = 0; i < 30; i++) {
        m = (a + b) / 2;
        x = 3 * (1 - m) * (1 - m) * m * x1 + 3 * (1 - m) * m * m * x2 + m * m * m;
        if (x < t) a = m; else b = m;
      }
      m = (a + b) / 2;
      return 3 * (1 - m) * (1 - m) * m * y1 + 3 * (1 - m) * m * m * y2 + m * m * m;
    };
  }
  // Easing.inOut(Easing.ease) de React Native : l'ease joué à l'aller, puis en miroir.
  var ease = cubic(0.42, 0, 1, 1);
  function rnInOut(t) { return t < 0.5 ? ease(t * 2) / 2 : 1 - ease((1 - t) * 2) / 2; }
  var easeOutCubic = cubic(0.215, 0.61, 0.355, 1);
  function elasticOut(t) { if (t <= 0 || t >= 1) return t; var p = 0.4, s = p / 4; return Math.pow(2, -10 * t) * Math.sin((t - s) * 2 * Math.PI / p) + 1; }
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function phase(ms, a, b, curve) { return curve(clamp((ms - a) / (b - a))); }
  function interpolate(p, input, output) {
    if (p <= input[0]) return output[0];
    for (var i = 1; i < input.length; i++) {
      if (p <= input[i]) return output[i - 1] + (output[i] - output[i - 1]) * (p - input[i - 1]) / (input[i] - input[i - 1]);
    }
    return output[output.length - 1];
  }

  var TOTAL = 1640, START = 640, TWITTER = 1000;
  var WINK = [[200, 0], [240, 1], [280, 2], [440, 1], [480, 0], [520, -1]];
  var frames = ['clin_50.webp', 'clin_85.webp', 'clin_100.webp'];

  function monter() {
    var box = document.createElement('div');
    box.id = 'ouverture';
    box.setAttribute('aria-hidden', 'true');
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    var g = document.createElementNS(ns, 'g');
    var window_ = document.createElementNS(ns, 'path');
    window_.setAttribute('fill', GREEN);
    window_.setAttribute('fill-rule', 'evenodd');
    var inside = document.createElementNS(ns, 'path');
    inside.setAttribute('d', SILHOUETTE);
    inside.setAttribute('fill', PAPER);
    // Le dedans du pot n'existe qu'à l'ouverture : avant, il n'a pas encore
    // de place, et se dessinait dans un coin.
    inside.style.display = 'none';
    g.appendChild(inside);
    svg.appendChild(window_);
    svg.appendChild(g);
    // Deux boîtes, comme dans l'app : le pot grandit autour de son centre, et
    // s'écrase sur sa base.
    var pot = document.createElement('div');
    pot.className = 'pot';
    var squash = document.createElement('div');
    squash.style.cssText = 'position:absolute;inset:0;transform-origin:50% 100%';
    pot.appendChild(squash);
    var logo = new Image(); logo.src = ASSETS + 'logo.webp'; logo.alt = '';
    logo.style.cssText = 'inset:0;width:100%;height:100%';
    squash.appendChild(logo);
    var u = SIZE / 1024, eyes = frames.map(function (f) {
      var img = new Image(); img.src = ASSETS + f; img.alt = '';
      img.style.cssText = 'left:' + EYE[0] * u + 'px;top:' + EYE[1] * u + 'px;width:' + EYE[2] * u + 'px;height:' + EYE[3] * u + 'px;visibility:hidden';
      squash.appendChild(img);
      return img;
    });
    box.appendChild(svg);
    box.appendChild(pot);
    document.body.appendChild(box);
    var page = [].slice.call(document.body.children).filter(function (el) { return el !== box && el.tagName !== 'SCRIPT'; });

    var t0 = null, skipped = 0, origins = null;
    box.addEventListener('click', function () {
      if (t0 !== null && !reduced) { var ms = performance.now() - t0 + skipped; if (ms < START) skipped += START - ms; }
    });

    function fin() {
      box.remove();
      page.forEach(function (el) { el.style.transform = ''; el.style.transformOrigin = ''; });
      root.classList.remove('ouverture');
    }

    function cadre(now) {
      if (t0 === null) t0 = now;
      var ms = now - t0 + skipped;
      if (reduced) {
        root.classList.remove('ouverture');
        box.style.background = GREEN; svg.style.display = 'none';
        box.style.opacity = String(1 - clamp(ms / 550));
        if (ms >= 550) return fin();
        return requestAnimationFrame(cadre);
      }
      if (ms >= TOTAL) return fin();
      var w = innerWidth, h = innerHeight;
      var frame = -1;
      WINK.forEach(function (s) { if (ms >= s[0]) frame = s[1]; });
      eyes.forEach(function (img, i) { img.style.visibility = ms < START && i === frame ? 'visible' : 'hidden'; });
      var press = phase(ms, 200, 290, easeOutCubic) * (1 - phase(ms, 440, START, elasticOut));
      var p = 100 * rnInOut(clamp((ms - START) / TWITTER));
      var scale = interpolate(p, [0, 10, 100], [1, 0.8, 70]);
      var app = interpolate(p, [0, 15, 30], [0, 0, 1]);
      var potOpacity = 1 - interpolate(p, [0, 10, 15], [0, 0, 1]);
      if (ms >= START) {
        root.classList.remove('ouverture');
        var side = SIZE * scale, x = w / 2 - side / 2, y = h / 2 - side / 2;
        window_.setAttribute('d', 'M-10 -10H' + (w + 10) + 'V' + (h + 10) + 'H-10Z' + SILHOUETTE.replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g, function (_, a, b) { return (x + a / SIZE * side).toFixed(1) + ' ' + (y + b / SIZE * side).toFixed(1); }));
        g.setAttribute('transform', 'translate(' + x + ' ' + y + ') scale(' + scale + ')');
        inside.style.display = '';
        inside.setAttribute('fill-opacity', String(1 - app));
        var pageScale = interpolate(p, [0, 100], [1.1, 1]);
        // La page grandit vers le milieu de l'écran : l'origine se mesure une
        // fois, avant la première transformation.
        if (!origins) origins = page.map(function (el) { return h / 2 - el.getBoundingClientRect().top; });
        page.forEach(function (el, i) {
          el.style.transformOrigin = '50% ' + origins[i] + 'px';
          el.style.transform = 'scale(' + pageScale + ')';
        });
      } else {
        window_.setAttribute('d', 'M-10 -10H' + (w + 10) + 'V' + (h + 10) + 'H-10Z');
      }
      pot.style.opacity = String(potOpacity);
      pot.style.transform = 'scale(' + scale + ')';
      squash.style.transform = 'scale(' + (1 + 0.035 * press) + ',' + (1 - 0.05 * press) + ')';
      requestAnimationFrame(cadre);
    }

    // Les images d'abord ; au-delà d'une seconde, l'ouverture part telle quelle.
    var attente = [logo].concat(eyes).map(function (img) {
      return new Promise(function (ok) { if (img.complete) ok(); else { img.onload = ok; img.onerror = ok; } });
    });
    Promise.race([Promise.all(attente), new Promise(function (ok) { setTimeout(ok, 1000); })]).then(function () { requestAnimationFrame(cadre); });
  }

  if (document.body) monter(); else document.addEventListener('DOMContentLoaded', monter);
})();
