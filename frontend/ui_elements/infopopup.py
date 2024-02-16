from typing import Callable

from .popup import PopUp


class InfoPopUp(PopUp):
    def __init__(self, x: int, y: int, text: str, screen, accept_action: Callable = None):
        def close_button():
            pass

        super().__init__(x,y,info_text=text, screen=screen, button1_text="select", button2_text="close", button1_action=accept_action, button2_action=close_button, button1_color="dark green", button2_color="dark red", button1_hover_color="light green", button2_hover_color="light red")
