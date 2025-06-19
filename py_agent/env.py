import math
from .physics import Ball, update_balls

TABLE_WIDTH = 800
TABLE_HEIGHT = 400
BALL_RADIUS = 10

class PoolEnv:
    def __init__(self):
        self.balls = []
        self.reset()

    def reset(self):
        self.balls = [
            Ball(100, 200, 0, 0, BALL_RADIUS, (255, 255, 255)),  # cue
            Ball(400, 200, 0, 0, BALL_RADIUS, (255, 0, 0)),       # target
        ]

    def step(self):
        update_balls(self.balls, TABLE_WIDTH, TABLE_HEIGHT)
