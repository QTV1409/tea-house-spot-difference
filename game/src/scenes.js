// Four hand-drawn scenes, painted fresh on canvas every frame. Each scene is drawn
// in a 600x460 panel space; `altered` paints the seven differences that make the
// right-hand picture differ from the left. Nothing here is copied art: every
// lantern, roof and wave is a few canvas shapes.
import { createRandom } from './random.js';

function circle(ctx, x, y, radius, fill) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, fill) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function rect(ctx, x, y, width, height, fill) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, width, height);
}

function poly(ctx, points, fill) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

function line(ctx, x1, y1, x2, y2, width, stroke) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineWidth = width;
  ctx.strokeStyle = stroke;
  ctx.stroke();
}

function sparkle(ctx, x, y, radius, fill) {
  ctx.beginPath();
  ctx.moveTo(x, y - radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.quadraticCurveTo(x, y, x, y + radius);
  ctx.quadraticCurveTo(x, y, x - radius, y);
  ctx.quadraticCurveTo(x, y, x, y - radius);
  ctx.fillStyle = fill;
  ctx.fill();
}

function text(ctx, value, x, y, size, fill, font = 'Georgia, serif') {
  ctx.font = `${size}px ${font}`;
  ctx.fillStyle = fill;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

/** A paper lantern: glowing body, dark caps, a tassel underneath. */
function paperLantern(ctx, x, y, scale, colour, lit) {
  if (lit) {
    const glow = ctx.createRadialGradient(x, y, 4, x, y, 46 * scale);
    glow.addColorStop(0, 'rgba(255, 190, 90, 0.5)');
    glow.addColorStop(1, 'rgba(255, 190, 90, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x - 50 * scale, y - 50 * scale, 100 * scale, 100 * scale);
  }
  ellipse(ctx, x, y, 20 * scale, 24 * scale, colour);
  ellipse(ctx, x, y, 20 * scale, 24 * scale, 'rgba(255,255,255,0.12)');
  line(ctx, x - 20 * scale, y, x + 20 * scale, y, 2, 'rgba(0,0,0,0.25)');
  rect(ctx, x - 8 * scale, y - 28 * scale, 16 * scale, 6 * scale, '#2b2033');
  rect(ctx, x - 8 * scale, y + 22 * scale, 16 * scale, 6 * scale, '#2b2033');
  line(ctx, x, y + 28 * scale, x, y + 40 * scale, 2, '#d8a03c');
  circle(ctx, x, y + 43 * scale, 3 * scale, '#d8a03c');
}

/** A scatter of stars, identical every paint thanks to the fixed seed. */
function stars(ctx, seed, count, maxY) {
  const random = createRandom(seed);
  for (let i = 0; i < count; i += 1) {
    const x = 20 + random() * 560;
    const y = 12 + random() * maxY;
    const r = 1 + random() * 1.8;
    circle(ctx, x, y, r, `rgba(255, 244, 214, ${0.35 + random() * 0.55})`);
  }
}

function skyGradient(ctx, stops) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  stops.forEach(([at, colour]) => gradient.addColorStop(at, colour));
  rect(ctx, 0, 0, 600, 300, gradient);
}

// ---------------------------------------------------------------- level 1 ----
function drawTeahouse(ctx, altered) {
  skyGradient(ctx, [[0, '#241d4e'], [0.55, '#5b3a6e'], [1, '#e8825a']]);
  stars(ctx, 11, 42, 170);
  if (!altered) {
    circle(ctx, 480, 70, 32, '#ffeec2');
    circle(ctx, 470, 62, 6, '#e8d5a0');
    circle(ctx, 492, 80, 4, '#e8d5a0');
    circle(ctx, 486, 58, 3, '#e8d5a0');
  }
  // Far mountains and the river.
  poly(ctx, [[0, 300], [120, 215], [240, 285], [360, 225], [480, 290], [600, 235], [600, 300]], '#3a2c5c');
  poly(ctx, [[0, 300], [90, 250], [210, 295], [330, 245], [470, 298], [600, 260], [600, 300]], '#2c2148');
  const river = ctx.createLinearGradient(0, 300, 0, 460);
  river.addColorStop(0, '#e8825a');
  river.addColorStop(0.25, '#7a5a7e');
  river.addColorStop(1, '#2e4a6b');
  rect(ctx, 0, 300, 600, 160, river);
  for (let i = 0; i < 5; i += 1) {
    line(ctx, 40 + i * 110, 330 + (i % 2) * 40, 110 + i * 110, 330 + (i % 2) * 40, 2, 'rgba(255, 220, 170, 0.35)');
  }
  ellipse(ctx, 80, 420, 26, 9, '#22384f');
  ellipse(ctx, 420, 430, 30, 10, '#22384f');

  // Cherry tree on the right bank.
  line(ctx, 478, 350, 492, 235, 10, '#4a2f2a');
  line(ctx, 492, 235, 462, 190, 6, '#4a2f2a');
  line(ctx, 492, 235, 528, 195, 6, '#4a2f2a');
  const blossom = altered ? '#f2ead8' : '#f49ac1';
  circle(ctx, 458, 172, 26, blossom);
  circle(ctx, 510, 150, 30, blossom);
  circle(ctx, 542, 192, 24, blossom);
  circle(ctx, 490, 208, 22, blossom);
  circle(ctx, 470, 150, 12, altered ? '#e2d5bd' : '#f7b8d2');
  circle(ctx, 525, 175, 11, altered ? '#e2d5bd' : '#f7b8d2');

  // The tea house: walls, curved roof, lit windows, door, hanging sign.
  rect(ctx, 100, 175, 230, 178, '#5a3d2b');
  rect(ctx, 100, 175, 230, 10, '#4a2f22');
  poly(ctx, [[82, 178], [348, 178], [330, 138], [100, 138]], '#2f4a6e');
  poly(ctx, [[82, 178], [348, 178], [338, 168], [92, 168]], '#3d5f8a');
  rect(ctx, 100, 168, 230, 8, '#24344f');
  const windowLit = '#ffd98a';
  const windowDark = '#241d33';
  rect(ctx, 130, 212, 44, 50, windowLit);
  rect(ctx, 200, 212, 44, 50, altered ? windowDark : windowLit);
  rect(ctx, 270, 212, 44, 50, windowLit);
  line(ctx, 152, 212, 152, 262, 3, '#4a2f22');
  line(ctx, 222, 212, 222, 262, 3, '#4a2f22');
  line(ctx, 292, 212, 292, 262, 3, '#4a2f22');
  line(ctx, 130, 237, 174, 237, 3, '#4a2f22');
  line(ctx, 200, 237, 244, 237, 3, '#4a2f22');
  line(ctx, 270, 237, 314, 237, 3, '#4a2f22');
  rect(ctx, 160, 282, 52, 71, '#33241a');
  circle(ctx, 206, 320, 3, '#d8a03c');
  // Hanging sign by the door.
  line(ctx, 300, 178, 300, 200, 3, '#2b2033');
  rect(ctx, 278, 200, 46, 62, '#f4ead2');
  rect(ctx, 278, 200, 46, 62, 'rgba(0,0,0,0)');
  ctx.strokeStyle = '#8a6d3b';
  ctx.lineWidth = 3;
  ctx.strokeRect(281, 203, 40, 56);
  text(ctx, altered ? '酒' : '茶', 301, 232, 34, '#5a3d2b');
  // Veranda and steps.
  rect(ctx, 92, 353, 246, 12, '#7a5238');
  rect(ctx, 120, 365, 190, 8, '#6b4630');
  rect(ctx, 140, 373, 150, 8, '#5a3d2b');
  // Two red lanterns under the eaves, one pole lantern by the tree.
  line(ctx, 115, 178, 115, 188, 2, '#2b2033');
  paperLantern(ctx, 115, 210, 0.85, '#e5534b', true);
  line(ctx, 315, 178, 315, 188, 2, '#2b2033');
  paperLantern(ctx, 315, 210, 0.85, altered ? '#3fa7c4' : '#e5534b', true);
  line(ctx, 520, 350, 520, 292, 4, '#2b2033');
  paperLantern(ctx, 520, 272, 0.9, '#e5534b', true);
  // The house cat, asleep on the veranda — unless it wandered off.
  if (!altered) {
    ellipse(ctx, 352, 348, 20, 10, '#2b2033');
    circle(ctx, 368, 340, 9, '#2b2033');
    poly(ctx, [[362, 334], [365, 326], [369, 333]], '#2b2033');
    poly(ctx, [[371, 333], [375, 326], [377, 334]], '#2b2033');
    ctx.beginPath();
    ctx.arc(334, 348, 12, Math.PI * 0.6, Math.PI * 1.5);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#2b2033';
    ctx.stroke();
  }
  // A teapot on a low table, steam curling up — unless the tea went cold.
  rect(ctx, 228, 396, 52, 8, '#7a5238');
  line(ctx, 232, 404, 232, 420, 4, '#5a3d2b');
  line(ctx, 272, 404, 272, 420, 4, '#5a3d2b');
  ellipse(ctx, 254, 388, 16, 11, '#3d5f8a');
  poly(ctx, [[250, 378], [258, 378], [256, 370]], '#2c4560');
  ctx.beginPath();
  ctx.arc(270, 388, 8, -Math.PI / 2, Math.PI / 2);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#2c4560';
  ctx.stroke();
  if (!altered) {
    ctx.beginPath();
    ctx.moveTo(248, 372);
    ctx.quadraticCurveTo(242, 358, 250, 348);
    ctx.quadraticCurveTo(256, 340, 250, 330);
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(244, 234, 210, 0.75)';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(260, 372);
    ctx.quadraticCurveTo(266, 360, 260, 350);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(244, 234, 210, 0.55)';
    ctx.stroke();
  }
  // Fireflies over the river.
  const fireflies = createRandom(77);
  for (let i = 0; i < 6; i += 1) {
    const x = 30 + fireflies() * 540;
    const y = 310 + fireflies() * 120;
    sparkle(ctx, x, y, 4 + fireflies() * 3, 'rgba(255, 230, 130, 0.85)');
  }
}

// ---------------------------------------------------------------- level 2 ----
function drawNightMarket(ctx, altered) {
  skyGradient(ctx, [[0, '#1c1440'], [0.6, '#3a2060'], [1, '#7a3a5e']]);
  stars(ctx, 22, 30, 120);
  if (true) {
    circle(ctx, 520, 60, 18, '#ffeec2');
    circle(ctx, 514, 54, 3, '#e8d5a0');
  }
  // Strings of festival lights sagging across the top.
  for (let row = 0; row < 2; row += 1) {
    const yBase = 34 + row * 34;
    ctx.beginPath();
    ctx.moveTo(0, yBase);
    ctx.quadraticCurveTo(300, yBase + 26, 600, yBase);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#241d33';
    ctx.stroke();
    for (let i = 0; i < 15; i += 1) {
      const x = 20 + i * 40;
      const t = x / 600;
      const y = yBase + 26 * 2 * t * (1 - t) + 10;
      const bulbOut = altered && row === 0 && i === 5;
      circle(ctx, x, y, 5, bulbOut ? '#3a2f4e' : ['#ffb454', '#ff7a6b', '#7fe08a', '#8fd3ff'][i % 4]);
      if (!bulbOut) sparkle(ctx, x, y, 8, 'rgba(255, 200, 110, 0.35)');
    }
  }
  // One big paper lantern hanging over the middle stall.
  line(ctx, 300, 66, 300, 92, 3, '#2b2033');
  paperLantern(ctx, 300, 116, 1.05, '#ff9a3d', true);

  // Three stalls: food, toys, flowers.
  const stalls = [
    { x: 30, awning: '#e5534b', stripe: '#f4ead2', goods: 'bowls' },
    { x: 220, awning: altered ? '#e8823d' : '#3f9e58', stripe: '#f4ead2', goods: 'toys' },
    { x: 410, awning: '#7a4a9e', stripe: '#f4ead2', goods: 'flowers' },
  ];
  stalls.forEach((stall) => {
    rect(ctx, stall.x + 8, 215, 8, 165, '#4a2f22');
    rect(ctx, stall.x + 164, 215, 8, 165, '#4a2f22');
    poly(ctx, [[stall.x, 215], [stall.x + 180, 215], [stall.x + 168, 182], [stall.x + 12, 182]], stall.awning);
    for (let s = 0; s < 5; s += 1) {
      poly(
        ctx,
        [
          [stall.x + 12 + s * 36, 182],
          [stall.x + 30 + s * 36, 182],
          [stall.x + 27 + s * 36, 215],
          [stall.x + 15 + s * 36, 215],
        ],
        s % 2 === 0 ? stall.stripe : stall.awning,
      );
    }
    rect(ctx, stall.x, 318, 180, 14, '#7a5238');
    rect(ctx, stall.x + 6, 332, 168, 48, '#5a3d2b');
  });
  // Food stall: three steaming bowls — or two, when one is already sold.
  const bowlXs = altered ? [60, 100] : [60, 100, 140];
  bowlXs.forEach((x) => {
    ellipse(ctx, x, 310, 16, 7, '#f4ead2');
    ellipse(ctx, x, 307, 12, 4, '#c96a3d');
    ctx.beginPath();
    ctx.moveTo(x - 4, 300);
    ctx.quadraticCurveTo(x - 8, 292, x - 3, 286);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(244, 234, 210, 0.6)';
    ctx.stroke();
  });
  // Toy stall: a pinwheel and stacking balls.
  line(ctx, 300, 318, 300, 268, 3, '#8a6d3b');
  for (let a = 0; a < 4; a += 1) {
    const angle = (a * Math.PI) / 2 + 0.5;
    poly(
      ctx,
      [
        [300, 268],
        [300 + Math.cos(angle) * 20, 268 + Math.sin(angle) * 20],
        [300 + Math.cos(angle + 0.7) * 20, 268 + Math.sin(angle + 0.7) * 20],
      ],
      ['#ff7a6b', '#ffd94c', '#7fe08a', '#8fd3ff'][a],
    );
  }
  circle(ctx, 268, 306, 10, '#ff7a6b');
  circle(ctx, 288, 310, 8, '#ffd94c');
  circle(ctx, 336, 308, 9, '#8fd3ff');
  // Flower stall: three bunches, the middle one pink — or yellow, on a different day.
  const flowerColours = ['#e5534b', altered ? '#ffd94c' : '#f49ac1', '#b678e8'];
  [440, 490, 540].forEach((x, i) => {
    line(ctx, x, 318, x, 292, 3, '#3f7a3d');
    circle(ctx, x - 8, 286, 9, flowerColours[i]);
    circle(ctx, x + 8, 286, 9, flowerColours[i]);
    circle(ctx, x, 276, 10, flowerColours[i]);
    circle(ctx, x, 286, 4, '#ffd94c');
  });
  // The toy vendor behind the middle stall, in a conical hat — unless it blew off.
  rect(ctx, 288, 262, 36, 56, '#3d5f8a');
  circle(ctx, 306, 248, 13, '#e8b98a');
  if (!altered) poly(ctx, [[284, 242], [328, 242], [306, 214]], '#d8b25e');
  circle(ctx, 300, 248, 2, '#241d33');
  circle(ctx, 312, 248, 2, '#241d33');
  ctx.beginPath();
  ctx.arc(306, 256, 5, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#241d33';
  ctx.stroke();
  // A child in the foreground, holding a red balloon — or holding only string.
  circle(ctx, 95, 402, 12, '#e8b98a');
  poly(ctx, [[83, 414], [107, 414], [112, 452], [78, 452]], '#e5534b');
  line(ctx, 88, 452, 84, 460, 4, '#241d33');
  line(ctx, 102, 452, 106, 460, 4, '#241d33');
  line(ctx, 100, 392, 100, 352, 2, '#f4ead2');
  if (!altered) {
    circle(ctx, 100, 330, 20, '#e5534b');
    poly(ctx, [[100, 350], [94, 358], [106, 358]], '#e5534b');
  }
  // Cobbles, a puddle, and the moon's reflection in it — or not.
  rect(ctx, 0, 380, 600, 80, '#4a3448');
  const cobbles = createRandom(33);
  for (let i = 0; i < 26; i += 1) {
    ellipse(ctx, 20 + cobbles() * 560, 392 + cobbles() * 56, 12 + cobbles() * 10, 5, 'rgba(0,0,0,0.18)');
  }
  ellipse(ctx, 450, 420, 62, 14, '#2e4a6b');
  if (!altered) ellipse(ctx, 450, 418, 16, 5, 'rgba(255, 238, 194, 0.8)');
  ellipse(ctx, 150, 432, 40, 9, '#2e4a6b');
}

// ---------------------------------------------------------------- level 3 ----
function drawLighthouse(ctx, altered) {
  skyGradient(ctx, [[0, '#1a2340'], [0.55, '#3a4a72'], [1, '#c97a5e']]);
  stars(ctx, 44, 36, 150);
  ellipse(ctx, 150, 80, 46, 12, 'rgba(244, 234, 210, 0.16)');
  ellipse(ctx, 420, 60, 60, 14, 'rgba(244, 234, 210, 0.14)');
  ellipse(ctx, 480, 110, 40, 10, 'rgba(244, 234, 210, 0.12)');
  // Three gulls — or two, when one has flown on.
  const gulls = altered ? [[250, 90], [350, 100]] : [[250, 90], [300, 70], [350, 100]];
  gulls.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.moveTo(x - 10, y);
    ctx.quadraticCurveTo(x - 4, y - 8, x, y);
    ctx.quadraticCurveTo(x + 4, y - 8, x + 10, y);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#241d33';
    ctx.stroke();
  });
  // The sea.
  const sea = ctx.createLinearGradient(0, 260, 0, 460);
  sea.addColorStop(0, '#c97a5e');
  sea.addColorStop(0.3, '#4a6a8a');
  sea.addColorStop(1, '#22384f');
  rect(ctx, 0, 260, 600, 200, sea);
  for (let i = 0; i < 6; i += 1) {
    ctx.beginPath();
    ctx.arc(40 + i * 100, 300 + (i % 2) * 44, 26, Math.PI, 0);
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 240, 210, 0.35)';
    ctx.stroke();
  }
  // The cliff and the lighthouse on it.
  poly(ctx, [[0, 460], [0, 300], [60, 270], [150, 300], [180, 460]], '#3a2f4e');
  poly(ctx, [[0, 460], [0, 380], [90, 350], [180, 390], [180, 460]], '#2c2140');
  // Tower: white with red bands; the middle band is white on the altered day.
  rect(ctx, 62, 96, 58, 210, '#f4ead2');
  rect(ctx, 62, 130, 58, 26, '#e5534b');
  rect(ctx, 62, 190, 58, 26, altered ? '#f4ead2' : '#e5534b');
  rect(ctx, 62, 250, 58, 26, '#e5534b');
  rect(ctx, 56, 88, 70, 10, '#2b2033');
  rect(ctx, 70, 58, 42, 30, '#2b2033');
  rect(ctx, 76, 64, 30, 18, altered ? '#241d33' : '#ffd98a');
  poly(ctx, [[66, 58], [116, 58], [108, 42], [74, 42]], '#e5534b');
  circle(ctx, 91, 40, 4, '#ffd94c');
  // The beam, sweeping right across the dusk — unless the lamp is out.
  if (!altered) {
    const beam = ctx.createLinearGradient(91, 70, 600, 150);
    beam.addColorStop(0, 'rgba(255, 238, 180, 0.55)');
    beam.addColorStop(1, 'rgba(255, 238, 180, 0)');
    poly(ctx, [[91, 62], [600, 96], [600, 168], [91, 82]], beam);
    sparkle(ctx, 300, 108, 10, 'rgba(255, 244, 200, 0.7)');
  }
  // A lit window halfway up the tower — or a dark one.
  rect(ctx, 84, 226, 16, 20, altered ? '#241d33' : '#ffd98a');
  // Rocks, a sailboat and a bobbing buoy.
  if (!altered) {
    ellipse(ctx, 300, 402, 30, 12, '#2c2140');
    ellipse(ctx, 300, 396, 18, 8, '#3a2f4e');
  }
  ellipse(ctx, 480, 424, 34, 12, '#2c2140');
  ellipse(ctx, 480, 418, 20, 8, '#3a2f4e');
  // The sailboat: white sail on the usual day, red sail on the altered one.
  poly(ctx, [[360, 340], [410, 340], [360, 318]], '#5a3d2b');
  poly(ctx, [[368, 332], [368, 268], [398, 332]], altered ? '#e5534b' : '#f4ead2');
  line(ctx, 368, 268, 368, 336, 3, '#2b2033');
  // The buoy, when it has not drifted off.
  if (!altered) {
    ellipse(ctx, 520, 382, 10, 8, '#e5534b');
    rect(ctx, 516, 370, 8, 5, '#f4ead2');
    line(ctx, 520, 370, 520, 360, 2, '#2b2033');
  }
}

