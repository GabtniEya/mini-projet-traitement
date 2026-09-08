"""Détecteur deep learning avec YOLOv8 pour détection et classification."""
import io
import numpy as np
from PIL import Image, ImageDraw, ImageFont

_model = None
_model_loaded = False


def _load_model():
    global _model, _model_loaded
    if _model_loaded:
        return _model
    try:
        from ultralytics import YOLO
        _model = YOLO("yolov8n.pt")
        _model_loaded = True
        return _model
    except Exception:
        _model_loaded = True
        return None


COCO_COLORS = [
    (220, 53, 69), (40, 167, 69), (0, 123, 255), (255, 193, 7),
    (23, 162, 184), (111, 66, 193), (253, 126, 20), (32, 201, 151),
    (102, 16, 242), (214, 51, 132), (39, 174, 96), (41, 128, 185),
]


def detect_with_yolo(img: Image.Image, conf_threshold: float = 0.25) -> dict:
    model = _load_model()

    if model is None:
        return _fallback_detect(img)

    try:
        results = model(img, conf=conf_threshold, verbose=False)
        result = results[0]

        annotated_img = img.convert("RGB").copy()
        draw = ImageDraw.Draw(annotated_img)

        objects = []
        class_counts: dict[str, int] = {}

        if result.boxes is not None:
            boxes = result.boxes
            for i, box in enumerate(boxes):
                x1, y1, x2, y2 = [int(v) for v in box.xyxy[0].tolist()]
                conf = float(box.conf[0])
                cls_id = int(box.cls[0])
                cls_name = model.names[cls_id]

                color = COCO_COLORS[cls_id % len(COCO_COLORS)]
                draw.rectangle([x1, y1, x2, y2], outline=color, width=3)
                label_text = f"{cls_name} {conf:.2f}"
                draw.rectangle([x1, y1 - 18, x1 + len(label_text) * 7, y1], fill=color)
                draw.text((x1 + 2, y1 - 16), label_text, fill=(255, 255, 255))

                objects.append({
                    "id": i + 1,
                    "class": cls_name,
                    "confidence": round(conf, 3),
                    "bbox": [x1, y1, x2 - x1, y2 - y1],
                })
                class_counts[cls_name] = class_counts.get(cls_name, 0) + 1

        return {
            "count": len(objects),
            "objects": objects,
            "class_counts": class_counts,
            "annotated": annotated_img,
            "model": "YOLOv8n",
        }
    except Exception as e:
        return _fallback_detect(img, error=str(e))


def classify_image(img: Image.Image) -> dict:
    """Classification globale de l'image avec ImageNet (torchvision)."""
    try:
        import torch
        import torchvision.transforms as T
        from torchvision import models

        transform = T.Compose([
            T.Resize(256),
            T.CenterCrop(224),
            T.ToTensor(),
            T.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
        ])

        model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.IMAGENET1K_V1)
        model.eval()

        tensor = transform(img.convert("RGB")).unsqueeze(0)
        with torch.no_grad():
            output = model(tensor)
        probs = torch.softmax(output[0], dim=0)
        top5 = torch.topk(probs, 5)

        weights = models.MobileNet_V2_Weights.IMAGENET1K_V1
        categories = weights.meta["categories"]
        top_classes = [
            {"class": categories[idx], "confidence": round(prob.item(), 4)}
            for idx, prob in zip(top5.indices, top5.values)
        ]
        return {"top_classes": top_classes, "model": "MobileNetV2"}
    except Exception as e:
        return {"top_classes": [], "model": "unavailable", "error": str(e)}


def _fallback_detect(img: Image.Image, error: str = "") -> dict:
    """Fallback: utilise la détection classique si YOLO indisponible."""
    from detection.classical_detector import detect_and_count_classical
    result = detect_and_count_classical(img)
    result["model"] = "classical_fallback"
    result["note"] = "YOLOv8 indisponible, détection classique utilisée"
    if error:
        result["error"] = error
    return result
