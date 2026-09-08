"""TP6: Segmentation par seuillage et morphologie mathématique."""
import numpy as np
from PIL import Image
from scipy.ndimage import binary_erosion, binary_dilation, label


def threshold_manual(img: Image.Image, threshold: int = 128) -> Image.Image:
    gray = np.array(img.convert("L"), dtype=np.uint8)
    binary = (gray > threshold).astype(np.uint8) * 255
    return Image.fromarray(binary)


def threshold_otsu(img: Image.Image) -> tuple[Image.Image, int]:
    gray = np.array(img.convert("L"), dtype=np.uint8)
    hist, _ = np.histogram(gray, bins=256, range=(0, 256))
    total = gray.size
    sum_total = np.dot(np.arange(256), hist)
    sum_bg, w_bg, max_var, threshold = 0.0, 0, 0.0, 0
    for t in range(256):
        w_bg += hist[t]
        if w_bg == 0:
            continue
        w_fg = total - w_bg
        if w_fg == 0:
            break
        sum_bg += t * hist[t]
        mean_bg = sum_bg / w_bg
        mean_fg = (sum_total - sum_bg) / w_fg
        var_between = w_bg * w_fg * (mean_bg - mean_fg) ** 2
        if var_between > max_var:
            max_var = var_between
            threshold = t
    binary = (gray > threshold).astype(np.uint8) * 255
    return Image.fromarray(binary), threshold


def erosion(img: Image.Image, iterations: int = 2) -> Image.Image:
    arr = np.array(img.convert("L")) > 128
    eroded = binary_erosion(arr, iterations=iterations)
    return Image.fromarray((eroded * 255).astype(np.uint8))


def dilation(img: Image.Image, iterations: int = 2) -> Image.Image:
    arr = np.array(img.convert("L")) > 128
    dilated = binary_dilation(arr, iterations=iterations)
    return Image.fromarray((dilated * 255).astype(np.uint8))


def opening(img: Image.Image, iterations: int = 2) -> Image.Image:
    arr = np.array(img.convert("L")) > 128
    eroded = binary_erosion(arr, iterations=iterations)
    opened = binary_dilation(eroded, iterations=iterations)
    return Image.fromarray((opened * 255).astype(np.uint8))


def closing(img: Image.Image, iterations: int = 2) -> Image.Image:
    arr = np.array(img.convert("L")) > 128
    dilated = binary_dilation(arr, iterations=iterations)
    closed = binary_erosion(dilated, iterations=iterations)
    return Image.fromarray((closed * 255).astype(np.uint8))


def segment_and_count(img: Image.Image, threshold: int | None = None, morph_iter: int = 2) -> dict:
    if threshold is None:
        binary_img, threshold = threshold_otsu(img)
    else:
        binary_img = threshold_manual(img, threshold)

    # Clean with morphological opening
    cleaned = opening(binary_img, iterations=morph_iter)
    arr = np.array(cleaned) > 128

    labeled, num_features = label(arr)
    return {
        "binary": binary_img,
        "cleaned": cleaned,
        "labeled": labeled,
        "count": num_features,
        "threshold": threshold,
    }
