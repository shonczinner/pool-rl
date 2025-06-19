import math

FRICTION = 0.99
MIN_VELOCITY = 0.1

class Ball:
    def __init__(self, x, y, vx, vy, radius, color):
        self.x, self.y = x, y
        self.vx, self.vy = vx, vy
        self.radius = radius
        self.color = color

    def move(self):
        self.x += self.vx
        self.y += self.vy
        self.vx *= FRICTION
        self.vy *= FRICTION
        if abs(self.vx) < MIN_VELOCITY: self.vx = 0
        if abs(self.vy) < MIN_VELOCITY: self.vy = 0

def collide(ball1, ball2):
    dx = ball2.x - ball1.x
    dy = ball2.y - ball1.y
    dist = math.hypot(dx, dy)
    if dist < ball1.radius + ball2.radius and dist != 0:
        nx, ny = dx / dist, dy / dist
        p = 2 * (ball1.vx * nx + ball1.vy * ny - ball2.vx * nx - ball2.vy * ny) / 2
        ball1.vx -= p * nx
        ball1.vy -= p * ny
        ball2.vx += p * nx
        ball2.vy += p * ny

def update_balls(balls, w, h):
    for ball in balls:
        ball.move()
        if ball.x < ball.radius or ball.x > w - ball.radius:
            ball.vx *= -1
        if ball.y < ball.radius or ball.y > h - ball.radius:
            ball.vy *= -1
    for i in range(len(balls)):
        for j in range(i + 1, len(balls)):
            collide(balls[i], balls[j])
