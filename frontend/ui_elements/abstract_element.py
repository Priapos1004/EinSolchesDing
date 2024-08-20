import textwrap

import pygame

from .utils import get_color, get_color_name


class AbstractElement:

    # Can be adjusted to change the space between lines
    line_spacing: int = -2

    # Can be adjusted to change the font type
    font_type: str = "comicsans"

    def __init__(self, x: int, y: int, width: int, height: int, outline_width: int, text: str, font_size: int, text_margin: int, bg_color: str | None, disabled_bg_color: str | None, selected_bg_color: str | None, outline_color: str | None, disabled_outline_color: str | None, hover_color: str | None, text_color: str, selected_text_color: str | None):
        self._x = x
        self._y = y
        self._width = width
        self._height = height
        self._outline_width = outline_width

        self._set_rect(x, y, width, height)

        self._available_text_width: int = self._inner_rect.width - (2 * text_margin)

        self._bg_color = get_color(bg_color) # if None -> no bg color
        self._disabled_bg_color = get_color(disabled_bg_color)
        self._selected_bg_color = get_color(selected_bg_color)
        self._outline_color = get_color(outline_color)
        self._disabled_outline_color = get_color(disabled_outline_color)
        self._hover_color = get_color(hover_color)
        self._text_color = get_color(text_color)
        self._selected_text_color = get_color(selected_text_color)

        self._text = text
        self._font_size = font_size
        self._font = pygame.font.SysFont(self.font_type, self._font_size)

        self._enabled = True  # Element is enabled by default
        self._hovered = False
        self._selected = False

    def _set_rect(self, x: int, y: int, width: int, height: int):
        self._rect = pygame.Rect(x, y, width, height)
        self._rect.center = (x,y)
        self._inner_rect = self._rect.inflate(-self._outline_width*2, -self._outline_width*2)

    def _get_text_width(self) -> int:
        # Measure the width of the sample text
        sample_text_width, _ = self._font.size(self._text)
        average_char_width = sample_text_width / len(self._text)

        # Estimate characters per line based on average character width
        return self._available_text_width // average_char_width

    @property
    def x(self) -> int:
        return self._x

    def set_x(self, x: int):
        self._x = x
        self._set_rect(self.x, self.y, self.width, self.height)

    @property
    def y(self) -> int:
        return self._y
    
    def set_y(self, y: int):
        self._y = y
        self._set_rect(self.x, self.y, self.width, self.height)

    @property
    def width(self) -> int:
        return self._width

    @property
    def height(self) -> int:
        return self._height

    @property
    def text(self) -> str:
        return self._text
    
    def set_text(self, text: str):
        self._text = text

    @property
    def bg_color(self) -> str:
        return get_color_name(self._bg_color)
    
    def set_bg_color(self, bg_color: str):
        self._bg_color = bg_color

    @property
    def text_color(self) -> str:
        return get_color_name(self._text_color)
    
    def set_text_color(self, text_color: str):
        self._text_color = text_color

    def get_rendered_text(self):
        if type(self.text) ==  str:
            rendered_text = self._font.render(self.text, 1, self._text_color)
        elif type(self.text) == list:
            rendered_text = [self._font.render(txt, 1, self._text_color) for txt in self.text]
        else:
            raise ValueError(f"input type of 'text' has to be str or list: {type(self.text)}")
        
        return rendered_text
    
    def disable(self):
        self._enabled = False

    def enable(self):
        self._enabled = True

    def select(self):
        self._selected = True

    def deselect(self):
        self._selected = False

    def is_over(self, pos: tuple[int, int]) -> bool:
        return self._rect.collidepoint(pos) and self._enabled
    
    def render_textblock(self, screen: pygame.Surface):
        """Draws a block of text into a specified rectangle."""
        # Split the text into lines that fit within the specified width
        lines = textwrap.wrap(self._text, width=self._get_text_width())

        total_height = sum(self._font.size(line)[1] for line in lines) + (len(lines) - 1) * self.line_spacing

        # Start drawing from this y to center text vertically
        y = self._inner_rect.top + (self._inner_rect.height - total_height) // 2

        for line in lines:
            if self._selected and self._enabled:
                line_surface = self._font.render(line, True, self._selected_text_color)
            else:
                line_surface = self._font.render(line, True, self._text_color)

            line_width, line_height = line_surface.get_size()
            if y + line_height > self._inner_rect.bottom:
                break  # Stop drawing if we run out of vertical space
            
            # center the text
            x = self._inner_rect.left + (self._inner_rect.width - line_width) // 2
            screen.blit(line_surface, (x, y))
            y += line_height + self.line_spacing

    def draw(self, screen: pygame.Surface):
        if self._bg_color is not None:
            if self._selected and self._enabled:
                pygame.draw.rect(screen, self._outline_color, self._rect, self._outline_width)
                pygame.draw.rect(screen, self._selected_bg_color, self._inner_rect)
            elif self._hovered and self._enabled:
                pygame.draw.rect(screen, self._outline_color, self._rect, self._outline_width)
                pygame.draw.rect(screen, self._hover_color, self._inner_rect)
            elif not self._enabled:
                pygame.draw.rect(screen, self._disabled_bg_color, self._rect)
            else:
                pygame.draw.rect(screen, self._outline_color, self._rect, self._outline_width)
                pygame.draw.rect(screen, self._bg_color, self._inner_rect)

        if self.text != "":
            self.render_textblock(screen)

    def click_listen(self, pos: tuple[int, int]):
        pass

    def hover_listen(self, pos: tuple[int, int]):
        self._hovered = self.is_over(pos)
