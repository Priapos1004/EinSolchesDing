def get_color(name: str) -> tuple[int, int, int] | None:
    if name in ("white", "w"):
        return (255, 255, 255)
    elif name in ("black", "b"):
        return (0, 0, 0)
    elif name in ("green", "g"):
        return (0, 255, 0)
    elif name in ("blue", "b"):
        return (0, 0, 255)
    elif name in ("red", "r"):
        return (255, 0, 0)
    elif name == "grey":
        return (128, 128, 128)
    elif name is None:
        return None
    else:
        raise ValueError(f"The following color was not found: {name}")
    
def get_hover_color(name: str) -> tuple[int, int, int] | None:
    if name in ("white", "w"):
        return (200, 200, 200)
    elif name in ("black", "b"):
        return (55, 55, 55)
    elif name in ("green", "g"):
        return (0, 200, 0)
    elif name in ("blue", "b"):
        return (0, 0, 200)
    elif name in ("red", "r"):
        return (200, 0, 0)
    elif name == "grey":
        return (100, 100, 100)
    elif name is None:
        return None
    else:
        raise ValueError(f"The following color was not found: {name}")
