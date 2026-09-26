// L'écran de bord de Yamanote 3D, sorti du jeu pour la page des expériences.
//
// Ce fichier n'est pas servi tel quel : c'est la source de `ecran.js`, qui en
// est la compilation. Il reprend la boucle de `src/ui/audio/LineScreen.tsx`
// (la dalle de la version sonore du jeu) et remplace ce qu'elle lisait dans le
// moteur, Zustand et `runtime`, par un train simulé ici : croisière, freinage,
// arrêt en gare, départ, et les deux incidents du jeu, l'arrêt d'urgence et la
// coupure de caténaire. La peinture, la rotation des pages, les fondus et le
// remplissage du ruban sont ceux du jeu, importés sans modification.
//
// Pour régénérer `ecran.js` après un changement dans le dépôt yamanote-3d :
//
//   npx esbuild experiences/yamanote/entree.ts --bundle --format=esm \
//     --target=es2020 --alias:@yamanote=<clone de yamanote-3d>/src \
//     --outfile=experiences/yamanote/ecran.js
//
// puis relever l'estampille `?v=` de l'appel dans `experiences/experiences.js`.

import {
  LCD_CUTOFF,
  SCREEN_H,
  SCREEN_W,
  drawEmergencyBrake,
  drawEmergencyInfo,
  drawExitDoors,
  drawExitTransfers,
  drawLoopMap,
  drawOutageInfo,
  drawPhoneManner,
  drawPriorityNotice,
  drawRoute,
  drawSecurityNotice,
  drawTrafficInfo,
  drawTransfers,
  fmtClock,
  secondsToArrival,
  trafficNotice,
  type ScreenSurface,
} from '@yamanote/three/lineScreen';
import {
  COUNTDOWN_STATES,
  computeLineScreenFrame,
  type EmergencyView,
  type LineScreenFrame,
} from '@yamanote/three/lineScreenStates';
import {
  ANIM_PERIOD,
  ANIM_PHASES,
  MOTION_STEP,
  bandFills,
  newScreenAnim,
  resetScreenAnim,
  screenLoops,
  stepScreenAnim,
} from '@yamanote/three/lineScreenAnim';
import { paintBlended } from '@yamanote/three/screenFade';
import { CONFIG } from '@yamanote/data/config';
import { DOOR_SIDE, STATIONS } from '@yamanote/data/stations';
import { nextStation } from '@yamanote/data/loop';
import { cruiseDuration } from '@yamanote/data/segments';

type Phase = 'cruise' | 'brake' | 'dwell' | 'depart';
type Direction = 'inner' | 'outer';

/**
 * Le train tourne trois fois plus vite qu'en vrai. À l'échelle réelle, la
 * rotation change de page toutes les quinze secondes et une gare dure deux
 * minutes : personne ne resterait devant une carte assez longtemps pour voir
 * l'écran passer du 次は au まもなく. À trois, une gare dure une minute et
 * chaque page tient cinq secondes, le temps de la lire.
 */
const VITESSE = 3;

/** L'arrêt en gare : la durée du jeu dépend de la mélodie du quai, on en garde l'ordre. */
const DWELL = 45;

/** Les incidents, raccourcis comme le reste, dans les bornes du jeu. */
const URGENCE = { freinage: 7, arret: 50, reprise: 12 };
const COUPURE = { elan: 3, freinage: 8, arret: 75, retour: 24, reprise: 12 };

interface Incident extends EmergencyView {
  t: number;
}

interface Train {
  index: number;
  dir: Direction;
  phase: Phase;
  phaseT: number;
  clockMin: number;
  doorSide: 1 | -1;
  incident: Incident;
  /** Tension de la rame : sous LCD_CUTOFF, la dalle est noire. */
  power: number;
}

/** L'heure de Tokyo au moment de l'ouverture : le jeu cale son horloge dessus. */
function heureDeTokyo(): number {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Tokyo',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date());
    const h = Number(parts.find((p) => p.type === 'hour')?.value);
    const m = Number(parts.find((p) => p.type === 'minute')?.value);
    if (Number.isFinite(h) && Number.isFinite(m)) return h * 60 + m;
  } catch {
    /* un navigateur sans fuseaux prend l'heure de départ du jeu */
  }
  return CONFIG.clockStart;
}

function dureeDePhase(t: Train): number {
  switch (t.phase) {
    case 'cruise':
      return cruiseDuration(t.index, t.dir);
    case 'brake':
      return CONFIG.brakeTime;
    case 'dwell':
      return DWELL;
    default:
      return CONFIG.departTime;
  }
}

