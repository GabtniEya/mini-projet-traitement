"""Détecteur classique basé sur la segmentation (TP6)."""
""""filtrage de taille pour eviter les petits artefacts"""
import numpy as np
from PIL import Image, ImageDraw
from scipy.ndimage import label, find_objects
from processing.tp6_segmentation import segment_and_count


def detect_and_count_classical(img: Image.Image, min_area: int = 100) -> dict:
    result = segment_and_count(img)
    labeled = result["labeled"]
    count_raw = result["count"]

    objects = find_objects(labeled)
    valid_objects = []
    for i, slc in enumerate(objects):
        if slc is None:
            continue
        region = labeled[slc] == (i + 1)
        area = region.sum()
        if area < min_area: 
            continue
        y_slice, x_slice = slc
        valid_objects.append({
            "id": i + 1,
            "bbox": [x_slice.start, y_slice.start, x_slice.stop - x_slice.start, y_slice.stop - y_slice.start],
            "area": int(area),
            "class": "objet",
            "confidence": 1.0,
        })

    annotated = img.convert("RGB").copy()
    draw = ImageDraw.Draw(annotated)
    for obj in valid_objects:
        x, y, w, h = obj["bbox"]
        draw.rectangle([x, y, x + w, y + h], outline=(0, 200, 100), width=2)
        draw.text((x + 2, y + 2), f"#{obj['id']}", fill=(0, 200, 100))

    return {
        "count": len(valid_objects),
        "objects": valid_objects,
        "annotated": annotated,
        "binary": result["binary"],
        "cleaned": result["cleaned"],
        "threshold": result["threshold"],
    }
