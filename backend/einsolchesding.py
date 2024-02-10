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
        self.player_number = 2
    
    def generate_round(self, player_number: int, language: Literal["de", "en"] = "de"):
        self.player_number = player_number
        data_shuffled = self.data.sample(frac=1).reset_index(drop=True)

        # select language
        data_shuffled = data_shuffled.drop(columns=[col for col in data_shuffled.columns if language not in col])
        data_shuffled.columns = [col.split("_")[0] for col in data_shuffled.columns]
        
        player_cards_df = [data_shuffled.iloc[i*7:(i+1)*7] for i in range(player_number)]
        draw_stack_df = data_shuffled.iloc[player_number*7:]

        self.player_cards = [pd.Series(sample["info"].values, index=sample.keyword).to_dict() for sample in player_cards_df]
        self.draw_stack = pd.Series(draw_stack_df["info"].values, index=draw_stack_df.keyword).to_dict()

    def get_player(self, player: int) -> dict:
        return self.player_cards[player]
    
    def get_played_cards(self) -> dict:
        return self.played_cards
    
    def playcard(self, keyword: str):
        self.played_cards[keyword] = self.player_cards[self.current_player][keyword]
        self.player_cards[self.current_player].pop(keyword)
        self.current_player = (self.current_player + 1) % self.player_number
        
    def draw_two_cards(self, player: int):
        key1, key2 = list(self.draw_stack.keys())[:2]
        self.player_cards[player][key1] = self.draw_stack[key1]
        self.player_cards[player][key2] = self.draw_stack[key2]
        self.draw_stack.pop(key1)
        self.draw_stack.pop(key2)
