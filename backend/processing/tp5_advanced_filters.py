"""TP5: Filtrage avancé - médian, lissage, Gaussien, Sobel."""
import numpy as np
from PIL import Image, ImageFilter
from scipy.ndimage import median_filter, gaussian_filter


def median_filter_manual(img: Image.Image, size: int = 3) -> Image.Image:
    arr = np.array(img.convert("RGB"), dtype=np.uint8)
    h, w, c = arr.shape
    k = size // 2
    result = arr.copy()
    for y in range(k, h - k):
        for x in range(k, w - k):
            window = arr[y - k:y + k + 1, x - k:x + k + 1]
            result[y, x] = np.median(window.reshape(-1, c), axis=0)
    return Image.fromarray(result)


def median_filter_scipy(img: Image.Image, size: int = 3) -> Image.Image:
    arr = np.array(img.convert("RGB"), dtype=np.uint8)
    result = median_filter(arr, size=(size, size, 1))
    return Image.fromarray(result.astype(np.uint8))


def gaussian_filter_scipy(img: Image.Image, sigma: float = 1.5) -> Image.Image:
    arr = np.array(img.convert("RGB"), dtype=np.float32)
    result = gaussian_filter(arr, sigma=(sigma, sigma, 0))
    return Image.fromarray(result.astype(np.uint8))


def gaussian_filter_pillow(img: Image.Image, radius: int = 2) -> Image.Image:
    return img.filter(ImageFilter.GaussianBlur(radius))


def sobel_filter(img: Image.Image) -> Image.Image:
    gray = np.array(img.convert("L"), dtype=np.float32)
    kx = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], dtype=np.float32)
    ky = np.array([[-1, -2, -1], [0, 0, 0], [1, 2, 1]], dtype=np.float32)
    from scipy.ndimage import convolve
    gx = convolve(gray, kx)
    gy = convolve(gray, ky)
    magnitude = np.sqrt(gx ** 2 + gy ** 2)
    magnitude = (magnitude / magnitude.max() * 255).astype(np.uint8)
    return Image.fromarray(magnitude)


def sobel_filter_pillow(img: Image.Image) -> Image.Image:
    return img.convert("L").filter(ImageFilter.FIND_EDGES)


def sharpen_pillow(img: Image.Image) -> Image.Image:
    return img.filter(ImageFilter.SHARPEN)
