// Boot and the one loop: input is read every frame, the clock ticks while the
// player is on a level, and the renderer paints what is there. The game moves
// between five screens: title, play, paused, level complete and results.
//
// ?shot=start|play|end (with &level=N) stages that scene instead of running the
// loop, paints it twice and sets window.__shotReady for a screenshot.
import {
  DIFFS_PER_LEVEL,
  FIELD,
  HINTS_PER_LEVEL,
  HIT_RADIUS,
  LEVELS,
  LEVEL_TIME,
  PANEL,
  PANEL_RIGHT_X,
  POINTS_COMBO_MAX,
  POINTS_COMBO_STEP,
  POINTS_FIND,
  POINTS_HINT_COST,
  POINTS_TIME_BONUS,
  WRONG_TIME_PENALTY,
} from './config.js';
import { createAudio } from './audio.js';
import {
  ACTION_CONFIRM,
  ACTION_HINT,
  ACTION_MUTE,
  ACTION_NEXT,
  ACTION_PAUSE,
  ACTION_RESTART,
  createInput,
} from './input.js';
import {
  AGAIN_BUTTON_RECT,
  HINT_BUTTON_RECT,
  LEVEL_CARD_RECTS,
  MUTE_BUTTON_RECT,
  NEXT_BUTTON_RECT,
  SCREEN_LEVEL_COMPLETE,
  SCREEN_PAUSED,
  SCREEN_PLAY,
  SCREEN_RESULTS,
  SCREEN_TITLE,
  createRenderer,
  readBest,
  saveBest,
} from './render.js';
import { SCENES } from './scenes.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const renderer = createRenderer(canvas);
const audio = createAudio();

function freshState() {
  return {
    screen: SCREEN_TITLE,
    levelIndex: 0,
    found: [],
    timeLeft: LEVEL_TIME,
    score: 0,
    combo: 0,
    hintsLeft: HINTS_PER_LEVEL,
    clicks: 0,
    wrongs: 0,
    foundTotal: 0,
    hintPulse: null,
    wrongFlash: null,
    message: '',
    messageUntil: 0,
    levelScore: 0,
    levelBonus: 0,
    levelStartScore: 0,
    levelResults: [],
    best: readBest(),
    muted: false,
  };
}

const state = freshState();

function announce(message) {
  status.textContent = message;
}

function say(message) {
  state.message = message;
  state.messageUntil = performance.now() + 2600;
  announce(message);
}

function startLevel(index) {
  state.levelIndex = index;
  state.screen = SCREEN_PLAY;
  state.found = [];
  state.timeLeft = LEVEL_TIME;
  state.combo = 0;
  state.hintsLeft = HINTS_PER_LEVEL;
  state.hintPulse = null;
  state.wrongFlash = null;
  state.levelStartScore = state.score;
  state.levelScore = 0;
  state.levelBonus = 0;
  audio.unlock();
  audio.click();
  say(`Level ${index + 1}: ${LEVELS[index].name} — find ${DIFFS_PER_LEVEL} differences.`);
}

function panelAt(point) {
  if (point.y >= PANEL.y && point.y <= PANEL.y + PANEL.height) {
    if (point.x >= PANEL.leftX && point.x <= PANEL.leftX + PANEL.width) {
      return { panel: 'left', x: point.x - PANEL.leftX, y: point.y - PANEL.y };
    }
    if (point.x >= PANEL_RIGHT_X && point.x <= PANEL_RIGHT_X + PANEL.width) {
      return { panel: 'right', x: point.x - PANEL_RIGHT_X, y: point.y - PANEL.y };
    }
  }
  return null;
}

function inRect(point, rect) {
  return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
}

function useHint() {
  if (state.screen !== SCREEN_PLAY || state.hintsLeft <= 0) return;
  const scene = SCENES[state.levelIndex];
  const remaining = scene.diffs.filter((diff) => !state.found.includes(diff.id));
  if (remaining.length === 0) return;
  const pick = remaining[Math.floor(Math.random() * remaining.length)];
  state.hintsLeft -= 1;
  state.score = Math.max(0, state.score - POINTS_HINT_COST);
  state.hintPulse = { id: pick.id, until: performance.now() + 3000 };
  audio.hint();
  say(`Hint: look near the ${pick.label.toLowerCase().replace(/^the /, '')}… (−${POINTS_HINT_COST} points)`);
}

function completeLevel() {
  state.levelBonus = Math.ceil(state.timeLeft) * POINTS_TIME_BONUS;
  state.levelScore = state.score - state.levelStartScore + state.levelBonus;
  state.score += state.levelBonus;
  state.levelResults.push({ cleared: true, score: state.levelScore });
  state.screen = SCREEN_LEVEL_COMPLETE;
  audio.levelClear();
  say(`Level complete! Time bonus +${state.levelBonus}.`);
}

function finishRun() {
  state.screen = SCREEN_RESULTS;
  if (state.score > state.best) {
    state.best = state.score;
    saveBest(state.score);
  }
  audio.gameOver();
}

