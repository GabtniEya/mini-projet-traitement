"""TP2: Niveaux de gris et détection de contours par luminance."""
import numpy as np
from PIL import Image


def to_grayscale_manual(img: Image.Image) -> Image.Image:
    arr = np.array(img.convert("RGB"), dtype=np.float32)
    # ITU-R BT.601 luminance formula
    gray = 0.299 * arr[:, :, 0] + 0.587 * arr[:, :, 1] + 0.114 * arr[:, :, 2]
    return Image.fromarray(gray.astype(np.uint8))


def detect_edges_manual(img: Image.Image, threshold: int = 30) -> Image.Image:
    gray = np.array(to_grayscale_manual(img), dtype=np.int32)
    h, w = gray.shape
    edges = np.zeros((h, w), dtype=np.uint8)
    for y in range(1, h - 1):
        for x in range(1, w - 1):
            dx = abs(int(gray[y, x + 1]) - int(gray[y, x - 1]))
            dy = abs(int(gray[y + 1, x]) - int(gray[y - 1, x]))
            if dx + dy > threshold:
                edges[y, x] = 255
    return Image.fromarray(edges)


def detect_edges_numpy(img: Image.Image, threshold: int = 30) -> Image.Image:
    gray = np.array(to_grayscale_manual(img), dtype=np.int32)
    dx = np.abs(np.roll(gray, -1, axis=1) - np.roll(gray, 1, axis=1))
    dy = np.abs(np.roll(gray, -1, axis=0) - np.roll(gray, 1, axis=0))
    edges = (dx + dy > threshold).astype(np.uint8) * 255
    return Image.fromarray(edges)


def to_grayscale_pillow(img: Image.Image) -> Image.Image:
    return img.convert("L")
