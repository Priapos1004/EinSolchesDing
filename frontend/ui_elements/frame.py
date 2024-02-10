from .utils import get_color


class Frame:
    def __init__(self, screen_color: tuple = get_color("black")):
        self.screen_color = screen_color
        self.elements = {} # list with all elements of the frame

    def info(self):
        print(f"screen color: {self.screen_color}")
        for element in self.elements:
            print(f"{element} : {self.elements[element].__class__.__name__}")

    def add_element(self, element, element_name: str):
        self.elements[element_name] = element

    def remove_element(self, element_name: str):
        self.elements.pop(element_name)

    def draw(self, screen):
        screen.fill(self.screen_color)

        for element in self.elements.values():
            element.draw(screen)

    def click_listen(self, pos):
        for element in self.elements.values():
            element.click_listen(pos)

    def hover_listen(self, pos):
        for element in self.elements.values():
            element.hover_listen(pos)
