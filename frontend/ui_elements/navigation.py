import sys

import pygame


class Navigation:
    def __init__(self, state_management: dict = {}):
        # Screen setup
        self.infoObject = pygame.display.Info()
        self.screen_width = self.infoObject.current_w
        self.screen_height = self.infoObject.current_h
        self.screen = pygame.display.set_mode((self.screen_width, self.screen_height))

        self.state_management = state_management # additional custom variables

        self.current_state = "main" # which frame is active
        self.frames = {"main": None} # frames
        self.running = True # if False -> Exit program

    def get_var(self, var_name: str):
        return self.state_management[var_name]

    def add_frame(self, frame, frame_name: str):
        self.frames[frame_name] = frame

    def info(self):
        print("### Frames ###")
        for frame in self.frames:
            print()
            print(f"{frame}:")
            self.frames[frame].info()

        if self.state_management:
            print()
            print("State management:")
            for var in self.state_management:
                value = self.state_management[var]
                print(f"    {var} = {value} ({value.__class__.__name__})")

    def run_game(self):
        while self.running:
            pos = pygame.mouse.get_pos()
            self.frames[self.current_state].hover_listen(pos)
            for event in pygame.event.get():
                if event.type == pygame.QUIT or (event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE):
                    self.running = False
                if event.type == pygame.MOUSEBUTTONDOWN:
                    if self.frames[self.current_state] is not None:
                        self.frames[self.current_state].click_listen(pos)
            
            # for testing
            if self.frames[self.current_state] is None:
                self.screen.fill((0, 0, 0))
            else:
                self.frames[self.current_state].draw(self.screen)

            pygame.display.flip()
            pygame.time.Clock().tick(60)

        # Quit Pygame
        pygame.quit()
        sys.exit()
