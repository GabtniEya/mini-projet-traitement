"""API FastAPI - Système de Détection et Comptage d'Objets."""
import io
import base64
import os
import sys
from pathlib import Path

from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from PIL import Image
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

sys.path.insert(0, str(Path(__file__).parent))

from processing.tp1_basic import apply_negative, apply_horizontal_flip, apply_rotation_90
from processing.tp2_grayscale_edges import to_grayscale_manual, detect_edges_numpy
from processing.tp3_fusion_blur import blur_numpy
from processing.tp5_advanced_filters import median_filter_scipy, gaussian_filter_scipy, sobel_filter
from processing.tp6_segmentation import threshold_otsu, opening
from detection.classical_detector import detect_and_count_classical
from detection.deep_detector import detect_with_yolo, classify_image

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.getenv("VITE_SUPABASE_ANON_KEY", "")

app = FastAPI(title="Image Object Detection API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def img_to_base64(img: Image.Image, fmt: str = "PNG") -> str:
    buf = io.BytesIO()
    img.save(buf, format=fmt)
    return base64.b64encode(buf.getvalue()).decode("utf-8")


def load_image(file: UploadFile) -> Image.Image:
    data = file.file.read()
    img = Image.open(io.BytesIO(data))
    return img.convert("RGB")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/pipeline")
async def run_pipeline(file: UploadFile = File(...)):
    """Pipeline complet: du prétraitement à la détection."""
    try:
        original = load_image(file)
        steps = []

        # TP1: Négatif
        negative = apply_negative(original)
        steps.append({"name": "TP1 - Négatif", "image": img_to_base64(negative), "description": "Inversion des valeurs pixel: 255 - pixel"})

        # TP2: Niveaux de gris
        gray = to_grayscale_manual(original)
        steps.append({"name": "TP2 - Niveaux de gris", "image": img_to_base64(gray), "description": "Formule luminance: 0.299R + 0.587G + 0.114B"})

        # TP2: Détection de contours
        edges = detect_edges_numpy(original, threshold=25)
        steps.append({"name": "TP2 - Détection contours", "image": img_to_base64(edges), "description": "Gradient dx + dy > seuil"})

        # TP3: Floutage
        blurred = blur_numpy(original, kernel_size=5)
        steps.append({"name": "TP3 - Floutage", "image": img_to_base64(blurred), "description": "Filtre uniforme 5×5 sur voisinage"})

        # TP5: Filtre médian
        median = median_filter_scipy(blurred, size=3)
        steps.append({"name": "TP5 - Filtre médian", "image": img_to_base64(median), "description": "Médiane des voisins 3×3 pour éliminer le bruit"})

        # TP5: Filtre Gaussien
        gauss = gaussian_filter_scipy(original, sigma=1.5)
        steps.append({"name": "TP5 - Filtre gaussien", "image": img_to_base64(gauss), "description": "Lissage gaussien σ=1.5"})

        # TP5: Sobel
        sobel = sobel_filter(gauss)
        steps.append({"name": "TP5 - Filtre Sobel", "image": img_to_base64(sobel), "description": "Détection de contours par convolution Sobel"})

        # TP6: Seuillage Otsu
        binary, otsu_thresh = threshold_otsu(original)
        steps.append({"name": f"TP6 - Seuillage Otsu (t={otsu_thresh})", "image": img_to_base64(binary), "description": "Maximisation de la variance inter-classes"})

        # TP6: Morphologie (ouverture)
        opened = opening(binary, iterations=2)
        steps.append({"name": "TP6 - Morphologie (ouverture)", "image": img_to_base64(opened), "description": "Érosion puis dilatation pour nettoyer les objets"})

        return JSONResponse({
            "original": img_to_base64(original),
            "steps": steps,
            "width": original.width,
            "height": original.height,
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/detect/classical")
async def detect_classical(file: UploadFile = File(...), min_area: int = Form(100)):
    """Détection classique basée sur la segmentation (TP6)."""
    try:
        img = load_image(file)
        result = detect_and_count_classical(img, min_area=min_area)
        return JSONResponse({
            "count": result["count"],
            "objects": result["objects"],
            "annotated": img_to_base64(result["annotated"]),
            "binary": img_to_base64(result["binary"]),
            "cleaned": img_to_base64(result["cleaned"]),
            "threshold": result["threshold"],
            "method": "classical",
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/detect/yolo")
async def detect_yolo(file: UploadFile = File(...), conf: float = Form(0.25)):
    """Détection deep learning avec YOLOv8."""
    try:
        img = load_image(file)
        result = detect_with_yolo(img, conf_threshold=conf)
        return JSONResponse({
            "count": result["count"],
            "objects": result["objects"],
            "class_counts": result.get("class_counts", {}),
            "annotated": img_to_base64(result["annotated"]),
            "model": result.get("model", "unknown"),
            "method": "deep_learning",
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/classify")
async def classify(file: UploadFile = File(...)):
    """Classification globale de l'image avec MobileNetV2."""
    try:
        img = load_image(file)
        result = classify_image(img)
        return JSONResponse(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/transform")
async def transform(
    file: UploadFile = File(...),
    operation: str = Form("negative"),
    param: float = Form(1.5),
):
    """Applique une transformation individuelle (TP1-TP5)."""
    try:
        img = load_image(file)
        ops = {
            "negative": lambda i: apply_negative(i),
            "flip_h": lambda i: apply_horizontal_flip(i),
            "rotate90": lambda i: apply_rotation_90(i),
            "grayscale": lambda i: to_grayscale_manual(i).convert("RGB"),
            "edges": lambda i: detect_edges_numpy(i, threshold=30).convert("RGB"),
            "blur": lambda i: blur_numpy(i, kernel_size=5),
            "median": lambda i: median_filter_scipy(i, size=3),
            "gaussian": lambda i: gaussian_filter_scipy(i, sigma=param),
            "sobel": lambda i: sobel_filter(i).convert("RGB"),
        }
        if operation not in ops:
            raise HTTPException(status_code=400, detail=f"Opération inconnue: {operation}")
        output = ops[operation](img)
        return JSONResponse({"image": img_to_base64(output), "operation": operation})
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