/** Fait avancer le train de `dt` secondes simulées. */
function avance(t: Train, dt: number): void {
  t.clockMin += dt / 60;
  const inc = t.incident;
  if (inc.stage !== 'none') {
    avanceIncident(t, dt);
    return;
  }
  t.phaseT += dt;
  while (t.phaseT >= dureeDePhase(t)) {
    t.phaseT -= dureeDePhase(t);
    if (t.phase === 'cruise') t.phase = 'brake';
    else if (t.phase === 'brake') t.phase = 'dwell';
    else if (t.phase === 'dwell') {
      // Au départ, la rame vise déjà la gare suivante : c'est ce que fait le
      // jeu, et c'est ce que `secondsToArrival` attend en phase `depart`.
      t.phase = 'depart';
      t.index = nextStation(t.index, t.dir);
    } else {
      t.phase = 'cruise';
      t.doorSide = DOOR_SIDE[t.index];
    }
  }
}

function avanceIncident(t: Train, dt: number): void {
  const inc = t.incident;
  inc.t += dt;
  if (inc.kind === 'brake') {
    if (inc.stage === 'braking' && inc.t >= URGENCE.freinage) etape(inc, 'stopped');
    else if (inc.stage === 'stopped' && inc.t >= URGENCE.arret) etape(inc, 'resuming');
    else if (inc.stage === 'resuming' && inc.t >= URGENCE.reprise) etape(inc, 'none');
    return;
  }
  // La coupure : la rame roule sur son élan, freine, s'immobilise, et la
  // tension ne revient qu'à la fin de l'attente. Tant qu'elle manque, la dalle
  // est éteinte ; l'écran rouge de la coupure ne se voit qu'au retour.
  if (inc.stage === 'coasting' && inc.t >= COUPURE.elan) etape(inc, 'braking');
  else if (inc.stage === 'braking' && inc.t >= COUPURE.freinage) etape(inc, 'stopped');
  else if (inc.stage === 'stopped') {
    if (inc.t >= COUPURE.arret - COUPURE.retour) t.power = 1;
    if (inc.t >= COUPURE.arret) etape(inc, 'resuming');
  } else if (inc.stage === 'resuming' && inc.t >= COUPURE.reprise) etape(inc, 'none');
}

function etape(inc: Incident, stage: EmergencyView['stage']): void {
  inc.stage = stage;
  inc.t = 0;
}

export interface EcranDeBord {
  /** Déclenche un incident. Refusé hors croisière, comme dans le jeu. */
  incident(kind: 'brake' | 'outage'): boolean;
  /** Vrai si un incident peut partir maintenant : en pleine voie, et un seul à la fois. */
  libre(): boolean;
  demarre(): void;
  arrete(): void;
  /** Ce que la dalle dit, en clair, pour la lecture d'écran. */
  resume(): string;
}

/**
 * Monte l'écran dans un canevas.
 *
 * `calme` : le réglage de mouvement réduit. Les pages changent encore (c'est
 * de l'information, pas un décor), mais sans fondu enchaîné ni remplissage du
 * ruban, et les repères ne clignotent plus.
 */
