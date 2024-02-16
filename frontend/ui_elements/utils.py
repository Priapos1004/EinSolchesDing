COLOR_MAP = {
    "white": (255, 255, 255),
    "w": (255, 255, 255),
    "black": (0, 0, 0),
    "green": (0, 255, 0),
    "g": (0, 255, 0),
    "blue": (0, 0, 255),
    "b": (0, 0, 255),
    "red": (255, 0, 0),
    "r": (255, 0, 0),
    "grey": (128, 128, 128),
    "light green": (144, 238, 144),
    "dark green": (0, 100, 0),
    "light blue": (173, 216, 230),
    "dark blue": (0, 0, 139),
    "light red": (255, 182, 193),
    "dark red": (139, 0, 0),
    "light grey": (200, 200, 200),
    "dark grey": (55, 55, 55),
    "yellow": (255, 255, 0),
    "light yellow": (255, 255, 224),
    "dark yellow": (204, 204, 0),
    "purple": (128, 0, 128),
    "light purple": (216, 191, 216),
    "dark purple": (75, 0, 130),
    "orange": (255, 165, 0),
    "light orange": (255, 224, 178),
    "dark orange": (255, 140, 0),
    "cyan": (0, 255, 255),
    "light cyan": (224, 255, 255),
    "dark cyan": (0, 139, 139),
    None: None,
}

def get_color(name: str) -> tuple[int, int, int] | None:
    return COLOR_MAP.get(name, "Color not found")
    
def get_color_name(color: tuple[int, int, int]) -> str | None:
    return {v: k for k, v in COLOR_MAP.items()}.get(color, "Color not found")
