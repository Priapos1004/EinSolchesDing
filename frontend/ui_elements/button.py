from typing import Callable

import pygame

from .abstract_element import AbstractElement
from .utils import get_color, get_hover_color


class Button(AbstractElement):
    def __init__(self, x: int, y: int, width: int, height: int, action: Callable = None, text: str = "", font_size: int = 40, font_type: str = "comicsans", color: str = "black", text_color: str = "white", outline: str = "white"):
        super().__init__(x, y, text, font_size, font_type, color, text_color)

        self.width = width
        self.height = height

        self._action = action

        self.outline = get_color(outline)

        self.enabled = True  # Button is enabled by default
        self.hover_color = get_hover_color(color) # color if mouse hovers over
        self.draw_color = color # color to use to fill the body of the button
        self.draw_outline_color = outline # color to use to draw the outline of the button

    def disable(self):
        self.enabled = False
        self.draw_color = get_color("grey")  # Grey color for disabled state
        self.draw_outline_color = get_hover_color("grey")

    def enable(self):
        self.enabled = True
        self.draw_color = self.color
        self.draw_outline_color = self.outline

    def draw(self, screen):
        pygame.draw.rect(screen, self.draw_outline_color, (self.x-2, self.y-2, self.width+4, self.height+4), 0)
        pygame.draw.rect(screen, self.draw_color, (self.x, self.y, self.width, self.height), 0)
        if self.text != "":
            screen.blit(self.rendered_text, (self.x + (self.width/2 - self.rendered_text.get_width()/2), self.y + (self.height/2 - self.rendered_text.get_height()/2)))

    def is_over(self, pos):
        # The button responds to hover only if it is enabled
        if self.enabled and self.x < pos[0] < self.x + self.width and self.y < pos[1] < self.y + self.height:
            return True
        return False
    
    def click_listen(self, pos):
        if self.is_over(pos):
            if self._action is not None:
                self._action()

    def hover_listen(self, pos):
        if self.is_over(pos):
            self.draw_color = self.hover_color
        else:
            if self.enabled:
                self.draw_color = self.color