function timeOut() {
  state.levelScore = state.score - state.levelStartScore;
  state.levelResults.push({ cleared: false, score: state.levelScore });
  say('Time ran out on this level.');
  finishRun();
}

function nextStep() {
  if (state.levelIndex + 1 < LEVELS.length) startLevel(state.levelIndex + 1);
  else finishRun();
}

function onPanelClick(hit) {
  const scene = SCENES[state.levelIndex];
  state.clicks += 1;
  let nearest = null;
  let nearestDistance = Infinity;
  scene.diffs.forEach((diff) => {
    if (state.found.includes(diff.id)) return;
    const distance = Math.hypot(diff.x - hit.x, diff.y - hit.y);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = diff;
    }
  });
  if (nearest !== null && nearestDistance <= Math.max(HIT_RADIUS, nearest.r)) {
    state.found.push(nearest.id);
    state.foundTotal += 1;
    const comboBonus = Math.min(POINTS_COMBO_MAX, state.combo * POINTS_COMBO_STEP);
    state.score += POINTS_FIND + comboBonus;
    state.combo += 1;
    state.hintPulse = null;
    audio.find();
    say(`Found: ${nearest.label} (+${POINTS_FIND + comboBonus})`);
    if (state.found.length >= DIFFS_PER_LEVEL) completeLevel();
    return;
  }
  state.wrongs += 1;
  state.combo = 0;
  state.timeLeft = Math.max(0, state.timeLeft - WRONG_TIME_PENALTY);
  state.wrongFlash = { panel: hit.panel, x: hit.x, y: hit.y, until: performance.now() + 600 };
  audio.wrong();
  say(`Not a difference — ${WRONG_TIME_PENALTY} seconds lost.`);
}

function handleInput(input) {
  const actions = input.takeActions();
  const levelPick = input.takeLevelPick();
  if (actions & ACTION_MUTE) {
    state.muted = !audio.toggle();
    return;
  }
  const clicks = input.takeClicks();
  clicks.forEach((point) => {
    audio.unlock();
    if (inRect(point, MUTE_BUTTON_RECT)) {
      state.muted = !audio.toggle();
      return;
    }
    if (state.screen === SCREEN_TITLE) {
      for (let i = 0; i < LEVEL_CARD_RECTS.length; i += 1) {
        if (inRect(point, LEVEL_CARD_RECTS[i])) {
          startLevel(i);
          return;
        }
      }
      startLevel(state.levelIndex);
      return;
    }
    if (state.screen === SCREEN_PLAY) {
      if (inRect(point, HINT_BUTTON_RECT)) {
        useHint();
        return;
      }
      const hit = panelAt(point);
      if (hit) onPanelClick(hit);
      return;
    }
    if (state.screen === SCREEN_PAUSED) {
      state.screen = SCREEN_PLAY;
      say('Playing.');
      return;
    }
    if (state.screen === SCREEN_LEVEL_COMPLETE) {
      if (inRect(point, NEXT_BUTTON_RECT)) nextStep();
      return;
    }
    if (state.screen === SCREEN_RESULTS) {
      if (inRect(point, AGAIN_BUTTON_RECT)) {
        const best = state.best;
        Object.assign(state, freshState(), { best });
        say('Tea House at Dusk. Press Space or click to start.');
      }
    }
  });
  if (state.screen === SCREEN_TITLE) {
    if (levelPick >= 0) startLevel(levelPick);
    else if (actions & ACTION_CONFIRM) startLevel(state.levelIndex);
    return;
  }
  if (state.screen === SCREEN_PLAY) {
    if (actions & ACTION_PAUSE) {
      state.screen = SCREEN_PAUSED;
      say('Paused.');
    } else if (actions & ACTION_HINT) {
      useHint();
    }
    return;
  }
  if (state.screen === SCREEN_PAUSED) {
    if (actions & (ACTION_PAUSE | ACTION_CONFIRM)) {
      state.screen = SCREEN_PLAY;
      say('Playing.');
    }
    return;
  }
  if (state.screen === SCREEN_LEVEL_COMPLETE) {
    if (actions & (ACTION_NEXT | ACTION_CONFIRM)) nextStep();
    return;
  }
  if (state.screen === SCREEN_RESULTS) {
    if (actions & ACTION_RESTART) {
      const best = state.best;
      Object.assign(state, freshState(), { best });
      say('Tea House at Dusk. Press Space or click to start.');
    }
  }
}

function runGame() {
  const input = createInput(canvas, renderer.toLogical);
  let last = performance.now();
  say('Tea House at Dusk. Press Space or click to start.');

  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    handleInput(input);
    if (state.screen === SCREEN_PLAY) {
      state.timeLeft -= dt;
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        timeOut();
      }
    }
    renderer.draw(state, now);
  }

  // Leaving the tab pauses a running game rather than letting the clock run unseen.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.screen === SCREEN_PLAY) {
      state.screen = SCREEN_PAUSED;
      say('Paused.');
    }
  });

  requestAnimationFrame(frame);
}

if (shot) stageShot(shot, state, renderer, audio);
else runGame();