export function monte(canvas: HTMLCanvasElement, calme = false): EcranDeBord {
  const g = canvas.getContext('2d');
  if (!g) throw new Error('canvas 2d');

  const depart = Math.floor(Math.random() * STATIONS.length);
  const train: Train = {
    index: depart,
    dir: Math.random() < 0.5 ? 'inner' : 'outer',
    phase: 'cruise',
    phaseT: 0,
    clockMin: heureDeTokyo(),
    doorSide: DOOR_SIDE[depart],
    incident: { stage: 'none', kind: 'brake', reason: 0, t: 0 },
    power: 1,
  };
  // On monte à bord à mi-parcours : la première chose vue est le 次は, et le
  // まもなく arrive vite.
  train.phaseT = cruiseDuration(train.index, train.dir) * 0.55;

  let scale = 0;
  let phase = 0;
  let lastKey = '';
  let dark = false;
  const motion = newScreenAnim();
  let stepAcc = 0;
  let wasMoving = false;
  let sinceBeat = 0;
  let id = 0;

  const resize = (): void => {
    const shown = canvas.getBoundingClientRect().width;
    const dpr = window.devicePixelRatio || 1;
    const next = shown > 0 ? Math.min(3, Math.max(1, (shown * dpr) / SCREEN_W)) : 1;
    if (Math.abs(next - scale) < 0.01) return;
    scale = next;
    canvas.width = Math.round(SCREEN_W * scale);
    canvas.height = Math.round(SCREEN_H * scale);
    lastKey = '';
    dark = false;
  };

  const frame = (): LineScreenFrame =>
    computeLineScreenFrame({
      index: train.index,
      phase: train.phase,
      direction: train.dir,
      clockMin: train.clockMin,
      clock: fmtClock(train.clockMin),
      countdown: Math.round(secondsToArrival(train.phase, train.phaseT, train.index, train.dir)),
      emergency: train.incident,
      notice: trafficNotice(train.clockMin),
    });

  const pageKey = (f: LineScreenFrame): string => {
    const layout = f.state === 'stationLayout' ? `${f.mode}/${f.lang}` : '-';
    return [f.index, train.phase, f.state, layout, f.status].join('|');
  };

  const paint = (s: ScreenSurface, f: LineScreenFrame, anim: number, fill: number): void => {
    const { index, clock, status, countdown, notice } = f;
    const dir = train.dir;
    const p = train.phase;
    if (f.state === 'stationLayout') {
      // On regarde la dalle du côté qui s'ouvre, comme dans la version sonore.
      if (f.mode === 'doors') drawExitDoors(s, index, clock, true, dir, anim, f.status);
      else drawExitTransfers(s, index, clock, f.lang, dir, anim, f.status);
      return;
    }
    switch (f.state) {
      case 'transfers': drawTransfers(s, index, clock, dir, status); break;
      case 'priority': drawPriorityNotice(s, index, clock, dir, status); break;
      case 'manner': drawPhoneManner(s, index, clock, dir, status); break;
      case 'trafficJP':
        if (notice) drawTrafficInfo(s, index, clock, status, 'jp', notice, dir);
        else drawLoopMap(s, index, p, countdown, clock, status, 'jp', dir, anim);
        break;
      case 'trafficEN':
        if (notice) drawTrafficInfo(s, index, clock, status, 'en', notice, dir);
        else drawLoopMap(s, index, p, countdown, clock, status, 'en', dir, anim);
        break;
      case 'securityJP': drawSecurityNotice(s, index, clock, 'jp', dir, status); break;
      case 'securityEN': drawSecurityNotice(s, index, clock, 'en', dir, status); break;
      case 'brake': drawEmergencyBrake(s); break;
      case 'emergency': drawEmergencyInfo(s); break;
      case 'outage': drawOutageInfo(s); break;
      case 'loopJP': drawLoopMap(s, index, p, countdown, clock, status, 'jp', dir, anim); break;
      case 'loopEN': drawLoopMap(s, index, p, countdown, clock, status, 'en', dir, anim); break;
      case 'zoomEN': drawRoute(s, index, p, countdown, clock, status, 'en', dir, anim, fill); break;
      default: drawRoute(s, index, p, countdown, clock, status, 'jp', dir, anim, fill);
    }
  };

  const tick = (): void => {
    if (document.hidden) return;
    avance(train, MOTION_STEP * VITESSE);
    resize();
    g.setTransform(scale, 0, 0, scale, 0, 0);

    if (train.power <= LCD_CUTOFF) {
      if (!dark) {
        dark = true;
        lastKey = '';
        g.fillStyle = '#05070a';
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
    const moving = (!calme && step.busy) || loops || wasMoving;
    wasMoving = (!calme && step.busy) || loops;

    const key = [
      page,
      shown.clock,
      shown.animated ? Math.floor(anim) : 0,
      COUNTDOWN_STATES.has(shown.state) ? shown.countdown : 0,
      scale,
    ].join('|');
    if (key === lastKey && !moving) return;
    lastKey = key;
    const surface = { g, w: SCREEN_W, h: SCREEN_H };
    paintBlended(surface, blend, (s) => paint(s, shown, anim, calme ? 1 : step.fill));
  };

  return {
    incident(kind) {
      if (train.phase !== 'cruise' || train.incident.stage !== 'none') return false;
      train.incident = {
        stage: kind === 'outage' ? 'coasting' : 'braking',
        kind,
        // Le motif ne se lit que dans l'annonce du conducteur, pas à l'écran.
        reason: 0,
        t: 0,
      };
      if (kind === 'outage') train.power = 0;
      return true;
    },
    libre() {
      return train.phase === 'cruise' && train.incident.stage === 'none';
    },
    demarre() {
      if (id) return;
      lastKey = '';
      id = window.setInterval(tick, MOTION_STEP * 1000);
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
    },
  };
}
