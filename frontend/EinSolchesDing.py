import pygame
from ui_elements import Button, Frame, Label, Navigation, NumCounter, Switch

from backend.einsolchesding import EinSolchesDing

# Initialize Pygame
pygame.init()

nav = Navigation()

### create main frame ###
main_frame = Frame()

def change_screen():
    player_frame = create_game()
    nav.add_frame(player_frame, "player_screen")

    nav.current_state = "player_screen"

def exit_game():
    nav.running = False

start_button = Button(nav.screen_width // 2 - 100, nav.screen_height // 2.5, 200, 100, action=change_screen, text='Start')
main_frame.add_element(start_button, "start_button")

exit_button = Button(nav.screen_width // 2 - 100, nav.screen_height // 2.5 + 150, 200, 100, action=exit_game, text='Exit')
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

        self.current_view = self.game.current_player

        self.update_elements()

    def add_element(self, element, element_name: str):
        self.static_elements[element_name] = element

    def update_elements(self):
        for player_idx, player_list in enumerate(self.game.player_cards):
            self.elements.append({})
            for idx, card in enumerate(player_list):
                self.elements[player_idx][card+"_label"] = Label(nav.screen_width // 2, nav.screen_height // 10 + 100 + 75*idx, card)

        self.elements.append({})
        for idx, card in enumerate(self.game.played_cards):
            self.elements[self.game.player_number][card+"_label"] = Label(nav.screen_width // 2, nav.screen_height // 10 + 100 + 75*idx, card)

    def draw(self, screen):
        screen.fill(self.screen_color)

        for element in self.elements[self.current_view].values():
            element.draw(screen)

        for element in self.static_elements.values():
            element.draw(screen)

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

    def back_to_menu():
        nav.current_state = "main"
        player_counter.reset_counter()

    def view_switch_played():
        game_frame.current_view = game_frame.game.player_number

    def view_switch_player():
        game_frame.current_view = game_frame.game.current_player

    view_switch = Switch(nav.screen_width // 2, nav.screen_height // 10, 100, 50, ("played", "player"), (view_switch_played, view_switch_player), font_size=20)
    game_frame.add_element(view_switch, "view_switch")

    back_button = Button(50, nav.screen_height - 150, 100, 50, action=back_to_menu, text="back")
    game_frame.add_element(back_button, "back_button")

    return game_frame

### start game ###
nav.info()
nav.run_game()
