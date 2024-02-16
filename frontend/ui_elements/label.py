import pygame

from .abstract_element import AbstractElement


class Label(AbstractElement):
    def __init__(self, x: int, y: int, width: int | None = None, height: int | None = None, text = "", font_size: int = 40, text_color="white", selected_text_color="dark green"):

        # automatic calculation of width and height based on text
        if width is None or height is None:
            font = pygame.font.SysFont(self.font_type, font_size)
            rendered_text = font.render(text, True, text_color)
            if width is None:
                width = rendered_text.get_width()

            if height is None:
                height = rendered_text.get_height()

        super().__init__(
            x=x, 
            y=y,
            width=width,
            height=height,
            outline_width=0,
            text=text,
            font_size=font_size,
            text_margin=0,
            bg_color=None,
            disabled_bg_color=None,
            selected_bg_color=None,
            outline_color=None,
            disabled_outline_color=None,
            hover_color=None,
            text_color=text_color,
            selected_text_color=selected_text_color,
        )
