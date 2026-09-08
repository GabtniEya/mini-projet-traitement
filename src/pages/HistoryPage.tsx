import { useEffect, useState } from 'react';
import { supabase, type Analysis } from '../lib/supabase';

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('analyses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setAnalyses((data as Analysis[]) || []);
        setLoading(false);
      });
  }, []);

  function fmt(dateStr: string) {
    return new Date(dateStr).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="spinner" />
        <p>Chargement de l'historique...</p>
      </div>
    );
  }

  if (analyses.length === 0) {
    return (
      <div className="empty-state" style={{ marginTop: 40 }}>
        <div className="empty-icon">📋</div>
        <h3>Aucune analyse</h3>
        <p>Effectuez une détection pour la voir apparaître ici.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="section">
        <div className="card-title">Historique des analyses</div>
        <p style={{ marginTop: 4, marginBottom: 20 }}>{analyses.length} analyse{analyses.length > 1 ? 's' : ''} enregistrée{analyses.length > 1 ? 's' : ''}</p>
        <div className="history-grid">
          {analyses.map((a) => (
            <div className="history-card" key={a.id}>
              <div className="history-info">
                <div className="history-name">{a.image_name || 'Sans nom'}</div>
                <div className="history-date">{fmt(a.created_at)}</div>
                <div className="history-count">{a.object_count} objet{a.object_count > 1 ? 's' : ''}</div>
                {Array.isArray(a.detected_classes) && a.detected_classes.length > 0 && (
                  <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {a.detected_classes.slice(0, 3).map((cls) => (
                      <span key={cls} style={{ fontSize: '0.65rem', background: 'var(--primary-50)', color: 'var(--primary-700)', border: '1px solid var(--primary-200)', borderRadius: 8, padding: '1px 6px' }}>
                        {cls}
                      </span>
                    ))}
                    {a.detected_classes.length > 3 && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--neutral-400)' }}>+{a.detected_classes.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
