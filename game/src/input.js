// Mouse and keyboard input, translated into logical 1280x720 coordinates and
// simple actions the main loop consumes. No pointer state is kept here: a click
// is one event, a key press is one action.

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_HINT = 4;
export const ACTION_NEXT = 8;
export const ACTION_RESTART = 16;
export const ACTION_MUTE = 32;

export function createInput(canvas, toLogical) {
  const clicks = [];
  let actions = 0;
  let levelPick = -1;

  function pushClick(event) {
    const point = toLogical(event.clientX, event.clientY);
    clicks.push(point);
  }

  canvas.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    pushClick(event);
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === ' ' || key === 'enter') {
      actions |= ACTION_CONFIRM;
      event.preventDefault();
    } else if (key === 'p' || key === 'escape') {
      actions |= ACTION_PAUSE;
    } else if (key === 'h') {
      actions |= ACTION_HINT;
    } else if (key === 'n') {
      actions |= ACTION_NEXT;
    } else if (key === 'r') {
      actions |= ACTION_RESTART;
    } else if (key === 'm') {
      actions |= ACTION_MUTE;
    } else if (key >= '1' && key <= '4') {
      levelPick = Number(key) - 1;
    }
  });

  return {
    /** Drain the clicks since the last frame, in logical coordinates. */
    takeClicks() {
      return clicks.splice(0, clicks.length);
    },
    /** Drain the key actions since the last frame. */
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    /** Drain a level number key (1-4), or -1 when none was pressed. */
    takeLevelPick() {
      const taken = levelPick;
      levelPick = -1;
      return taken;
    },
  };
}
