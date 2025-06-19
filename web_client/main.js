import { PoolEnv, TABLE_WIDTH, TABLE_HEIGHT, MARGIN_X, MARGIN_Y } from './env.js';
import { bindEvents } from './utils.js'

const resetButtonX = TABLE_WIDTH - 80;
const resetButtonY = TABLE_HEIGHT + 30;
const resetButtonWidth = 70;
const resetButtonHeight = 30;

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const env = new PoolEnv();

let dragStart = null;
let pendingAction = null;
let resetCooldownUntil = 0;

function getCanvasCoordinates(e, isTouchEnd = false) {
  const rect = canvas.getBoundingClientRect();
  let clientX, clientY;

  if (e.touches && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else if (isTouchEnd && e.changedTouches && e.changedTouches.length > 0) {
    clientX = e.changedTouches[0].clientX;
    clientY = e.changedTouches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }

  return {
    x: clientX - rect.left,
    y: clientY - rect.top
  };
}

function startDrag(x, y) {
  if (!env.isIdle()) return;
  if (Date.now() < resetCooldownUntil) return; // prevent early drag after reset
  dragStart = [x, y];
}

function endDrag(x, y) {
  if (!dragStart) return;

  const dx = (dragStart[0] - x) * 0.1;
  const dy = (dragStart[1] - y) * 0.1;

  pendingAction = { dx, dy };
  dragStart = null;
}

function clickReset(x, y) {
  const relX = x - MARGIN_X;
  const relY = y - MARGIN_Y;

  if (
    relX >= resetButtonX && relX <= resetButtonX + resetButtonWidth &&
    relY >= resetButtonY && relY <= resetButtonY + resetButtonHeight
  ) {
    env.reset();
    resetCooldownUntil = Date.now() + 10; // 10 ms cooldown
    dragStart = null;
    pendingAction = null;
  }
}

bindEvents(canvas, ['mousedown', 'touchstart'], (e) => {
  const { x, y } = getCanvasCoordinates(e);
  startDrag(x, y);
});

bindEvents(document, ['mouseup', 'touchend'], (e) => {
  const { x, y } = getCanvasCoordinates(e, true); // include touchend
  endDrag(x, y);
});

bindEvents(canvas, ['click', 'touchstart'], (e) => {
  const { x, y } = getCanvasCoordinates(e);
  clickReset(x, y);
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.translate(MARGIN_X,MARGIN_Y)

  // Draw brown border
  ctx.fillStyle = '#8B4513'; // saddle brown
  ctx.fillRect(
     - 20,
     - 20,
    TABLE_WIDTH + 40,
    TABLE_HEIGHT + 40
  );

  // Draw green table surface
  ctx.fillStyle = '#2e8b57'; // sea green
  ctx.fillRect(0, 0, TABLE_WIDTH, TABLE_HEIGHT);

  // Draw pockets
  for (const [x, y] of env.pockets) {
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2);
    ctx.fillStyle = 'black';
    ctx.fill();
  }

  // Draw balls
  for (let ball of env.balls) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
  }

  // Draw UI text at the bottom
  ctx.font = 'bold 20px monospace';
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';

  const text = `BALLS: ${env.balls.length - 1}   SHOTS: ${env.shots}   FOULS: ${env.fouls}`;
  ctx.fillText(text, TABLE_WIDTH / 2, TABLE_HEIGHT + 50);

  // Draw status text
  ctx.font = 'bold 16px monospace';
  ctx.fillStyle = env.isIdle() ? '#0f0' : '#aaa';
  const status = env.isIdle() ? 'READY TO SHOOT' : '...WAITING';
  ctx.fillText(status, TABLE_WIDTH / 2, TABLE_HEIGHT + 75);

  // Draw RESET button
  ctx.fillStyle = '#444';
  ctx.fillRect(resetButtonX, resetButtonY, resetButtonWidth, resetButtonHeight);
  ctx.strokeStyle = '#fff';
  ctx.strokeRect(resetButtonX, resetButtonY, resetButtonWidth, resetButtonHeight);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('RESET', resetButtonX + resetButtonWidth / 2, resetButtonY + 20);


  ctx.translate(-MARGIN_X,-MARGIN_Y)
}

function loop() {
  if (pendingAction && env.isIdle()) {
    env.step(pendingAction);
    pendingAction = null;
  } else {
    env.step();
  }

  draw();
  requestAnimationFrame(loop);
}

loop();
