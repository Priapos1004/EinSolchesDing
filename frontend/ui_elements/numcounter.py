from .abstract_elements import AbstractElements
from .button import Button
from .label import Label


class NumCounter(AbstractElements):

    space_inbetween: list[int] = [20, 25, 25]
    button_width = 100
    button_height = 60

    def __init__(self, x: int, y: int,  min_value: int, max_value: int, default_value: int, text: str = "", font_size: int = 40, bg_color: str = "black", outline_color: str = "white", text_color: str = "white"):
        self.min_value = min_value
        self.max_value = max_value
        self.default_value = default_value
        self._counter: int = default_value # counter for label

        self.text_label = Label(0, 0, text=text, font_size=font_size, text_color=text_color)
        self.counter_label = Label(0, 0, text=str(default_value), font_size=font_size, text_color=text_color)

        def plus_counter():
            self._counter += 1
            self.counter_label.set_text(str(self._counter))

        def minus_counter():
            self._counter -= 1
            self.counter_label.set_text(str(self._counter))

        self.minus_button = Button(0, 0, self.button_width, self.button_height, action=minus_counter, text="-", font_size=font_size, bg_color=bg_color, text_color=text_color, outline_color=outline_color)
        self.plus_button = Button(0, 0, self.button_width, self.button_height, action=plus_counter, text="+", font_size=font_size, bg_color=bg_color, text_color=text_color, outline_color=outline_color)

        super().__init__(
            x=x,
            y=y,
            space_inbetween=self.space_inbetween,
            elements=[self.text_label, self.minus_button, self.counter_label, self.plus_button]
        )

    @property
    def counter(self) -> int:
        return self._counter
    
    def reset_counter(self):
        self._counter = self.default_value
        self.counter_label.set_text(str(self._counter))

    def draw(self, screen):
        super().draw(screen)

        if self.counter > self.min_value:
            self.minus_button.enable()
        else:
            self.minus_button.disable()

        if self.counter < self.max_value:
            self.plus_button.enable()
        else:
            self.plus_button.disable()
