
import { useState } from 'react';
import { classifyImage } from '../lib/api';
import ImageUploader from '../components/ImageUploader';

interface TopClass {
  class: string;
  confidence: number;
}

interface ClassResult {
  top_classes: TopClass[];
  model: string;
  error?: string;
}

export default function ClassificationPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ClassResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClassify() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const data = await classifyImage(file);
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  const top = result?.top_classes[0];
  const maxConf = result?.top_classes[0]?.confidence ?? 1;

  return (
    <div>
      <div className="section">
        <div className="card-title">Classification d'image (MobileNetV2)</div>
        <p style={{ marginTop: 4, marginBottom: 16 }}>
          Classifie l'image dans 1000 catégories ImageNet grâce à un réseau MobileNetV2 pré-entraîné.
        </p>
        <ImageUploader
          onImageSelected={(f, url) => { setFile(f); setPreview(url); setResult(null); }}
          currentFile={file}
          previewUrl={preview}
        />
        <div className="btn-group">
          <button className="btn btn-success" onClick={handleClassify} disabled={!file || loading}>
            {loading ? '⏳ Classification...' : '🧠 Classifier l\'image'}
          </button>
        </div>
        {error && <div className="alert alert-error" style={{ marginTop: 12 }}>⚠ {error}</div>}
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <p>Inférence MobileNetV2 (ImageNet)...</p>
        </div>
      )}

      {result && (
        <div className="section">
          {result.error ? (
            <div className="alert alert-error">⚠ Modèle indisponible: {result.error}</div>
          ) : (
            <>
              {top && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: '16px 20px', background: 'var(--secondary-50)', border: '1px solid var(--secondary-100)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '2.5rem' }}>🏷️</div>
                  <div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--neutral-800)' }}>{top.class}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--secondary-600)', marginTop: 2 }}>
                      Confiance : {(top.confidence * 100).toFixed(1)}% · <span className="model-badge" style={{ background: 'var(--secondary-700)' }}>{result.model}</span>
                    </div>
                  </div>
                </div>
              )}
              <div className="section-title">Top 5 prédictions</div>
              <div className="classification-list">
                {result.top_classes.map((item, i) => (
                  <div className="cls-item" key={item.class}>
                    <span className="cls-rank">#{i + 1}</span>
                    <div className="cls-bar-wrap">
                      <div className="cls-name">{item.class}</div>
                      <div className="cls-bar">
                        <div className="cls-bar-fill" style={{ width: `${(item.confidence / maxConf) * 100}%` }} />
                      </div>
                    </div>
                    <span className="cls-pct">{(item.confidence * 100).toFixed(2)}%</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