// ---------------------------------------------------------------- level 4 ----
function drawShrine(ctx, altered) {
  skyGradient(ctx, [[0, '#f2d8a8'], [0.55, '#e8a878'], [1, '#c97a6e']]);
  if (!altered) {
    circle(ctx, 480, 90, 26, '#ffdf8a');
    circle(ctx, 480, 90, 34, 'rgba(255, 223, 138, 0.35)');
  }
  poly(ctx, [[0, 300], [140, 190], [260, 270], [400, 200], [520, 275], [600, 220], [600, 300]], '#8a7a9e');
  poly(ctx, [[0, 300], [110, 235], [240, 290], [380, 240], [520, 295], [600, 255], [600, 300]], '#6b5a82');
  // The stream at the foot of the hill, with a koi — or without one.
  const stream = ctx.createLinearGradient(0, 400, 0, 460);
  stream.addColorStop(0, '#7ab8c9');
  stream.addColorStop(1, '#3d6a8a');
  rect(ctx, 0, 400, 600, 60, stream);
  line(ctx, 60, 420, 180, 420, 2, 'rgba(255,255,255,0.4)');
  line(ctx, 300, 440, 430, 440, 2, 'rgba(255,255,255,0.35)');
  if (!altered) {
    ellipse(ctx, 480, 428, 18, 7, '#ff8a3d');
    poly(ctx, [[496, 428], [508, 420], [508, 436]], '#ff8a3d');
    circle(ctx, 466, 428, 2, '#241d33');
  }
  // Stone steps up the middle to the shrine.
  for (let i = 0; i < 6; i += 1) {
    const y = 400 - i * 24;
    const w = 110 - i * 8;
    if (altered && i === 2) continue; // one step stone is missing
    rect(ctx, 300 - w / 2, y, w, 16, i % 2 === 0 ? '#9a8a7a' : '#8a7a6a');
    rect(ctx, 300 - w / 2, y, w, 3, 'rgba(255,255,255,0.25)');
  }
  // The shrine: red pillars, white walls, curved dark roof.
  rect(ctx, 360, 190, 130, 75, '#f4ead2');
  rect(ctx, 360, 190, 10, 75, '#c94b3d');
  rect(ctx, 480, 190, 10, 75, '#c94b3d');
  rect(ctx, 415, 215, 40, 50, '#5a3d2b');
  circle(ctx, 448, 240, 3, '#d8a03c');
  poly(ctx, [[340, 192], [510, 192], [492, 148], [358, 148]], '#2b3a55');
  poly(ctx, [[340, 192], [510, 192], [500, 182], [350, 182]], '#3d5f8a');
  // The roof ornament — a small golden finial, when it is still there.
  if (!altered) {
    circle(ctx, 425, 140, 8, '#d8a03c');
    poly(ctx, [[425, 132], [430, 122], [420, 122]], '#d8a03c');
  }
  // Stone lanterns flanking the steps; one flame is out on the altered day.
  [[250, 330], [390, 330]].forEach(([x, y], index) => {
    rect(ctx, x - 14, y + 22, 28, 10, '#8a7a6a');
    rect(ctx, x - 4, y - 6, 8, 28, '#9a8a7a');
    rect(ctx, x - 16, y - 22, 32, 16, '#8a7a6a');
    rect(ctx, x - 10, y - 18, 20, 8, '#2b2033');
    const lit = !(altered && index === 0);
    if (lit) {
      circle(ctx, x, y - 14, 4, '#ffd98a');
      sparkle(ctx, x, y - 14, 9, 'rgba(255, 217, 138, 0.5)');
    }
  });
  // The maple on the left: red leaves on the usual day, green on the altered one.
  line(ctx, 84, 420, 96, 300, 12, '#4a2f2a');
  line(ctx, 96, 300, 60, 240, 7, '#4a2f2a');
  line(ctx, 96, 300, 140, 250, 7, '#4a2f2a');
  const leaf = altered ? '#5a9e4b' : '#c94b3d';
  const leafLight = altered ? '#7fc46b' : '#e87a5e';
  circle(ctx, 60, 200, 34, leaf);
  circle(ctx, 120, 150, 38, leaf);
  circle(ctx, 160, 205, 30, leaf);
  circle(ctx, 100, 195, 26, leafLight);
  circle(ctx, 140, 175, 18, leafLight);
  // A rack of wooden prayer tablets — three, or two when one is taken home.
  rect(ctx, 505, 280, 70, 8, '#5a3d2b');
  line(ctx, 512, 288, 512, 330, 4, '#5a3d2b');
  line(ctx, 568, 288, 568, 330, 4, '#5a3d2b');
  const tablets = altered ? [522, 552] : [522, 542, 562];
  tablets.forEach((x) => {
    poly(ctx, [[x, 288], [x + 16, 288], [x + 16, 316], [x + 8, 324], [x, 316]], '#d8b25e');
    line(ctx, x + 4, 300, x + 12, 300, 1, '#8a6d3b');
    line(ctx, x + 4, 306, x + 12, 306, 1, '#8a6d3b');
  });
}

