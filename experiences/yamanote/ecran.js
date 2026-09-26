/* Fichier compilé : ne pas le modifier à la main. Source : entree.ts, qui importe la peinture de l'écran de bord depuis le dépôt yamanote-3d (commit 4097ba8, 18 septembre 2026). La commande pour le refaire est dans l'en-tête de entree.ts. */

// ../../../brunopaiva15/yamanote-3d/src/data/config.ts
var CONFIG = {
  // Cycle station (secondes). depart et brake sont dimensionnés pour le profil
  // physique E235 de systems/trainPhysics (~0,84 m/s² au démarrage, arrêt
  // complet en ~23 s depuis 90 km/h - les dernières secondes ne servant qu'à
  // poser la rame, voir le lâcher final du freinage).
  //
  // La durée de croisière n'est PAS ici : elle se déduit de l'intervalle réel
  // du tronçon (data/segments, SEGMENT_HEADWAY_SEC → cruiseDuration), et varie
  // donc d'un tronçon à l'autre et d'un sens à l'autre. Un `cruiseTime: 59`
  // traînait à cette place, que plus personne ne lisait depuis le passage aux
  // intervalles réels : le supprimer évite qu'on le règle en croyant agir.
  //
  // dwellTime n'est PAS la durée d'arrêt non plus : celle-ci est tirée par arrêt
  // (stationCycle.dwellDuration, 40 à 65 s selon la gare, l'état de la ligne
  // et - surtout - la longueur de la 発車メロディ du quai, qu'on laisse aller
  // au bout de ses deux passages). C'est le forfait d'arrêt retiré de
  // l'intervalle réel du tronçon
  // pour dimensionner la croisière (segments.cruiseDuration) - le laisser bas
  // garde à la croisière de quoi placer l'annonce de départ ET celle
  // d'approche, qui cumulent jusqu'à 71 s de parole sur une même file.
  //
  // Le lâcher final allonge le freinage de deux secondes ; elles sont reprises
  // sur le forfait d'arrêt pour que la croisière - et donc l'horaire de la
  // boucle - ne bouge pas d'une seconde.
  brakeTime: 24,
  dwellTime: 20,
  departTime: 17,
  doorTime: 2.6,
  /**
   * Course de fermeture d'une porte palière (s).
   *
   * Elle est ici, et non parmi les profils de systems/doorMotion, parce qu'un
   * autre module en dépend : c'est cette durée qui décide combien de paires
   * Mi5–Do5 l'avertisseur de fermeture a le temps de donner (voir
   * data/psdCloseWarning et tests/psdCloseWarning.test.ts). Trois, en l'état -
   * et raccourcir la course sans y penser en retirerait une.
   */
  psdCloseTime: 0.9,
  // Vitesses et hauteurs (mètres, m/s, km/h).
  maxSpeedKmh: 90,
  walkSpeed: 1.4,
  // Le quai est bien plus long que le wagon : sans presser le pas on n'en
  // verrait jamais le bout pendant un arrêt.
  runSpeed: 3,
  eyeHeight: 1.55,
  sitHeight: 1.16,
  // Station initiale (scène avant le clic). Au boarding, randomizeEntry()
  // re-tire gare + phase ; l'horloge se cale sur Tokyo au start.
  startIndex: Math.floor(Math.random() * 30),
  clockStart: 16 * 60 + 51,
  // Rendu. (Un `exposure: 0.85` a vécu ici sans jamais être appliqué à
  // `gl.toneMappingExposure` : l'exposition vient du ton mapping de la scène.)
  bloom: 0.25,
  // Géométrie intérieure du wagon (demi-dimensions).
  carHalfLength: 10,
  carHalfWidth: 1.4,
  carHeight: 2.38,
  doorCenters: [-7.5, -2.5, 2.5, 7.5],
  doorHalfWidth: 0.66,
  // Intervalle entre joints de rail (mètres).
  railJointGap: 23,
  // Sonorisation : diffuseurs de plafond du wagon (de part et d'autre du
  // caisson central, au droit de chaque porte). Ceux du QUAI ne sont pas ici :
  // ils appartiennent à la gare, qui les répartit sur toute sa longueur
  // (systems/stationPlacement, data/stationGeometry).
  speakerX: 1.02,
  speakerY: 2.364
  // encastré dans le plafond (sous-face à 2,38 m)
};
var V_MAX = CONFIG.maxSpeedKmh / 3.6;
var CABIN_SPEAKERS = CONFIG.doorCenters.flatMap(
  (z) => [1, -1].map((s) => [s * CONFIG.speakerX, CONFIG.speakerY, z])
);

// ../../../brunopaiva15/yamanote-3d/src/data/e235.ts
var E235 = {
  /** Entraxe des caisses : c'est la trame sur laquelle le quai est bâti. */
  pitch: 20,
  /** Longueur de caisse hors soufflet (20 000 mm bogie à bogie, caisse un peu plus courte). */
  bodyHalfLen: 9.8,
  /** Demi-largeur de caisse (2 950 mm). */
  halfWidth: 1.475,
  /** Ligne de toit (3 620 mm au-dessus du rail). */
  roofY: 2.49,
  /** Sommet du toit bombé. */
  roofCrownY: 2.6,
  /** Sommet des carénages de climatisation (≈ 4 070 mm rail). */
  acTopY: 2.92,
  /** Sous-face du châssis et bas de jupe. */
  underframeY: -0.1,
  skirtY: -0.74,
  /** Champignon du rail (1 130 mm sous le plancher). */
  railY: -1.13,
  /** Bogies : entraxe 13 800 mm, empattement 2 100 mm, roues Ø 810 mm. */
  bogieDz: 6.9,
  axleDz: 1.05,
  wheelR: 0.405,
  /** Portes : mêmes cotes que l'intérieur, sinon rien ne s'aligne. */
  doorCenters: CONFIG.doorCenters,
  doorHalfW: CONFIG.doorHalfWidth,
  doorH: 1.85,
  /** Face extérieure des vantaux, juste devant la peau de caisse. */
  doorFaceX: 1.5,
  /** Bandeau vitré, aligné sur les baies de l'intérieur. */
  windowBottom: 0.85,
  windowTop: 1.75,
  windowRadius: 0.11,
  /** Montant entre deux baies d'un même panneau. */
  pillar: 0.16,
  /**
   * Habillage uguisu (黄緑6号). Le E235-0 n'a PAS de bandeau continu en haut de
   * caisse : le vert est AUX PORTES, et il monte du bas de caisse jusqu'au
   * pavillon. Les vantaux, verts eux aussi, n'en sont que la partie basse
   * mobile ; au-dessus, c'est la caisse qui est verte. Entre deux portes, le
   * haut de caisse reste inox.
   */
  doorGreenTop: 2.38,
  /** Nez de cabine : longueur du masque vert et hauteur de son pare-brise. */
  cabLen: 2.1,
  windshieldBottom: 1.02,
  windshieldTop: 2.16
};
var PLAYER_CAR = 5;
var CONSIST = [
  { no: 1, kind: "cab", label: "\u30AF\u30CFE235-0", panto: false },
  { no: 2, kind: "motor", label: "\u30E2\u30CFE235-0", panto: false },
  { no: 3, kind: "motor", label: "\u30E2\u30CFE234-0", panto: true },
  { no: 4, kind: "trailer", label: "\u30B5\u30CFE235-0", panto: false },
  { no: 5, kind: "motor", label: "\u30E2\u30CFE235-0", panto: false },
  { no: 6, kind: "motor", label: "\u30E2\u30CFE234-0", panto: true },
  { no: 7, kind: "trailer", label: "\u30B5\u30CFE235-500", panto: false },
  { no: 8, kind: "motor", label: "\u30E2\u30CFE235-0", panto: false },
  { no: 9, kind: "motor", label: "\u30E2\u30CFE234-0", panto: true },
  { no: 10, kind: "trailer", label: "\u30B5\u30CFE235-4600", panto: false },
  { no: 11, kind: "cab", label: "\u30AF\u30CFE234-0", panto: false }
];
function carZ(index) {
  return (index - PLAYER_CAR) * E235.pitch;
}

// ../../../brunopaiva15/yamanote-3d/src/data/loop.ts
var STATION_COUNT = 30;
function wrapStation(index) {
  return (index % STATION_COUNT + STATION_COUNT) % STATION_COUNT;
}
function directionStep(dir) {
  return dir === "outer" ? -1 : 1;
}
function nextStation(index, dir) {
  return wrapStation(index + directionStep(dir));
}
function prevStation(index, dir) {
  return wrapStation(index - directionStep(dir));
}
function stationAtHop(from, hops, dir) {
  return wrapStation(from + hops * directionStep(dir));
}

// ../../../brunopaiva15/yamanote-3d/src/data/stations.ts
var STATIONS = [
  { jy: "JY01", kanji: "\u6771\u4EAC", kana: "\u3068\u3046\u304D\u3087\u3046", romaji: "Tokyo", code: "TYO", zh: "\u4E1C\u4EAC", ko: "\uB3C4\uCFC4" },
  { jy: "JY02", kanji: "\u795E\u7530", kana: "\u304B\u3093\u3060", romaji: "Kanda", code: "KND", zh: "\u795E\u7530", ko: "\uAC04\uB2E4" },
  { jy: "JY03", kanji: "\u79CB\u8449\u539F", kana: "\u3042\u304D\u306F\u3070\u3089", romaji: "Akihabara", code: "AKB", zh: "\u79CB\u53F6\u539F", ko: "\uC544\uD0A4\uD558\uBC14\uB77C" },
  { jy: "JY04", kanji: "\u5FA1\u5F92\u753A", kana: "\u304A\u304B\u3061\u307E\u3061", romaji: "Okachimachi", code: "OKC", zh: "\u5FA1\u5F92\u753A", ko: "\uC624\uCE74\uCE58\uB9C8\uCE58" },
  { jy: "JY05", kanji: "\u4E0A\u91CE", kana: "\u3046\u3048\u306E", romaji: "Ueno", code: "UEN", zh: "\u4E0A\u91CE", ko: "\uC6B0\uC5D0\uB178" },
  { jy: "JY06", kanji: "\u9DAF\u8C37", kana: "\u3046\u3050\u3044\u3059\u3060\u306B", romaji: "Uguisudani", code: "UGD", zh: "\u83BA\u8C37", ko: "\uC6B0\uAD6C\uC774\uC2A4\uB2E4\uB2C8" },
  { jy: "JY07", kanji: "\u65E5\u66AE\u91CC", kana: "\u306B\u3063\u307D\u308A", romaji: "Nippori", code: "NPR", zh: "\u65E5\u66AE\u91CC", ko: "\uB2DB\uD3EC\uB9AC" },
  { jy: "JY08", kanji: "\u897F\u65E5\u66AE\u91CC", kana: "\u306B\u3057\u306B\u3063\u307D\u308A", romaji: "Nishi-Nippori", code: "NNP", zh: "\u897F\u65E5\u66AE\u91CC", ko: "\uB2C8\uC2DC\uB2DB\uD3EC\uB9AC" },
  { jy: "JY09", kanji: "\u7530\u7AEF", kana: "\u305F\u3070\u305F", romaji: "Tabata", code: "TBT", zh: "\u7530\u7AEF", ko: "\uB2E4\uBC14\uD0C0" },
  { jy: "JY10", kanji: "\u99D2\u8FBC", kana: "\u3053\u307E\u3054\u3081", romaji: "Komagome", code: "KMG", zh: "\u9A79\u8FBC", ko: "\uACE0\uB9C8\uACE0\uBA54" },
  { jy: "JY11", kanji: "\u5DE3\u9D28", kana: "\u3059\u304C\u3082", romaji: "Sugamo", code: "SGM", zh: "\u5DE2\u9E2D", ko: "\uC2A4\uAC00\uBAA8" },
  { jy: "JY12", kanji: "\u5927\u585A", kana: "\u304A\u304A\u3064\u304B", romaji: "\u014Ctsuka", code: "OTS", zh: "\u5927\u585A", ko: "\uC624\uC4F0\uCE74" },
  { jy: "JY13", kanji: "\u6C60\u888B", kana: "\u3044\u3051\u3076\u304F\u308D", romaji: "Ikebukuro", code: "IKB", zh: "\u6C60\u888B", ko: "\uC774\uCF00\uBD80\uCFE0\uB85C" },
  { jy: "JY14", kanji: "\u76EE\u767D", kana: "\u3081\u3058\u308D", romaji: "Mejiro", code: "MJR", zh: "\u76EE\u767D", ko: "\uBA54\uC9C0\uB85C" },
  { jy: "JY15", kanji: "\u9AD8\u7530\u99AC\u5834", kana: "\u305F\u304B\u3060\u306E\u3070\u3070", romaji: "Takadanobaba", code: "TKB", zh: "\u9AD8\u7530\u9A6C\u573A", ko: "\uB2E4\uCE74\uB2E4\uB178\uBC14\uBC14" },
  { jy: "JY16", kanji: "\u65B0\u5927\u4E45\u4FDD", kana: "\u3057\u3093\u304A\u304A\u304F\u307C", romaji: "Shin-\u014Ckubo", code: "SOK", zh: "\u65B0\u5927\u4E45\u4FDD", ko: "\uC2E0\uC624\uCFE0\uBCF4" },
  { jy: "JY17", kanji: "\u65B0\u5BBF", kana: "\u3057\u3093\u3058\u3085\u304F", romaji: "Shinjuku", code: "SJK", zh: "\u65B0\u5BBF", ko: "\uC2E0\uC8FC\uCFE0" },
  { jy: "JY18", kanji: "\u4EE3\u3005\u6728", kana: "\u3088\u3088\u304E", romaji: "Yoyogi", code: "YOY", zh: "\u4EE3\u4EE3\u6728", ko: "\uC694\uC694\uAE30" },
  { jy: "JY19", kanji: "\u539F\u5BBF", kana: "\u306F\u3089\u3058\u3085\u304F", romaji: "Harajuku", code: "JYH", zh: "\u539F\u5BBF", ko: "\uD558\uB77C\uC8FC\uCFE0" },
  { jy: "JY20", kanji: "\u6E0B\u8C37", kana: "\u3057\u3076\u3084", romaji: "Shibuya", code: "SBY", zh: "\u6DA9\u8C37", ko: "\uC2DC\uBD80\uC57C" },
  { jy: "JY21", kanji: "\u6075\u6BD4\u5BFF", kana: "\u3048\u3073\u3059", romaji: "Ebisu", code: "EBS", zh: "\u60E0\u6BD4\u5BFF", ko: "\uC5D0\uBE44\uC2A4" },
  { jy: "JY22", kanji: "\u76EE\u9ED2", kana: "\u3081\u3050\u308D", romaji: "Meguro", code: "MGR", zh: "\u76EE\u9ED1", ko: "\uBA54\uAD6C\uB85C" },
  { jy: "JY23", kanji: "\u4E94\u53CD\u7530", kana: "\u3054\u305F\u3093\u3060", romaji: "Gotanda", code: "GTN", zh: "\u4E94\u53CD\u7530", ko: "\uACE0\uD0C4\uB2E4" },
  { jy: "JY24", kanji: "\u5927\u5D0E", kana: "\u304A\u304A\u3055\u304D", romaji: "\u014Csaki", code: "OSK", zh: "\u5927\u5D0E", ko: "\uC624\uC0AC\uD0A4" },
  { jy: "JY25", kanji: "\u54C1\u5DDD", kana: "\u3057\u306A\u304C\u308F", romaji: "Shinagawa", code: "SGW", zh: "\u54C1\u5DDD", ko: "\uC2DC\uB098\uAC00\uC640" },
  { jy: "JY26", kanji: "\u9AD8\u8F2A\u30B2\u30FC\u30C8\u30A6\u30A7\u30A4", kana: "\u305F\u304B\u306A\u308F\u3052\u30FC\u3068\u3046\u3047\u3044", romaji: "Takanawa Gateway", code: "TGW", zh: "\u9AD8\u8F6EGateway", ko: "\uB2E4\uCE74\uB098\uC640 \uAC8C\uC774\uD2B8\uC6E8\uC774" },
  { jy: "JY27", kanji: "\u7530\u753A", kana: "\u305F\u307E\u3061", romaji: "Tamachi", code: "TMC", zh: "\u7530\u753A", ko: "\uB2E4\uB9C8\uCE58" },
  { jy: "JY28", kanji: "\u6D5C\u677E\u753A", kana: "\u306F\u307E\u307E\u3064\u3061\u3087\u3046", romaji: "Hamamatsuch\u014D", code: "HMC", zh: "\u6EE8\u677E\u753A", ko: "\uD558\uB9C8\uB9C8\uC4F0\uCD08" },
  { jy: "JY29", kanji: "\u65B0\u6A4B", kana: "\u3057\u3093\u3070\u3057", romaji: "Shimbashi", code: "SMB", zh: "\u65B0\u6865", ko: "\uC2E0\uBC14\uC2DC" },
  { jy: "JY30", kanji: "\u6709\u697D\u753A", kana: "\u3086\u3046\u3089\u304F\u3061\u3087\u3046", romaji: "Y\u016Brakuch\u014D", code: "YUR", zh: "\u6709\u4E50\u753A", ko: "\uC720\uB77C\uCFE0\uCD08" }
];
var CODED_JY = /* @__PURE__ */ new Set([
  "JY01",
  // 東京 TYO
  "JY02",
  // 神田 KND
  "JY03",
  // 秋葉原 AKB
  "JY05",
  // 上野 UEN
  "JY07",
  // 日暮里 NPR
  "JY13",
  // 池袋 IKB
  "JY17",
  // 新宿 SJK
  "JY20",
  // 渋谷 SBY
  "JY21",
  // 恵比寿 EBS
  "JY24",
  // 大崎 OSK
  "JY25",
  // 品川 SGW
  "JY26",
  // 高輪ゲートウェイ TGW - attribué à l'ouverture, en 2020
  "JY28",
  // 浜松町 HMC
  "JY29"
  // 新橋 SMB
]);
function stationCode(st) {
  return CODED_JY.has(st.jy) ? st.code : "";
}
var DOOR_SIDE = [
  // JY01 Tokyo     JY02 Kanda     JY03 Akihabara  JY04 Okachimachi JY05 Ueno
  -1,
  -1,
  -1,
  -1,
  -1,
  // JY06 Uguisudani JY07 Nippori  JY08 N.-Nippori JY09 Tabata      JY10 Komagome
  -1,
  -1,
  -1,
  -1,
  1,
  // JY11 Sugamo    JY12 Ōtsuka    JY13 Ikebukuro  JY14 Mejiro      JY15 Takadanobaba
  1,
  1,
  -1,
  1,
  1,
  // JY16 Shin-Ōkubo JY17 Shinjuku JY18 Yoyogi     JY19 Harajuku    JY20 Shibuya
  1,
  -1,
  -1,
  1,
  1,
  // JY21 Ebisu     JY22 Meguro    JY23 Gotanda    JY24 Ōsaki       JY25 Shinagawa
  1,
  1,
  1,
  1,
  1,
  // JY26 Takanawa G. JY27 Tamachi JY28 Hamamatsu. JY29 Shimbashi   JY30 Yūrakuchō
  1,
  -1,
  -1,
  -1,
  -1
];
var TRANSFERS = {
  JY01: {
    jp: "\u4E2D\u592E\u7DDA\u3001\u4EAC\u6D5C\u6771\u5317\u7DDA\u3001\u6771\u6D77\u9053\u7DDA\u3001\u6A2A\u9808\u8CC0\u7DDA\u3001\u7DCF\u6B66\u7DDA\u5FEB\u901F\u3001\u4EAC\u8449\u7DDA\u3001\u4E0A\u91CE\u6771\u4EAC\u30E9\u30A4\u30F3\u3001\u6771\u6D77\u9053\u65B0\u5E79\u7DDA\u3001\u6771\u4EAC\u30E1\u30C8\u30ED\u4E38\u30CE\u5185\u7DDA",
    en: "the Chuo, Keihin-Tohoku, Tokaido, Yokosuka, Sobu, Keiyo and Ueno-Tokyo Lines, the Tokaido Shinkansen, and the Tokyo Metro Marunouchi Line"
  },
  JY02: { jp: "\u4EAC\u6D5C\u6771\u5317\u7DDA\u3001\u4E2D\u592E\u7DDA\u3001\u6771\u4EAC\u30E1\u30C8\u30ED\u9280\u5EA7\u7DDA", en: "the Keihin-Tohoku and Chuo Lines, and the Tokyo Metro Ginza Line" },
  JY03: {
    jp: "\u4EAC\u6D5C\u6771\u5317\u7DDA\u3001\u4E2D\u592E\u30FB\u7DCF\u6B66\u7DDA\u3001\u6771\u4EAC\u30E1\u30C8\u30ED\u65E5\u6BD4\u8C37\u7DDA\u3001\u3064\u304F\u3070\u30A8\u30AF\u30B9\u30D7\u30EC\u30B9",
    en: "the Keihin-Tohoku and Chuo-Sobu Lines, the Tokyo Metro Hibiya Line, and the Tsukuba Express"
  },
  JY04: {
    jp: "\u4EAC\u6D5C\u6771\u5317\u7DDA\u3001\u6771\u4EAC\u30E1\u30C8\u30ED\u9280\u5EA7\u7DDA\u3001\u65E5\u6BD4\u8C37\u7DDA\u3001\u90FD\u55B6\u5927\u6C5F\u6238\u7DDA",
    en: "the Keihin-Tohoku Line, the Tokyo Metro Ginza and Hibiya Lines, and the Toei Oedo Line"
  },
  JY05: {
    jp: "\u4EAC\u6D5C\u6771\u5317\u7DDA\u3001\u5B87\u90FD\u5BAE\u7DDA\u3001\u9AD8\u5D0E\u7DDA\u3001\u5E38\u78D0\u7DDA\u3001\u4E0A\u91CE\u6771\u4EAC\u30E9\u30A4\u30F3\u3001\u6771\u5317\u30FB\u4E0A\u8D8A\u65B0\u5E79\u7DDA\u3001\u6771\u4EAC\u30E1\u30C8\u30ED\u9280\u5EA7\u7DDA\u3001\u65E5\u6BD4\u8C37\u7DDA\u3001\u4EAC\u6210\u7DDA",
    en: "the Keihin-Tohoku, Utsunomiya, Takasaki, Joban and Ueno-Tokyo Lines, the Tohoku and Joetsu Shinkansen, the Tokyo Metro Ginza and Hibiya Lines, and the Keisei Line"
  },
  JY07: {
    jp: "\u4EAC\u6D5C\u6771\u5317\u7DDA\u3001\u5E38\u78D0\u7DDA\u3001\u4EAC\u6210\u7DDA\u3001\u65E5\u66AE\u91CC\u30FB\u820E\u4EBA\u30E9\u30A4\u30CA\u30FC",
    en: "the Keihin-Tohoku and Joban Lines, the Keisei Line, and the Nippori-Toneri Liner"
  },
  JY08: {
    jp: "\u4EAC\u6D5C\u6771\u5317\u7DDA\u3001\u6771\u4EAC\u30E1\u30C8\u30ED\u5343\u4EE3\u7530\u7DDA\u3001\u65E5\u66AE\u91CC\u30FB\u820E\u4EBA\u30E9\u30A4\u30CA\u30FC",
    en: "the Keihin-Tohoku Line, the Tokyo Metro Chiyoda Line, and the Nippori-Toneri Liner"
  },
  JY09: { jp: "\u4EAC\u6D5C\u6771\u5317\u7DDA", en: "the Keihin-Tohoku Line" },
  JY10: { jp: "\u6771\u4EAC\u30E1\u30C8\u30ED\u5357\u5317\u7DDA", en: "the Tokyo Metro Namboku Line" },
  JY11: { jp: "\u90FD\u55B6\u4E09\u7530\u7DDA", en: "the Toei Mita Line" },
  JY12: { jp: "\u90FD\u96FB\u8352\u5DDD\u7DDA", en: "the Toden Arakawa Line" },
  JY13: {
    jp: "\u57FC\u4EAC\u7DDA\u3001\u6E58\u5357\u65B0\u5BBF\u30E9\u30A4\u30F3\u3001\u6771\u4EAC\u30E1\u30C8\u30ED\u4E38\u30CE\u5185\u7DDA\u3001\u6709\u697D\u753A\u7DDA\u3001\u526F\u90FD\u5FC3\u7DDA\u3001\u6771\u6B66\u6771\u4E0A\u7DDA\u3001\u897F\u6B66\u6C60\u888B\u7DDA",
    en: "the Saikyo and Shonan-Shinjuku Lines, the Tokyo Metro Marunouchi, Yurakucho and Fukutoshin Lines, the Tobu Tojo Line, and the Seibu Ikebukuro Line"
  },
  JY15: { jp: "\u897F\u6B66\u65B0\u5BBF\u7DDA\u3001\u6771\u4EAC\u30E1\u30C8\u30ED\u6771\u897F\u7DDA", en: "the Seibu Shinjuku Line and the Tokyo Metro Tozai Line" },
  JY17: {
    jp: "\u4E2D\u592E\u7DDA\u3001\u4E2D\u592E\u30FB\u7DCF\u6B66\u7DDA\u3001\u57FC\u4EAC\u7DDA\u3001\u6E58\u5357\u65B0\u5BBF\u30E9\u30A4\u30F3\u3001\u5C0F\u7530\u6025\u7DDA\u3001\u4EAC\u738B\u7DDA\u3001\u6771\u4EAC\u30E1\u30C8\u30ED\u4E38\u30CE\u5185\u7DDA\u3001\u90FD\u55B6\u65B0\u5BBF\u7DDA\u3001\u5927\u6C5F\u6238\u7DDA",
    en: "the Chuo, Chuo-Sobu, Saikyo and Shonan-Shinjuku Lines, the Odakyu Line, the Keio Line, the Tokyo Metro Marunouchi Line, and the Toei Shinjuku and Oedo Lines"
  },
  JY18: { jp: "\u4E2D\u592E\u30FB\u7DCF\u6B66\u7DDA\u3001\u90FD\u55B6\u5927\u6C5F\u6238\u7DDA", en: "the Chuo-Sobu Line and the Toei Oedo Line" },
  JY19: { jp: "\u6771\u4EAC\u30E1\u30C8\u30ED\u5343\u4EE3\u7530\u7DDA\u3001\u526F\u90FD\u5FC3\u7DDA", en: "the Tokyo Metro Chiyoda and Fukutoshin Lines" },
  JY20: {
    jp: "\u57FC\u4EAC\u7DDA\u3001\u6E58\u5357\u65B0\u5BBF\u30E9\u30A4\u30F3\u3001\u6771\u4EAC\u30E1\u30C8\u30ED\u9280\u5EA7\u7DDA\u3001\u534A\u8535\u9580\u7DDA\u3001\u526F\u90FD\u5FC3\u7DDA\u3001\u6771\u6025\u6771\u6A2A\u7DDA\u3001\u7530\u5712\u90FD\u5E02\u7DDA\u3001\u4EAC\u738B\u4E95\u306E\u982D\u7DDA",
    en: "the Saikyo and Shonan-Shinjuku Lines, the Tokyo Metro Ginza, Hanzomon and Fukutoshin Lines, the Tokyu Toyoko and Den-en-toshi Lines, and the Keio Inokashira Line"
  },
  JY21: {
    jp: "\u57FC\u4EAC\u7DDA\u3001\u6E58\u5357\u65B0\u5BBF\u30E9\u30A4\u30F3\u3001\u6771\u4EAC\u30E1\u30C8\u30ED\u65E5\u6BD4\u8C37\u7DDA",
    en: "the Saikyo and Shonan-Shinjuku Lines, and the Tokyo Metro Hibiya Line"
  },
  JY22: {
    jp: "\u6771\u4EAC\u30E1\u30C8\u30ED\u5357\u5317\u7DDA\u3001\u90FD\u55B6\u4E09\u7530\u7DDA\u3001\u6771\u6025\u76EE\u9ED2\u7DDA",
    en: "the Tokyo Metro Namboku Line, the Toei Mita Line, and the Tokyu Meguro Line"
  },
  JY23: { jp: "\u90FD\u55B6\u6D45\u8349\u7DDA\u3001\u6771\u6025\u6C60\u4E0A\u7DDA", en: "the Toei Asakusa Line and the Tokyu Ikegami Line" },
  JY24: {
    jp: "\u57FC\u4EAC\u7DDA\u3001\u6E58\u5357\u65B0\u5BBF\u30E9\u30A4\u30F3\u3001\u308A\u3093\u304B\u3044\u7DDA",
    en: "the Saikyo and Shonan-Shinjuku Lines, and the Rinkai Line"
  },
  JY25: {
    jp: "\u6771\u6D77\u9053\u7DDA\u3001\u6A2A\u9808\u8CC0\u7DDA\u3001\u4EAC\u6D5C\u6771\u5317\u7DDA\u3001\u4E0A\u91CE\u6771\u4EAC\u30E9\u30A4\u30F3\u3001\u6771\u6D77\u9053\u65B0\u5E79\u7DDA\u3001\u4EAC\u6025\u7DDA",
    en: "the Tokaido, Yokosuka, Keihin-Tohoku and Ueno-Tokyo Lines, the Tokaido Shinkansen, and the Keikyu Line"
  },
  JY28: {
    jp: "\u4EAC\u6D5C\u6771\u5317\u7DDA\u3001\u6771\u4EAC\u30E2\u30CE\u30EC\u30FC\u30EB\u3001\u90FD\u55B6\u6D45\u8349\u7DDA\u3001\u5927\u6C5F\u6238\u7DDA",
    en: "the Keihin-Tohoku Line, the Tokyo Monorail, and the Toei Asakusa and Oedo Lines"
  },
  JY29: {
    jp: "\u6771\u6D77\u9053\u7DDA\u3001\u6A2A\u9808\u8CC0\u7DDA\u3001\u4EAC\u6D5C\u6771\u5317\u7DDA\u3001\u4E0A\u91CE\u6771\u4EAC\u30E9\u30A4\u30F3\u3001\u6771\u4EAC\u30E1\u30C8\u30ED\u9280\u5EA7\u7DDA\u3001\u90FD\u55B6\u6D45\u8349\u7DDA\u3001\u3086\u308A\u304B\u3082\u3081",
    en: "the Tokaido, Yokosuka, Keihin-Tohoku and Ueno-Tokyo Lines, the Tokyo Metro Ginza Line, the Toei Asakusa Line, and the Yurikamome"
  },
  JY30: { jp: "\u4EAC\u6D5C\u6771\u5317\u7DDA\u3001\u6771\u4EAC\u30E1\u30C8\u30ED\u6709\u697D\u753A\u7DDA", en: "the Keihin-Tohoku Line and the Tokyo Metro Yurakucho Line" }
};
var LOOP_HUB_JY = ["JY01", "JY05", "JY13", "JY17", "JY20", "JY25"];
var LOOP_HUB_INDICES = STATIONS.reduce((out, st, i) => {
  if (LOOP_HUB_JY.includes(st.jy)) out.push(i);
  return out;
}, []);

