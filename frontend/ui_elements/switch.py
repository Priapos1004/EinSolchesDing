from typing import Callable

from .abstract_element import AbstractElement
from .button import Button


class Switch(AbstractElement):
    def __init__(self, x: int, y: int, width: int, height: int, texts: tuple[str, str], actions: tuple[Callable, Callable] = None, font_size: int = 20, font_type: str = "comicsans", color: str = "black", text_color: str = "white", outline: str = "white"):
        super().__init__(x, y, texts, font_size, font_type, color, text_color)

        self.button1 = Button(x-width,y,width,height,actions[0],texts[0],font_size, font_type, color, text_color, outline)
        self.button2 = Button(x,y,width,height,actions[1],texts[1],font_size, font_type, color, text_color, outline)

    def draw(self, screen):
        self.button1.draw(screen)
        self.button2.draw(screen)

    def click_listen(self, pos: tuple):
        self.button1.click_listen(pos)
        self.button2.click_listen(pos)

    def hover_listen(self, pos: tuple):
        self.button1.hover_listen(pos)
        self.button2.hover_listen(pos)
