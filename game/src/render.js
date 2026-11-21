// Paints every screen on one canvas: title, play (two panels side by side),
// pause, level complete and results. The canvas shows a fixed 1280x720 logical
// area, scaled to the window with letterboxing.
import {
  BEST_KEY,
  DIFFS_PER_LEVEL,
  FIELD,
  FONT,
  HINTS_PER_LEVEL,
  LEVELS,
  PALETTE,
  PANEL,
  PANEL_RIGHT_X,
} from './config.js';
import { drawScene, SCENES } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_LEVEL_COMPLETE = 'levelComplete';
export const SCREEN_RESULTS = 'results';

/** Clickable regions, in logical coordinates, for the current screen. */
export const LEVEL_CARD_RECTS = LEVELS.map((_, i) => ({
  id: `level-${i}`,
  x: 90 + i * 290,
  y: 430,
  width: 260,
  height: 120,
}));
export const HINT_BUTTON_RECT = { id: 'hint', x: 1010, y: 640, width: 250, height: 44 };
export const NEXT_BUTTON_RECT = { id: 'next', x: 540, y: 520, width: 200, height: 52 };
export const AGAIN_BUTTON_RECT = { id: 'again', x: 540, y: 560, width: 200, height: 52 };
export const MUTE_BUTTON_RECT = { id: 'mute', x: 1198, y: 12, width: 64, height: 40 };