// ../../../brunopaiva15/yamanote-3d/src/data/segments.ts
var segmentAt = (stationIndex, dir) => dir === "outer" ? wrapStation(stationIndex) : wrapStation(stationIndex - 1);
var SEGMENT_KM = [
  /* 00 Tokyo→Kanda             */
  1.3,
  /* 01 Kanda→Akihabara         */
  0.7,
  /* 02 Akihabara→Okachimachi   */
  1,
  /* 03 Okachimachi→Ueno        */
  0.6,
  /* 04 Ueno→Uguisudani         */
  1.1,
  /* 05 Uguisudani→Nippori      */
  1.1,
  /* 06 Nippori→Nishi-Nippori   */
  0.5,
  /* 07 Nishi-Nippori→Tabata    */
  0.8,
  /* 08 Tabata→Komagome         */
  1.6,
  /* 09 Komagome→Sugamo         */
  0.7,
  /* 10 Sugamo→Otsuka           */
  1.1,
  /* 11 Otsuka→Ikebukuro        */
  1.8,
  /* 12 Ikebukuro→Mejiro        */
  1.2,
  /* 13 Mejiro→Takadanobaba     */
  0.9,
  /* 14 Takadanobaba→Shin-Okubo */
  1.4,
  /* 15 Shin-Okubo→Shinjuku     */
  1.3,
  /* 16 Shinjuku→Yoyogi         */
  0.7,
  /* 17 Yoyogi→Harajuku         */
  1.5,
  /* 18 Harajuku→Shibuya        */
  1.2,
  /* 19 Shibuya→Ebisu           */
  1.6,
  /* 20 Ebisu→Meguro            */
  1.5,
  /* 21 Meguro→Gotanda          */
  1.2,
  /* 22 Gotanda→Osaki           */
  0.9,
  /* 23 Osaki→Shinagawa         */
  2,
  /* 24 Shinagawa→Takanawa GW   */
  0.9,
  /* 25 Takanawa Gateway→Tamachi*/
  1.3,
  /* 26 Tamachi→Hamamatsucho    */
  1.5,
  /* 27 Hamamatsucho→Shimbashi  */
  1.2,
  /* 28 Shimbashi→Yurakucho     */
  1.1,
  /* 29 Yurakucho→Tokyo         */
  0.8
];
var LOOP_KM = 34.5;
var LOOP_MINUTES = 64;
var STOP_FIXED_S = CONFIG.departTime + CONFIG.brakeTime + CONFIG.dwellTime;
var LOOP_CRUISE_S = LOOP_MINUTES * 60 - STATION_COUNT * STOP_FIXED_S;
var SEGMENT_HEADWAY_SEC = SEGMENT_KM.map(
  (km) => STOP_FIXED_S + LOOP_CRUISE_S * km / LOOP_KM
);
var SEGMENT_HEADWAY_MIN = SEGMENT_HEADWAY_SEC.map(
  (s) => Math.round(s / 60)
);
function segmentForArrival(stationIndex, dir) {
  return segmentAt(stationIndex, dir);
}
function segmentForHop(fromIndex, dir) {
  return segmentForArrival(nextStation(fromIndex, dir), dir);
}
function headwaySecondsTo(fromIndex, hops, dir) {
  let total = 0;
  let idx = fromIndex;
  for (let k = 0; k < hops; k++) {
    total += SEGMENT_HEADWAY_SEC[segmentForHop(idx, dir)];
    idx = stationAtHop(idx, 1, dir);
  }
  return total;
}
function headwayMinutesTo(fromIndex, hops, dir) {
  return Math.round(headwaySecondsTo(fromIndex, hops, dir) / 60);
}
function cruiseDuration(stationIndex, dir) {
  const headwaySec = SEGMENT_HEADWAY_SEC[segmentForArrival(stationIndex, dir)];
  const fixed = CONFIG.departTime + CONFIG.brakeTime + CONFIG.dwellTime;
  return Math.max(8, headwaySec - fixed);
}
var ROOF_HUBS = Object.fromEntries(
  LOOP_HUB_INDICES.map((i) => [i, "steel"])
);

// ../../../brunopaiva15/yamanote-3d/src/data/stationGeometry.ts
var PLATFORM_TOP = -0.06;
var PSD_X = 1.78;
var PSD_H = 1.32;
var PSD_HALF_GAP = 0.9;
var PSD_LEAF_W = 0.98;
var PSD_LEAF_TRAVEL = 0.92;
var PSD_LEAF_TIP_INSET = 4e-3;
var PSD_POCKET_LEN = PSD_LEAF_W + PSD_LEAF_TRAVEL + PSD_LEAF_TIP_INSET - PSD_HALF_GAP + 0.05;
var PSD_WALL_T = 0.1;
var PSD_JOINT_T = PSD_WALL_T + 0.01;
var PSD_BAND_T = PSD_JOINT_T + 0.02;
var PSD_FACE_X = PSD_X + PSD_WALL_T / 2;
var PSD_BUZZER_X = PSD_X + PSD_BAND_T / 2;
var PSD_BUZZER_Y = PLATFORM_TOP + PSD_H - 0.02;
var PLATFORM_DEPTH = 5.4;
var PLATFORM_BACK_X = PSD_X + PLATFORM_DEPTH - 0.15;
var PLATFORM_MID_X = PSD_X + PLATFORM_DEPTH * 0.55;
var STAIR_HALF_Z = 2.6;
var ESCALATOR_HALF_Z = 3.6;
var ELEVATOR_HALF_Z = 0.95;
var KIOSK_HALF_Z = 3.2;
function directionBandZs(length) {
  const halfZ = length / 2;
  return [-halfZ + 31, -halfZ + 109, -halfZ + 161];
}
var STAIR_RISE = 0.175;
var STAIR_GOING = 0.31;
var STAIR_STEPS = 15;
var STAIR_CLEAR_HALF_X = 1.32;
var STAIR_CLEAR_Z1 = 2.42;
var STAIR_LAP = 0.02;
var STAIR_OPENING_HALF_X = STAIR_CLEAR_HALF_X + STAIR_LAP;
var STAIR_OPENING_Z0 = -STAIR_HALF_Z + STAIR_GOING;
var STAIR_OPENING_Z1 = STAIR_CLEAR_Z1 + STAIR_LAP;
var STAIR_LANDING_Y = -STAIR_STEPS * STAIR_RISE;
var STAIR_SOFFIT_Y = STAIR_LANDING_Y - 0.3;
var STAIR_LINTEL_Y = -0.48;
var STAIR_HEADROOM = STAIR_LINTEL_Y - STAIR_LANDING_Y;
var STAIR_LOWER_STEPS = 6;
var STAIR_LOWER_Y = STAIR_LANDING_Y - STAIR_LOWER_STEPS * STAIR_RISE;
var STAIR_LOWER_Z0 = STAIR_CLEAR_Z1;
var STAIR_LOWER_Z1 = STAIR_LOWER_Z0 + (STAIR_LOWER_STEPS + 1) * STAIR_GOING;
var STAIR_LOWER_END = 8.8;
var STAIR_WALK_STEPS = 5;
var STAIR_WALK_Y = -STAIR_WALK_STEPS * STAIR_RISE;
var STAIR_WALK_LEN = (STAIR_WALK_STEPS + 1) * STAIR_GOING - 0.02;
var STAIR_FULL_LEN = (STAIR_STEPS + 1) * STAIR_GOING + 1.05;
var STAIR_FULL_STEPS = STAIR_STEPS + 3;
var DESCENT_LOWER_T = STAIR_LOWER_Z0 + STAIR_HALF_Z;
var DESCENT_LEN = STAIR_LOWER_END + STAIR_HALF_Z;
var ESCALATOR_SLOPE = Math.PI / 6;
var ESCALATOR_DROP = -STAIR_LOWER_Y;
var ESCALATOR_RUN = ESCALATOR_DROP / Math.tan(ESCALATOR_SLOPE);
var ESCALATOR_LANDING = ESCALATOR_HALF_Z - ESCALATOR_RUN / 2;
var ESCALATOR_CLEAR_HALF_X = 0.72;
var ESCALATOR_OPENING_HALF_X = ESCALATOR_CLEAR_HALF_X + STAIR_LAP;
var ESCALATOR_OPENING_Z0 = -ESCALATOR_RUN / 2;
var ESCALATOR_OPENING_Z1 = ESCALATOR_HALF_Z - 0.24;
var ASCENT_STEPS_A = 15;
var ASCENT_LANDING_LEN = 4 * STAIR_GOING;
var ASCENT_STEPS_B = 14;
var ASCENT_FLOOR_Y = (ASCENT_STEPS_A + ASCENT_STEPS_B) * STAIR_RISE;
var ASCENT_A_END = (ASCENT_STEPS_A + 0.5) * STAIR_GOING;
var ASCENT_B_START = ASCENT_A_END + ASCENT_LANDING_LEN;
var ASCENT_LANDING_Y = ASCENT_STEPS_A * STAIR_RISE;
var ASCENT_LEN = ASCENT_B_START + (ASCENT_STEPS_B + 0.5) * STAIR_GOING + 0.6;

