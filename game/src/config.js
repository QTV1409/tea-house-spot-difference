// Tea House at Dusk — Spot the Difference
// Tuning numbers, palette and level metadata in one place. The playfield is a fixed
// 1280x720 logical area; the renderer scales it to the window, so no rule below
// depends on the screen size.

export const FIELD = { width: 1280, height: 720 };

// Two picture panels, side by side, in logical coordinates.
export const PANEL = { width: 600, height: 460, y: 84, gap: 40, leftX: 20 };
export const PANEL_RIGHT_X = PANEL.leftX + PANEL.width + PANEL.gap;

// One round per level: find every difference before the clock runs out.
export const LEVEL_TIME = 120;
export const DIFFS_PER_LEVEL = 7;
export const HINTS_PER_LEVEL = 3;
export const POINTS_FIND = 100;
export const POINTS_COMBO_STEP = 25;
export const POINTS_COMBO_MAX = 100;
export const POINTS_HINT_COST = 50;
export const POINTS_TIME_BONUS = 5;
export const WRONG_TIME_PENALTY = 5;

// A click counts as a hit when it lands this close to a difference centre (panel px).
export const HIT_RADIUS = 30;

export const PALETTE = {
  backdrop: '#141126',
  header: '#1d1836',
  panelEdge: '#3a2f5e',
  panelLabel: '#f4ead2',
  text: '#f4ead2',
  muted: '#b8aed6',
  accent: '#ffb454',
  accentSoft: '#ffcf8a',
  good: '#7fe08a',
  bad: '#ff6b6b',
  hint: '#8fd3ff',
  button: '#2c2350',
  buttonEdge: '#ffb454',
  overlay: 'rgba(12, 8, 28, 0.72)',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'teahouse-spot-difference.best';

/** Level names and the one-line mood shown under each level card. */
export const LEVELS = [
  { id: 'teahouse', name: 'Tea House at Dusk', mood: 'Lanterns over a quiet river' },
  { id: 'nightmarket', name: 'Night Market', mood: 'Stalls, steam and paper lanterns' },
  { id: 'lighthouse', name: 'Lighthouse Cove', mood: 'A blinking light above the bay' },
  { id: 'shrine', name: 'Mountain Shrine', mood: 'Stone steps under the maple' },
];
