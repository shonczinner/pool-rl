export const FRICTION = 0.99;
export const MIN_VELOCITY = 0.1;

export class Ball {
  constructor(x, y, vx, vy, radius, color) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.color = color;
  }

  move() {
    this.x += this.vx;
    this.y += this.vy;
    this.vx *= FRICTION;
    this.vy *= FRICTION;

    if (Math.abs(this.vx) < MIN_VELOCITY) this.vx = 0;
    if (Math.abs(this.vy) < MIN_VELOCITY) this.vy = 0;
  }

  bounce(width, height) {
    if (this.x < this.radius) {
      this.x = this.radius;
      this.vx *= -1;
    } else if (this.x > width - this.radius) {
      this.x = width - this.radius;
      this.vx *= -1;
    }

    if (this.y < this.radius) {
      this.y = this.radius;
      this.vy *= -1;
    } else if (this.y > height - this.radius) {
      this.y = height - this.radius;
      this.vy *= -1;
    }
  }
}

export function collide(ball1, ball2) {
  const dx = ball2.x - ball1.x;
  const dy = ball2.y - ball1.y;
  const dist = Math.hypot(dx, dy);
  const minDist = ball1.radius + ball2.radius;

  if (dist === 0 || dist >= minDist) return; // No collision

  // Normal vector
  const nx = dx / dist;
  const ny = dy / dist;

  // Tangent vector
  const tx = -ny;
  const ty = nx;

  // Project velocities onto normal and tangent vectors
  const v1n = ball1.vx * nx + ball1.vy * ny;
  const v1t = ball1.vx * tx + ball1.vy * ty;
  const v2n = ball2.vx * nx + ball2.vy * ny;
  const v2t = ball2.vx * tx + ball2.vy * ty;

  // Elastic collision: swap normal velocities (assuming equal mass)
  const v1nAfter = v2n;
  const v2nAfter = v1n;

  // Convert scalar normal + tangent velocities back to vectors
  ball1.vx = v1nAfter * nx + v1t * tx;
  ball1.vy = v1nAfter * ny + v1t * ty;
  ball2.vx = v2nAfter * nx + v2t * tx;
  ball2.vy = v2nAfter * ny + v2t * ty;

  // Positional correction to resolve overlap
  const overlap = minDist - dist;
  const correction = overlap / 2;
  ball1.x -= nx * correction;
  ball1.y -= ny * correction;
  ball2.x += nx * correction;
  ball2.y += ny * correction;
}

export function updateBalls(balls, width, height) {
  // Move balls and handle wall collisions
  for (const ball of balls) {
    ball.move();
    ball.bounce(width, height);
  }

  // Handle ball-ball collisions
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      collide(balls[i], balls[j]);
    }
  }
}