// ../../../brunopaiva15/yamanote-3d/src/data/stationLayouts.ts
var FULL_PLATFORM_LEN = 224;
function bays(length, spacing, from = -0.5, to = 0.5) {
  const out = [];
  const z0 = length * from + spacing * 0.4;
  const z1 = length * to - spacing * 0.4;
  for (let z = z0; z <= z1; z += spacing) out.push(z);
  return out;
}
function takanawaDeckZs(length) {
  return [-length * 0.22, length * 0.275];
}
var PALETTES = {
  // Béton clair et acier gris : la gare JR ordinaire.
  standard: {
    slab: "#c8c9c4",
    wall: "#b8bab4",
    column: "#8e9296",
    canopy: "#5e646a",
    accent: "#80c241",
    lamp: "#fff2d4",
    tile: "#c7b394"
  },
  // Tranchée : tout est plus sombre, la lumière vient d'en haut.
  trench: {
    slab: "#b9bab5",
    wall: "#9a9c96",
    column: "#7c8085",
    canopy: "#4e545a",
    accent: "#80c241",
    lamp: "#ffeec6",
    tile: "#a8977c"
  },
  // Viaduc : dalle plus claire, structure peinte en gris perle.
  viaduct: {
    slab: "#cdcec8",
    wall: "#c2c4bd",
    column: "#9aa0a4",
    canopy: "#6a7076",
    accent: "#80c241",
    lamp: "#fff5dc",
    tile: "#cfbb99"
  },
  // Grande gare : béton lissé pâle, charpente claire.
  hub: {
    slab: "#d2d3ce",
    wall: "#c6c8c2",
    column: "#a6abaf",
    canopy: "#7a8188",
    accent: "#80c241",
    lamp: "#fff8e6",
    tile: "#d3c0a0"
  },
  // Tokyo : brique et acier riveté sombre de la halle Marunouchi.
  tokyo: {
    slab: "#cfc9c1",
    wall: "#9d5a48",
    column: "#5d4038",
    canopy: "#6b5348",
    accent: "#80c241",
    lamp: "#ffeec0",
    tile: "#7d4636"
  },
  // Shinjuku : forêt de piliers, éclairage jaune, tout est plus bas.
  shinjuku: {
    slab: "#c2c3bd",
    wall: "#adaea8",
    column: "#8b8f92",
    canopy: "#565c62",
    accent: "#80c241",
    lamp: "#ffe9ae",
    tile: "#b39a70"
  },
  // Shibuya : verre et acier blanc de la reconstruction de 2023.
  shibuya: {
    slab: "#d8d9d5",
    wall: "#dcded9",
    column: "#c6cacd",
    canopy: "#aeb5ba",
    accent: "#80c241",
    lamp: "#ffffff",
    tile: "#c8ced2"
  },
  // Takanawa Gateway : acier blanc, cèdre clair, verre. La plus lumineuse de la
  // boucle - elle empruntait jusqu'ici la palette de Shibuya, qui est grise.
  //
  // Blanche, mais pas BLANCHE PARTOUT : c'est le piège de cette gare-là. Le
  // fond de travée est un mur-rideau, donc un gris bleuté de verre et non un
  // aplat crème ; le soubassement et les bancs sont en cèdre. Le blanc reste au
  // sol, aux poteaux et à la membrane du toit, où il est juste.
  takanawa: {
    slab: "#dcdcd6",
    wall: "#a9b6bd",
    column: "#e9eae6",
    canopy: "#e9e5d9",
    accent: "#80c241",
    lamp: "#ffffff",
    tile: "#c9a97c",
    bench: "#c2a271"
  },
  // Vieux viaduc de brique et d'acier : Yūrakuchō, Shimbashi. Piliers épais,
  // maçonnerie sombre, arcades commerçantes en dessous.
  brickViaduct: {
    slab: "#c6c2ba",
    wall: "#8f6551",
    column: "#4f4a45",
    canopy: "#5a5450",
    accent: "#80c241",
    lamp: "#ffe9bc",
    tile: "#7a4d3c"
  },
  // Harajuku : le bâtiment blanc de 2020 d'un côté, le Meiji-jingū de l'autre.
  harajuku: {
    slab: "#d4d5cf",
    wall: "#dcdcd4",
    column: "#b9bdb8",
    canopy: "#8f9690",
    accent: "#80c241",
    lamp: "#fff6e0",
    tile: "#b8a582"
  }
};
var FAMILY = {
  ground: {
    depth: PLATFORM_DEPTH + 2.2,
    canopy: "steel",
    canopyY: 4.1,
    columnSpacing: 12,
    palette: "standard"
  },
  elevated: {
    depth: PLATFORM_DEPTH + 1.4,
    canopy: "steel",
    canopyY: 3.9,
    columnSpacing: 11,
    palette: "viaduct"
  },
  trench: {
    depth: PLATFORM_DEPTH + 0.8,
    canopy: "slab",
    canopyY: 3.3,
    columnSpacing: 9,
    palette: "trench"
  }
};
var KT = "Keihin-T\u014Dhoku";
var SPECS = [
  {
    // JY01 - halle monumentale, voies 4 et 5 sur deux quais partagés avec la
    // Keihin-Tōhoku. Depuis le quai, ce n'est pas la façade de brique qu'on
    // voit, c'est un gigantesque environnement ferroviaire couvert.
    name: "JY01 Tokyo",
    elevation: "ground",
    config: "sharedIsland",
    sharedWith: KT,
    parallel: ["T\u014Dkaid\u014D", "Ch\u016B\u014D", "T\u014Dkaid\u014D Shinkansen"],
    signature: "tokyo",
    ambience: "hall",
    crowd: 2,
    depth: 10.5,
    canopy: "truss",
    // Sous la grande dalle de la halle (6,30 m) : l'auvent de quai reste dessous.
    canopyY: 5.5,
    columnSpacing: 16,
    palette: "tokyo"
  },
  {
    // JY02 - viaduc à trois quais centraux ; les voies 2 et 3 sont réunies sur
    // le même îlot. Quai étroit, charpente sombre, immeubles à toucher.
    name: "JY02 Kanda",
    elevation: "elevated",
    // Deux îlots partagés avec la Keihin-Tōhoku, et non un îlot Yamanote : les
    // voies 2 et 3 sont la paire CENTRALE, chacune adossée à une voie
    // Keihin-Tōhoku sur son quai. C'est ce qui met les portes à gauche dans les
    // deux sens, comme partout sur le côté est de la boucle.
    config: "sharedIsland",
    sharedWith: KT,
    parallel: ["Ch\u016B\u014D", "Ginza"],
    ambience: "street",
    crowd: 1,
    depth: PLATFORM_DEPTH + 0.6,
    canopyY: 3.7
  },
  {
    // JY03 - viaducs croisés : les voies 5 et 6 de la Chūō–Sōbu passent
    // perpendiculairement au niveau supérieur. Poutres massives, plafonds bas,
    // plusieurs couches de circulation visibles à la fois.
    name: "JY03 Akihabara",
    elevation: "elevated",
    config: "sharedIsland",
    sharedWith: KT,
    parallel: ["Ch\u016B\u014D\u2013S\u014Dbu", "Hibiya", "Tsukuba Express"],
    signature: "akihabara",
    ambience: "electric",
    crowd: 1.4,
    depth: PLATFORM_DEPTH + 1,
    canopyY: 3.7,
    columnSpacing: 9.5
  },
  {
    // JY04 - quatre voies parallèles sur viaduc, quais rectilignes et étroits,
    // couverture métallique presque continue. Ameyoko est juste dessous.
    name: "JY04 Okachimachi",
    elevation: "elevated",
    config: "sharedIsland",
    sharedWith: KT,
    parallel: ["Ginza", "Hibiya", "\u014Cedo"],
    ambience: "market",
    crowd: 0.95,
    depth: PLATFORM_DEPTH + 0.9
  },
  {
    // JY05 - voies élevées, voies terminales et niveaux souterrains. Le quai
    // Yamanote est plus resserré qu'à Tokyo, mais le faisceau donne au décor
    // une profondeur considérable.
    name: "JY05 Ueno",
    openFarSide: true,
    elevation: "ground",
    config: "sharedIsland",
    sharedWith: KT,
    parallel: ["Utsunomiya", "Takasaki", "J\u014Dban", "T\u014Dhoku Shinkansen"],
    signature: "ueno",
    ambience: "hall",
    crowd: 1.6,
    depth: 8.6,
    canopy: "truss",
    canopyY: 5.2,
    columnSpacing: 14,
    palette: "hub"
  },
  {
    // JY06 - la plus discrète de la boucle : deux quais centraux au sol,
    // toitures anciennes, garde-corps simples, vue sur les temples et les
    // arbres d'Ueno. « Vallée du rossignol » : les oiseaux font partie du lieu.
    name: "JY06 Uguisudani",
    elevation: "ground",
    config: "sharedIsland",
    sharedWith: KT,
    parallel: ["T\u014Dhoku Shinkansen"],
    ambience: "birds",
    crowd: 0.55,
    depth: PLATFORM_DEPTH + 1.4,
    canopyY: 3.8,
    clock: false
  },
  {
    // JY07 - immense corridor ferroviaire au sol, voies 10 et 11 séparées.
    // Quais longs, ponts-concours au-dessus des rails, faisceau dégagé.
    name: "JY07 Nippori",
    openFarSide: true,
    elevation: "ground",
    config: "sharedIsland",
    sharedWith: KT,
    parallel: ["J\u014Dban", "Keisei", "Nippori\u2013Toneri Liner"],
    signature: "nippori",
    ambience: "street",
    crowd: 1.2,
    depth: PLATFORM_DEPTH + 2.6,
    canopyY: 4.2
  },
  {
    // JY08 - compacte mais verticalement complexe : quais JR au niveau
    // supérieur, hall en dessous. Quais sobres, étroits, très techniques.
    name: "JY08 Nishi-Nippori",
    elevation: "elevated",
    config: "sharedIsland",
    sharedWith: KT,
    parallel: ["Chiyoda", "Nippori\u2013Toneri Liner"],
    ambience: "street",
    crowd: 0.9,
    depth: PLATFORM_DEPTH + 0.8,
    canopyY: 3.6
  },
  {
    // JY09 - quatre voies en TRANCHÉE sous le bâtiment de gare, pas au sol :
    // murs de soutènement, passerelles, grande gare-pont au-dessus.
    name: "JY09 Tabata",
    elevation: "trench",
    config: "sharedIsland",
    sharedWith: KT,
    parallel: ["T\u014Dhoku Shinkansen"],
    ambience: "quiet",
    crowd: 0.8
  },
  {
    // JY10 - unique quai central en tranchée, étroit et calme, talus
    // végétalisés et azalées le long de la voie. Là encore une tranchée, que
    // le tronçon au sol ne laissait pas deviner.
    name: "JY10 Komagome",
    elevation: "trench",
    config: "island",
    parallel: ["Namboku"],
    ambience: "quiet",
    crowd: 0.8,
    depth: PLATFORM_DEPTH + 0.5
  },
  {
    // JY11 - quai central en tranchée, murs latéraux proches, toiture
    // partielle, bâtiment de gare posé au-dessus des voies.
    name: "JY11 Sugamo",
    elevation: "trench",
    config: "island",
    parallel: ["Mita"],
    ambience: "quiet",
    crowd: 0.85
  },
  {
    // JY12 - quai aérien ouvert, la rue passe immédiatement en dessous et le
    // tram Arakawa traverse à côté. Le tronçon est en tranchée, la gare non.
    name: "JY12 Otsuka",
    elevation: "elevated",
    config: "island",
    parallel: ["Toden Arakawa"],
    signature: "otsuka",
    ambience: "tram",
    crowd: 0.9,
    depth: PLATFORM_DEPTH + 1.6,
    canopyY: 4
  },
  {
    // JY13 - quatre voies Yamanote (5 à 8) sur deux quais centraux : c'est ce
    // qui permet départs et terminus. Quais très larges, cages d'escalier
    // nombreuses, panneaux suspendus volumineux. Les voies 5 et 8, longtemps
    // nues, ont reçu leurs portes le 18 mars 2026 : la gare est désormais
    // entièrement équipée.
    name: "JY13 Ikebukuro",
    elevation: "ground",
    config: "terminusIsland",
    parallel: ["Saiky\u014D", "Sh\u014Dnan\u2013Shinjuku", "Seibu Ikebukuro", "T\u014Dbu T\u014Dj\u014D"],
    ambience: "hall",
    crowd: 2,
    depth: 9.8,
    canopy: "truss",
    canopyY: 5.6,
    columnSpacing: 14,
    palette: "hub"
  },
  {
    // JY14 - un seul bâtiment-pont au-dessus du quai, peu de locaux, vue
    // dégagée. L'une des deux seules gares sans correspondance ferroviaire.
    name: "JY14 Mejiro",
    elevation: "trench",
    config: "island",
    parallel: [],
    ambience: "quiet",
    crowd: 0.75,
    depth: PLATFORM_DEPTH + 0.6
  },
  {
    // JY15 - quai aérien étroit, toiture métallique continue, colonnes
    // nombreuses, lignes Seibu visibles juste à côté. Forte affluence
    // étudiante et accumulation de panneaux.
    name: "JY15 Takadanobaba",
    elevation: "elevated",
    config: "island",
    parallel: ["Seibu Shinjuku", "T\u014Dzai"],
    ambience: "students",
    crowd: 1.4,
    depth: PLATFORM_DEPTH + 0.7,
    canopyY: 3.7,
    columnSpacing: 9.5
  },
  {
    // JY16 - quai central étroit, toiture simple, ville extrêmement proche.
    // Le bâtiment actuel est plus vertical que l'ancienne petite gare.
    name: "JY16 Shin-Okubo",
    elevation: "elevated",
    config: "island",
    parallel: [],
    ambience: "street",
    crowd: 1,
    depth: PLATFORM_DEPTH + 0.5,
    canopyY: 3.8
  },
  {
    // JY17 - quai central des voies 14 et 15, au niveau du sol. Alignement
    // massif de quais, toiture presque continue, forêt de poteaux, visibilité
    // coupée par les autres quais. Pas encore de portes de quai Yamanote : la
    // restructuration en cours l'interdit.
    name: "JY17 Shinjuku",
    elevation: "ground",
    // Les deux voies Yamanote ne se font PAS face sur un même îlot : la 14 et
    // la 15 bordent deux quais différents, chacun partagé avec la Chūō–Sōbu.
    // C'est la même disposition qu'à Yoyogi, deux gares plus loin, et c'est
    // elle qui met les portes à gauche dans les deux sens.
    config: "sharedIsland",
    sharedWith: "Ch\u016B\u014D\u2013S\u014Dbu",
    parallel: ["Ch\u016B\u014D", "Saiky\u014D", "Sh\u014Dnan\u2013Shinjuku", "Odaky\u016B", "Kei\u014D"],
    psd: "none",
    works: true,
    signature: "shinjuku",
    ambience: "hall",
    crowd: 2.2,
    depth: 8.4,
    canopy: "slab",
    canopyY: 4.2,
    columnSpacing: 9,
    palette: "shinjuku"
  },
  {
    // JY18 - quatre voies imbriquant Yamanote et Chūō–Sōbu : les voies 1 et 2
    // sont sur DEUX quais différents, chacune adossée à une voie Chūō–Sōbu.
    // Quais légèrement courbes, anciennes marquises, organisation asymétrique.
    name: "JY18 Yoyogi",
    elevation: "ground",
    config: "sharedIsland",
    sharedWith: "Ch\u016B\u014D\u2013S\u014Dbu",
    parallel: ["\u014Cedo"],
    ambience: "street",
    crowd: 0.9,
    depth: PLATFORM_DEPTH + 1,
    canopyY: 3.8
  },
  {
    // JY19 - LE seul couple de quais latéraux de la boucle, depuis la refonte
    // qui a remplacé l'ancien quai central. Takeshita d'un côté, la végétation
    // du Meiji-jingū de l'autre ; bâtiment clair et vitré, quais courbes.
    name: "JY19 Harajuku",
    elevation: "ground",
    config: "side",
    parallel: ["Chiyoda", "Fukutoshin"],
    signature: "harajuku",
    ambience: "park",
    crowd: 1.3,
    depth: PLATFORM_DEPTH + 0.8,
    canopy: "glass",
    canopyY: 4.6,
    palette: "harajuku"
  },
  {
    // JY20 - depuis 2023 les deux sens tiennent sur un unique quai central très
    // large, mais fortement courbé. Parois et plafonds provisoires, panneaux de
    // chantier partout, et toujours pas de portes de quai en 2026.
    name: "JY20 Shibuya",
    elevation: "elevated",
    config: "island",
    parallel: ["Saiky\u014D", "Sh\u014Dnan\u2013Shinjuku", "Ginza", "T\u014Dky\u016B T\u014Dyoko"],
    psd: "none",
    works: true,
    signature: "shibuya",
    ambience: "hall",
    crowd: 2,
    depth: 10,
    canopy: "glass",
    canopyY: 6.2,
    columnSpacing: 15,
    palette: "shibuya"
  },
  {
    // JY21 - quai central couvert sur viaduc, parallèle au quai
    // Saikyō/Shōnan–Shinjuku, très intégré au complexe Atre. L'extrémité est
    // se prolonge vers la longue passerelle d'Ebisu Garden Place.
    name: "JY21 Ebisu",
    elevation: "elevated",
    config: "island",
    parallel: ["Saiky\u014D", "Sh\u014Dnan\u2013Shinjuku", "Hibiya"],
    signature: "ebisu",
    ambience: "office",
    crowd: 1.2,
    depth: PLATFORM_DEPTH + 1.8,
    canopyY: 4.2
  },
  {
    // JY22 - quai central en tranchée, murs latéraux proches, Atre posé
    // au-dessus. Large au centre, effilé aux extrémités.
    name: "JY22 Meguro",
    elevation: "trench",
    config: "island",
    parallel: ["Namboku", "Mita", "T\u014Dky\u016B Meguro"],
    ambience: "quiet",
    crowd: 1,
    depth: PLATFORM_DEPTH + 1
  },
  {
    // JY23 - quai central légèrement courbé sur viaduc, ville et façades
    // commerciales à toucher, et la Tōkyū Ikegami spectaculairement perchée au
    // quatrième niveau. Le tronçon est en tranchée, la gare non.
    name: "JY23 Gotanda",
    elevation: "elevated",
    config: "island",
    parallel: ["T\u014Dky\u016B Ikegami", "Asakusa"],
    signature: "gotanda",
    ambience: "street",
    crowd: 1,
    depth: PLATFORM_DEPTH + 1.2,
    canopyY: 3.9
  },
  {
    // JY24 - quatre voies Yamanote (1 à 4) sur deux quais centraux : point
    // opérationnel de départ, de terminus et d'accès au dépôt. Portes en place
    // sur les voies principales 1 et 3 ; les secondaires 2 et 4 sont encore
    // en travaux civils (笠石) jusqu'à novembre 2026 au moins.
    name: "JY24 Osaki",
    openFarSide: true,
    elevation: "ground",
    config: "terminusIsland",
    parallel: ["Saiky\u014D", "Sh\u014Dnan\u2013Shinjuku", "Rinkai"],
    psd: "partial",
    ambience: "office",
    crowd: 1.3,
    depth: 8.8,
    canopyY: 4.6,
    columnSpacing: 13,
    palette: "hub"
  },
  {
    // JY25 - très grande gare au sol. Voies 1 et 3 sur deux quais séparés :
    // la numérotation n'est plus continue depuis le remaniement. Immense
    // toiture industrielle, longues perspectives, escaliers massifs, et
    // plusieurs secteurs encore en travaux sur le plan de 2026.
    name: "JY25 Shinagawa",
    openFarSide: true,
    elevation: "ground",
    config: "sharedIsland",
    sharedWith: KT,
    parallel: ["T\u014Dkaid\u014D", "Yokosuka", "T\u014Dkaid\u014D Shinkansen", "Keiky\u016B"],
    works: true,
    ambience: "hall",
    crowd: 1.7,
    depth: 9.4,
    canopy: "truss",
    canopyY: 5.4,
    columnSpacing: 14,
    palette: "hub"
  },
  {
    // JY26 - grand quai central, second quai central pour la Keihin-Tōhoku.
    // Toiture blanche inspirée de l'origami, acier et bois clair, façades
    // vitrées, atrium visible depuis le quai : la plus lumineuse de la boucle,
    // et la seule dont l'architecture est entièrement propre.
    name: "JY26 Takanawa Gateway",
    elevation: "ground",
    config: "island",
    parallel: [KT],
    signature: "takanawaGateway",
    ambience: "quiet",
    crowd: 0.7,
    depth: 9,
    canopy: "glass",
    canopyY: 6,
    // Rien ne couvre le quai que la toiture pliée : voir `sigCanopy`.
    sigCanopy: true,
    columnSpacing: 15,
    palette: "takanawa"
  },
  {
    // JY27 - quatre voies sur deux quais centraux, les extérieures à la
    // Keihin-Tōhoku. Longues marquises, quais rectilignes, vaste
    // bâtiment-pont, et une partie du hall en travaux en 2026.
    name: "JY27 Tamachi",
    elevation: "ground",
    config: "sharedIsland",
    sharedWith: KT,
    parallel: ["T\u014Dkaid\u014D"],
    works: true,
    ambience: "office",
    crowd: 1,
    depth: PLATFORM_DEPTH + 1.8
  },
  {
    // JY28 - quatre voies au niveau supérieur. Environnement très vertical, le
    // monorail de Haneda immédiatement à côté, éléments anciens mêlés aux
    // structures neuves et plusieurs zones en construction.
    name: "JY28 Hamamatsucho",
    elevation: "elevated",
    config: "sharedIsland",
    sharedWith: KT,
    parallel: ["Tokyo Monorail", "Asakusa", "\u014Cedo"],
    works: true,
    signature: "hamamatsucho",
    ambience: "monorail",
    crowd: 1.1,
    depth: PLATFORM_DEPTH + 1.2,
    canopyY: 4
  },
  {
    // JY29 - grande gare élevée, quai central des voies 4 et 5. Vieux viaduc
    // métallique, couverture dense, quais parallèles multiples ; dessous, les
    // arcades et les couloirs bas contrastent avec les tours de Shiodome.
    name: "JY29 Shimbashi",
    // Huit voies parallèles sous la même couverture : rien ne ferme la travée.
    openFarSide: true,
    elevation: "elevated",
    // Deux îlots partagés avec la Keihin-Tōhoku : voies 4 et 5 au centre du
    // faisceau, une voie Keihin-Tōhoku au dos de chaque quai.
    config: "sharedIsland",
    sharedWith: KT,
    parallel: ["T\u014Dkaid\u014D", "Yokosuka", "Ginza", "Asakusa", "Yurikamome"],
    signature: "shimbashi",
    ambience: "office",
    crowd: 1.5,
    depth: PLATFORM_DEPTH + 2,
    canopyY: 4.1,
    palette: "brickViaduct"
  },
  {
    // JY30 - viaduc ancien en acier et maçonnerie, piliers épais, quai couvert
    // et étroit. Restaurants et petites cellules commerciales sous les voies ;
    // à l'ouest, l'International Forum tranche par sa modernité.
    name: "JY30 Yurakucho",
    elevation: "elevated",
    config: "sharedIsland",
    sharedWith: KT,
    parallel: ["Y\u016Brakuch\u014D"],
    signature: "yurakucho",
    ambience: "office",
    crowd: 1.1,
    depth: PLATFORM_DEPTH + 0.6,
    canopyY: 3.4,
    palette: "brickViaduct"
  }
];
function amenities(scale, kiosk, clock) {
  const half = FULL_PLATFORM_LEN / 2;
  return {
    benches: Math.round(6 * scale),
    vending: Math.max(1, Math.round(2 * scale)),
    kiosk,
    // Trémies réparties le long du quai, jamais en face d'une porte.
    stairs: [-half * 0.62, half * 0.1],
    escalators: scale > 1 ? [-half * 0.2, half * 0.55] : [half * 0.55],
    elevator: scale > 0.9 ? -half * 0.34 : null,
    clock
  };
}
function dodgePlanes(zs, solids) {
  return zs.flatMap((base) => {
    for (let d = 0; d <= 4.5; d += 0.9) {
      for (const s of d === 0 ? [0] : [-d, d]) {
        const z = base + s;
        if (!solids.some((o) => Math.abs(z - o.z) < o.r)) return [z];
      }
    }
    return [];
  });
}
function sigPlanFor(key, length, depth, spacing, am) {
  if (!key) return void 0;
  const usable = length / 2 - 3;
  const backX = PSD_X + depth / 2;
  const halfConsist = (CONSIST.length - 1) / 2 * E235.pitch;
  const accesses = [
    ...am.stairs.map((z) => ({ z, r: STAIR_HALF_Z + 0.75 })),
    ...am.escalators.map((z) => ({ z, r: ESCALATOR_HALF_Z + 0.75 })),
    ...am.elevator !== null ? [{ z: am.elevator, r: ELEVATOR_HALF_Z + 0.75 }] : []
  ];
  const gantries = [
    ...am.stairs.map((z) => ({ z: z - STAIR_HALF_Z - 1.6, r: 1.4 })),
    ...am.escalators.map((z) => ({ z: z - ESCALATOR_HALF_Z - 1.6, r: 1.4 }))
  ];
  const entries = [
    ...am.stairs.map((z) => ({ z: z - STAIR_HALF_Z + 0.1, r: 0.6 })),
    ...am.escalators.map((z) => ({ z: z - ESCALATOR_HALF_Z + 0.1, r: 0.6 }))
  ];
  const bands = directionBandZs(length).map((z) => ({ z, r: 4.65 }));
  const kiosk = am.kiosk ? [{ z: usable * 0.36, r: KIOSK_HALF_Z + 0.75 }] : [];
  const clock = am.clock ? [{ z: 0, r: 0.8 }] : [];
  const columns = [];
  for (let z = -usable; z <= usable; z += spacing) columns.push({ z, r: 0.55 });
  const mirrors = [-1, 1].map((d) => ({ z: d * (halfConsist + 1.2), r: 0.5 }));
  const spinePosts = (zs, extra = []) => dodgePlanes(zs, [...accesses, ...gantries, ...bands, ...kiosk, ...clock, ...columns, ...extra]);
  switch (key) {
    case "tokyo":
      return { keepOut: bays(length, 16).map((z) => ({ z, r: 0.5 })), posts: [], runBlocks: [] };
    case "yurakucho": {
      const zs = dodgePlanes(bays(length, 7.2), [
        ...am.escalators.map((z) => ({ z, r: ESCALATOR_HALF_Z + 0.9 })),
        ...entries,
        ...columns,
        ...mirrors,
        ...gantries.map((g) => ({ z: g.z, r: 0.6 }))
      ]);
      return { keepOut: zs.map((z) => ({ z, r: 0.75 })), posts: [], runBlocks: [] };
    }
    case "shinjuku":
      return { keepOut: bays(length, 12).map((z) => ({ z, r: 0.55 })), posts: [], runBlocks: [] };
    case "shimbashi": {
      const zs = spinePosts(bays(length, 11));
      return {
        keepOut: zs.map((z) => ({ z, r: 0.8 })),
        posts: zs.map((z) => ({ x: backX, z })),
        runBlocks: []
      };
    }
    case "ebisu": {
      const built = length * 0.46;
      const zs = spinePosts(bays(built, 12).map((z) => z - length * 0.16));
      return {
        keepOut: zs.map((z) => ({ z, r: 0.8 })),
        posts: zs.map((z) => ({ x: backX, z })),
        runBlocks: []
      };
    }
    case "takanawaGateway": {
      const decks = takanawaDeckZs(length).map((z) => ({ z, r: 4.2 }));
      const zs = spinePosts(bays(length, 27), decks);
      return {
        keepOut: [...zs.map((z) => ({ z, r: 0.6 })), ...decks],
        posts: zs.map((z) => ({ x: backX, z })),
        // Les branches des colonnes-arbres s'ouvrent DANS la coupe, à la cote
        // même où courent la gouttière et le chemin de câbles : les conduites
        // s'interrompent au droit de chaque colonne, comme elles le font aux
        // gaines d'escalier mécanique.
        runBlocks: zs.map((z) => ({ z0: z - 1.3, z1: z + 1.3 }))
      };
    }
    case "hamamatsucho": {
      const joint = -length * 0.06;
      return {
        keepOut: [{ z: joint, r: 1.55 }],
        posts: [{ x: PSD_X + 0.3, z: joint }],
        runBlocks: [{ z0: joint - 1.8, z1: joint + 1.8 }]
      };
    }
    default:
      return void 0;
  }
}
function build(spec) {
  const f = FAMILY[spec.elevation];
  const am = amenities(spec.crowd, spec.kiosk ?? spec.crowd >= 1.4, spec.clock ?? true);
  const depth = spec.depth ?? f.depth;
  const columnSpacing = spec.columnSpacing ?? f.columnSpacing;
  return {
    elevation: spec.elevation,
    config: spec.config,
    sharedWith: spec.sharedWith,
    parallel: spec.parallel ?? [],
    psd: spec.psd ?? "full",
    works: spec.works ?? false,
    openFarSide: spec.openFarSide ?? false,
    length: FULL_PLATFORM_LEN,
    depth,
    canopy: spec.canopy ?? f.canopy,
    canopyY: spec.canopyY ?? f.canopyY,
    sigCanopy: spec.sigCanopy ?? false,
    columnSpacing,
    palette: PALETTES[spec.palette ?? f.palette],
    amenities: am,
    crowdScale: spec.crowd,
    ambience: spec.ambience,
    signature: spec.signature,
    sigPlan: sigPlanFor(spec.signature, FULL_PLATFORM_LEN, depth, columnSpacing, am)
  };
}
var CACHE = /* @__PURE__ */ new Map();
function layoutFor(index) {
  const i = (index % 30 + 30) % 30;
  const hit = CACHE.get(i);
  if (hit) return hit;
  const layout = build(SPECS[i]);
  CACHE.set(i, layout);
  return layout;
}

