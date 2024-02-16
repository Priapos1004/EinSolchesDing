import sys
import textwrap
from typing import Callable

import pygame

from .button import Button
from .utils import get_color


class PopUp:
    popup_width = 400
    popup_height = 200
    info_text_margin = 15
    button_outline_space = 15
    outline_color = "white"
    outline_thickness = 4
    font_type = "comicsans"
    font_size = 20
    text_color = "white"

    def __init__(self, x, y, info_text: str, screen, button1_text: str, button2_text: str, button1_action: Callable, button2_action: Callable, button1_color: str, button2_color: str, button1_hover_color: str, button2_hover_color: str):
        self.x = x
        self.y = y
        self.screen = screen
        self.button1_action = button1_action
        self.button2_action = button2_action

        self.popup_surf = pygame.Surface((self.popup_width, self.popup_height))
        self.popup_rect = self.popup_surf.get_rect(center=(x, y))
        self._available_info_text_width: int = self.popup_rect.width - 2 * self.info_text_margin

        self._font = pygame.font.SysFont(self.font_type, self.font_size)
        self._info_text = info_text

        self.button1 = Button(self.popup_rect.x + self.popup_width - self.button_outline_space - 40, self.popup_rect.y + self.popup_height - self.button_outline_space - 20, 80, 40, button1_action, button1_text, font_size=self.font_size, bg_color=button1_color, hover_color=button1_hover_color, text_color=self.text_color)
        self.button2 = Button(self.popup_rect.x + self.button_outline_space + 40, self.popup_rect.y + self.popup_height - self.button_outline_space - 20, 80, 40, button2_action, button2_text, font_size=self.font_size, bg_color=button2_color, hover_color=button2_hover_color, text_color=self.text_color)

    @property
    def info_text(self) -> str:
        return self._info_text
    
    def set_info_text(self, info_text: str):
        self._info_text = info_text

    def _get_info_text_width(self) -> int:
        # Measure the width of the sample text
        sample_text_width, _ = self._font.size(self.info_text)
        average_char_width = sample_text_width / len(self.info_text)

        # Estimate characters per line based on average character width
        return self._available_info_text_width // average_char_width
    
    def render_textblock(self):
        """Draws a block of text into a specified rectangle."""
        y = self.popup_rect.top + 10
        line_spacing = -2  # Can be adjusted to change the space between lines

        # Split the text into lines that fit within the specified width
        lines = textwrap.wrap(self.info_text, width=self._get_info_text_width())

        for line in lines:
            line_surface = self._font.render(line, True, self.text_color)
            line_width, line_height = line_surface.get_size()
            if y + line_height > self.popup_rect.bottom:
                break  # Stop drawing if we run out of vertical space
            
            # center the text
            x = self.popup_rect.left + (self.popup_rect.width - line_width) // 2
            self.screen.blit(line_surface, (x, y))
            y += line_height + line_spacing

    def activate_popup(self):
        self.popup_surf.fill(get_color("dark grey"))
        popup_active = True
        while popup_active:
            pos = pygame.mouse.get_pos()
            self.button1.hover_listen(pos)
            self.button2.hover_listen(pos)
            for event in pygame.event.get():
                if event.type == pygame.MOUSEBUTTONDOWN:
                    if not self.popup_rect.collidepoint(pos):
                        popup_active = False

                    if self.button1_action is not None:
                        if self.button1.is_over(event.pos):
                            popup_active = False
                        self.button1.click_listen(pos)

                    if self.button2_action is not None:
                        if self.button2.is_over(event.pos):
                            popup_active = False
                        self.button2.click_listen(pos)

                if event.type == pygame.QUIT:
                    pygame.quit()
                    sys.exit()

            outline_rect = self.popup_rect.inflate(self.outline_thickness * 2, self.outline_thickness * 2)
            pygame.draw.rect(self.screen, get_color(self.outline_color), outline_rect, self.outline_thickness)

            self.screen.blit(self.popup_surf, self.popup_rect)

            if self.button1_action is not None:
                self.button1.draw(self.screen)

            if self.button2_action is not None:
                self.button2.draw(self.screen)

            self.render_textblock()
            pygame.display.flip()