function formatTime(seconds) {
  const left = Math.max(0, Math.ceil(seconds));
  return `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`;
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;

  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    scale = Math.min(width / FIELD.width, height / FIELD.height);
    offsetX = (width - FIELD.width * scale) / 2;
    offsetY = (height - FIELD.height * scale) / 2;
  }

  window.addEventListener('resize', resize);
  resize();

  function toLogical(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left - offsetX) / scale,
      y: (clientY - rect.top - offsetY) / scale,
    };
  }

  function panelPoint(panel, diff) {
    const x0 = panel === 'left' ? PANEL.leftX : PANEL_RIGHT_X;
    return { x: x0 + diff.x, y: PANEL.y + diff.y };
  }

  function ring(x, y, radius, colour, width, dashed) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.setLineDash(dashed ? [8, 6] : []);
    ctx.lineWidth = width;
    ctx.strokeStyle = colour;
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function checkMark(x, y, size, colour) {
    ctx.beginPath();
    ctx.moveTo(x - size, y);
    ctx.lineTo(x - size * 0.25, y + size * 0.8);
    ctx.lineTo(x + size, y - size * 0.9);
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.strokeStyle = colour;
    ctx.stroke();
  }

  function drawPanels(state, now) {
    const scene = SCENES[state.levelIndex];
    // Left picture: the original. Right picture: the altered one.
    ctx.save();
    ctx.translate(PANEL.leftX, PANEL.y);
    drawScene(ctx, state.levelIndex, false);
    ctx.restore();
    ctx.save();
    ctx.translate(PANEL_RIGHT_X, PANEL.y);
    drawScene(ctx, state.levelIndex, true);
    ctx.restore();
    // Panel frames and labels.
    ctx.lineWidth = 3;
    ctx.strokeStyle = PALETTE.panelEdge;
    ctx.strokeRect(PANEL.leftX - 2, PANEL.y - 2, PANEL.width + 4, PANEL.height + 4);
    ctx.strokeRect(PANEL_RIGHT_X - 2, PANEL.y - 2, PANEL.width + 4, PANEL.height + 4);
    ctx.font = `bold 20px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillStyle = PALETTE.panelLabel;
    ctx.fillText('A', PANEL.leftX + 12, PANEL.y + 10);
    ctx.fillText('B', PANEL_RIGHT_X + 12, PANEL.y + 10);
    // Rings on every difference already found, on both pictures.
    state.found.forEach((id) => {
      const diff = scene.diffs.find((entry) => entry.id === id);
      if (!diff) return;
      ['left', 'right'].forEach((panel) => {
        const point = panelPoint(panel, diff);
        ctx.beginPath();
        ctx.arc(point.x, point.y, diff.r + 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(127, 224, 138, 0.18)';
        ctx.fill();
        ring(point.x, point.y, diff.r + 4, PALETTE.good, 4, false);
        checkMark(point.x, point.y, 10, PALETTE.good);
      });
    });
    // A hint pulses around one difference not found yet.
    if (state.hintPulse) {
      const diff = scene.diffs.find((entry) => entry.id === state.hintPulse.id);
      if (diff && now < state.hintPulse.until) {
        const pulse = diff.r + 6 + Math.sin(now / 160) * 4;
        ['left', 'right'].forEach((panel) => {
          const point = panelPoint(panel, diff);
          ring(point.x, point.y, pulse, PALETTE.hint, 4, true);
        });
      }
    }
    // A wrong click flashes a red cross where the player clicked.
    if (state.wrongFlash && now < state.wrongFlash.until) {
      const point = panelPoint(state.wrongFlash.panel, { x: state.wrongFlash.x, y: state.wrongFlash.y });
      ctx.beginPath();
      ctx.moveTo(point.x - 12, point.y - 12);
      ctx.lineTo(point.x + 12, point.y + 12);
      ctx.moveTo(point.x + 12, point.y - 12);
      ctx.lineTo(point.x - 12, point.y + 12);
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.strokeStyle = PALETTE.bad;
      ctx.stroke();
    }
  }

  function drawHeader(state) {
    ctx.fillStyle = PALETTE.header;
    ctx.fillRect(0, 0, FIELD.width, 64);
    ctx.font = `bold 24px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = PALETTE.accent;
    ctx.fillText('Tea House at Dusk', 20, 33);
    ctx.font = `18px ${FONT}`;
    ctx.fillStyle = PALETTE.muted;
    const level = LEVELS[state.levelIndex];
    ctx.fillText(`Level ${state.levelIndex + 1} of ${LEVELS.length} · ${level.name}`, 330, 33);
    if (state.screen === SCREEN_PLAY || state.screen === SCREEN_PAUSED) {
      ctx.textAlign = 'right';
      const lowTime = state.timeLeft <= 20;
      ctx.fillStyle = lowTime ? PALETTE.bad : PALETTE.text;
      ctx.font = `bold 26px ${FONT}`;
      ctx.fillText(formatTime(state.timeLeft), 760, 33);
      ctx.fillStyle = PALETTE.text;
      ctx.font = `bold 22px ${FONT}`;
      ctx.fillText(`Found ${state.found.length} / ${DIFFS_PER_LEVEL}`, 950, 33);
      ctx.fillText(`Score ${state.score}`, 1180, 33);
    }
    // Sound toggle, top right.
    ctx.fillStyle = PALETTE.button;
    ctx.fillRect(MUTE_BUTTON_RECT.x, MUTE_BUTTON_RECT.y, MUTE_BUTTON_RECT.width, MUTE_BUTTON_RECT.height);
    ctx.strokeStyle = PALETTE.buttonEdge;
    ctx.lineWidth = 2;
    ctx.strokeRect(MUTE_BUTTON_RECT.x, MUTE_BUTTON_RECT.y, MUTE_BUTTON_RECT.width, MUTE_BUTTON_RECT.height);
    ctx.font = `18px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = PALETTE.text;
    ctx.fillText(state.muted ? 'Muted' : 'Sound', 1230, 33);
  }

  function drawFooter(state) {
    ctx.font = `17px ${FONT}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = PALETTE.muted;
    if (state.screen === SCREEN_PLAY) {
      ctx.fillText('Click a difference on either picture · H: hint · P: pause', 20, 662);
      ctx.textAlign = 'center';
      ctx.fillStyle = state.hintsLeft > 0 ? PALETTE.text : PALETTE.muted;
      ctx.fillText(`Hint (${state.hintsLeft} left)`, 1135, 662);
      ctx.strokeStyle = PALETTE.buttonEdge;
      ctx.lineWidth = 2;
      ctx.strokeRect(HINT_BUTTON_RECT.x, HINT_BUTTON_RECT.y, HINT_BUTTON_RECT.width, HINT_BUTTON_RECT.height);
    } else {
      ctx.fillText('Find all 7 differences before the clock runs out. A wrong click costs 5 seconds.', 20, 662);
    }
    if (state.message && state.messageUntil > performance.now()) {
      ctx.font = `bold 20px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.fillStyle = PALETTE.accentSoft;
      ctx.fillText(state.message, FIELD.width / 2, 600);
    }
  }

  function drawTitle(state) {
    // The first scene, dimmed, as a backdrop.
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.translate(0, 64);
    ctx.scale(FIELD.width / 600, (FIELD.height - 64) / 460);
    drawScene(ctx, 0, false);
    ctx.restore();
    ctx.fillStyle = 'rgba(20, 17, 38, 0.45)';
    ctx.fillRect(0, 64, FIELD.width, FIELD.height - 64);
    ctx.textAlign = 'center';
    ctx.fillStyle = PALETTE.text;
    ctx.font = `bold 62px ${FONT}`;
    ctx.fillText('Tea House at Dusk', FIELD.width / 2, 150);
    ctx.font = `24px ${FONT}`;
    ctx.fillStyle = PALETTE.accentSoft;
    ctx.fillText('A spot-the-difference game in four quiet places', FIELD.width / 2, 198);
    ctx.font = `19px ${FONT}`;
    ctx.fillStyle = PALETTE.text;
    ctx.fillText('Two pictures look the same — but seven details changed. Find them all before time runs out.', FIELD.width / 2, 245);
    ctx.fillText('Click a difference on either picture. Wrong clicks cost 5 seconds. Hints cost 50 points.', FIELD.width / 2, 275);
    ctx.font = `bold 22px ${FONT}`;
    ctx.fillStyle = PALETTE.accent;
    ctx.fillText('Choose a place to begin — or press Space for Level 1', FIELD.width / 2, 400);
    LEVELS.forEach((level, i) => {
      const card = LEVEL_CARD_RECTS[i];
      const selected = state.levelIndex === i;
      ctx.fillStyle = selected ? '#3a2f5e' : PALETTE.button;
      ctx.fillRect(card.x, card.y, card.width, card.height);
      ctx.lineWidth = selected ? 4 : 2;
      ctx.strokeStyle = selected ? PALETTE.accent : PALETTE.panelEdge;
      ctx.strokeRect(card.x, card.y, card.width, card.height);
      ctx.fillStyle = PALETTE.text;
      ctx.font = `bold 21px ${FONT}`;
      ctx.fillText(`${i + 1}. ${level.name}`, card.x + card.width / 2, card.y + 42);
      ctx.font = `16px ${FONT}`;
      ctx.fillStyle = PALETTE.muted;
      ctx.fillText(level.mood, card.x + card.width / 2, card.y + 78);
    });
    if (state.best > 0) {
      ctx.font = `19px ${FONT}`;
      ctx.fillStyle = PALETTE.muted;
      ctx.fillText(`Best total score: ${state.best}`, FIELD.width / 2, 600);
    }
  }

  function overlayPanel(x, y, width, height) {
    ctx.fillStyle = PALETTE.overlay;
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    ctx.fillStyle = '#241d42';
    ctx.fillRect(x, y, width, height);
    ctx.lineWidth = 3;
    ctx.strokeStyle = PALETTE.buttonEdge;
    ctx.strokeRect(x, y, width, height);
  }

  function drawLevelComplete(state) {
    overlayPanel(340, 150, 600, 440);
    ctx.textAlign = 'center';
    ctx.fillStyle = PALETTE.good;
    ctx.font = `bold 40px ${FONT}`;
    ctx.fillText('Level complete!', FIELD.width / 2, 220);
    const level = LEVELS[state.levelIndex];
    ctx.fillStyle = PALETTE.text;
    ctx.font = `22px ${FONT}`;
    ctx.fillText(`${level.name} — all 7 differences found`, FIELD.width / 2, 270);
    ctx.fillText(`Time bonus: +${state.levelBonus}  ·  Level score: ${state.levelScore}`, FIELD.width / 2, 315);
    ctx.fillText(`Total score: ${state.score}`, FIELD.width / 2, 360);
    ctx.fillStyle = PALETTE.button;
    ctx.fillRect(NEXT_BUTTON_RECT.x, NEXT_BUTTON_RECT.y, NEXT_BUTTON_RECT.width, NEXT_BUTTON_RECT.height);
    ctx.strokeStyle = PALETTE.buttonEdge;
    ctx.lineWidth = 2;
    ctx.strokeRect(NEXT_BUTTON_RECT.x, NEXT_BUTTON_RECT.y, NEXT_BUTTON_RECT.width, NEXT_BUTTON_RECT.height);
    ctx.fillStyle = PALETTE.text;
    ctx.font = `bold 22px ${FONT}`;
    ctx.fillText(state.levelIndex + 1 < LEVELS.length ? 'Next level (N)' : 'See results (N)', FIELD.width / 2, 547);
  }

  function drawResults(state) {
    ctx.fillStyle = PALETTE.backdrop;
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    ctx.textAlign = 'center';
    ctx.fillStyle = PALETTE.accent;
    ctx.font = `bold 44px ${FONT}`;
    ctx.fillText('All four places explored', FIELD.width / 2, 120);
    ctx.fillStyle = PALETTE.text;
    ctx.font = `26px ${FONT}`;
    ctx.fillText(`Total score: ${state.score}   ·   Best: ${Math.max(state.best, state.score)}`, FIELD.width / 2, 175);
    const accuracy = state.clicks === 0 ? 100 : Math.round((state.foundTotal / state.clicks) * 100);
    ctx.font = `21px ${FONT}`;
    ctx.fillText(`Accuracy: ${accuracy}%  (${state.foundTotal} found, ${state.wrongs} wrong clicks)`, FIELD.width / 2, 215);
    state.levelResults.forEach((result, i) => {
      const y = 270 + i * 52;
      ctx.textAlign = 'left';
      ctx.fillStyle = PALETTE.text;
      ctx.font = `20px ${FONT}`;
      ctx.fillText(`${i + 1}. ${LEVELS[i].name}`, 380, y);
      ctx.textAlign = 'right';
      ctx.fillStyle = result.cleared ? PALETTE.good : PALETTE.bad;
      ctx.fillText(result.cleared ? `Cleared · ${result.score} pts` : 'Time ran out', 900, y);
    });
    ctx.fillStyle = PALETTE.button;
    ctx.fillRect(AGAIN_BUTTON_RECT.x, AGAIN_BUTTON_RECT.y, AGAIN_BUTTON_RECT.width, AGAIN_BUTTON_RECT.height);
    ctx.strokeStyle = PALETTE.buttonEdge;
    ctx.lineWidth = 2;
    ctx.strokeRect(AGAIN_BUTTON_RECT.x, AGAIN_BUTTON_RECT.y, AGAIN_BUTTON_RECT.width, AGAIN_BUTTON_RECT.height);
    ctx.fillStyle = PALETTE.text;
    ctx.font = `bold 22px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText('Play again (R)', FIELD.width / 2, 587);
  }

  function draw(state, now) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = PALETTE.backdrop;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    ctx.setTransform(scale * dpr, 0, 0, scale * dpr, offsetX * dpr, offsetY * dpr);
    if (state.screen === SCREEN_TITLE) {
      drawHeader(state);
      drawTitle(state);
      drawFooter(state);
      return;
    }
    if (state.screen === SCREEN_RESULTS) {
      drawHeader(state);
      drawResults(state);
      drawFooter(state);
      return;
    }
    drawHeader(state);
    drawPanels(state, now);
    drawFooter(state);
    if (state.screen === SCREEN_PAUSED) {
      overlayPanel(440, 260, 400, 160);
      ctx.textAlign = 'center';
      ctx.fillStyle = PALETTE.text;
      ctx.font = `bold 34px ${FONT}`;
      ctx.fillText('Paused', FIELD.width / 2, 320);
      ctx.font = `19px ${FONT}`;
      ctx.fillStyle = PALETTE.muted;
      ctx.fillText('Press P or click to resume', FIELD.width / 2, 365);
    }
    if (state.screen === SCREEN_LEVEL_COMPLETE) drawLevelComplete(state);
  }

  return { draw, toLogical, resize };
}

export function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

export function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off: the best score then lasts this visit only.
  }
}
