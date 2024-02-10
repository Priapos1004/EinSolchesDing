from .abstract_element import AbstractElement
from .button import Button
from .label import Label


class NumCounter(AbstractElement):
    space_inbetween = 25 # space between counter and button

    def __init__(self, x: int, y: int,  min_value: int, max_value: int, default_value: int, text: str = "", font_size: int = 40, font_type: str = "comicsans", color: str = "black", text_color: str = "white", outline: str = "white"):
        super().__init__(x, y, text, font_size, font_type, color, text_color)

        self.min_value = min_value
        self.max_value = max_value
        self.default_value = default_value
        self._counter: int = default_value # counter for label

        counter_length = self.font.render(str(default_value), 1, self.text_color).get_width()
        mid_length = (self.rendered_text.get_width()+counter_length+220+2*self.space_inbetween)//2

        self.text_label = Label(self.x - mid_length + self.rendered_text.get_width()//2, self.y, self.text, font_size, font_type, text_color)
        self.counter_label = Label(self.x + mid_length - 100 - self.space_inbetween - counter_length//2, self.y, str(default_value), font_size, font_type, text_color)

        def plus_counter():
            self._counter += 1
            self.counter_label.set_text(str(self._counter))

        def minus_counter():
            self._counter -= 1
            self.counter_label.set_text(str(self._counter))

        self.minus_button = Button(self.x - mid_length + self.rendered_text.get_width() + 20, self.y - self.rendered_text.get_height() // 2 + 5, 100, 50, action=minus_counter, text="-", font_size=font_size, font_type=font_type, color=color, text_color=text_color, outline=outline)
        self.plus_button = Button(self.x + mid_length - 100, self.y - self.rendered_text.get_height() // 2 + 5, 100, 50, action=plus_counter, text="+", font_size=font_size, font_type=font_type, color=color, text_color=text_color, outline=outline)

    @property
    def counter(self) -> int:
        return self._counter
    
    def reset_counter(self):
        self._counter = self.default_value
        self.counter_label.set_text(str(self._counter))

    def draw(self, screen):
        self.text_label.draw(screen)
        self.counter_label.draw(screen)
        self.plus_button.draw(screen)
        self.minus_button.draw(screen)

        if self.counter > self.min_value:
            self.minus_button.enable()
        else:
            self.minus_button.disable()

        if self.counter < self.max_value:
            self.plus_button.enable()
        else:
            self.plus_button.disable()

    def click_listen(self, pos):
        self.plus_button.click_listen(pos)
        self.minus_button.click_listen(pos)

    def hover_listen(self, pos):
        self.plus_button.hover_listen(pos)
        self.minus_button.hover_listen(pos)