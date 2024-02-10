import pygame

from .utils import get_color


class AbstractElement:
    def __init__(self, x: int, y: int, text: str, font_size: int, font_type: str, color: str, text_color: str):
        self._x = x
        self._y = y

        self.color = get_color(color)
        self.text_color = get_color(text_color)

        self._text = text
        self.font_size = font_size
        self.font_type = font_type
        self.font = pygame.font.SysFont(self.font_type, self.font_size)

        if type(text) ==  str:
            self.rendered_text = self.font.render(self._text, 1, self.text_color)
        elif type(text) == list:
            self.rendered_text = [self.font.render(txt, 1, self.text_color) for txt in self.text]

    @property
    def x(self) -> int:
        return self._x

    def set_x(self, x: int):
        self._x = x

    @property
    def y(self) -> int:
        return self._y
    
    def set_y(self, y: int):
        self._y = y

    @property
    def text(self) -> str:
        return self._text
    
    def set_text(self, text: str):
        self._text = text
        if type(text) ==  str:
            self.rendered_text = self.font.render(self._text, 1, self.text_color)
        elif type(text) == list:
            self.rendered_text = [self.font.render(txt, 1, self.text_color) for txt in self._text]

    def draw(self, screen):
        pass

    def click_listen(self, pos: tuple):
        pass

    def hover_listen(self, pos: tuple):
        pass