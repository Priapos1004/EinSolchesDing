from typing import Callable

from .popup import PopUp


class DecisionPopUp(PopUp):
    def __init__(self, x, y, text, screen, decision1_text: str, decision2_text: str, decision1_action: Callable = None, decision2_action: Callable = None):
        super().__init__(x,y,info_text=text, screen=screen, button1_text=decision1_text, button2_text=decision2_text, button1_action=decision1_action, button2_action=decision2_action, button1_color="dark green", button2_color="dark red", button1_hover_color="light green", button2_hover_color="light red")
