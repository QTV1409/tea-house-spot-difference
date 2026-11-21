// The screenshot scenes behind ?shot=start|play|end. Each one sets the real game
// state — a title screen, a level in progress with some differences already
// found, or the final results — then paints it twice and flags it ready, so the
// frame is exactly what a player sees and the same query always gives the same
// frame.
import { LEVELS } from './config.js';
import { SCREEN_PLAY, SCREEN_RESULTS, SCREEN_TITLE } from './render.js';
import { SCENES } from './scenes.js';

export function stageShot(name, state, renderer, audio) {
  const query = new URLSearchParams(window.location.search);
  const levelParam = Number.parseInt(query.get('level') ?? '1', 10);
  const level = Number.isInteger(levelParam) ? Math.min(LEVELS.length - 1, Math.max(0, levelParam - 1)) : 0;
  void audio;

  if (name === 'start') {
    state.screen = SCREEN_TITLE;
    state.levelIndex = 0;
  } else if (name === 'play') {
    // Three differences found, four still to find, the counter showing it.
    state.screen = SCREEN_PLAY;
    state.levelIndex = level;
    state.found = SCENES[level].diffs.slice(0, 3).map((diff) => diff.id);
    state.foundTotal = 3;
    state.clicks = 4;
    state.timeLeft = 83;
    state.score = 375;
    state.combo = 3;
    state.hintsLeft = 2;
    const lastFound = SCENES[level].diffs[2];
    state.message = `Found: ${lastFound.label} (+150)`;
    state.messageUntil = performance.now() + 60000;
  } else if (name === 'end') {
    state.screen = SCREEN_RESULTS;
    state.levelIndex = LEVELS.length - 1;
    state.score = 2840;
    state.foundTotal = 28;
    state.clicks = 31;
    state.wrongs = 3;
    state.best = 2840;
    state.levelResults = [640, 700, 760, 740].map((score) => ({ cleared: true, score }));
  } else {
    state.screen = SCREEN_TITLE;
    state.levelIndex = 0;
  }

  let painted = 0;
  function paint() {
    renderer.draw(state, performance.now());
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}