// ../../../brunopaiva15/yamanote-3d/src/data/stationInterior.ts
var HALL_WALL_T = 0.24;
var EXIT_MOUTH_STEPS = 6;
var EXIT_MOUTH_GOING = 0.31;
var EXIT_MOUTH_Z0 = HALL_WALL_T + 0.025;
var EXIT_MOUTH_END = EXIT_MOUTH_Z0 + EXIT_MOUTH_GOING * EXIT_MOUTH_STEPS;
var SPECS2 = [
  { name: "JY01 Tokyo", gateJp: "\u4E38\u306E\u5185\u4E2D\u592E\u53E3", gate: "Marunouchi Central" },
  { name: "JY02 Kanda", gateJp: "\u897F\u53E3\u6539\u672D", gate: "West" },
  { name: "JY03 Akihabara", brand: "atre", gateJp: "\u96FB\u6C17\u8857\u53E3", gate: "Electric Town" },
  { name: "JY04 Okachimachi", gateJp: "\u5317\u53E3\u6539\u672D", gate: "North" },
  // Le plan de quai d'Ueno en montre quatre, sur deux niveaux : 不忍 et 中央 en
  // M2F et 1F au sud, 公園 et 入谷 en 3F au nord. Deux groupes d'accès, donc
  // deux halls - c'est une gare à part, et elle attend sa phase.
  { name: "JY05 Ueno", brand: "ecute", gateJp: "\u4E2D\u592E\u6539\u672D", gate: "Central" },
  { name: "JY06 Uguisudani", gateJp: "\u5357\u53E3\u6539\u672D", gate: "South" },
  // Deux ponts-concours enjambent tout le faisceau : le hall est dessus.
  // Nippori a déjà son niveau de correspondance : ce sont ses DEUX
  // PONTS-CONCOURS, dessinés par sa charpente signature, dont la sous-face est
  // à 5,10 m - exactement la cote d'un hall d'en haut. Y poser en plus le hall
  // générique reviendrait à bâtir deux fois la même chose, l'une dans l'autre.
  // Elle attend son traitement propre (docs/STATION_INTERIOR, phase 6).
  { name: "JY07 Nippori", brand: "ecute", place: "over", bespoke: true, gateJp: "\u5357\u6539\u672D", gate: "South" },
  { name: "JY08 Nishi-Nippori", gateJp: "\u5357\u6539\u672D", gate: "South" },
  { name: "JY09 Tabata", brand: "atre", place: "over", gateJp: "\u5317\u53E3\u6539\u672D", gate: "North" },
  { name: "JY10 Komagome", place: "over", gateJp: "\u5317\u53E3\u6539\u672D", gate: "North" },
  { name: "JY11 Sugamo", place: "over", gateJp: "\u5317\u53E3\u6539\u672D", gate: "North" },
  { name: "JY12 \u014Ctsuka", gateJp: "\u5317\u53E3\u6539\u672D", gate: "North" },
  { name: "JY13 Ikebukuro", gateJp: "\u4E2D\u592E\u6539\u672D", gate: "Central" },
  { name: "JY14 Mejiro", place: "over", gateJp: "\u4E2D\u592E\u6539\u672D", gate: "Central" },
  { name: "JY15 Takadanobaba", gateJp: "\u65E9\u7A32\u7530\u53E3", gate: "Waseda" },
  { name: "JY16 Shin-\u014Ckubo", gateJp: "\u4E2D\u592E\u6539\u672D", gate: "Central" },
  { name: "JY17 Shinjuku", gateJp: "\u6771\u53E3\u6539\u672D", gate: "East" },
  { name: "JY18 Yoyogi", gateJp: "\u5317\u53E3\u6539\u672D", gate: "North" },
  { name: "JY19 Harajuku", gateJp: "\u897F\u53E3\u6539\u672D", gate: "West" },
  { name: "JY20 Shibuya", gateJp: "\u30CF\u30C1\u516C\u6539\u672D", gate: "Hachik\u014D" },
  { name: "JY21 Ebisu", brand: "atre", gateJp: "\u897F\u53E3\u6539\u672D", gate: "West" },
  { name: "JY22 Meguro", brand: "atre", place: "over", gateJp: "\u4E2D\u592E\u6539\u672D", gate: "Central" },
  { name: "JY23 Gotanda", gateJp: "\u4E2D\u592E\u6539\u672D", gate: "Central" },
  { name: "JY24 \u014Csaki", gateJp: "\u5357\u6539\u672D", gate: "South" },
  { name: "JY25 Shinagawa", brand: "ecute", gateJp: "\u4E2D\u592E\u6539\u672D", gate: "Central" },
  { name: "JY26 Takanawa Gateway", gateJp: "\u6539\u672D\u53E3", gate: "Gate" },
  { name: "JY27 Tamachi", gateJp: "\u5317\u53E3\u6539\u672D", gate: "North" },
  { name: "JY28 Hamamatsuch\u014D", gateJp: "\u5317\u53E3\u6539\u672D", gate: "North" },
  { name: "JY29 Shimbashi", gateJp: "\u70CF\u68EE\u53E3", gate: "Karasumori" },
  { name: "JY30 Y\u016Brakuch\u014D", gateJp: "\u4E2D\u592E\u53E3", gate: "Central" }
];
function gateNameFor(index) {
  const spec = SPECS2[(index % 30 + 30) % 30];
  return { jp: spec.gateJp, romaji: spec.gate };
}

// ../../../brunopaiva15/yamanote-3d/src/data/fonts.ts
var JP_FONT = "'Hiragino Kaku Gothic ProN','Yu Gothic','Noto Sans JP',sans-serif";

// ../../../brunopaiva15/yamanote-3d/src/data/rng.ts
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = a + 1831565813 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// ../../../brunopaiva15/yamanote-3d/src/three/lineScreenAnim.ts
var ANIM_PHASES = 4;
var ANIM_PERIOD = 0.5;
var PAGE_FADE = 0.14;
var MOTION_STEP = 1 / 30;
var BAND_FILL_DELAY = 0.3;
var BAND_FILL_TIME = 1.35;
function bandFills(state) {
  return state === "zoomJP" || state === "zoomEN";
}
function bandFill(t) {
  const x = (t - BAND_FILL_DELAY) / BAND_FILL_TIME;
  return x <= 0 ? 0 : x >= 1 ? 1 : x;
}
var DOOR_CYCLE = ANIM_PHASES * ANIM_PERIOD;
var DOOR_OPEN_END = 0.55;
var DOOR_HOLD_END = 1.42;
var DOOR_SHUT_END = 1.85;
var MARKER_OUT = 0.6;
var MARKER_UP = 0.98;
var MARKER_DOWN = 1.05;
var MARKER_IN = 1.42;
var smooth = (x) => x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x);
var ramp = (t, from, to) => smooth((t - from) / (to - from));
var cycleTime = (anim) => (anim % ANIM_PHASES + ANIM_PHASES) % ANIM_PHASES * ANIM_PERIOD;
function doorAperture(anim) {
  const t = cycleTime(anim);
  if (t < DOOR_OPEN_END) return ramp(t, 0, DOOR_OPEN_END) ** 1.35;
  if (t < DOOR_HOLD_END) return 1;
  if (t < DOOR_SHUT_END) return 1 - ramp(t, DOOR_HOLD_END, DOOR_SHUT_END);
  return 0;
}
function doorMarker(anim) {
  const t = cycleTime(anim);
  if (t <= MARKER_OUT || t >= MARKER_IN) return 0;
  if (t < MARKER_UP) return ramp(t, MARKER_OUT, MARKER_UP);
  if (t <= MARKER_DOWN) return 1;
  return 1 - ramp(t, MARKER_DOWN, MARKER_IN);
}
function screenLoops(f) {
  return f.state === "stationLayout" && f.mode === "doors";
}
function newScreenAnim() {
  return { page: "", t: 0, faded: 1 };
}
function resetScreenAnim(a) {
  a.page = "";
  a.t = 0;
  a.faded = 1;
}
function stepScreenAnim(a, page, fills, dt) {
  let elapsed = dt;
  if (page !== a.page) {
    a.faded = a.page === "" ? 1 : 0;
    a.page = page;
    a.t = 0;
    elapsed = Math.min(dt, MOTION_STEP);
  }
  a.t += elapsed;
  let blend = 1;
  if (a.faded < 1) {
    const target = a.t >= PAGE_FADE ? 1 : a.t / PAGE_FADE;
    blend = (target - a.faded) / (1 - a.faded);
    a.faded = target;
  }
  const fill = fills ? bandFill(a.t) : 1;
  return {
    blend,
    fill,
    busy: a.faded < 1 || fills && a.t < BAND_FILL_DELAY + BAND_FILL_TIME
  };
}

// ../../../brunopaiva15/yamanote-3d/src/three/lineScreen.ts
var SCREEN_W = 768;
var SCREEN_H = 432;
var ROUTE_FOOTNOTE_JP = "\u306E\u308A\u304B\u3048\u3001\u5F85\u3061\u5408\u308F\u305B\u6642\u9593\u306F\u542B\u307E\u308C\u307E\u305B\u3093\u3002\u96FB\u8ECA\u306B\u3088\u308A\u591A\u5C11\u6642\u9593\u304C\u7570\u306A\u308A\u307E\u3059\u3002";
var ROUTE_FOOTNOTE_EN = "Transfer and waiting times are not included. Times may differ by train.";
var YAMANOTE_GREEN = "#54af00";
var YAMANOTE_GREEN_DARK = "#0b5800";
var BAND_DIM = "#8b93a6";
var BAND_DIM_DARK = "#3a3f4d";
var SCREEN_BG = "#e9e9e9";
var HEADER_BG = "#191a17";
var HEADER_TEXT = "#e8e8e7";
var HEADER_DIM = "#bab8ce";
var CLOCK_COLOR = "#d1cef5";
var CAR_NUM_COLOR = "#c4c1e3";
var CAR_LABEL_COLOR = "#9593a6";
var MARKER_RED = "#8f1a17";
var LCD_CUTOFF = 0.45;
var CAR_NO = CONSIST[PLAYER_CAR].no;
var MAJOR_INDICES = [0, 4, 12, 16, 19, 24];
function fmtClock(clockMin) {
  const total = Math.floor(clockMin) % (24 * 60);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}