// ------------------------------------------------------------------ export ----
export const SCENES = [
  {
    id: 'teahouse',
    draw: drawTeahouse,
    diffs: [
      { id: 'moon', label: 'The moon is gone', x: 480, y: 70, r: 30 },
      { id: 'lantern', label: 'A lantern changed colour', x: 315, y: 210, r: 22 },
      { id: 'cat', label: 'The cat wandered off', x: 352, y: 344, r: 24 },
      { id: 'sign', label: 'The sign reads differently', x: 301, y: 231, r: 26 },
      { id: 'window', label: 'A window went dark', x: 222, y: 237, r: 26 },
      { id: 'steam', label: 'The teapot stopped steaming', x: 250, y: 352, r: 20 },
      { id: 'blossom', label: 'The blossoms turned white', x: 510, y: 150, r: 26 },
    ],
  },
  {
    id: 'nightmarket',
    draw: drawNightMarket,
    diffs: [
      { id: 'bulb', label: 'A festival bulb went out', x: 220, y: 66, r: 14 },
      { id: 'balloon', label: 'The balloon floated away', x: 100, y: 330, r: 24 },
      { id: 'awning', label: 'An awning changed colour', x: 305, y: 198, r: 24 },
      { id: 'bowl', label: 'A bowl was sold', x: 140, y: 307, r: 16 },
      { id: 'hat', label: 'The vendor lost his hat', x: 306, y: 228, r: 18 },
      { id: 'flowers', label: 'Flowers changed colour', x: 490, y: 286, r: 18 },
      { id: 'reflection', label: 'The moon left the puddle', x: 450, y: 418, r: 18 },
    ],
  },
  {
    id: 'lighthouse',
    draw: drawLighthouse,
    diffs: [
      { id: 'beam', label: 'The lighthouse beam is off', x: 300, y: 105, r: 30 },
      { id: 'gull', label: 'A gull flew away', x: 300, y: 70, r: 14 },
      { id: 'sail', label: 'The sail changed colour', x: 383, y: 300, r: 26 },
      { id: 'band', label: 'A red band turned white', x: 91, y: 203, r: 24 },
      { id: 'buoy', label: 'The buoy drifted off', x: 520, y: 376, r: 18 },
      { id: 'window', label: 'The lighthouse window went dark', x: 92, y: 236, r: 14 },
      { id: 'rock', label: 'A rock sank', x: 300, y: 398, r: 20 },
    ],
  },
  {
    id: 'shrine',
    draw: drawShrine,
    diffs: [
      { id: 'maple', label: 'Maple leaves turned green', x: 120, y: 150, r: 26 },
      { id: 'flame', label: 'A stone lantern went out', x: 250, y: 316, r: 14 },
      { id: 'tablet', label: 'A prayer tablet is missing', x: 552, y: 306, r: 16 },
      { id: 'finial', label: 'The roof ornament is gone', x: 425, y: 136, r: 16 },
      { id: 'koi', label: 'The koi swam away', x: 480, y: 428, r: 18 },
      { id: 'step', label: 'A step stone is missing', x: 300, y: 352, r: 18 },
      { id: 'sun', label: 'The sun has set', x: 480, y: 90, r: 26 },
    ],
  },
];

/** Draw one scene into the current transform: `altered` paints the differences. */
export function drawScene(ctx, levelIndex, altered) {
  SCENES[levelIndex].draw(ctx, altered);
}
