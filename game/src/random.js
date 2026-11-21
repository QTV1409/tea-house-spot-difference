// A tiny seeded random generator (mulberry32), so a scene and its screenshot
// staging are exactly repeatable from one number.

export function createRandom(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pick one of `items` with the seeded generator. */
export function pick(random, items) {
  return items[Math.floor(random() * items.length)];
}