function secondsToArrival(phase, phaseT, stationIndex, dir) {
  const cruiseSec = cruiseDuration(stationIndex, dir);
  if (phase === "cruise") return Math.max(0, cruiseSec - phaseT) + CONFIG.brakeTime;
  if (phase === "brake") return Math.max(0, CONFIG.brakeTime - phaseT);
  if (phase === "depart") {
    return Math.max(0, CONFIG.departTime - phaseT) + cruiseSec + CONFIG.brakeTime;
  }
  return 0;
}
function etaMinutes(index, hops, atStation, countdown, dir) {
  if (atStation && hops === 0) return 0;
  const hopMin = headwayMinutesTo(index, hops, dir);
  if (atStation) return hopMin;
  const remain = Math.max(1, Math.ceil(countdown / 60));
  return hops === 0 ? remain : hopMin + remain;
}
function fitText(g, text, maxWidth, basePx, weight = "bold") {
  let px = basePx;
  do {
    g.font = `${weight} ${px}px ${JP_FONT}`;
    if (g.measureText(text).width <= maxWidth) return;
    px -= 2;
  } while (px > 10);
}
var STATUS_LABEL = {
  now: { jp: "\u305F\u3060\u3044\u307E", en: "Now stopping at" },
  next: { jp: "\u6B21\u306F", en: "Next" },
  soon: { jp: "\u307E\u3082\u306A\u304F", en: "Arriving at" }
};
var LCD_ROMAJI = { JY01: "T\u014Dky\u014D" };
function stationName(st, lang) {
  if (lang === "jp") return st.kanji;
  return LCD_ROMAJI[st.jy] ?? st.romaji;
}
var HEADER_H = 133;
function drawStationTile(g, code, jy) {
  const boxY = code ? 35 : 53;
  g.fillStyle = "#000000";
  g.beginPath();
  g.roundRect(220, boxY, 78, 131 - boxY, 6);
  g.fill();
  g.textAlign = "center";
  if (code) {
    g.fillStyle = "#ffffff";
    fitText(g, code, 66, 24);
    g.fillText(code, 259, 54);
  }
  const tileY = boxY + 22.5 * (code ? 1 : 0.25);
  g.fillStyle = YAMANOTE_GREEN;
  g.beginPath();
  g.roundRect(225.5, tileY, 67, 67, 9);
  g.fill();
  g.fillStyle = "#ecebe9";
  g.beginPath();
  g.roundRect(233.5, tileY + 7.5, 52, 52, 3);
  g.fill();
  g.fillStyle = "#141414";
  g.font = `bold 20px ${JP_FONT}`;
  g.fillText("JY", 259, tileY + 25.5);
  g.font = `bold 32px ${JP_FONT}`;
  g.fillText(jy.slice(2), 259, tileY + 53.5);
  g.textAlign = "left";
}
function drawHeader(g, w, index, clock, status, lang, dir) {
  const next = STATIONS[index];
  g.fillStyle = HEADER_BG;
  g.fillRect(0, 0, w, HEADER_H);
  const majors = [];
  for (let k = 1; k <= 29 && majors.length < 2; k++) {
    const idx = stationAtHop(index, k, dir);
    if (MAJOR_INDICES.includes(idx)) majors.push(stationName(STATIONS[idx], lang));
  }
  g.fillStyle = HEADER_TEXT;
  if (lang === "en") {
    g.textAlign = "left";
    g.fillStyle = HEADER_DIM;
    g.font = `18px ${JP_FONT}`;
    g.fillText("Bound for", 7, 66);
    g.fillStyle = HEADER_TEXT;
    const l1 = `${majors[0] ?? ""}&`;
    const l2 = majors[1] ?? "";
    fitText(g, l1.length >= l2.length ? l1 : l2, 142, 30);
    g.fillText(l1, 6, 92);
    g.fillText(l2, 6, 121);
  } else {
    const suffix = "\u65B9\u9762";
    g.textAlign = "right";
    fitText(g, `${majors[0] ?? ""}\u30FB${majors[1] ?? ""}`, 163, 36);
    g.fillText(`${majors[0] ?? ""}\u30FB${majors[1] ?? ""}`, 171, 87);
    g.font = `21px ${JP_FONT}`;
    g.fillText(suffix, 171, 119);
  }
  g.fillStyle = YAMANOTE_GREEN;
  g.fillRect(182, 0, 32, HEADER_H);
  g.textAlign = "left";
  g.fillStyle = "#dcdcda";
  fitText(g, STATUS_LABEL[status][lang], 260, 27, "");
  g.fillText(STATUS_LABEL[status][lang], 226, 27);
  drawStationTile(g, stationCode(next), next.jy);
  const name = stationName(next, lang);
  g.textAlign = "center";
  g.fillStyle = HEADER_TEXT;
  const jpName = lang !== "en";
  if (jpName && name.length === 2) {
    g.font = `bold 95px ${JP_FONT}`;
    g.fillText(name[0], 517 - 95.5, 118);
    g.fillText(name[1], 517 + 95.5, 118);
  } else {
    drawSqueezed(
      g,
      name,
      517,
      jpName ? 118 : 116,
      squeezeToFit(g, name, jpName ? 95 : 92, 436, jpName ? 0.85 : 0.75)
    );
  }
  g.textAlign = "right";
  g.fillStyle = CLOCK_COLOR;
  g.font = `bold 32px ${JP_FONT}`;
  g.fillText(clock, 657, 29);
  const carLabel = lang === "jp" ? "\u53F7\u8ECA" : "Car No.";
  g.fillStyle = CAR_NUM_COLOR;
  g.font = `italic bold 38px ${JP_FONT}`;
  const carNumW = g.measureText(String(CAR_NO)).width;
  g.fillText(String(CAR_NO), 763, 34);
  g.fillStyle = CAR_LABEL_COLOR;
  if (lang === "en") {
    g.font = `17px ${JP_FONT}`;
    g.fillText(carLabel, 763 - carNumW - 8, 29);
  } else {
    g.font = `16px ${JP_FONT}`;
    g.fillText(carLabel, 763, 51);
  }
  g.textAlign = "left";
}
var LINE_BADGES = [
  // Les shinkansen de JR East (vert) et de JR Central (bleu) : le pictogramme
  // ne s'applique QU'AUX libellés qui portent 新幹線 - « 京浜東北線 » contient
  // 東北 et se retrouverait sinon frappé d'un nez de rame.
  { match: /(東北|山形|秋田|北海道|上越|北陸).*新幹線/, code: "", color: "#00a650", shink: true, en: "T\u014Dhoku\u30FBYamagata\u30FBAkita\u30FBJ\u014Detsu\u30FBHokuriku Shinkansen" },
  { match: /新幹線/, code: "", color: "#1f6fb5", shink: true, en: "T\u014Dkaid\u014D\u30FBSany\u014D Shinkansen" },
  { match: /京浜東北/, code: "JK", color: "#00a7db", en: "Keihin-T\u014Dhoku Line" },
  { match: /総武線快速/, code: "JO", color: "#0067c0", en: "S\u014Dbu Line (Rapid)" },
  { match: /中央・総武/, code: "JB", color: "#ffd400", en: "Ch\u016B\u014D-S\u014Dbu Line" },
  { match: /中央線/, code: "JC", color: "#f15a24", en: "Ch\u016B\u014D Line" },
  { match: /上野東京/, code: "JT|JU", color: "#f68b1e", en: "Ueno-T\u014Dky\u014D Line" },
  { match: /常磐/, code: "JJ", color: "#00b48d", en: "J\u014Dban Line" },
  { match: /宇都宮|高崎/, code: "JU", color: "#f68b1e", en: "Utsunomiya\u30FBTakasaki Line" },
  { match: /東海道線/, code: "JT", color: "#f68b1e", en: "T\u014Dkaid\u014D Line" },
  { match: /横須賀/, code: "JO", color: "#0067c0", en: "Yokosuka Line" },
  { match: /京葉/, code: "JE", color: "#c9252b", en: "Keiy\u014D Line" },
  { match: /埼京|川越/, code: "JA", color: "#00ac9a", en: "Saiky\u014D Line" },
  { match: /湘南新宿/, code: "JS", color: "#e21f26", en: "Sh\u014Dnan-Shinjuku Line" },
  { match: /丸ノ内/, code: "M", color: "#e60012", round: true, en: "Marunouchi Line" },
  { match: /銀座/, code: "G", color: "#f39700", round: true, en: "Ginza Line" },
  { match: /日比谷/, code: "H", color: "#9caeb7", round: true, en: "Hibiya Line" },
  { match: /千代田/, code: "C", color: "#00a95f", round: true, en: "Chiyoda Line" },
  { match: /有楽町/, code: "Y", color: "#c1a470", round: true, en: "Y\u016Brakuch\u014D Line" },
  { match: /副都心/, code: "F", color: "#9c5e31", round: true, en: "Fukutoshin Line" },
  { match: /半蔵門/, code: "Z", color: "#8f76d6", round: true, en: "Hanz\u014Dmon Line" },
  { match: /南北/, code: "N", color: "#00ac9b", round: true, en: "Namboku Line" },
  { match: /東西/, code: "T", color: "#009bbf", round: true, en: "T\u014Dzai Line" },
  { match: /浅草/, code: "A", color: "#e85298", round: true, en: "Asakusa Line" },
  { match: /都営新宿/, code: "S", color: "#6cbb5a", round: true, en: "Toei Shinjuku Line" },
  { match: /大江戸/, code: "E", color: "#b6007a", round: true, en: "Toei \u014Cedo Line" },
  { match: /三田/, code: "I", color: "#0079c2", round: true, en: "Toei Mita Line" },
  { match: /京急|京浜急行/, code: "KK", color: "#00bfff", en: "Keiky\u016B Line" },
  { match: /京成/, code: "KS", color: "#005aaa", en: "Keisei Line" },
  { match: /東急/, code: "TY", color: "#e5171f", en: "T\u014Dky\u016B Line" },
  { match: /東武/, code: "TS", color: "#0f6cb6", en: "T\u014Dbu Line" },
  { match: /西武/, code: "SI", color: "#f5a200", en: "Seibu Line" },
  { match: /小田急/, code: "OH", color: "#0079c2", en: "Odaky\u016B Line" },
  { match: /京王/, code: "KO", color: "#d31e79", en: "Kei\u014D Line" },
  { match: /りんかい/, code: "R", color: "#0079c1", en: "Rinkai Line" },
  { match: /モノレール/, code: "MO", color: "#0a6eb4", en: "T\u014Dky\u014D Monorail" },
  { match: /つくば/, code: "TX", color: "#00a7db", en: "Tsukuba Express" },
  { match: /舎人ライナー/, code: "NT", color: "#c7176b", en: "Nippori-Toneri Liner" },
  { match: /ライナー|荒川線/, code: "", color: "#6d7a83", en: "Local Line" }
];
function lineBadgeWidth(label, size) {
  const b = LINE_BADGES.find((e) => e.match.test(label));
  const n = b?.code ? b.code.split("|").length : 1;
  return n * size + (n - 1) * size * 0.13;
}
function lineNameEn(label) {
  return LINE_BADGES.find((e) => e.match.test(label))?.en ?? label;
}
function drawShinkansenGlyph(g, x, y, s, bg) {
  const u = (a) => x + s * a;
  const v = (b) => y + s * b;
  g.fillStyle = "#ffffff";
  g.beginPath();
  g.moveTo(u(0.5), v(0.09));
  g.bezierCurveTo(u(0.68), v(0.1), u(0.83), v(0.3), u(0.86), v(0.68));
  g.lineTo(u(0.14), v(0.68));
  g.bezierCurveTo(u(0.17), v(0.3), u(0.32), v(0.1), u(0.5), v(0.09));
  g.closePath();
  g.fill();
  g.fillStyle = bg;
  g.beginPath();
  g.moveTo(u(0.29), v(0.28));
  g.lineTo(u(0.71), v(0.28));
  g.lineTo(u(0.66), v(0.44));
  g.lineTo(u(0.34), v(0.44));
  g.closePath();
  g.fill();
  for (const sgn of [-1, 1]) {
    g.beginPath();
    g.ellipse(u(0.5 + sgn * 0.22), v(0.58), s * 0.062, s * 0.045, 0, 0, Math.PI * 2);
    g.fill();
  }
  g.fillStyle = "#ffffff";
  g.fillRect(u(0.2), v(0.75), s * 0.6, s * 0.11);
}
function drawLineBadge(g, label, x, cy, s) {
  const b = LINE_BADGES.find((e) => e.match.test(label));
  const color = b?.color ?? "#6d7a83";
  const codes = b?.code ? b.code.split("|") : [""];
  let bx = x;
  for (const code of codes) {
    const top = cy - s / 2;
    if (b?.shink) {
      g.fillStyle = color;
      g.beginPath();
      g.roundRect(bx, top, s, s, 2);
      g.fill();
      drawShinkansenGlyph(g, bx, top, s, color);
    } else if (b?.round) {
      g.fillStyle = color;
      g.beginPath();
      g.arc(bx + s / 2, cy, s / 2, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "#ffffff";
      g.textAlign = "center";
      g.font = `bold ${Math.round(s * 0.66)}px ${JP_FONT}`;
      g.fillText(code, bx + s / 2, cy + s * 0.24);
      g.textAlign = "left";
    } else {
      g.fillStyle = "#ffffff";
      g.strokeStyle = color;
      g.lineWidth = Math.max(1.5, s * 0.09);
      g.beginPath();
      g.roundRect(bx + 0.5, top + 0.5, s - 1, s - 1, 2);
      g.fill();
      g.stroke();
      g.fillStyle = color;
      g.textAlign = "center";
      g.font = `bold ${Math.round(s * (code.length > 1 ? 0.5 : 0.62))}px ${JP_FONT}`;
      g.fillText(code, bx + s / 2, cy + s * 0.2);
      g.textAlign = "left";
    }
    bx += s + s * 0.13;
  }
  return bx - x - s * 0.13;
}
var ZOOM_SPINE = [
  [-70, 106, 13],
  [40, 124, 15],
  [140, 146, 18],
  [226.5, 172.6, 22],
  [293.1, 203.1, 26],
  [360.8, 247.8, 32],
  [422.1, 301.9, 40],
  [476.5, 374.2, 46],
  [514, 442, 50],
  [545, 510, 52]
];
var ZOOM_SLOTS = [
  { cx: 476.5, cy: 374.2, r: 24.5, bx: 546.3, by: 363.4, bs: 43, fs: 48 },
  { cx: 422.1, cy: 301.9, r: 22.4, bx: 497.9, by: 296.1, bs: 43, fs: 48 },
  { cx: 360.8, cy: 247.8, r: 19.5, bx: 431.6, by: 236, bs: 36, fs: 41 },
  { cx: 293.1, cy: 203.1, r: 17, bx: 352.9, by: 184.3, bs: 31, fs: 31 },
  { cx: 226.5, cy: 172.6, r: 14.5, bx: 270.5, by: 148.6, bs: 29, fs: 26 }
];
var ZOOM_ARC_GAP = 11;
var ZOOM_NAME_GAP = 10;
var NAME_MIN_SQUEEZE = 0.55;
function squeezeToFit(g, text, px, avail, floor = NAME_MIN_SQUEEZE) {
  g.font = `bold ${px}px ${JP_FONT}`;
  let tw = g.measureText(text).width;
  if (tw <= avail) return 1;
  let sx = avail / tw;
  if (sx < floor) {
    g.font = `bold ${Math.max(10, Math.round(px * sx / floor))}px ${JP_FONT}`;
    tw = g.measureText(text).width;
    sx = Math.min(1, avail / tw);
  }
  return sx;
}
function drawSqueezed(g, text, x, y, sx) {
  if (sx === 1) {
    g.fillText(text, x, y);
    return;
  }
  g.save();
  g.translate(x, y);
  g.scale(sx, 1);
  g.fillText(text, 0, 0);
  g.restore();
}
function nameBaseline(g, cy, latin) {
  return cy + g.measureText(latin ? "H" : "\u7530").actualBoundingBoxAscent / 2;
}
function drawFittedName(g, text, x, cy, px, avail, latin) {
  const sx = squeezeToFit(g, text, px, avail);
  drawSqueezed(g, text, x, nameBaseline(g, cy, latin), sx);
}
function spineSamples(pts, steps = 12) {
  const at = (i) => pts[Math.max(0, Math.min(pts.length - 1, i))];
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      const t2 = t * t;
      const t3 = t2 * t;
      const cr = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([cr(p0[0], p1[0], p2[0], p3[0]), cr(p0[1], p1[1], p2[1], p3[1]), p1[2] + (p2[2] - p1[2]) * t]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}
function bandEdges(X) {
  const spine = spineSamples(ZOOM_SPINE);
  const outer = [];
  const inner = [];
  const along = [];
  let len = 0;
  for (let i = 0; i < spine.length; i++) {
    const [x, y, hw] = spine[i];
    const p = spine[Math.max(0, i - 1)];
    const n = spine[Math.min(spine.length - 1, i + 1)];
    const tx = n[0] - p[0];
    const ty = n[1] - p[1];
    const d = Math.hypot(tx, ty) || 1;
    inner.push([X(x - ty / d * hw), y + tx / d * hw]);
    outer.push([X(x + ty / d * hw), y - tx / d * hw]);
    if (i > 0) len += Math.hypot(x - spine[i - 1][0], y - spine[i - 1][1]);
    along.push(len);
  }
  return { outer, inner, u: along.map((a) => 1 - a / (len || 1)) };
}
var ZOOM_OUTER = bandEdges((x) => x).outer;
function bandRight(y0, y1) {
  let m = -Infinity;
  for (let i = 0; i < ZOOM_OUTER.length - 1; i++) {
    const a = ZOOM_OUTER[i];
    const b = ZOOM_OUTER[i + 1];
    if (a[1] >= y0 && a[1] <= y1) m = Math.max(m, a[0]);
    if (b[1] >= y0 && b[1] <= y1) m = Math.max(m, b[0]);
    for (const yc of [y0, y1]) {
      if ((a[1] - yc) * (b[1] - yc) < 0) {
        m = Math.max(m, a[0] + (b[0] - a[0]) * (yc - a[1]) / (b[1] - a[1]));
      }
    }
  }
  return m;
}
function zoomSlotX(slot) {
  const bx = Math.max(slot.bx, bandRight(slot.by - slot.bs / 2, slot.by + slot.bs / 2) + ZOOM_ARC_GAP);
  return { bx, nx: bx + slot.bs + ZOOM_NAME_GAP };
}
function edgeAt(edge, u, at) {
  for (let i = 0; i < u.length - 1; i++) {
    if (at <= u[i] && at >= u[i + 1]) {
      const span = u[i] - u[i + 1] || 1;
      const t = (u[i] - at) / span;
      return [
        edge[i][0] + (edge[i + 1][0] - edge[i][0]) * t,
        edge[i][1] + (edge[i + 1][1] - edge[i][1]) * t
      ];
    }
  }
  return at > u[0] ? edge[0] : edge[edge.length - 1];
}
function paintBand(g, e, from, to, body, edge) {
  if (to <= from) return;
  const cut = (b) => {
    const out = [edgeAt(b, e.u, to)];
    for (let i = 0; i < e.u.length; i++) if (e.u[i] < to && e.u[i] > from) out.push(b[i]);
    out.push(edgeAt(b, e.u, from));
    return out;
  };
  const outer = cut(e.outer);
  const inner = cut(e.inner);
  g.strokeStyle = edge;
  g.lineWidth = 13;
  g.lineJoin = "round";
  g.lineCap = "butt";
  g.beginPath();
  inner.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y));
  g.stroke();
  g.fillStyle = body;
  g.beginPath();
  outer.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y));
  for (let i = inner.length - 1; i >= 0; i--) g.lineTo(inner[i][0], inner[i][1]);
  g.closePath();
  g.fill();
}
function drawJyBadge(g, jy, x, cy, s) {
  const top = cy - s / 2;
  g.fillStyle = "#f4f4f2";
  g.strokeStyle = YAMANOTE_GREEN;
  g.lineWidth = s * 0.1;
  g.beginPath();
  g.roundRect(x, top, s, s, 3);
  g.fill();
  g.stroke();
  g.fillStyle = "#141414";
  g.textAlign = "center";
  g.font = `${Math.round(s * 0.4)}px ${JP_FONT}`;
  g.fillText("JY", x + s / 2, top + s * 0.44);
  g.font = `bold ${Math.round(s * 0.56)}px ${JP_FONT}`;
  g.fillText(jy.slice(2), x + s / 2, top + s * 0.92);
  g.textAlign = "left";
}
function drawHerePentagon(g, x, y, angle, s = 1, mir = false) {
  g.save();
  g.translate(x, y);
  g.rotate(angle);
  g.scale(mir ? -s : s, s);
  const path = () => {
    g.beginPath();
    g.moveTo(-19.2, -29.8);
    g.lineTo(10.2, -29.8);
    g.lineTo(35.3, 7.7);
    g.lineTo(-16.5, 30);
    g.lineTo(-35.6, -10.9);
    g.closePath();
  };
  g.save();
  g.translate(3, 4);
  g.strokeStyle = "rgba(70,92,124,0.22)";
  g.lineWidth = 13;
  g.lineJoin = "round";
  path();
  g.stroke();
  g.fillStyle = "rgba(70,92,124,0.22)";
  g.fill();
  g.restore();
  g.strokeStyle = "#f2f2f2";
  g.lineWidth = 13;
  g.lineJoin = "round";
  path();
  g.stroke();
  g.fillStyle = MARKER_RED;
  path();
  g.fill();
  g.fillStyle = "#f2f2f2";
  g.beginPath();
  g.ellipse(-2.2, -2.4, 9.9, 7.7, 0, 0, Math.PI * 2);
  g.fill();
  g.restore();
}
function drawHereBlock(g, x, y, angle) {
  g.save();
  g.translate(x, y);
  g.rotate(angle);
  g.beginPath();
  g.moveTo(-14.75, -11.95);
  g.lineTo(9.75, -11.95);
  g.lineTo(14.75, 0);
  g.lineTo(9.75, 11.95);
  g.lineTo(-14.75, 11.95);
  g.closePath();
  g.strokeStyle = "#f0f0ee";
  g.lineWidth = 3;
  g.lineJoin = "round";
  g.stroke();
  g.fillStyle = MARKER_RED;
  g.fill();
  g.fillStyle = "#f2f2f2";
  g.beginPath();
  g.arc(-1, 0, 4.6, 0, Math.PI * 2);
  g.fill();
  g.restore();
}
var markerLit = (anim) => anim % ANIM_PHASES < 2;
function drawWayChevron(g, x, y, angle, s = 1) {
  g.save();
  g.translate(x, y);
  g.rotate(angle);
  g.scale(s, s);
  g.beginPath();
  g.moveTo(-8.05, -15.5);
  g.lineTo(2.65, -15.5);
  g.lineTo(8.05, 0);
  g.lineTo(2.65, 15.5);
  g.lineTo(-8.05, 15.5);
  g.lineTo(-2.65, 0);
  g.closePath();
  g.strokeStyle = "#f0f0ee";
  g.lineWidth = 1.6;
  g.lineJoin = "miter";
  g.stroke();
  g.fillStyle = MARKER_RED;
  g.fill();
  g.restore();
}
function drawRoute(s, index, phase, countdown, clock, status, lang, dir, anim = 0, fill = 1) {
  const { g, w, h } = s;
  const next = STATIONS[index];
  const en = lang === "en";
  const mir = dir === "outer";
  const X = (x) => mir ? w - x : x;
  const AL = mir ? "right" : "left";
  g.fillStyle = SCREEN_BG;
  g.fillRect(0, 0, w, h);
  const edges = bandEdges(X);
  if (fill < 1) paintBand(g, edges, 0, 1, BAND_DIM, BAND_DIM_DARK);
  paintBand(g, edges, 0, fill, YAMANOTE_GREEN, YAMANOTE_GREEN_DARK);
  const atStation = phase === "dwell";
  for (let k = 4; k >= 0; k--) {
    const st = STATIONS[stationAtHop(index, k, dir)];
    const slot = ZOOM_SLOTS[k];
    if (k > 0 || !atStation) {
      const minutes = etaMinutes(index, k, atStation, countdown, dir);
      g.beginPath();
      g.arc(X(slot.cx), slot.cy, slot.r, 0, Math.PI * 2);
      g.fillStyle = !atStation && k === 0 ? "#efa61c" : "#f4f4f2";
      g.fill();
      g.fillStyle = "#141414";
      g.font = `bold ${Math.round(slot.r * 1.55)}px ${JP_FONT}`;
      g.textAlign = "center";
      g.fillText(String(minutes), X(slot.cx), slot.cy + slot.r * 0.55);
    }
    if (k === 4) {
      g.fillStyle = "#141414";
      g.font = `12px ${JP_FONT}`;
      g.textAlign = AL;
      g.fillText(en ? "(min)" : "(\u5206)", X(slot.cx + slot.r + 3), slot.cy + 6);
    }
    const { bx, nx } = zoomSlotX(slot);
    drawJyBadge(g, st.jy, mir ? X(bx) - slot.bs : bx, slot.by, slot.bs);
    g.fillStyle = "#141414";
    g.textAlign = AL;
    const name = stationName(st, lang);
    const avail = w - nx - 6;
    const px = en ? Math.round(slot.fs * 0.82) : slot.fs;
    const words = name.split(" ");
    if (!en && name.length === 2) {
      g.font = `bold ${slot.fs}px ${JP_FONT}`;
      g.textAlign = "center";
      const near = X(nx + slot.fs * 0.5);
      const far = X(nx + slot.fs * 2.5);
      const y = nameBaseline(g, slot.by, false);
      g.fillText(name[0], mir ? far : near, y);
      g.fillText(name[1], mir ? near : far, y);
      g.textAlign = AL;
    } else if (en && words.length === 2) {
      const linePx = Math.round(px * 0.75);
      const lead = Math.round(linePx * 0.95);
      const indent = linePx * 0.55;
      drawFittedName(g, words[0], X(nx), slot.by - lead / 2, linePx, avail, true);
      drawFittedName(g, words[1], X(nx + indent), slot.by + lead / 2, linePx, avail - indent, true);
    } else {
      drawFittedName(g, name, X(nx), slot.by, px, avail, en);
    }
  }
  if (markerLit(anim)) {
    if (atStation) {
      drawHerePentagon(g, X(ZOOM_SLOTS[0].cx + 3.5), ZOOM_SLOTS[0].cy + 2.5, 0, 1, mir);
    } else {
      const a = Math.atan2(ZOOM_SLOTS[0].cy - ZOOM_SLOTS[1].cy, ZOOM_SLOTS[0].cx - ZOOM_SLOTS[1].cx);
      const ang = mir ? -a : a + Math.PI;
      drawWayChevron(g, X(ZOOM_SLOTS[0].cx + 20), ZOOM_SLOTS[0].cy + 27, ang, 1.25);
    }
  }
  const tr = TRANSFERS[next.jy];
  if (tr) {
    g.textAlign = mir ? "right" : "left";
    const head = en ? [["Transfer at", false], [`${next.romaji} Station`, true]] : [[`${next.kanji}\u99C5`, true], ["\u4E57\u63DB\u3048\u306E\u3054\u6848\u5185", false]];
    head.forEach(([text, isName], i) => {
      g.font = `${isName ? "bold " : ""}17px ${JP_FONT}`;
      g.fillStyle = isName ? "#141414" : "#4c4f52";
      g.fillText(text, X(8), 217 + i * 21);
    });
    const labels = tr.jp.split("\u3001").filter(Boolean);
    const COL = [10, 177];
    const COL_W = 160;
    let y = 262;
    let col = 0;
    g.font = `17px ${JP_FONT}`;
    for (const label of labels) {
      if (y > 400) break;
      const text = en ? lineNameEn(label) : label;
      const bw = lineBadgeWidth(label, 18.7);
      const wide = g.measureText(text).width + bw + 4 > COL_W;
      if (wide && col === 1) {
        col = 0;
        y += 22.3;
        if (y > 400) break;
      }
      const x = COL[col];
      const avail = (wide ? COL_W * 2 + 17 : COL_W) - bw - 4;
      const lines = [];
      let rest = text;
      while (rest && lines.length < 3) {
        let cut = rest.length;
        while (cut > 1 && g.measureText(rest.slice(0, cut)).width > avail) cut--;
        lines.push(rest.slice(0, cut));
        rest = rest.slice(cut).replace(/^ /, "");
      }
      const textW = Math.max(...lines.map((l) => g.measureText(l).width));
      const bx = mir ? X(x) - bw - 4 - textW : x;
      drawLineBadge(g, label, bx, y - 6, 18.7);
      g.fillStyle = "#141414";
      g.font = `17px ${JP_FONT}`;
      g.textAlign = "left";
      let ly = y;
      for (const line of lines) {
        if (ly > 400) break;
        g.fillText(line, bx + bw + 4, ly);
        ly += 21;
      }
      ly -= 21;
      if (wide) {
        y = ly + 22.3;
        col = 0;
      } else if (col === 0) {
        col = 1;
      } else {
        col = 0;
        y += 22.3;
      }
    }
  }
  g.textAlign = AL;
  g.fillStyle = "#6f7270";
  g.font = `11px ${JP_FONT}`;
  g.fillText(en ? ROUTE_FOOTNOTE_EN : ROUTE_FOOTNOTE_JP, X(8), h - 12);
  g.textAlign = "left";
  drawHeader(g, w, index, clock, status, lang, dir);
}
var LOOP_COLS = 15;
function loopSlot(stIdx) {
  if (stIdx === 0) return { col: LOOP_COLS - 1, top: false };
  if (stIdx <= 15) return { col: LOOP_COLS - stIdx, top: true };
  return { col: stIdx - 16, top: false };
}
function drawVerticalName(g, name, x, yStart, glyph) {
  g.font = `bold ${glyph}px ${JP_FONT}`;
  g.textAlign = "center";
  for (let i = 0; i < name.length; i++) {
    const ch = name[i];
    const base = yStart + i * glyph;
    if (ch === "\u30FC") {
      g.save();
      g.translate(x, base - glyph * 0.35);
      g.rotate(Math.PI / 2);
      g.fillText(ch, 0, glyph * 0.35);
      g.restore();
    } else {
      g.fillText(ch, x, base);
    }
  }
  g.textAlign = "left";
}
function splitVertical(name) {
  if (name.length <= 4) return null;
  const kata = name.search(/[゠-ヿ]/);
  const cut = kata > 0 ? kata : Math.ceil(name.length / 2);
  return [name.slice(0, cut), name.slice(cut)];
}
var LOOP_X0 = 83;
var LOOP_DX = 43.15;
var LOOP_Y_TOP = 247.6;
var LOOP_Y_BOT = 320.3;
var LOOP_RING_W = 26;
var LOOP_EN_TILT = -0.94;
var LOOP_RING_L = LOOP_X0 - 58;
var LOOP_RING_R = LOOP_X0 + (LOOP_COLS - 1) * LOOP_DX + 57;
var LOOP_RING_R_CAP = (LOOP_Y_BOT - LOOP_Y_TOP) / 2;
var LOOP_RUN = LOOP_RING_R - LOOP_RING_L - 2 * LOOP_RING_R_CAP;
var LOOP_CAP = Math.PI * LOOP_RING_R_CAP;
var LOOP_PERIM = 2 * (LOOP_RUN + LOOP_CAP);
function loopArc(slot) {
  const x = LOOP_X0 + slot.col * LOOP_DX;
  const x0 = LOOP_RING_L + LOOP_RING_R_CAP;
  return slot.top ? x - x0 : LOOP_RUN + LOOP_CAP + (LOOP_RUN - (x - x0));
}
function loopPointAt(t) {
  const s = (t % LOOP_PERIM + LOOP_PERIM) % LOOP_PERIM;
  const x0 = LOOP_RING_L + LOOP_RING_R_CAP;
  const x1 = LOOP_RING_R - LOOP_RING_R_CAP;
  if (s < LOOP_RUN) return { x: x0 + s, y: LOOP_Y_TOP, angle: 0 };
  if (s < LOOP_RUN + LOOP_CAP) {
    const a2 = -Math.PI / 2 + (s - LOOP_RUN) / LOOP_RING_R_CAP;
    return {
      x: x1 + Math.cos(a2) * LOOP_RING_R_CAP,
      y: LOOP_Y_TOP + LOOP_RING_R_CAP + Math.sin(a2) * LOOP_RING_R_CAP,
      angle: a2 + Math.PI / 2
    };
  }
  if (s < 2 * LOOP_RUN + LOOP_CAP) {
    return { x: x1 - (s - LOOP_RUN - LOOP_CAP), y: LOOP_Y_BOT, angle: Math.PI };
  }
  const a = Math.PI / 2 + (s - 2 * LOOP_RUN - LOOP_CAP) / LOOP_RING_R_CAP;
  return {
    x: x0 + Math.cos(a) * LOOP_RING_R_CAP,
    y: LOOP_Y_TOP + LOOP_RING_R_CAP + Math.sin(a) * LOOP_RING_R_CAP,
    angle: a + Math.PI / 2
  };
}
function drawLoopBreak(g, x, y, up) {
  const f = up ? 1 : -1;
  g.strokeStyle = SCREEN_BG;
  g.lineWidth = 3.2;
  g.lineCap = "butt";
  g.lineJoin = "miter";
  g.beginPath();
  g.moveTo(x - 15, y + f * 3.3);
  g.lineTo(x, y - f * 3.3);
  g.lineTo(x + 15, y + f * 3.3);
  g.stroke();
}
function drawLoopMap(s, index, phase, countdown, clock, status, lang, dir, anim = 0) {
  const { g, w, h } = s;
  g.fillStyle = SCREEN_BG;
  g.fillRect(0, 0, w, h);
  drawHeader(g, w, index, clock, status, lang, dir);
  const en = lang === "en";
  const at = (slot) => [
    LOOP_X0 + slot.col * LOOP_DX,
    slot.top ? LOOP_Y_TOP : LOOP_Y_BOT
  ];
  const tNext = loopArc(loopSlot(index));
  const tAfter = loopArc(loopSlot(stationAtHop(index, 1, dir)));
  let delta = tAfter - tNext;
  if (delta > LOOP_PERIM / 2) delta -= LOOP_PERIM;
  if (delta < -LOOP_PERIM / 2) delta += LOOP_PERIM;
  const way = delta >= 0 ? 1 : -1;
  const rowAngle = (top) => (top ? 0 : Math.PI) + (way > 0 ? 0 : Math.PI);
  g.strokeStyle = YAMANOTE_GREEN;
  g.lineWidth = LOOP_RING_W;
  g.lineJoin = "round";
  g.beginPath();
  g.roundRect(
    LOOP_RING_L,
    LOOP_Y_TOP,
    LOOP_RING_R - LOOP_RING_L,
    LOOP_Y_BOT - LOOP_Y_TOP,
    LOOP_RING_R_CAP
  );
  g.stroke();
  const midY = LOOP_Y_TOP + LOOP_RING_R_CAP;
  drawLoopBreak(g, LOOP_RING_L, midY, way > 0);
  drawLoopBreak(g, LOOP_RING_R, midY, way < 0);
  const rank = new Array(30);
  for (let k = 0; k < 30; k++) rank[stationAtHop(index, k, dir)] = k;
  const atStation = phase === "dwell";
  const MINUTES_SHOWN = 14;
  for (let stIdx = 0; stIdx < 30; stIdx++) {
    const slot = loopSlot(stIdx);
    const [x, y] = at(slot);
    const k = rank[stIdx];
    if (atStation && k === 0) {
      if (markerLit(anim)) drawHereBlock(g, x, y, rowAngle(slot.top));
    } else if (k < MINUTES_SHOWN) {
      const minutes = etaMinutes(index, k, atStation, countdown, dir);
      g.beginPath();
      g.arc(x, y, 11.1, 0, Math.PI * 2);
      g.fillStyle = !atStation && k === 0 ? "#efc22a" : "#f6f6f4";
      g.fill();
      if (!atStation && k === 0) {
        g.strokeStyle = "#b8901c";
        g.lineWidth = 2.4;
        g.stroke();
      }
      g.fillStyle = "#141414";
      g.font = `bold 18px ${JP_FONT}`;
      g.textAlign = "center";
      g.fillText(String(minutes), x, y + 6.5);
      const endsRun = k === MINUTES_SHOWN - 1 || loopSlot(stationAtHop(index, k + 1, dir)).top !== slot.top;
      if (endsRun) {
        g.font = `10px ${JP_FONT}`;
        g.textAlign = "left";
        g.fillText(en ? "(min)" : "(\u5206)", x + 12, y + 12);
      }
    } else {
      g.beginPath();
      g.arc(x, y, 5.8, 0, Math.PI * 2);
      g.fillStyle = "#d8d8d8";
      g.fill();
    }
    g.textAlign = "left";
    g.fillStyle = "#141414";
    if (en) {
      g.save();
      g.translate(x + (slot.top ? -2 : 2), slot.top ? LOOP_Y_TOP - 22 : LOOP_Y_BOT + 26);
      g.rotate(LOOP_EN_TILT);
      g.textAlign = slot.top ? "left" : "right";
      g.font = `bold 12px ${JP_FONT}`;
      stationName(STATIONS[stIdx], "en").split(" ").forEach((word, i) => g.fillText(word, 0, 4 + i * 14));
      g.restore();
      g.textAlign = "left";
      continue;
    }
    const name = STATIONS[stIdx].kanji;
    const split = splitVertical(name);
    if (slot.top) {
      const glyph = Math.min(20, 73 / name.length);
      drawVerticalName(g, name, x, 222.5 - (name.length - 1) * glyph, glyph);
    } else if (split) {
      const g0 = Math.min(19, 76 / split[0].length);
      const g1 = Math.min(19, 76 / split[1].length);
      drawVerticalName(g, split[0], x + g0 * 0.55, 342.5 + g0 * 0.8, g0);
      drawVerticalName(g, split[1], x - g0 * 0.55, 342.5 + g1 * 0.8, g1);
    } else {
      const glyph = Math.min(19, 76 / name.length);
      drawVerticalName(g, name, x, 342.5 + glyph * 0.8, glyph);
    }
  }
  if (!atStation && markerLit(anim)) {
    const mk = loopPointAt(tNext - way * 22);
    drawWayChevron(g, mk.x, mk.y, rowAngle(loopSlot(index).top));
  }
  g.textAlign = "left";
  g.fillStyle = "#6f7270";
  g.font = `11px ${JP_FONT}`;
  g.fillText(en ? ROUTE_FOOTNOTE_EN : ROUTE_FOOTNOTE_JP, 8, h - 12);
}
function drawPhoneManner(s, index, clock, dir, status = "next") {
  const { g, w, h } = s;
  g.fillStyle = "#ffffff";
  g.fillRect(0, 0, w, h);
  drawHeader(g, w, index, clock, status, "jp", dir);
  const cx = 172;
  const cy = HEADER_H + (h - HEADER_H) * 0.52;
  g.save();
  g.translate(cx, cy);
  g.rotate(-0.32);
  g.fillStyle = "#9a9a9a";
  g.beginPath();
  g.roundRect(-52, -96, 104, 192, 14);
  g.fill();
  g.fillStyle = "#b4b4b4";
  g.beginPath();
  g.roundRect(-42, -84, 84, 74, 6);
  g.fill();
  g.fillStyle = "#8a8a8a";
  g.fillRect(-52, -6, 104, 7);
  g.strokeStyle = "#9a9a9a";
  g.lineWidth = 6;
  g.beginPath();
  g.moveTo(36, -96);
  g.lineTo(46, -136);
  g.stroke();
  g.strokeStyle = "#8a8a8a";
  g.lineWidth = 4;
  for (const sgn of [-1, 1]) {
    for (let i = 1; i <= 2; i++) {
      g.beginPath();
      g.arc(sgn * 60, -70, 10 + i * 12, sgn > 0 ? -0.8 : Math.PI - 0.8, sgn > 0 ? 0.8 : Math.PI + 0.8);
      g.stroke();
    }
  }
  g.fillStyle = "#3a3a3a";
  g.font = `bold 23px ${JP_FONT}`;
  g.textAlign = "center";
  g.save();
  g.rotate(-0.12);
  g.fillText("\u30DE\u30CA\u30FC", 0, 34);
  g.restore();
  g.strokeStyle = "#d0202a";
  g.lineWidth = 6;
  g.beginPath();
  g.moveTo(-48, 40);
  g.lineTo(48, 12);
  g.stroke();
  g.fillStyle = "#3a3a3a";
  g.font = `bold 26px ${JP_FONT}`;
  g.fillText("\u901A\u8A71", 0, 82);
  g.restore();
  g.textAlign = "left";
  g.fillStyle = "#141414";
  g.font = `bold 32px ${JP_FONT}`;
  g.fillText("\u30DE\u30CA\u30FC\u30E2\u30FC\u30C9\u306B\u8A2D\u5B9A\u306E\u4E0A\u3001", 300, HEADER_H + 92);
  g.fillText("\u901A\u8A71\u306F\u3054\u9060\u616E\u304F\u3060\u3055\u3044\u3002", 300, HEADER_H + 134);
  g.fillStyle = "#4a4a4a";
  g.font = `17px ${JP_FONT}`;
  g.fillText("Please set your mobile phone to silent mode", 300, HEADER_H + 172);
  g.fillText("and refrain from talking on the phone.", 300, HEADER_H + 194);
}
var APPROACH_BAND_Y = HEADER_H;
var APPROACH_BAND_H = 39;
var APPROACH_PLAT_Y = APPROACH_BAND_Y + APPROACH_BAND_H;
var APPROACH_PLAT_H = 115;
var APPROACH_CARS_Y = 291;
var APPROACH_CARS_H = 35;
var APPROACH_FOOT_Y = 328;
var APPROACH_PX_PER_M = 660 / (CONSIST.length * E235.pitch);
function drawStairGlyph(g, x, y, s) {
  const n = 4;
  const step = s / n;
  g.beginPath();
  g.moveTo(x - s / 2, y + s * 0.5);
  for (let i = 0; i < n; i++) {
    g.lineTo(x - s / 2 + i * step, y + s * 0.5 - (i + 1) * step);
    g.lineTo(x - s / 2 + (i + 1) * step, y + s * 0.5 - (i + 1) * step);
  }
  g.lineTo(x + s / 2, y + s * 0.5);
  g.closePath();
  g.fillStyle = "#eef2fb";
  g.fill();
  g.strokeStyle = "#33427a";
  g.lineWidth = 1.2;
  g.stroke();
}
function drawEscalatorGlyph(g, x, y, s) {
  g.fillStyle = "#eef2fb";
  g.strokeStyle = "#33427a";
  g.lineWidth = 1.2;
  g.beginPath();
  g.moveTo(x - s * 0.46, y + s * 0.45);
  g.lineTo(x + s * 0.18, y - s * 0.45);
  g.lineTo(x + s * 0.46, y - s * 0.45);
  g.lineTo(x + s * 0.46, y + s * 0.45);
  g.closePath();
  g.fill();
  g.stroke();
  g.fillStyle = "#33427a";
  g.beginPath();
  g.arc(x - s * 0.26, y + s * 0.26, s * 0.12, 0, Math.PI * 2);
  g.fill();
}
function drawElevatorGlyph(g, x, y, s) {
  g.fillStyle = "#eef2fb";
  g.strokeStyle = "#3a4a78";
  g.lineWidth = 1;
  g.beginPath();
  g.rect(x - s * 0.32, y - s * 0.5, s * 0.64, s);
  g.fill();
  g.stroke();
  g.fillStyle = "#3a4a78";
  g.beginPath();
  g.moveTo(x - s * 0.14, y - s * 0.06);
  g.lineTo(x - s * 0.02, y - s * 0.3);
  g.lineTo(x + s * 0.1, y - s * 0.06);
  g.closePath();
  g.moveTo(x - s * 0.14, y + s * 0.1);
  g.lineTo(x - s * 0.02, y + s * 0.34);
  g.lineTo(x + s * 0.1, y + s * 0.1);
  g.closePath();
  g.fill();
}
var DOOR_SHUT = 2;
var DOOR_WIDE = 31;
function drawDoorGlyph(g, mine, anim) {
  const open = mine ? doorAperture(anim) : 0;
  const mark = mine ? doorMarker(anim) : 0;
  const off = DOOR_SHUT + (DOOR_WIDE - DOOR_SHUT) * open;
  const cx = 150;
  const top = 333;
  const bot = 418;
  const leafW = 46;
  g.fillStyle = "#e8c81e";
  g.fillRect(cx - 58, bot, 116, 10);
  if (open > 0) {
    g.fillStyle = "#1c4a86";
    g.fillRect(cx - off, bot - 23, off * 2, 23);
  }
  if (mark > 0) {
    g.fillStyle = "#c4232b";
    g.beginPath();
    g.moveTo(cx - 22 * mark, bot - 1);
    g.lineTo(cx, bot - 1 - 17 * mark);
    g.lineTo(cx + 22 * mark, bot - 1);
    g.closePath();
    g.fill();
  }
  for (const sgn of [-1, 1]) {
    const inner = cx + sgn * off;
    const lx = sgn < 0 ? inner - leafW : inner;
    g.fillStyle = "#e2e9f4";
    g.strokeStyle = "#9fb0cb";
    g.lineWidth = 1;
    g.fillRect(lx, top, leafW, bot - top);
    g.strokeRect(lx + 0.5, top + 0.5, leafW - 1, bot - top - 1);
    const win = g.createLinearGradient(0, top + 5, 0, top + 52);
    win.addColorStop(0, "#0d3a72");
    win.addColorStop(1, "#bcd8ef");
    g.fillStyle = win;
    g.fillRect(lx + 6, top + 5, leafW - 12, 47);
    g.fillStyle = "#e8d022";
    g.fillRect(sgn < 0 ? inner - 4 : inner, top, 4, bot - top);
  }
  if (!mine) {
    const my = (top + bot) / 2;
    g.fillStyle = "#d0202a";
    g.beginPath();
    g.arc(cx, my, 27, 0, Math.PI * 2);
    g.fill();
    g.fillStyle = "#ffffff";
    g.fillRect(cx - 18, my - 5, 36, 10);
  }
  if (mine) {
    g.fillStyle = "#eef2fa";
    for (const sgn of [-1, 1]) {
      const tail = cx + sgn * (off + leafW + 8);
      const tip = tail + sgn * 22;
      const my = (top + bot) / 2;
      g.beginPath();
      g.moveTo(tip, my);
      g.lineTo(tail + sgn * 9, my - 13);
      g.lineTo(tail + sgn * 9, my - 6);
      g.lineTo(tail, my - 6);
      g.lineTo(tail, my + 6);
      g.lineTo(tail + sgn * 9, my + 6);
      g.lineTo(tail + sgn * 9, my + 13);
      g.closePath();
      g.fill();
    }
  }
}
function drawStationLayout(s, index, anim) {
  const { g, w, h } = s;
  const next = STATIONS[index];
  const layout = layoutFor(index);
  const gate = gateNameFor(index);
  const hasTransfer = Boolean(TRANSFERS[next.jy]);
  g.fillStyle = "#0a1738";
  g.fillRect(0, 0, w, h);
  const grad = g.createLinearGradient(0, APPROACH_PLAT_Y, 0, APPROACH_PLAT_Y + APPROACH_PLAT_H);
  grad.addColorStop(0, "#4a63a8");
  grad.addColorStop(0.55, "#8b9ccb");
  grad.addColorStop(1, "#5d72b0");
  g.fillStyle = grad;
  g.fillRect(0, APPROACH_PLAT_Y, w, APPROACH_PLAT_H);
  g.strokeStyle = "#d8c65a";
  g.lineWidth = 1.6;
  g.setLineDash([7, 6]);
  for (const y of [APPROACH_PLAT_Y + 8, APPROACH_PLAT_Y + APPROACH_PLAT_H - 8]) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(w, y);
    g.stroke();
  }
  g.setLineDash([]);
  const scale = APPROACH_PX_PER_M;
  const cx = w / 2;
  const px = (z) => cx - z * scale;
  const am = layout.amenities;
  const access = [
    ...am.stairs.map((z) => ({ x: px(z), kind: "stair" })),
    ...am.escalators.map((z) => ({ x: px(z), kind: "escalator" })),
    ...am.elevator !== null ? [{ x: px(am.elevator), kind: "elevator" }] : []
  ].sort((a, b) => a.x - b.x);
  const glyphY = APPROACH_PLAT_Y + APPROACH_PLAT_H * 0.6;
  for (const a of access) {
    const draw = a.kind === "stair" ? drawStairGlyph : a.kind === "escalator" ? drawEscalatorGlyph : drawElevatorGlyph;
    draw(g, a.x, glyphY, 46);
  }
  const groups = [];
  for (const a of access) {
    const last = groups[groups.length - 1];
    if (last && a.x - last[last.length - 1].x < 62) last.push(a);
    else groups.push([a]);
  }
  const gateGroup = groups.reduce(
    (best, gr) => Math.abs(gr[0].x - cx) > Math.abs(best[0].x - cx) ? gr : best
  );
  g.fillStyle = "#c3d4f4";
  g.fillRect(0, APPROACH_BAND_Y, w, APPROACH_BAND_H);
  const ly = APPROACH_BAND_Y + 4;
  const lh = APPROACH_BAND_H - 8;
  const boxes = groups.map((gr) => {
    const isGate = gr === gateGroup;
    const kinds = new Set(gr.map((a) => a.kind));
    const base = kinds.has("stair") ? hasTransfer ? "\u306E\u308A\u304B\u3048\u968E\u6BB5" : "\u968E\u6BB5" : kinds.has("escalator") ? "\u30A8\u30B9\u30AB\u30EC\u30FC\u30BF\u30FC" : "\u30A8\u30EC\u30D9\u30FC\u30BF\u30FC";
    const label = base + (isGate ? `\u30FB${gate.jp}` : "");
    g.font = `13px ${JP_FONT}`;
    const tw = Math.min(232, g.measureText(label).width + 14);
    const gx = gr.reduce((sum, a) => sum + a.x, 0) / gr.length;
    return { gr, isGate, label, tw, x: gx - tw / 2 };
  });
  for (let i = 1; i < boxes.length; i++) {
    const prev = boxes[i - 1];
    boxes[i].x = Math.max(boxes[i].x, prev.x + prev.tw + 6);
  }
  const overflow = boxes.length ? boxes[boxes.length - 1].x + boxes[boxes.length - 1].tw - (w - 4) : 0;
  if (overflow > 0) for (let i = boxes.length - 1; i >= 0; i--) boxes[i].x -= overflow;
  for (let i = 1; i < boxes.length; i++) {
    boxes[i - 1].x = Math.min(boxes[i - 1].x, boxes[i].x - boxes[i - 1].tw - 6);
  }
  for (const b of boxes) {
    const lx = Math.max(4, b.x);
    g.strokeStyle = "#dde5f7";
    g.lineWidth = 1.6;
    for (const a of b.gr) {
      g.beginPath();
      g.moveTo(Math.max(lx + 4, Math.min(lx + b.tw - 4, a.x)), ly + lh);
      g.lineTo(a.x, glyphY - 20);
      g.stroke();
    }
    g.fillStyle = "#f4e34a";
    g.fillRect(lx, ly, b.tw, lh);
    g.fillStyle = "#1a1a10";
    g.textAlign = "center";
    fitText(g, b.label, b.tw - 10, 13, "");
    g.fillText(b.label, lx + b.tw / 2, b.isGate ? ly + 15 : ly + 20);
    if (b.isGate) {
      g.font = `9px ${JP_FONT}`;
      fitText(g, `${gate.romaji} Gate`, b.tw - 10, 9, "");
      g.fillText(`${gate.romaji} Gate`, lx + b.tw / 2, ly + 26);
    }
    g.textAlign = "left";
  }
  g.fillStyle = "#c3d4f4";
  g.fillRect(0, APPROACH_CARS_Y, w, APPROACH_CARS_H);
  const boxW = E235.pitch * scale;
  const boxY = APPROACH_CARS_Y + 4;
  const boxH = APPROACH_CARS_H - 8;
  const cap = boxH / 2;
  for (let i = 0; i < CONSIST.length; i++) {
    const bx = px(carZ(i)) - boxW / 2;
    const isMine = i === PLAYER_CAR;
    const first = i === CONSIST.length - 1;
    const last = i === 0;
    g.fillStyle = isMine ? "#c4232b" : "#f2f5fc";
    g.strokeStyle = isMine ? "#e8909a" : "#5a6a92";
    g.lineWidth = 1.4;
    g.beginPath();
    g.roundRect(bx, boxY, boxW, boxH, [first ? cap : 3, last ? cap : 3, last ? cap : 3, first ? cap : 3]);
    g.fill();
    g.stroke();
    g.fillStyle = isMine ? "#ffffff" : "#14203f";
    g.textAlign = "center";
    g.font = `italic bold 17px ${JP_FONT}`;
    g.fillText(String(CONSIST[i].no), bx + boxW / 2, APPROACH_CARS_Y + 25);
    const mark = doorMarker(anim);
    if (isMine && mark > 0) {
      g.fillStyle = "#c4232b";
      g.beginPath();
      g.moveTo(bx + boxW / 2 - 12 * mark, boxY);
      g.lineTo(bx + boxW / 2, boxY - 14 * mark);
      g.lineTo(bx + boxW / 2 + 12 * mark, boxY);
      g.closePath();
      g.fill();
    }
  }
  g.textAlign = "left";
  g.fillStyle = "#14203f";
  const tipX = px(carZ(0)) + boxW / 2 + 7;
  g.beginPath();
  g.moveTo(tipX, APPROACH_CARS_Y + 7);
  g.lineTo(tipX + 13, APPROACH_CARS_Y + APPROACH_CARS_H / 2);
  g.lineTo(tipX, APPROACH_CARS_Y + APPROACH_CARS_H - 7);
  g.closePath();
  g.fill();
  g.textAlign = "left";
}
function drawExitTransfers(s, index, clock, lang, dir, anim = 0, status = "next") {
  const { g, w, h } = s;
  drawStationLayout(s, index, anim);
  g.fillStyle = "#c3d4f4";
  g.fillRect(0, APPROACH_FOOT_Y, w, h - APPROACH_FOOT_Y);
  const labels = (TRANSFERS[STATIONS[index].jy]?.jp ?? "").split("\u3001").filter(Boolean).slice(0, 6);
  if (labels.length === 0) {
    g.textAlign = "center";
    g.fillStyle = "#2b3a63";
    g.font = `20px ${JP_FONT}`;
    g.fillText("\u306E\u308A\u304B\u3048\u306E\u8DEF\u7DDA\u306F\u3042\u308A\u307E\u305B\u3093", w / 2, APPROACH_FOOT_Y + 50);
    g.fillStyle = "#4a5a80";
    g.font = `13px ${JP_FONT}`;
    g.fillText("No connecting lines at this station", w / 2, APPROACH_FOOT_Y + 70);
    g.textAlign = "left";
  } else {
    let x = 24;
    let y = APPROACH_FOOT_Y + 32;
    for (const label of labels) {
      const en = lineNameEn(label);
      g.font = `17px ${JP_FONT}`;
      const jpW = g.measureText(label).width;
      g.font = `11px ${JP_FONT}`;
      const enW = g.measureText(en).width;
      const textW = Math.max(jpW, enW);
      if (x + 26 + textW > w - 16) {
        x = 24;
        y += 40;
      }
      if (y > h - 22) break;
      const bw = drawLineBadge(g, label, x, y - 6, 19);
      g.textAlign = "left";
      g.fillStyle = "#14203f";
      g.font = `17px ${JP_FONT}`;
      g.fillText(label, x + bw + 5, y);
      g.fillStyle = "#3d4c70";
      g.font = `11px ${JP_FONT}`;
      g.fillText(en, x + bw + 5, y + 15);
      x += bw + 5 + textW + 26;
    }
    g.textAlign = "left";
  }
  drawHeader(g, w, index, clock, status, lang, dir);
}
function drawExitDoors(s, index, clock, mine, dir, anim = 0, status = "soon") {
  const { g, w, h } = s;
  drawStationLayout(s, index, anim);
  const foot = g.createLinearGradient(0, APPROACH_FOOT_Y, 0, h);
  foot.addColorStop(0, "#0d1f55");
  foot.addColorStop(1, "#050d2a");
  g.fillStyle = foot;
  g.fillRect(0, APPROACH_FOOT_Y, w, h - APPROACH_FOOT_Y);
  drawDoorGlyph(g, mine, anim);
  g.textAlign = "left";
  g.fillStyle = "#ffffff";
  const jp = mine ? "\u3053\u3061\u3089\u5074\u306E\u30C9\u30A2\u304C\u958B\u304D\u307E\u3059" : "\u53CD\u5BFE\u5074\u306E\u30C9\u30A2\u304C\u958B\u304D\u307E\u3059";
  fitText(g, jp, w - 316, 34, "");
  g.fillText(jp, 300, APPROACH_FOOT_Y + 42);
  g.fillStyle = "#b9c6e8";
  const en = mine ? "Doors on this side will open." : "Doors on the other side will open.";
  fitText(g, en, w - 316, 21, "");
  g.fillText(en, 302, APPROACH_FOOT_Y + 72);
  g.textAlign = "left";
  drawHeader(g, w, index, clock, status, "jp", dir);
}
function drawTransfers(s, index, clock, dir, status = "next") {
  const { g, w, h } = s;
  const next = STATIONS[index];
  g.fillStyle = "#eceae5";
  g.fillRect(0, 0, w, h);
  drawHeader(g, w, index, clock, status, "jp", dir);
  g.fillStyle = "#dfe6ea";
  g.fillRect(0, HEADER_H, w, 40);
  g.fillStyle = "#26303a";
  g.font = `bold 23px ${JP_FONT}`;
  g.textAlign = "left";
  g.fillText(`${next.kanji}\u306E\u308A\u304B\u3048  /  Transfer at ${next.romaji}`, 16, HEADER_H + 28);
  const lines = (TRANSFERS[next.jy]?.jp ?? "").split("\u3001").filter(Boolean).slice(0, 8);
  if (lines.length === 0) {
    g.fillStyle = "#5c646c";
    g.font = `26px ${JP_FONT}`;
    g.fillText("\u306E\u308A\u304B\u3048\u306E\u8DEF\u7DDA\u306F\u3042\u308A\u307E\u305B\u3093", 24, h * 0.66);
    return;
  }
  const cols = 2;
  const cw = (w - 48) / cols;
  lines.forEach((label, i) => {
    const cx = 24 + i % cols * cw;
    const cy = HEADER_H + 68 + Math.floor(i / cols) * 44;
    const bw = drawLineBadge(g, label, cx, cy - 8, 32);
    g.textAlign = "left";
    g.fillStyle = "#26303a";
    fitText(g, label, cw - bw - 36, 23, "");
    g.fillText(label, cx + bw + 12, cy);
  });
}
function drawPriorityNotice(s, index, clock, dir, status = "next") {
  const { g, w, h } = s;
  g.fillStyle = "#ffffff";
  g.fillRect(0, 0, w, h);
  drawHeader(g, w, index, clock, status, "jp", dir);
  const bx = 96;
  const bw = w - 2 * bx;
  g.fillStyle = "#4a9e5c";
  g.beginPath();
  g.roundRect(bx, HEADER_H + 18, bw, 74, 8);
  g.fill();
  g.fillStyle = "#ffffff";
  g.textAlign = "left";
  g.font = `bold 52px ${JP_FONT}`;
  g.fillText("\u512A\u5148\u5E2D", bx + 26, HEADER_H + 74);
  g.font = `bold 15px ${JP_FONT}`;
  g.fillText("Priority", bx + bw - 96, HEADER_H + 40);
  g.fillText("Seat", bx + bw - 96, HEADER_H + 57);
  g.font = `13px ${JP_FONT}`;
  g.fillText("\u4F18\u5148\u5EA7\u4F4D", bx + bw - 96, HEADER_H + 74);
  g.fillText("\uB178\uC57D\uC790\uC11D", bx + bw - 96, HEADER_H + 89);
  const seatY = HEADER_H + 176;
  for (let i = 0; i < 5; i++) {
    const cx = w * (0.17 + i * 0.165);
    g.fillStyle = "#2f5fa8";
    g.beginPath();
    g.roundRect(cx - 4, seatY - 26, 26, 10, 3);
    g.fill();
    g.beginPath();
    g.roundRect(cx + 16, seatY - 62, 10, 46, 3);
    g.fill();
    g.beginPath();
    g.arc(cx + 2, seatY - 66, 11, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.roundRect(cx - 6, seatY - 52, 18, 30, 7);
    g.fill();
    g.beginPath();
    g.roundRect(cx - 26, seatY - 28, 32, 11, 5);
    g.fill();
    g.beginPath();
    g.roundRect(cx - 26, seatY - 24, 11, 26, 5);
    g.fill();
    if (i === 0) {
      g.lineWidth = 4;
      g.strokeStyle = "#2f5fa8";
      g.beginPath();
      g.moveTo(cx - 34, seatY - 44);
      g.lineTo(cx - 34, seatY + 2);
      g.stroke();
    }
    if (i === 1) {
      g.lineWidth = 4;
      g.strokeStyle = "#2f5fa8";
      g.beginPath();
      g.moveTo(cx - 36, seatY - 50);
      g.lineTo(cx - 30, seatY + 2);
      g.moveTo(cx - 42, seatY - 50);
      g.lineTo(cx - 30, seatY - 50);
      g.stroke();
    }
    if (i === 2) {
      g.fillStyle = "#ffffff";
      g.fillRect(cx - 3, seatY - 48, 12, 4);
      g.fillRect(cx + 1, seatY - 52, 4, 12);
    }
    if (i === 3) {
      g.fillStyle = "#2f5fa8";
      g.beginPath();
      g.arc(cx - 16, seatY - 40, 7, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.roundRect(cx - 22, seatY - 32, 13, 14, 5);
      g.fill();
    }
    if (i === 4) {
      g.fillStyle = "#e08fb0";
      g.beginPath();
      g.arc(cx - 8, seatY - 36, 10, 0, Math.PI * 2);
      g.fill();
    }
  }
  const caps = ["\u304A\u5E74\u5BC4\u308A\u306E\u65B9", "\u304B\u3089\u3060\u306E\u4E0D\u81EA\u7531\u306A\u65B9", "\u5185\u90E8\u969C\u304C\u3044\u306E\u3042\u308B\u65B9", "\u4E73\u5E7C\u5150\u3092\u304A\u9023\u308C\u306E\u65B9", "\u598A\u5A20\u3057\u3066\u3044\u308B\u65B9"];
  g.fillStyle = "#1a1a1a";
  g.font = `11px ${JP_FONT}`;
  g.textAlign = "center";
  caps.forEach((c, i) => g.fillText(c, w * (0.17 + i * 0.165), seatY + 30));
  g.fillStyle = "#141414";
  g.font = `bold 17px ${JP_FONT}`;
  g.fillText("\u512A\u5148\u5E2D\u3092\u5FC5\u8981\u3068\u3055\u308C\u308B\u304A\u5BA2\u3055\u307E\u304C\u3044\u3089\u3063\u3057\u3083\u3044\u307E\u3057\u305F\u3089\u3001\u5E2D\u3092\u304A\u8B72\u308A\u304F\u3060\u3055\u3044\u3002", w / 2, h - 30);
  g.fillStyle = "#4a4a4a";
  g.font = `13px ${JP_FONT}`;
  g.fillText("Please offer your seat to those who may need it.", w / 2, h - 12);
  g.textAlign = "left";
}
var OTHER_LINES = [
  { jp: "\u6771\u6025\u6C60\u4E0A\u7DDA", en: "Tokyu Ikegami Line", color: "#ee86a7" },
  { jp: "\u4E2D\u592E\u7DDA\u5FEB\u901F", en: "Chuo Line (Rapid)", color: "#f15a24" },
  { jp: "\u4EAC\u738B\u7DDA", en: "Keio Line", color: "#d31e79" },
  { jp: "\u57FC\u4EAC\u7DDA", en: "Saikyo Line", color: "#00ac9a" },
  { jp: "\u6771\u4EAC\u30E1\u30C8\u30ED\u6771\u897F\u7DDA", en: "Tokyo Metro Tozai Line", color: "#009bbf" },
  { jp: "\u4EAC\u6210\u672C\u7DDA", en: "Keisei Main Line", color: "#005aaa" }
];
var DELAY_REASONS = [
  ["\u4FE1\u53F7\u78BA\u8A8D", "a signal check"],
  ["\u8ECA\u5185\u70B9\u691C", "an on-board inspection"],
  ["\u8E0F\u5207\u5B89\u5168\u78BA\u8A8D", "a crossing safety check"],
  ["\u6DF7\u96D1", "congestion"]
];
function trafficNotice(clockMin) {
  const slot = Math.floor(clockMin / 30);
  const r = rng(4200 + slot);
  if (r() > 0.34) return null;
  const line = OTHER_LINES[Math.floor(r() * OTHER_LINES.length)];
  const [reasonJp, reasonEn] = DELAY_REASONS[Math.floor(r() * DELAY_REASONS.length)];
  return { lineJp: line.jp, lineEn: line.en, reasonJp, reasonEn };
}
function drawInfoBand(g, w) {
  const bh = 30;
  g.fillStyle = "#ffffff";
  g.fillRect(0, HEADER_H, w, bh);
  g.fillStyle = "#1a1a1a";
  g.textAlign = "center";
  g.font = `17px ${JP_FONT}`;
  g.fillText("\u904B\u884C\u60C5\u5831\u3000Train Information", w / 2, HEADER_H + 21);
  g.textAlign = "left";
  g.strokeStyle = "#9a9a9a";
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(0, HEADER_H + bh - 0.5);
  g.lineTo(w, HEADER_H + bh - 0.5);
  g.stroke();
  return HEADER_H + bh;
}
function drawPageBox(g, w, h, page) {
  g.fillStyle = "#ffffff";
  g.strokeStyle = "#3a3a3a";
  g.lineWidth = 1.4;
  g.beginPath();
  g.rect(w - 74, h - 34, 60, 24);
  g.fill();
  g.stroke();
  g.fillStyle = "#1a1a1a";
  g.textAlign = "center";
  g.font = `16px ${JP_FONT}`;
  g.fillText(page, w - 44, h - 16);
  g.textAlign = "left";
}
function drawTrafficInfo(s, index, clock, status, lang, notice, dir) {
  const { g, w, h } = s;
  const top = (() => {
    g.fillStyle = "#dcdcdc";
    g.fillRect(0, 0, w, h);
    drawHeader(g, w, index, clock, status, lang, dir);
    return drawInfoBand(g, w);
  })();
  if (lang === "jp") {
    g.fillStyle = "#141414";
    g.font = `bold 21px ${JP_FONT}`;
    g.textAlign = "left";
    g.fillText(`\u3010${notice.lineJp}\u3000\u9045\u5EF6\u3011`, 22, top + 38);
    g.font = `20px ${JP_FONT}`;
    const body = `${notice.lineJp}\u306F\u3001${notice.reasonJp}\u306E\u5F71\u97FF\u3067\u3001\u4E0A\u4E0B\u7DDA\u306E\u4E00\u90E8\u5217\u8ECA\u306B\u9045\u308C\u304C\u3067\u3066\u3044\u307E\u3059\u3002`;
    let rest = body;
    let y = top + 70;
    while (rest && y < h - 46) {
      let cut = rest.length;
      while (cut > 1 && g.measureText(rest.slice(0, cut)).width > w - 44) cut--;
      g.fillText(rest.slice(0, cut), 22, y);
      rest = rest.slice(cut);
      y += 30;
    }
    drawPageBox(g, w, h, "1/2");
    return;
  }
  const rows = [
    ["Line", notice.lineEn],
    ["Direction", "Inbound and outbound lines"],
    ["Status", "Delay"],
    ["Cause", notice.reasonEn.replace(/^an? /, "")]
  ];
  const rh = 30;
  const labelW = 128;
  rows.forEach(([label, value], i) => {
    const y = top + 16 + i * rh;
    g.fillStyle = "#92a9d6";
    g.fillRect(14, y, labelW, rh);
    g.fillStyle = "#e9e9e9";
    g.fillRect(14 + labelW, y, w - 28 - labelW, rh);
    g.strokeStyle = "#5a5a5a";
    g.lineWidth = 1;
    g.strokeRect(14.5, y + 0.5, labelW, rh);
    g.strokeRect(14.5 + labelW, y + 0.5, w - 28 - labelW, rh);
    g.fillStyle = "#141414";
    g.font = `18px ${JP_FONT}`;
    g.textAlign = "left";
    g.fillText(label, 24, y + 21);
    fitText(g, value, w - 52 - labelW, 18, "");
    g.fillText(value, 24 + labelW, y + 21);
  });
  drawPageBox(g, w, h, "2/2");
}
function drawRuns(g, runs, x, y) {
  let cx = x;
  for (const [text, hot] of runs) {
    g.fillStyle = hot ? "#d0202a" : "#141414";
    g.fillText(text, cx, y);
    cx += g.measureText(text).width;
  }
}
var SECURITY_JP = [
  [["\u305F\u3060\u3044\u307E\u3001\u5F53\u793E\u30B0\u30EB\u30FC\u30D7\u3067\u306F\u3001\u8B66\u5BDF\u3068\u9023\u643A\u3057\u3001", false], ["\u7279\u5225\u8B66\u6212", true], ["\u3092\u5B9F\u65BD\u3057\u3066", false]],
  [["\u304A\u308A\u307E\u3059\u3002\u9632\u72AF\u30AB\u30E1\u30E9\u3092\u99C5\u69CB\u5185\u306B\u8A2D\u7F6E\u3057\u3066\u3044\u308B\u307B\u304B\u3001\u793E\u54E1\u304A\u3088\u3073\u8B66\u5099\u54E1\u306B\u3088\u308B", false]],
  [["\u99C5\u69CB\u5185\u30FB\u5217\u8ECA\u5185\u306E\u5DE1\u56DE\u3092\u5F37\u5316\u3057\u3066\u3001\u304A\u5BA2\u3055\u307E\u306B\u5B89\u5FC3\u3057\u3066\u3054\u5229\u7528\u3044\u305F\u3060\u3051\u308B\u3088\u3046", false]],
  [["\u306B\u52AA\u3081\u3066\u304A\u308A\u307E\u3059\u3002", false]],
  [["\u99C5\u69CB\u5185\u3067", false], ["\u4E0D\u5BE9\u7269\u3084\u6C17\u304C\u304B\u308A\u306A\u3053\u3068", true], ["\u304C\u3054\u3056\u3044\u307E\u3057\u305F\u3089\u3001\u304A\u8FD1\u304F\u306E\u99C5\u4FC2\u54E1\u3001\u8ECA\u638C", false]],
  [["\u307E\u305F\u306F\u8B66\u5099\u54E1\u307E\u3067\u304A\u77E5\u3089\u305B\u304F\u3060\u3055\u3044\u3002\u304A\u5BA2\u69D8\u306E\u3054\u5354\u529B\u3092\u304A\u9858\u3044\u3044\u305F\u3057\u307E\u3059\u3002", false]]
];
var SECURITY_EN = [
  [["Together with the Police Department, we are", false]],
  [["now on ", false], ["a high alert.", true]],
  [["If you find ", false], ["something suspicious", true], [" at a station or on a train,", false]],
  [["please inform station staff, conductors or security guards", false]],
  [["as soon as possible.", false]]
];
function drawSecurityNotice(s, index, clock, lang, dir, status = "next") {
  const { g, w, h } = s;
  g.fillStyle = "#ffffff";
  g.fillRect(0, 0, w, h);
  drawHeader(g, w, index, clock, status, lang, dir);
  const top = HEADER_H + 4;
  g.strokeStyle = "#e00b18";
  g.lineWidth = 7;
  g.strokeRect(6.5, top + 3.5, w - 13, h - top - 10);
  const jp = lang === "jp";
  g.textAlign = "center";
  g.fillStyle = "#d0202a";
  g.font = `bold ${jp ? 24 : 30}px ${JP_FONT}`;
  const title = jp ? "\u7279\u5225\u8B66\u6212\u5B9F\u65BD\u306E\u304A\u77E5\u3089\u305B" : "Security Notice";
  g.fillText(title, w / 2, top + 40);
  const tw = g.measureText(title).width;
  g.strokeStyle = "#d0202a";
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(w / 2 - tw / 2 - 10, top + 48);
  g.lineTo(w / 2 + tw / 2 + 10, top + 48);
  g.stroke();
  g.textAlign = "left";
  g.font = `${jp ? 19 : 22}px ${JP_FONT}`;
  const runs = jp ? SECURITY_JP : SECURITY_EN;
  runs.forEach((line, i) => drawRuns(g, line, 26, top + 82 + i * (jp ? 27 : 32)));
}
var NOTICE_TOP_BG = "#0d6a3d";
var NOTICE_BOT_BG = "#0a0a0a";
var NOTICE_SPLIT = 212;
function drawWarningTriangle(g, cx, cy, half) {
  const hh = half * 1.214;
  const r = half * 0.25;
  const p = [
    [cx, cy - hh],
    [cx + half, cy + hh * 0.776],
    [cx - half, cy + hh * 0.776]
  ];
  g.beginPath();
  g.moveTo((p[2][0] + p[0][0]) / 2, (p[2][1] + p[0][1]) / 2);
  for (let i = 0; i < 3; i++) g.arcTo(p[i][0], p[i][1], p[(i + 1) % 3][0], p[(i + 1) % 3][1], r);
  g.closePath();
  g.fillStyle = "#f7d117";
  g.fill();
  g.strokeStyle = "#141414";
  g.lineWidth = half * 0.157;
  g.lineJoin = "round";
  g.stroke();
  const top = cy - hh * 0.553;
  const bot = cy + hh * 0.2;
  g.fillStyle = "#141414";
  g.beginPath();
  g.moveTo(cx - half * 0.13, top);
  g.lineTo(cx + half * 0.13, top);
  g.lineTo(cx + half * 0.1, bot);
  g.lineTo(cx - half * 0.1, bot);
  g.closePath();
  g.fill();
  g.beginPath();
  g.arc(cx, cy + hh * 0.447, half * 0.128, 0, Math.PI * 2);
  g.fill();
}
function drawDisruptionNotice(s, n) {
  const { g, w, h } = s;
  g.fillStyle = NOTICE_TOP_BG;
  g.fillRect(0, 0, w, NOTICE_SPLIT);
  g.fillStyle = NOTICE_BOT_BG;
  g.fillRect(0, NOTICE_SPLIT, w, h - NOTICE_SPLIT);
  drawWarningTriangle(g, 103, 116, 70);
  g.textAlign = "left";
  g.fillStyle = "#ffffff";
  n.jp.forEach((line, i) => {
    fitText(g, line, w - 226, 27, "");
    g.fillText(line, 212, 86 + i * 36);
  });
  g.fillStyle = "#f2f2f2";
  const blocks = [
    [n.en, 252],
    [n.zh, 321],
    [n.ko, 380]
  ];
  for (const [lines, y0] of blocks) {
    lines.forEach((line, i) => {
      fitText(g, line, w - 44, 21, "");
      g.fillText(line, 24, y0 + i * 27);
    });
  }
}
var NOTICE_SUSPENDED = {
  jp: [
    "\u3053\u306E\u96FB\u8ECA\u306F\u305F\u3060\u3044\u307E\u904B\u8EE2\u3092\u898B\u5408\u308F\u305B\u3066\u304A\u308A\u307E\u3059\u3002",
    "\u73FE\u5728\u306E\u3068\u3053\u308D\u3001\u904B\u8EE2\u518D\u958B\u306E\u76EE\u51E6\u306F\u305F\u3063\u3066\u304A\u308A\u307E\u305B\u3093\u3002",
    "\u3054\u8FF7\u60D1\u3092\u304A\u304B\u3051\u3044\u305F\u3057\u307E\u3059\u3002\u7533\u3057\u8A33\u3054\u3056\u3044\u307E\u305B\u3093\u3002"
  ],
  en: [
    "We are sorry to inform you that operation of this train has been stopped.",
    "At present, it is unclear when operations will resume. Please excuse the delay."
  ],
  zh: ["\u672C\u6B21\u5217\u8F66\u73B0\u5728\u6682\u505C\u8FD0\u884C\u3002\u76EE\u524D\u5C1A\u65E0\u6CD5\u9884\u6D4B\u4F55\u65F6\u6062\u590D\u8FD0\u884C\u3002", "\u7531\u6B64\u7ED9\u60A8\u5E26\u6765\u7684\u4E0D\u4FBF\uFF0C\u6211\u4EEC\u6DF1\u8868\u6B49\u610F\u3002"],
  ko: [
    "\uC774 \uC5F4\uCC28\uB294 \uD604\uC7AC \uC6B4\uD589\uC744 \uC911\uB2E8\uD558\uACE0 \uC788\uC2B5\uB2C8\uB2E4. \uC6B4\uD589 \uC7AC\uAC1C\uB294 \uC544\uC9C1",
    "\uC608\uC815\uB418\uC5B4 \uC788\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4. \uBD88\uD3B8\uC744 \uB07C\uCCD0\uB4DC\uB824 \uB300\uB2E8\uD788 \uC8C4\uC1A1\uD569\uB2C8\uB2E4."
  ]
};
var NOTICE_OUTAGE = {
  jp: [
    "\u3053\u306E\u96FB\u8ECA\u306F\u67B6\u7DDA\u306E\u505C\u96FB\u306E\u305F\u3081\u505C\u8ECA\u3057\u3066\u304A\u308A\u307E\u3057\u305F\u3002",
    "\u96FB\u529B\u304C\u5FA9\u65E7\u3044\u305F\u3057\u307E\u3057\u305F\u306E\u3067\u3001\u307E\u3082\u306A\u304F\u904B\u8EE2\u3092\u518D\u958B\u3044\u305F\u3057\u307E\u3059\u3002",
    "\u3054\u8FF7\u60D1\u3092\u304A\u304B\u3051\u3044\u305F\u3057\u307E\u3059\u3002\u7533\u3057\u8A33\u3054\u3056\u3044\u307E\u305B\u3093\u3002"
  ],
  en: [
    "This train was stopped by a power failure on the overhead line.",
    "Power has been restored and service will resume shortly."
  ],
  zh: ["\u672C\u6B21\u5217\u8F66\u56E0\u63A5\u89E6\u7F51\u505C\u7535\u800C\u505C\u8F66\u3002", "\u4F9B\u7535\u5DF2\u6062\u590D\uFF0C\u5217\u8F66\u5373\u5C06\u6062\u590D\u8FD0\u884C\u3002"],
  ko: ["\uC774 \uC5F4\uCC28\uB294 \uC804\uCC28\uC120 \uC815\uC804\uC73C\uB85C \uC815\uCC28\uD558\uC600\uC2B5\uB2C8\uB2E4.", "\uC804\uB825\uC774 \uBCF5\uAD6C\uB418\uC5B4 \uACE7 \uC6B4\uD589\uC744 \uC7AC\uAC1C\uD569\uB2C8\uB2E4."]
};
function drawEmergencyBrake(s) {
  const { g, w, h } = s;
  const bg = g.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, "#c9a218");
  bg.addColorStop(0.5, "#f2d84a");
  bg.addColorStop(1, "#c9a218");
  g.fillStyle = bg;
  g.fillRect(0, 0, w, h);
  g.fillStyle = "#f7e88a";
  g.beginPath();
  g.roundRect(16, 12, w - 32, h - 24, 18);
  g.fill();
  g.save();
  g.globalAlpha = 0.35;
  g.fillStyle = "#d9a94a";
  g.beginPath();
  g.moveTo(w / 2 - 26, 30);
  g.lineTo(w / 2 + 26, 30);
  g.lineTo(w / 2 + 16, 250);
  g.lineTo(w / 2 - 16, 250);
  g.closePath();
  g.fill();
  g.beginPath();
  g.arc(w / 2, 320, 30, 0, Math.PI * 2);
  g.fill();
  g.restore();
  g.textAlign = "center";
  g.fillStyle = "#d0202a";
  g.font = `bold 66px ${JP_FONT}`;
  g.fillText("\u6025\u505C\u8ECA\u3057\u307E\u3059\uFF01", w / 2, 108);
  g.fillStyle = "#141414";
  g.font = `bold 38px ${JP_FONT}`;
  g.fillText("\u304A\u8FD1\u304F\u306E\u624B\u3059\u308A\u3084\u540A\u308A\u9769\u306B", w / 2, 190);
  g.fillText("\u304A\u3064\u304B\u307E\u308A\u304F\u3060\u3055\u3044\u3002", w / 2, 236);
  g.font = `bold 19px ${JP_FONT}`;
  g.fillText("\u8D70\u884C\u4E2D\u5B89\u5168\u78BA\u4FDD\u306E\u305F\u3081\u3084\u3080\u3092\u5F97\u305A\u6025\u505C\u8ECA", w / 2, 330);
  g.fillText("\u3059\u308B\u3053\u3068\u304C\u3042\u308A\u307E\u3059\u306E\u3067\u3054\u6CE8\u610F\u4E0B\u3055\u3044\u3002", w / 2, 356);
  g.textAlign = "left";
}
function drawEmergencyInfo(s) {
  drawDisruptionNotice(s, NOTICE_SUSPENDED);
}
function drawOutageInfo(s) {
  drawDisruptionNotice(s, NOTICE_OUTAGE);
}

// ../../../brunopaiva15/yamanote-3d/src/three/lineScreenStates.ts
var NOTICE_SEGMENTS = [
  {
    from: "JY08",
    to: "JY09",
    directions: "both",
    notices: ["securityJP", "securityEN"],
    confidence: "estimated",
    source: "secteur de \u7530\u7AEF cit\xE9 en exemple ; bornes de l\u2019intervalle non fournies"
  },
  {
    from: "JY09",
    to: "JY10",
    directions: "both",
    notices: ["securityJP", "securityEN"],
    confidence: "estimated",
    source: "secteur de \u7530\u7AEF cit\xE9 en exemple ; bornes de l\u2019intervalle non fournies"
  },
  {
    from: "JY11",
    to: "JY12",
    directions: "both",
    notices: ["securityJP", "securityEN"],
    confidence: "estimated",
    source: "secteur de \u5927\u585A cit\xE9 en exemple ; bornes de l\u2019intervalle non fournies"
  },
  {
    from: "JY12",
    to: "JY13",
    directions: "both",
    notices: ["securityJP", "securityEN"],
    confidence: "estimated",
    source: "secteur de \u5927\u585A cit\xE9 en exemple ; bornes de l\u2019intervalle non fournies"
  },
  {
    from: "JY23",
    to: "JY24",
    directions: "both",
    notices: ["securityJP", "securityEN", "priority", "manner"],
    confidence: "estimated",
    source: "secteur de \u5927\u5D0E cit\xE9 en exemple ; bornes de l\u2019intervalle non fournies"
  },
  {
    from: "JY24",
    to: "JY25",
    directions: "both",
    notices: ["securityJP", "securityEN", "priority", "manner"],
    confidence: "estimated",
    source: "secteurs de \u5927\u5D0E et de \u54C1\u5DDD cit\xE9s en exemple ; bornes non fournies"
  },
  {
    from: "JY25",
    to: "JY26",
    directions: "both",
    notices: ["securityJP", "securityEN", "priority", "manner"],
    confidence: "estimated",
    source: "secteur de \u54C1\u5DDD cit\xE9 en exemple ; bornes de l\u2019intervalle non fournies"
  }
];
function segmentKey(fromJy, toJy) {
  return fromJy < toJy ? `${fromJy}-${toJy}` : `${toJy}-${fromJy}`;
}
var SEGMENT_TABLE = (() => {
  const table = /* @__PURE__ */ new Map();
  for (const seg of NOTICE_SEGMENTS) {
    const key = segmentKey(seg.from, seg.to);
    const list = table.get(key);
    if (list) list.push(seg);
    else table.set(key, [seg]);
  }
  return table;
})();
function appliesTo(seg, dir) {
  return seg.directions === "both" || seg.directions.includes(dir);
}
function segmentEntries(index, dir) {
  const from = STATIONS[prevStation(index, dir)].jy;
  const key = segmentKey(from, STATIONS[index].jy);
  return (SEGMENT_TABLE.get(key) ?? []).filter((seg) => appliesTo(seg, dir));
}
function segmentNotices(index, dir) {
  const out = [];
  for (const seg of segmentEntries(index, dir)) {
    for (const n of seg.notices) if (!out.includes(n)) out.push(n);
  }
  return out;
}
var ANIMATED_STATES = /* @__PURE__ */ new Set([
  "zoomJP",
  "zoomEN",
  "loopJP",
  "loopEN",
  "stationLayout"
]);
var COUNTDOWN_STATES = /* @__PURE__ */ new Set([
  "zoomJP",
  "zoomEN",
  "loopJP",
  "loopEN"
]);
function computeLineScreenFrame(input) {
  const { index, phase, direction: dir, clockMin, clock, countdown, emergency, notice } = input;
  const tick = Math.floor(clockMin * 4);
  const base = {
    index,
    clock,
    countdown,
    notice,
    emergencyReason: emergency.reason
  };
  const plain = (state, status2) => ({ ...base, state, status: status2, animated: ANIMATED_STATES.has(state) });
  if (emergency.stage !== "none") {
    return plain(
      emergency.kind === "outage" ? "outage" : emergency.stage === "braking" ? "brake" : "emergency",
      "next"
    );
  }
  if (phase === "brake") {
    return {
      ...base,
      state: "stationLayout",
      mode: "doors",
      status: "soon",
      lang: "jp",
      animated: true
    };
  }
  const status = phase === "dwell" ? "now" : "next";
  const rotation = phase === "dwell" ? (
    // À quai, la rotation garde les deux plans de ligne ET le plan des
    // sorties de la gare où l'on est : c'est l'écran de la figure 6,
    // portillons nommés et correspondances en bas. Le pictogramme « portes
    // qui ferment », lui, a disparu des rames et rien ne le remplace - on ne
    // force pas un écran pour combler un trou.
    ["loopJP", "zoomJP", { layout: "jp" }, "loopEN", "zoomEN", { layout: "en" }]
  ) : (
    // `cruise` et `depart` : on roule vers la gare visée.
    //
    // Les autres états dégradés de la propre ligne (retard persistant,
    // interruption planifiée) restent non rendus : la simulation n'a pas ces
    // incidents, les afficher serait annoncer au voyageur quelque chose qui
    // n'arrive pas.
    [
      "loopJP",
      "zoomJP",
      { layout: "jp" },
      "loopEN",
      "zoomEN",
      { layout: "en" },
      "transfers",
      // Les avis de campagne du secteur - le plus souvent aucun.
      ...segmentNotices(index, dir)
    ]
  );
  if (notice && phase !== "dwell") rotation.push("trafficJP", "trafficEN");
  const slot = rotation[tick % rotation.length];
  if (typeof slot === "object") {
    return {
      ...base,
      state: "stationLayout",
      mode: "transfers",
      status,
      lang: slot.layout,
      animated: true
    };
  }
  return plain(slot, status);
}

// ../../../brunopaiva15/yamanote-3d/src/three/screenFade.ts
var SCRATCH = /* @__PURE__ */ new Map();
function scratchFor(dst) {
  const m = dst.g.getTransform();
  const sx = m.a || 1;
  const sy = m.d || 1;
  const key = `${dst.w}x${dst.h}`;
  const held = SCRATCH.get(key);
  if (held && held.sx === sx && held.sy === sy) return held.surface;
  const canvas = held ? held.surface.g.canvas : document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(dst.w * sx));
  canvas.height = Math.max(1, Math.round(dst.h * sy));
  const g = canvas.getContext("2d");
  if (!g) throw new Error("Canvas 2D indisponible");
  g.setTransform(sx, 0, 0, sy, 0, 0);
  const surface = { g, w: dst.w, h: dst.h };
  SCRATCH.set(key, { surface, sx, sy });
  return surface;
}
function paintBlended(dst, blend, paint) {
  if (blend >= 1) {
    paint(dst);
    return;
  }
  const scratch = scratchFor(dst);
  paint(scratch);
  const g = dst.g;
  const alpha = g.globalAlpha;
  g.globalAlpha = Math.max(0, blend);
  g.drawImage(scratch.g.canvas, 0, 0, dst.w, dst.h);
  g.globalAlpha = alpha;
}

