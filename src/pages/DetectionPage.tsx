import { useState } from 'react';
import { detectClassical, detectYolo, b64ToUrl } from '../lib/api';
import { supabase } from '../lib/supabase';
import ImageUploader from '../components/ImageUploader';

interface DetectedObject {
  id: number;
  class: string;
  confidence: number;
  bbox: [number, number, number, number];
}

interface DetectionResult {
  count: number;
  objects: DetectedObject[];
  class_counts?: Record<string, number>;
  annotated: string;
  binary?: string;
  cleaned?: string;
  threshold?: number;
  model?: string;
  method: string;
}

interface Props {
  mode: 'classical' | 'yolo';
}

export default function DetectionPage({ mode }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [minArea, setMinArea] = useState(100);
  const [conf, setConf] = useState(0.25);
  const [showBinary, setShowBinary] = useState(false);

  async function handleDetect() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const data = mode === 'classical'
        ? await detectClassical(file, minArea)
        : await detectYolo(file, conf);
      setResult(data);

      // Save to Supabase
      const classes = data.class_counts
        ? Object.keys(data.class_counts)
        : [...new Set(data.objects.map((o: DetectedObject) => o.class))];
      await supabase.from('analyses').insert({
        image_name: file.name,
        object_count: data.count,
        detected_classes: classes,
        processing_params: mode === 'classical' ? { min_area: minArea } : { conf },
        pipeline_steps: [mode],
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  const isYolo = mode === 'yolo';
  const title = isYolo ? 'Détection Deep Learning (YOLOv8)' : 'Détection Classique (TP6)';
  const desc = isYolo
    ? 'YOLOv8 détecte et classe les objets en un seul passage du réseau de neurones.'
    : 'Segmentation par seuillage Otsu + morphologie mathématique + comptage des composantes.';

  return (
    <div>
      <div className="section">
        <div className="card-title">{title}</div>
        <p style={{ marginTop: 4, marginBottom: 16 }}>{desc}</p>
        <ImageUploader
          onImageSelected={(f, url) => { setFile(f); setPreview(url); setResult(null); }}
          currentFile={file}
          previewUrl={preview}
        />

        {/* Params */}
        <div style={{ marginBottom: 16 }}>
          {!isYolo ? (
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--neutral-700)', display: 'block', marginBottom: 6 }}>
                Surface minimale des objets (pixels)
              </label>
              <div className="range-wrap">
                <input type="range" min={10} max={1000} step={10} value={minArea} onChange={e => setMinArea(+e.target.value)} />
                <span className="range-val">{minArea}</span>
              </div>
            </div>
          ) : (
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--neutral-700)', display: 'block', marginBottom: 6 }}>
                Seuil de confiance
              </label>
              <div className="range-wrap">
                <input type="range" min={0.1} max={0.9} step={0.05} value={conf} onChange={e => setConf(+e.target.value)} />
                <span className="range-val">{conf.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="btn-group">
          <button className="btn btn-primary" onClick={handleDetect} disabled={!file || loading}>
            {loading ? '⏳ Analyse...' : `🔍 Détecter les objets`}
          </button>
        </div>
        {error && <div className="alert alert-error" style={{ marginTop: 12 }}>⚠ {error}</div>}
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <p>{isYolo ? 'Inférence YOLOv8...' : 'Segmentation + morphologie...'}</p>
        </div>
      )}

      {result && (
        <>
          {/* Count */}
          <div className="count-section">
            <div className="count-badge">{result.count}</div>
            <div>
              <div className="count-label">
                {result.count === 0 ? 'Aucun objet détecté' : `${result.count} objet${result.count > 1 ? 's' : ''} détecté${result.count > 1 ? 's' : ''}`}
              </div>
              <div className="count-sub">
                Méthode : {result.method} &nbsp;·&nbsp;
                {result.model && <span className={`model-badge ${isYolo ? 'yolo' : 'classical'}`}>{result.model}</span>}
                {result.threshold !== undefined && ` · Seuil Otsu: ${result.threshold}`}
              </div>
            </div>
          </div>

          <div className="detection-results">
            {/* Annotated image */}
            <div>
              <div className="section-title">Image annotée</div>
              <div className="image-preview">
                <img src={b64ToUrl(result.annotated)} alt="Annotée" />
                <div className="img-label">Résultat détection</div>
              </div>
              {!isYolo && result.binary && (
                <div style={{ marginTop: 10 }}>
                  <button className="btn btn-secondary" style={{ fontSize: '0.75rem' }} onClick={() => setShowBinary(!showBinary)}>
                    {showBinary ? 'Masquer' : 'Voir'} image binaire / nettoyée
                  </button>
                  {showBinary && (
                    <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div className="image-preview"><img src={b64ToUrl(result.binary!)} alt="Binaire" /><div className="img-label">Seuillage Otsu</div></div>
                      <div className="image-preview"><img src={b64ToUrl(result.cleaned!)} alt="Nettoyée" /><div className="img-label">Après morphologie</div></div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Object list */}
            <div>
              <div className="section-title">Objets détectés ({result.count})</div>
              {result.class_counts && Object.keys(result.class_counts).length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--neutral-500)', marginBottom: 6 }}>Par classe :</div>
                  <div className="class-chips">
                    {Object.entries(result.class_counts).map(([cls, n]) => (
                      <div className="class-chip" key={cls}>
                        {cls} <span className="chip-count">{n}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {result.objects.length === 0 ? (
                <div className="empty-state" style={{ padding: 24 }}>
                  <div className="empty-icon">🔍</div>
                  <h3>Aucun objet</h3>
                  <p>Essayez de baisser le seuil ou la surface minimale.</p>
                </div>
              ) : (
                <div className="object-list">
                  {result.objects.map((obj) => (
                    <div className="object-item" key={obj.id}>
                      <div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--neutral-400)', marginRight: 6 }}>#{obj.id}</span>
                        <span className="obj-class">{obj.class}</span>
                      </div>
                      <span className="obj-conf">{(obj.confidence * 100).toFixed(0)}%</span>
                      <span className="obj-bbox">{obj.bbox[2]}×{obj.bbox[3]}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
