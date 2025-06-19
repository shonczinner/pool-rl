import pygame
from env import PoolEnv

pygame.init()
screen = pygame.display.set_mode((800, 400))
clock = pygame.time.Clock()
env = PoolEnv()
drag_start = None

running = True
while running:
    screen.fill((20, 100, 20))  # Green table

    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        elif event.type == pygame.MOUSEBUTTONDOWN:
            drag_start = pygame.mouse.get_pos()
        elif event.type == pygame.MOUSEBUTTONUP:
            drag_end = pygame.mouse.get_pos()
            if drag_start:
                dx = drag_start[0] - drag_end[0]
                dy = drag_start[1] - drag_end[1]
                cue = env.balls[0]
                cue.vx, cue.vy = dx * 0.1, dy * 0.1
            drag_start = None

    env.step()

    for ball in env.balls:
        pygame.draw.circle(screen, ball.color, (int(ball.x), int(ball.y)), ball.radius)

    pygame.display.flip()
    clock.tick(60)
