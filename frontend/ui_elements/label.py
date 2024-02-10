import pygame

from .abstract_element import AbstractElement
from .utils import get_color


class Label(AbstractElement):
    def __init__(self, x, y, text = "", font_size: int = 40, font_type: str = "comicsans", text_color="white"):
        super().__init__(x, y, text, font_size, font_type, None, text_color)

    def draw(self, screen):
        screen.blit(self.rendered_text, (self.x - self.rendered_text.get_width() // 2, self.y - self.rendered_text.get_height() // 2))