// entree.ts
var VITESSE = 3;
var DWELL = 45;
var URGENCE = { freinage: 7, arret: 50, reprise: 12 };
var COUPURE = { elan: 3, freinage: 8, arret: 75, retour: 24, reprise: 12 };
function heureDeTokyo() {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Tokyo",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).formatToParts(/* @__PURE__ */ new Date());
    const h = Number(parts.find((p) => p.type === "hour")?.value);
    const m = Number(parts.find((p) => p.type === "minute")?.value);
    if (Number.isFinite(h) && Number.isFinite(m)) return h * 60 + m;
  } catch {
  }
  return CONFIG.clockStart;
}
function dureeDePhase(t) {
  switch (t.phase) {
    case "cruise":
      return cruiseDuration(t.index, t.dir);
    case "brake":
      return CONFIG.brakeTime;
    case "dwell":
      return DWELL;
    default:
      return CONFIG.departTime;
  }
}
function avance(t, dt) {
  t.clockMin += dt / 60;
  const inc = t.incident;
  if (inc.stage !== "none") {
    avanceIncident(t, dt);
    return;
  }
  t.phaseT += dt;
  while (t.phaseT >= dureeDePhase(t)) {
    t.phaseT -= dureeDePhase(t);
    if (t.phase === "cruise") t.phase = "brake";
    else if (t.phase === "brake") t.phase = "dwell";
    else if (t.phase === "dwell") {
      t.phase = "depart";
      t.index = nextStation(t.index, t.dir);
    } else {
      t.phase = "cruise";
      t.doorSide = DOOR_SIDE[t.index];
    }
  }
}
function avanceIncident(t, dt) {
  const inc = t.incident;
  inc.t += dt;
  if (inc.kind === "brake") {
    if (inc.stage === "braking" && inc.t >= URGENCE.freinage) etape(inc, "stopped");
    else if (inc.stage === "stopped" && inc.t >= URGENCE.arret) etape(inc, "resuming");
    else if (inc.stage === "resuming" && inc.t >= URGENCE.reprise) etape(inc, "none");
    return;
  }
  if (inc.stage === "coasting" && inc.t >= COUPURE.elan) etape(inc, "braking");
  else if (inc.stage === "braking" && inc.t >= COUPURE.freinage) etape(inc, "stopped");
  else if (inc.stage === "stopped") {
    if (inc.t >= COUPURE.arret - COUPURE.retour) t.power = 1;
    if (inc.t >= COUPURE.arret) etape(inc, "resuming");
  } else if (inc.stage === "resuming" && inc.t >= COUPURE.reprise) etape(inc, "none");
}
function etape(inc, stage) {
  inc.stage = stage;
  inc.t = 0;
}
function monte(canvas, calme = false) {
  const g = canvas.getContext("2d");
  if (!g) throw new Error("canvas 2d");
  const depart = Math.floor(Math.random() * STATIONS.length);
  const train = {
    index: depart,
    dir: Math.random() < 0.5 ? "inner" : "outer",
    phase: "cruise",
    phaseT: 0,
    clockMin: heureDeTokyo(),
    doorSide: DOOR_SIDE[depart],
    incident: { stage: "none", kind: "brake", reason: 0, t: 0 },
    power: 1
  };
  train.phaseT = cruiseDuration(train.index, train.dir) * 0.55;
  let scale = 0;
  let phase = 0;
  let lastKey = "";
  let dark = false;
  const motion = newScreenAnim();
  let stepAcc = 0;
  let wasMoving = false;
  let sinceBeat = 0;
  let id = 0;
  const resize = () => {
    const shown = canvas.getBoundingClientRect().width;
    const dpr = window.devicePixelRatio || 1;
    const next = shown > 0 ? Math.min(3, Math.max(1, shown * dpr / SCREEN_W)) : 1;
    if (Math.abs(next - scale) < 0.01) return;
    scale = next;
    canvas.width = Math.round(SCREEN_W * scale);
    canvas.height = Math.round(SCREEN_H * scale);
    lastKey = "";
    dark = false;
  };
  const frame = () => computeLineScreenFrame({
    index: train.index,
    phase: train.phase,
    direction: train.dir,
    clockMin: train.clockMin,
    clock: fmtClock(train.clockMin),
    countdown: Math.round(secondsToArrival(train.phase, train.phaseT, train.index, train.dir)),
    emergency: train.incident,
    notice: trafficNotice(train.clockMin)
  });
  const pageKey = (f) => {
    const layout = f.state === "stationLayout" ? `${f.mode}/${f.lang}` : "-";
    return [f.index, train.phase, f.state, layout, f.status].join("|");
  };
  const paint = (s, f, anim, fill) => {
    const { index, clock, status, countdown, notice } = f;
    const dir = train.dir;
    const p = train.phase;
    if (f.state === "stationLayout") {
      if (f.mode === "doors") drawExitDoors(s, index, clock, true, dir, anim, f.status);
      else drawExitTransfers(s, index, clock, f.lang, dir, anim, f.status);
      return;
    }
    switch (f.state) {
      case "transfers":
        drawTransfers(s, index, clock, dir, status);
        break;
      case "priority":
        drawPriorityNotice(s, index, clock, dir, status);
        break;
      case "manner":
        drawPhoneManner(s, index, clock, dir, status);
        break;
      case "trafficJP":
        if (notice) drawTrafficInfo(s, index, clock, status, "jp", notice, dir);
        else drawLoopMap(s, index, p, countdown, clock, status, "jp", dir, anim);
        break;
      case "trafficEN":
        if (notice) drawTrafficInfo(s, index, clock, status, "en", notice, dir);
        else drawLoopMap(s, index, p, countdown, clock, status, "en", dir, anim);
        break;
      case "securityJP":
        drawSecurityNotice(s, index, clock, "jp", dir, status);
        break;
      case "securityEN":
        drawSecurityNotice(s, index, clock, "en", dir, status);
        break;
      case "brake":
        drawEmergencyBrake(s);
        break;
      case "emergency":
        drawEmergencyInfo(s);
        break;
      case "outage":
        drawOutageInfo(s);
        break;
      case "loopJP":
        drawLoopMap(s, index, p, countdown, clock, status, "jp", dir, anim);
        break;
      case "loopEN":
        drawLoopMap(s, index, p, countdown, clock, status, "en", dir, anim);
        break;
      case "zoomEN":
        drawRoute(s, index, p, countdown, clock, status, "en", dir, anim, fill);
        break;
      default:
        drawRoute(s, index, p, countdown, clock, status, "jp", dir, anim, fill);
    }
  };
  const tick = () => {
    if (document.hidden) return;
    avance(train, MOTION_STEP * VITESSE);
    resize();
    g.setTransform(scale, 0, 0, scale, 0, 0);
    if (train.power <= LCD_CUTOFF) {
      if (!dark) {
        dark = true;
        lastKey = "";
        g.fillStyle = "#05070a";
        g.fillRect(0, 0, SCREEN_W, SCREEN_H);
      }
      resetScreenAnim(motion);
      return;
    }
    dark = false;
    sinceBeat += MOTION_STEP;
    const beat = sinceBeat >= ANIM_PERIOD;
    if (beat) {
      sinceBeat = 0;
      if (!calme) phase = (phase + 1) % ANIM_PHASES;
    }
    const anim = phase + (calme ? 0 : sinceBeat / ANIM_PERIOD);
    stepAcc += MOTION_STEP;
    if (!beat && !wasMoving) return;
    const stepDt = stepAcc;
    stepAcc = 0;
    const shown = frame();
    const page = pageKey(shown);
    const step = stepScreenAnim(motion, page, !calme && bandFills(shown.state), stepDt);
    const loops = !calme && screenLoops(shown);
    const blend = calme ? 1 : step.blend;
    const moving = !calme && step.busy || loops || wasMoving;
    wasMoving = !calme && step.busy || loops;
    const key = [
      page,
      shown.clock,
      shown.animated ? Math.floor(anim) : 0,
      COUNTDOWN_STATES.has(shown.state) ? shown.countdown : 0,
      scale
    ].join("|");
    if (key === lastKey && !moving) return;
    lastKey = key;
    const surface = { g, w: SCREEN_W, h: SCREEN_H };
    paintBlended(surface, blend, (s) => paint(s, shown, anim, calme ? 1 : step.fill));
  };
  return {
    incident(kind) {
      if (train.phase !== "cruise" || train.incident.stage !== "none") return false;
      train.incident = {
        stage: kind === "outage" ? "coasting" : "braking",
        kind,
        // Le motif ne se lit que dans l'annonce du conducteur, pas à l'écran.
        reason: 0,
        t: 0
      };
      if (kind === "outage") train.power = 0;
      return true;
    },
    libre() {
      return train.phase === "cruise" && train.incident.stage === "none";
    },
    demarre() {
      if (id) return;
      lastKey = "";
      id = window.setInterval(tick, MOTION_STEP * 1e3);
      tick();
    },
    arrete() {
      if (!id) return;
      window.clearInterval(id);
      id = 0;
    },
    resume() {
      const s = STATIONS[train.index];
      return `${s.kanji} ${s.romaji}`;
    }
  };
}
export {
  monte
};
