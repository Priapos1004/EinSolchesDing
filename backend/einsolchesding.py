from typing import Literal

import pandas as pd


class EinSolchesDing:
    def __init__(self, folder_path: str = "backend/", file_path: str = "EinSolchesDing_de_en.csv"):
        self.data_folder_path = folder_path
        self.data_file = file_path

        self.data: pd.DataFrame = pd.read_csv(folder_path+file_path)

        self.player_cards: list[dict] = []
        self.draw_stack: dict = {}
        self.played_cards: dict = {}

        self.current_player = 0
        self._player_number = 2
        self._max_cards = 7 # only draw cards if less then _max_cars cards

        self._winner = -1 # changes to idx of player who won
        self._zero_cards = -1 # changes to current player idx if he/she played last card

    @property
    def player_number(self) -> int:
        return self._player_number

    @property
    def max_cards(self) -> int:
        return self._max_cards

    def set_max_cards(self, max_cards: int):
        self._max_cards = max_cards

    def get_zero_card(self) -> int:
        return self._zero_cards

    def get_winner(self) -> int:
        return self._winner
    
    def check_card_playable(self) -> bool:
        return len(self.played_cards) + 1 <= self.max_cards

    def reset_variables(self):
        self.current_player = 0
        self._winner = -1
        self._zero_cards = -1
        self.played_cards: dict = {}
    
    def generate_round(self, player_number: int, language: Literal["de", "en"] = "de", start_card_number: int = 7):
        self.reset_variables()
        self._player_number = player_number

        data_shuffled = self.data.sample(frac=1).reset_index(drop=True)

        # select language
        data_shuffled = data_shuffled.drop(columns=[col for col in data_shuffled.columns if language not in col])
        data_shuffled.columns = [col.split("_")[0] for col in data_shuffled.columns]
        
        player_cards_df = [data_shuffled.iloc[i*start_card_number:(i+1)*start_card_number] for i in range(player_number)]
        draw_stack_df = data_shuffled.iloc[player_number*start_card_number:]

        self.player_cards = [pd.Series(sample["info"].values, index=sample.keyword).to_dict() for sample in player_cards_df]
        self.draw_stack = pd.Series(draw_stack_df["info"].values, index=draw_stack_df.keyword).to_dict()

    def get_player(self, player: int) -> dict:
        return self.player_cards[player]
    
    def get_played_cards(self) -> dict:
        return self.played_cards
    
    def playcard(self, keyword: str):
        if self.check_card_playable():

            if self._zero_cards != -1:
                return

            self.played_cards[keyword] = self.player_cards[self.current_player][keyword]
            self.player_cards[self.current_player].pop(keyword)

            if not self.player_cards[self.current_player]:
                self._zero_cards = self.current_player

            self.current_player = (self.current_player + 1) % self._player_number

    def _draw_card(self, player: int):
        key = list(self.draw_stack.keys())[0]
        self.player_cards[player][key] = self.draw_stack[key]
        self.draw_stack.pop(key)
        
    def draw_two_cards(self, player: int):
        if len(self.player_cards[player]) <= self.max_cards - 2:
            self._draw_card(player)
            self._draw_card(player)
        elif len(self.player_cards[player]) == self.max_cards - 1:
            self._draw_card(player)
        else:
            pass

        if self._zero_cards != -1:
            if player != self._zero_cards:
                self._winner = self._zero_cards
            else:
                self._zero_cards = -1

        # reset played cards
        self.played_cards: dict = {}
