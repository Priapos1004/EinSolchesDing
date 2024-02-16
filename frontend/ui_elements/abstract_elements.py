import pygame

from .abstract_element import AbstractElement


class AbstractElements:
    def __init__(self, x: int, y: int, space_inbetween: list[int], elements: list[AbstractElement]):
        self._x = x
        self._y = y
        self._space_inbetween = space_inbetween
        self._elements = elements

        if len(space_inbetween) != len(elements) - 1:
            raise ValueError("'space_inbetween' needs to have length: length of 'elements' - 1")

        self.set_x(x)
        self.set_y(y)

    @property
    def x(self) -> int:
        return self._x
    
    def _get_x_idx(self, x: int, idx: int, widths: list[int], total_width: int) -> int:
        x_value = x - total_width // 2 # left border of elements
        x_value += sum(widths[:idx]) + sum(self._space_inbetween[:idx]) + widths[idx] // 2
        return x_value

    def set_x(self, x: int):
        widths = [elem.width for elem in self._elements]
        total_width = sum(widths)+sum(self._space_inbetween)

        for idx, element in enumerate(self._elements):
            element.set_x(self._get_x_idx(x, idx, widths, total_width))

    @property
    def y(self) -> int:
        return self._y
    
    def set_y(self, y: int):
        for element in self._elements:
            element.set_y(y)

    def enable(self):
        for element in self._elements:
            element.enable()

    def disable(self):
        for element in self._elements:
            element.disable()

    def draw(self, screen: pygame.Surface):
        for element in self._elements:
            element.draw(screen)

    def click_listen(self, pos: tuple[int, int]):
        for element in self._elements:
            element.click_listen(pos)

    def hover_listen(self, pos: tuple[int, int]):
        for element in self._elements:
            element.hover_listen(pos)
