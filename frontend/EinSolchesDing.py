import pygame
from ui_elements import (Button, DecisionPopUp, Frame, InfoPopUp, Navigation,
                         NumCounter, PopUp, Switch)

from backend.einsolchesding import EinSolchesDing

# Initialize Pygame
pygame.init()

nav = Navigation()
pygame.display.set_caption("EinSolchesDing")

### create main frame ###
main_frame = Frame()

def change_screen():
    player_frame = create_game()
    nav.add_frame(player_frame, "player_screen")

    nav.current_state = "player_screen"

def exit_game():
    nav.running = False

def back_to_menu():
    nav.current_state = "main"

start_button = Button(nav.screen_width // 2, nav.screen_height // 2.5, 200, 100, action=change_screen, text='Start')
main_frame.add_element(start_button, "start_button")

exit_button = Button(nav.screen_width // 2, nav.screen_height // 2.5 + 150, 200, 100, action=exit_game, text='Exit')
main_frame.add_element(exit_button, "exit_button")

player_counter = NumCounter(nav.screen_width // 2, nav.screen_height // 2.5 - 150, 2, 5, 2, "Players:")
main_frame.add_element(player_counter, "player_counter")

nav.add_frame(main_frame, "main")

### create game frame ###
class ESDFrame(Frame):
    def __init__(self, player_number: int):
        self.screen_color = (0,0,0)
        self.game = EinSolchesDing()
        self.game.generate_round(player_number, "en")

        self.elements = [] # list with all elements of the frame
        self.static_elements = {}

        self.win_popup = PopUp(nav.screen_width // 2, nav.screen_height // 2 - 100, info_text=f"The winner is player {self.game.get_winner() + 1}!!!", screen=nav.screen, button1_action=back_to_menu, button1_text="YOLO!!!", button1_color="dark yellow", button1_hover_color="light yellow", button2_action=None, button2_color=None, button2_hover_color=None, button2_text="")

        self.update_elements()

    def add_element(self, element, element_name: str):
        self.static_elements[element_name] = element

    def update_elements(self):
        self.current_view = self.game.player_number
        
        if "view_switch" in self.static_elements:
            self.static_elements["view_switch"].set_text(("played", f"player {self.game.current_player+1}"))
            self.static_elements["view_switch"].select_button1()

        self.elements = []
        for player_idx, player_list in enumerate(self.game.player_cards):
            self.elements.append({})
            for idx, card in enumerate(player_list):
                self.elements[player_idx][card+"_label"] = self.create_popup_button(nav.screen_width // 2, nav.screen_height // 10 + 80 + 83*idx, card, player_list[card], True)

        self.elements.append({})
        for idx, card in enumerate(self.game.played_cards):
            self.elements[self.game.player_number][card+"_label"] = self.create_popup_button(nav.screen_width // 2, nav.screen_height // 10 + 80 + 83*idx, card, self.game.played_cards[card], False)

    def create_popup_button(self, x, y, keyword, info, select_button):
        def accept_action():
            if not self.game.check_card_playable():
                InfoPopUp(nav.screen_width // 2, nav.screen_height // 2 - 100, f"The maximum number of cards has been played (max = {self.game.max_cards}). The loser button has to be used.", nav.screen).activate_popup()
            elif self.game.get_zero_card() != -1:
                InfoPopUp(nav.screen_width // 2, nav.screen_height // 2 - 100, f"The previous player has no cards left. The loser button has to be used.", nav.screen).activate_popup()
            else:
                self.game.playcard(keyword)
                self.static_elements["view_switch"].set_text(("played", f"player {self.game.current_player+1}"))
                self.current_view = self.game.player_number
                self.update_elements()

        if select_button:
            info = InfoPopUp(nav.screen_width // 2, nav.screen_height // 2 - 100, info, nav.screen, accept_action)
        else:
            info = InfoPopUp(nav.screen_width // 2, nav.screen_height // 2 - 100, info, nav.screen, None)

        button_info = Button(x, y, 400, 75, action=info.activate_popup, text=keyword)
        return button_info

    def draw(self, screen):
        screen.fill(self.screen_color)

        for element in self.elements[self.current_view].values():
            element.draw(screen)

        for element in self.static_elements.values():
            element.draw(screen)

        if self.game.get_winner() != -1:
            self.win_popup.set_info_text(f"The winner is player {self.game.get_winner() + 1}!!!")
            self.win_popup.activate_popup()

    def click_listen(self, pos):
        for element in self.elements[self.current_view].values():
            element.click_listen(pos)

        for element in self.static_elements.values():
            element.click_listen(pos)

    def hover_listen(self, pos):
        for element in self.elements[self.current_view].values():
            element.hover_listen(pos)

        for element in self.static_elements.values():
            element.hover_listen(pos)


def create_game():
    game_frame = ESDFrame(player_counter.counter)

    def view_switch_played():
        game_frame.current_view = game_frame.game.player_number

    def view_switch_player():
        game_frame.current_view = game_frame.game.current_player

    view_switch = Switch(nav.screen_width // 2, nav.screen_height // 10, 100, 50, ("played", "player 1"), (view_switch_played, view_switch_player))
    game_frame.add_element(view_switch, "view_switch")

    back_button = Button(110, nav.screen_height - 130, 120, 60, action=back_to_menu, text="back")
    game_frame.add_element(back_button, "back_button")

    def prev_lost_action():
        game_frame.game.draw_two_cards((game_frame.game.current_player-1)%game_frame.game.player_number)
        game_frame.update_elements()

    def prev_won_action():
        game_frame.game.draw_two_cards(game_frame.game.current_player)
        game_frame.game.current_player = (game_frame.game.current_player - 1)%game_frame.game.player_number
        game_frame.update_elements()

    loser_decision = DecisionPopUp(nav.screen_width // 2, nav.screen_height // 2 - 100, text="Was the previous player able to name a valid thing?", screen=nav.screen, decision1_action=prev_won_action, decision2_action=prev_lost_action, decision1_text="Yes", decision2_text="No")
    loser_button = Button(nav.screen_width - 110, nav.screen_height - 130, 120, 60, action=loser_decision.activate_popup, text="loser")
    game_frame.add_element(loser_button, "loser_button")

    return game_frame

### start game ###
nav.info()
nav.run_game()
