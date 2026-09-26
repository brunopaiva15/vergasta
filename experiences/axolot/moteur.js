/* Le moteur « datamosh » d’Axolot, recopié tel quel depuis
   resources/views/partials/datamosh-engine.blade.php (dépôt compta), sans les
   directives Blade qui l’entouraient. Ne pas le modifier ici : s’il change,
   le recopier. */

/*
 * Moteur « datamosh » : rendu d'un décodage vidéo corrompu en Canvas 2D.
 *
 * Grille de colonnes FIXE (rien ne bouge horizontalement), seul le pavage
 * vertical s'anime. Les bords de colonnes suivent x = W * (i/N)^1.65, ce qui
 * donne des colonnes étroites à gauche et larges à droite (effet de fuite).
 * Chaque colonne empile des tuiles dont les frontières viennent d'une
 * sigmoïde : une tuile entre en filet par le haut, s'ouvre à environ la
 * moitié de la hauteur au centre, puis se referme en sortant.
 */
(function () {
    if (window.AxolotDatamosh) {
        return;
    }

    /*
     * Couleurs du logo : le violet de marque domine largement, le blanc donne
     * le contraste, les pops secondaires de la charte n'apparaissent que par
     * touches. Les « quasi-noirs » restent des violets profonds, assez clairs
     * pour se détacher du fond de la pastille (sinon la silhouette se troue).
     */
    var PALETTE = [
        '#ffffff',
        '#803fe8',
        '#a78bfa',
        '#6d28d9',
        '#c4b5fd',
        '#2f1f57',
        '#7c3aed',
        '#fbbf24',
        '#231544',
        '#22d3ee',
        '#f472b6',
        '#34d399',
    ];

    var WHITE = 0;
    var DARKS = [8, 5];
    var VIOLETS = [1, 2, 3, 6, 4];
    var POPS = [7, 9, 10, 11];
    var POP_RATE = 0.15;

    var COLS = 11;
    var POWER = 1.65;
    var TILES = 15;
    var CYCLE = 0.2;
    var STAGGER = 0.006;
    var STRETCH = 8.5;
    var EARLY = 1.0;
    var SPRING_K = 1.6;
    var BLEED = 0.012;
    var COL_PHASE = -0.4;
    var STRIP_LEN = 61;

    var SPRING_NORM = 1 - Math.exp(-SPRING_K);

    /*
     * Ré-échelonne la fraction d'un pas de tuile en arrivée exponentielle,
     * miroir à mi-chemin : la tuile se précipite vers le centre de son pas,
     * s'y attarde pendant qu'elle est la plus grosse, puis repart.
     * Monotone et exacte en 0 et 1, donc la pile ne dérive jamais.
     */
    function springStep(p) {
        var half = function (t) {
            return (1 - Math.exp(-SPRING_K * t)) / SPRING_NORM;
        };

        return p < 0.5 ? 0.5 * half(2 * p) : 1 - 0.5 * half(2 * (1 - p));
    }

    function pickDifferent(from, avoid) {
        for (var i = 1; i <= PALETTE.length; i++) {
            var candidate = (from + i) % PALETTE.length;

            if (avoid.indexOf(candidate) === -1) {
                return candidate;
            }
        }

        return from;
    }

    function mulberry32(seed) {
        var a = seed >>> 0;

        return function () {
            a |= 0;
            a = (a + 0x6d2b79f5) | 0;
            var t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    /*
     * Bande cyclique de couleurs, indexée par l'IDENTITÉ des tuiles et jamais
     * par leur position à l'écran : sinon les couleurs semblent glisser avec
     * la géométrie. Le blanc et les quasi-noirs reviennent souvent, faute de
     * quoi il ne reste qu'un velours côtelé de demi-teintes sans contraste.
     */
    function buildStrip(seed, popRate) {
        var rand = mulberry32(seed);
        var strip = [];

        for (var n = 0; n < STRIP_LEN; n++) {
            var r = rand();
            var next;

            if (r < 0.26) {
                next = WHITE;
            } else if (r < 0.42) {
                next = DARKS[Math.floor(rand() * DARKS.length)];
            } else if (rand() < popRate) {
                next = POPS[Math.floor(rand() * POPS.length)];
            } else {
                next = VIOLETS[Math.floor(rand() * VIOLETS.length)];
            }

            if (n > 0 && next === strip[n - 1]) {
                next = pickDifferent(next, [strip[n - 1]]);
            }

            strip.push(next);
        }

        if (strip[STRIP_LEN - 1] === strip[0]) {
            strip[STRIP_LEN - 1] = pickDifferent(
                strip[STRIP_LEN - 1],
                [strip[STRIP_LEN - 2], strip[0]]
            );
        }

        return strip;
    }

    /*
     * `options.popRate` règle la part de couleurs pop secondaires. À grande
     * taille (l'overlay), quelques touches réveillent la mosaïque. Sur une
     * marque de 32 px, où seules quelques tuiles sont visibles à la fois, une
     * seule touche occupe la moitié du logo et l'on croit à un bug d'affichage,
     * d'où un réglage à zéro côté barre latérale.
     */
    function createDatamosh(host, seed, options) {
        var settings = options || {};
        var popRate = typeof settings.popRate === 'number' ? settings.popRate : POP_RATE;
        var canvas = document.createElement('canvas');
        canvas.style.display = 'block';
        canvas.style.width = '100%';
        canvas.style.height = '100%';

        var ctx = canvas.getContext('2d', { alpha: false });

        if (! ctx) {
            return { ok: false };
        }

        host.appendChild(canvas);
        ctx.imageSmoothingEnabled = false;

        var strip = buildStrip(seed, popRate);
        var edges = [];
        var width = 0;
        var height = 0;
        var raf = 0;
        var running = false;
        var lastT = 0;
        var elapsed = 0;

        function measure() {
            var rect = host.getBoundingClientRect();
            var dpr = Math.min(2, window.devicePixelRatio || 1);

            width = Math.max(1, Math.round(rect.width * dpr));
            height = Math.max(1, Math.round(rect.height * dpr));
            canvas.width = width;
            canvas.height = height;
            ctx.imageSmoothingEnabled = false;

            edges = [];

            for (var i = 0; i <= COLS; i++) {
                edges.push(Math.round(width * Math.pow(i / COLS, POWER)));
            }
        }

        /*
         * Frontière d'une tuile ayant parcouru `k` pas. Sigmoïde presque plate
         * aux deux bouts et raide au centre : la raideur EST la hauteur de la
         * tuile. Prolongée LINÉAIREMENT au-delà des bornes plutôt que bornée,
         * sinon toutes les tuiles hors champ s'écrasent sur y = 0 et la bande
         * qui possède cette ligne clignote en changeant de couleur.
         */
        function tileEdge(k) {
            var u = k / TILES;

            if (u < 0) {
                return u * 0.05;
            }

            if (u > 1) {
                return 1 + (u - 1) * 0.05;
            }

            var v = Math.pow(u, EARLY);
            var a = Math.pow(v, STRETCH);

            return a / (a + Math.pow(1 - v, STRETCH));
        }

        function draw() {
            for (var i = 0; i < COLS; i++) {
                var x0 = edges[i];
                var columnWidth = edges[i + 1] - x0;

                if (columnWidth <= 0) {
                    continue;
                }

                var t = elapsed - (COLS - 1 - i) * STAGGER;
                var raw = t <= 0 ? 0 : t / CYCLE;

                /* Phase JAMAIS repliée : l'identité de la tuile en dérive.
                   Un repli ferait téléporter toutes les frontières en haut. */
                var linear = raw + i * COL_PHASE;
                var step = Math.floor(linear);
                var flow = step + springStep(linear - step);

                var bleed = Math.round(BLEED * height);
                var base = -Math.floor(flow);

                /* Peinture de bas en haut : le débord d'une tuile recouvre
                   celle du dessous, ce qui empile des couches au lieu d'une grille. */
                for (var n = TILES + 2; n >= -2; n--) {
                    var id = base + n;
                    var k = id + flow;
                    var top = Math.round(tileEdge(k) * height);
                    var bottom = Math.round(tileEdge(k + 1) * height) + bleed;

                    if (bottom <= top || bottom <= 0 || top >= height) {
                        continue;
                    }

                    var y = Math.max(0, top);
                    var tileHeight = Math.min(height, bottom) - y;

                    if (tileHeight <= 0) {
                        continue;
                    }

                    var s = id - i;
                    var len = strip.length;
                    ctx.fillStyle = PALETTE[strip[((s % len) + len) % len]];
                    ctx.fillRect(x0, y, columnWidth, tileHeight);
                }
            }
        }

        function tick(now) {
            if (! running) {
                return;
            }

            var dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 0;
            lastT = now;
            elapsed += dt;
            draw();
            raf = requestAnimationFrame(tick);
        }

        var observer = null;

        if (typeof ResizeObserver !== 'undefined') {
            observer = new ResizeObserver(function () {
                /* `measure()` réaffecte canvas.width, ce qui efface le canvas :
                   on repeint tout de suite, sinon une image noire passe. */
                measure();
                draw();
            });
            observer.observe(host);
        }

        measure();

        /* Première image tout de suite : sans elle, le canvas resterait noir
           jusqu'au premier rAF et la silhouette clignoterait à l'ouverture. */
        draw();

        return {
            ok: true,
            start: function () {
                if (running) {
                    return;
                }

                running = true;
                lastT = 0;
                raf = requestAnimationFrame(tick);
            },
            stop: function () {
                running = false;

                if (raf) {
                    cancelAnimationFrame(raf);
                }

                raf = 0;
            },
            renderStill: function () {
                elapsed = CYCLE * 0.45 + COLS * STAGGER;
                draw();
            },
            /* Indispensable quand l'hôte est retiré du DOM (navigation SPA),
               sinon le ResizeObserver garde une référence sur le noeud mort. */
            destroy: function () {
                running = false;

                if (raf) {
                    cancelAnimationFrame(raf);
                }

                raf = 0;

                if (observer) {
                    observer.disconnect();
                    observer = null;
                }

                canvas.remove();
            },
        };
    }

    window.AxolotDatamosh = { create: createDatamosh };
})();
