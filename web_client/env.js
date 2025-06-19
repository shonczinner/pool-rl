import { Ball, updateBalls } from './physics.js';

export const TABLE_WIDTH = 600;
export const TABLE_HEIGHT = 300;
export const MARGIN_X = 100;
export const MARGIN_Y = 100;
const POCKET_RADIUS = 18;
const BALL_RADIUS = 10;

export class PoolEnv {
  constructor() {
    this.shots = 0;
    this.fouls = 0;
    this.balls = [];
    this.ballOwners = [];

    // Owner IDs
    this.cueID = 0;
    this.playerID = 1; // main player
    this.opponentID = 2; // foul if sunk

    this.pockets = [];
    this.reset();
  }

  reset() {
    this.shots = 0;
    this.fouls = 0;

    this.balls = [
      new Ball(TABLE_WIDTH / 4, TABLE_HEIGHT / 2, 0, 0, BALL_RADIUS, 'white'), // cue
      new Ball(3 * TABLE_WIDTH / 4, TABLE_HEIGHT / 4, 0, 0, BALL_RADIUS, 'red'), // player target
      new Ball(3 * TABLE_WIDTH / 4, 3 * TABLE_HEIGHT / 4, 0, 0, BALL_RADIUS, 'black'), // opponent ball
    ];

    this.ballOwners = [this.cueID, this.playerID, this.opponentID];

    const left = 0;
    const right = TABLE_WIDTH;
    const top = 0;
    const bottom = TABLE_HEIGHT;
    const midX = (left + right) / 2;

    this.pockets = [
      [left, top],
      [midX, top],
      [right, top],
      [left, bottom],
      [midX, bottom],
      [right, bottom],
    ];
  }

  step(action = null) {
    if (action) {
      this.shots += 1;
      const cue = this.balls[0]; // always first
      cue.vx = action.dx;
      cue.vy = action.dy;
    }

    updateBalls(this.balls, TABLE_WIDTH, TABLE_HEIGHT);
    this.handlePockets();

    return { state: this.getState(), reward: -1 };
  }

  handlePockets() {
    const newBalls = [];
    const newOwners = [];

    let scratched = false;

    for (let i = 0; i < this.balls.length; i++) {
      const ball = this.balls[i];
      const owner = this.ballOwners[i];

      let pocketed = false;
      for (const [px, py] of this.pockets) {
        const dx = ball.x - px;
        const dy = ball.y - py;
        if (Math.hypot(dx, dy) < POCKET_RADIUS) {
          pocketed = true;
          break;
        }
      }

      if (!pocketed) {
        newBalls.push(ball);
        newOwners.push(owner);
      } else {
        if (owner !== this.playerID) {
          this.fouls += 1;
          if (owner === this.cueID) scratched = true;
        }
        // pocketed opponent/cue ball — do NOT add back to list
      }
    }

    this.balls = newBalls;
    this.ballOwners = newOwners;

    if (scratched) {
      this.placeCueBall();
    }
  }

  placeCueBall() {
    const radius = BALL_RADIUS;
    const maxAttempts = 100;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const newX = radius + Math.random() * (TABLE_WIDTH - 2 * radius);
      const newY = radius + Math.random() * (TABLE_HEIGHT - 2 * radius);

      const safe = this.balls.every(other => {
        const dx = newX - other.x;
        const dy = newY - other.y;
        return Math.hypot(dx, dy) > radius + other.radius + 5;
      });

      if (safe) {
        const cueBall = new Ball(newX, newY, 0, 0, radius, 'white');
        this.balls.unshift(cueBall);
        this.ballOwners.unshift(this.cueID);
        return;
      }
    }

    console.warn("Could not safely respawn cue ball.");
  }

  getState() {
    return this.balls.map(b => [b.x, b.y]).flat();
  }

  isIdle() {
    return this.balls.every(ball => ball.vx === 0 && ball.vy === 0);
  }
}
