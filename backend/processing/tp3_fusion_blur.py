"""TP3: Fusion d'images et floutage spatial."""
import numpy as np
from PIL import Image, ImageFilter


def fuse_images_max(img1: Image.Image, img2: Image.Image) -> Image.Image:
    a1 = np.array(img1.convert("RGB"), dtype=np.uint8)
    a2 = np.array(img2.resize(img1.size).convert("RGB"), dtype=np.uint8)
    fused = np.maximum(a1, a2)
    return Image.fromarray(fused)


def fuse_images_blend(img1: Image.Image, img2: Image.Image, alpha: float = 0.5) -> Image.Image:
    a1 = np.array(img1.convert("RGB"), dtype=np.float32)
    a2 = np.array(img2.resize(img1.size).convert("RGB"), dtype=np.float32)
    blended = (alpha * a1 + (1 - alpha) * a2).clip(0, 255).astype(np.uint8)
    return Image.fromarray(blended)


def blur_manual(img: Image.Image, kernel_size: int = 3) -> Image.Image:
    arr = np.array(img.convert("RGB"), dtype=np.float32)
    h, w, c = arr.shape
    k = kernel_size // 2
    result = arr.copy()
    for y in range(k, h - k):
        for x in range(k, w - k):
            result[y, x] = arr[y - k:y + k + 1, x - k:x + k + 1].mean(axis=(0, 1))
    return Image.fromarray(result.astype(np.uint8))


def blur_numpy(img: Image.Image, kernel_size: int = 5) -> Image.Image:
    arr = np.array(img.convert("RGB"), dtype=np.float32)
    from scipy.ndimage import uniform_filter
    result = uniform_filter(arr, size=(kernel_size, kernel_size, 1))
    return Image.fromarray(result.astype(np.uint8))


def blur_pillow(img: Image.Image, radius: int = 2) -> Image.Image:
    return img.filter(ImageFilter.BoxBlur(radius))
