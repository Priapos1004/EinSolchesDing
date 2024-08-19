from typing import Callable

from .abstract_elements import AbstractElements
from .button import Button


class Switch(AbstractElements):
    def __init__(self, x: int, y: int, width: int, height: int, texts: tuple[str, str], actions: tuple[Callable, Callable] = None, font_size: int = 20):

        self.button1 = Button(0,0,width,height,action=actions[0],text=texts[0],font_size=font_size)
        self.button2 = Button(0,0,width,height,action=actions[1],text=texts[1],font_size=font_size)

        self.select_button1()

        super().__init__(
            x=x,
            y=y,
            space_inbetween=[0],
            elements=[self.button1, self.button2]
        )
    
    def get_current_button_text(self):
        return [self.button1, self.button2][1 - int(self._selected_button1)].text

    def select_button1(self):
        self._selected_button1 = True
        self.button1.select()
        self.button2.deselect()

    def deselect_button1(self):
        self._selected_button1 = False
        self.button1.deselect()
        self.button2.select()

    def set_text(self, texts: tuple[str, str]):
        self.button1.set_text(texts[0])
        self.button2.set_text(texts[1])

    def click_listen(self, pos: tuple):
        if self._selected_button1:
            self.button2.click_listen(pos)

            if self.button2.is_over(pos):
                self.deselect_button1()
        else:
            self.button1.click_listen(pos)

            if self.button1.is_over(pos):
                self.select_button1()

    def hover_listen(self, pos: tuple):
        if self._selected_button1:
            self.button2.hover_listen(pos)
        else:
            self.button1.hover_listen(pos)
