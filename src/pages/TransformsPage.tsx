import { useState } from 'react';
import { applyTransform, b64ToUrl } from '../lib/api';
import ImageUploader from '../components/ImageUploader';

const OPERATIONS = [
  { id: 'negative', label: 'Négatif', icon: '🔄', tp: 'TP1' },
  { id: 'flip_h', label: 'Miroir H', icon: '↔️', tp: 'TP1' },
  { id: 'rotate90', label: 'Rotation 90°', icon: '↩️', tp: 'TP1' },
  { id: 'grayscale', label: 'Niveaux de gris', icon: '🌑', tp: 'TP2' },
  { id: 'edges', label: 'Contours', icon: '📐', tp: 'TP2' },
  { id: 'blur', label: 'Flou', icon: '💧', tp: 'TP3' },
  { id: 'median', label: 'Médian', icon: '📊', tp: 'TP5' },
  { id: 'gaussian', label: 'Gaussien', icon: '〰️', tp: 'TP5' },
  { id: 'sobel', label: 'Sobel', icon: '⚡', tp: 'TP5' },
];

export default function TransformsPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultImg, setResultImg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sigma, setSigma] = useState(1.5);

  async function handleApply(opId: string) {
    if (!file) return;
    setOp(opId);
    setLoading(true);
    setError(null);
    setResultImg(null);
    try {
      const data = await applyTransform(file, opId, sigma);
      setResultImg(data.image);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="section">
        <div className="card-title">Transformations individuelles</div>
        <p style={{ marginTop: 4, marginBottom: 16 }}>
          Appliquez une seule transformation à la fois pour observer l'effet pixel par pixel.
        </p>
        <ImageUploader
          onImageSelected={(f, url) => { setFile(f); setPreview(url); setResultImg(null); }}
          currentFile={file}
          previewUrl={preview}
        />

        {file && (
          <>
            <div className="section-title">Choisir une transformation</div>
            <div className="transform-grid">
              {OPERATIONS.map((o) => (
                <button
                  key={o.id}
                  className={`transform-btn ${op === o.id ? 'active' : ''}`}
                  onClick={() => handleApply(o.id)}
                  disabled={loading}
                >
                  <span className="transform-icon">{o.icon}</span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--neutral-400)', marginBottom: 2 }}>{o.tp}</div>
                  {o.label}
                </button>
              ))}
            </div>

            {op === 'gaussian' && (
              <div style={{ marginTop: 14 }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--neutral-700)', display: 'block', marginBottom: 6 }}>Sigma (σ)</label>
                <div className="range-wrap">
                  <input type="range" min={0.5} max={5} step={0.5} value={sigma} onChange={e => setSigma(+e.target.value)} />
                  <span className="range-val">{sigma}</span>
                </div>
              </div>
            )}
          </>
        )}
        {error && <div className="alert alert-error" style={{ marginTop: 12 }}>⚠ {error}</div>}
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <p>Application de la transformation...</p>
        </div>
      )}

      {resultImg && !loading && (
        <div className="section">
          <div className="section-title">Résultat : {OPERATIONS.find(o => o.id === op)?.label}</div>
          <div className="two-col">
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--neutral-500)', marginBottom: 6 }}>Avant</div>
              <div className="image-preview"><img src={preview!} alt="Avant" /></div>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--neutral-500)', marginBottom: 6 }}>Après</div>
              <div className="image-preview"><img src={b64ToUrl(resultImg)} alt="Après" /><div className="img-label">{OPERATIONS.find(o => o.id === op)?.label}</div></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 