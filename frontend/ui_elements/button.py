from typing import Callable

from .abstract_element import AbstractElement


class Button(AbstractElement):
    def __init__(self, x: int, y: int, width: int, height: int, action: Callable = None, text: str = "", font_size: int = 40, bg_color: str = "black", selected_bg_color: str = "white", outline_color: str = "white", hover_color: str = "grey", text_color: str = "white", selected_text_color: str = "black"):
        super().__init__(
            x=x, 
            y=y,
            width=width,
            height=height,
            outline_width=2,
            text=text,
            font_size=font_size,
            text_margin=0,
            bg_color=bg_color,
            disabled_bg_color="light grey", # Grey color for disabled state
            selected_bg_color=selected_bg_color,
            outline_color=outline_color,
            disabled_outline_color="dark grey", # Grey color for disabled state
            hover_color=hover_color,
            text_color=text_color,
            selected_text_color=selected_text_color,
        )

        self._action = action
    
    def click_listen(self, pos: tuple[int, int]):
        if self.is_over(pos):
            if self._action is not None:
                self._action()
