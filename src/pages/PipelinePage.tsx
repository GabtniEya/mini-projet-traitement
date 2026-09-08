import { useState } from 'react';
import { runPipeline, b64ToUrl } from '../lib/api';
import ImageUploader from '../components/ImageUploader';

interface Step {
  name: string;
  image: string;
  description: string;
}

interface PipelineResult {
  original: string;
  steps: Step[];
  width: number;
  height: number;
}

export default function PipelinePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PipelineResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleRun() {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const data = await runPipeline(file);
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }

  function tpLabel(name: string) {
    const m = name.match(/^(TP\d+)/);
    return m ? m[1] : 'TP';
  }

  return (
    <div>
      <div className="section">
        <div className="card-title">Pipeline de traitement complet</div>
        <p style={{ marginTop: 4, marginBottom: 16 }}>
          Visualisez chaque étape du traitement : TP1 → TP2 → TP3 → TP5 → TP6.
        </p>
        <ImageUploader
          onImageSelected={(f, url) => { setFile(f); setPreview(url); setResult(null); }}
          currentFile={file}
          previewUrl={preview}
        />
        <div className="btn-group">
          <button className="btn btn-primary" onClick={handleRun} disabled={!file || loading}>
            {loading ? '⏳ Traitement...' : '▶ Lancer le pipeline'}
          </button>
          {result && (
            <button className="btn btn-secondary" onClick={() => setResult(null)}>
              Réinitialiser
            </button>
          )}
        </div>
        {error && <div className="alert alert-error" style={{ marginTop: 12 }}>⚠ {error}</div>}
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <p>Exécution du pipeline en cours...</p>
        </div>
      )}

      {result && (
        <div className="section">
          <div className="section-title">
            Résultats — {result.width}×{result.height}px · {result.steps.length} étapes
          </div>
          <div className="pipeline-grid">
            <div className="step-card">
              <img src={b64ToUrl(result.original)} alt="Original" />
              <div className="step-info">
                <span className="step-badge">ORIGINAL</span>
                <div className="step-name">Image originale</div>
                <div className="step-desc">Avant tout traitement</div>
              </div>
            </div>
            {result.steps.map((step) => (
              <div className="step-card" key={step.name}>
                <img src={b64ToUrl(step.image)} alt={step.name} />
                <div className="step-info">
                  <span className="step-badge">{tpLabel(step.name)}</span>
                  <div className="step-name">{step.name.replace(/^TP\d+ - /, '')}</div>
                  <div className="step-desc">{step.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
