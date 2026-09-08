"""TP1: Manipulations de base des pixels - négatif, symétrie, rotation."""
import numpy as np
from PIL import Image


def apply_negative(img: Image.Image) -> Image.Image:
    arr = np.array(img.convert("RGB"), dtype=np.uint8)
    result = 255 - arr
    return Image.fromarray(result)


def apply_horizontal_flip(img: Image.Image) -> Image.Image:
    arr = np.array(img.convert("RGB"))
    result = arr[:, ::-1, :]
    return Image.fromarray(result.astype(np.uint8))


def apply_vertical_flip(img: Image.Image) -> Image.Image:
    arr = np.array(img.convert("RGB"))
    result = arr[::-1, :, :]
    return Image.fromarray(result.astype(np.uint8))


def apply_rotation_90(img: Image.Image) -> Image.Image:
    arr = np.array(img.convert("RGB"))
    result = np.rot90(arr)
    return Image.fromarray(result.astype(np.uint8))


def apply_negative_pillow(img: Image.Image) -> Image.Image:
    from PIL import ImageOps
    return ImageOps.invert(img.convert("RGB"))


def apply_flip_pillow(img: Image.Image) -> Image.Image:
    return img.transpose(Image.FLIP_LEFT_RIGHT)
