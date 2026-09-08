const FEATURES = [
  { icon: '🔬', title: 'Pipeline TP1→TP6', desc: 'Négatif, symétrie, niveaux de gris, contours, flou, Sobel, Otsu, morphologie.', badge: 'Traitement classique' },
  { icon: '🔍', title: 'Détection classique', desc: 'Seuillage Otsu + opérations morphologiques (ouverture) + labélisation des composantes connexes.', badge: 'Segmentation' },
  { icon: '🤖', title: 'YOLOv8 Deep Learning', desc: 'Détection et classification en temps réel avec le modèle YOLOv8n pré-entraîné sur COCO (80 classes).', badge: 'IA / CNN' },
  { icon: '🧠', title: 'Classification MobileNetV2', desc: 'Classification globale parmi 1000 catégories ImageNet. Top-5 avec scores de confiance.', badge: 'Transfer Learning' },
  { icon: '🎛️', title: 'Transformations', desc: 'Appliquez individuellement chaque filtre : médian, gaussien, Sobel, flou uniforme, etc.', badge: 'Exploration' },
  { icon: '📊', title: 'Historique Supabase', desc: 'Chaque analyse est sauvegardée en base de données pour un suivi complet.', badge: 'BDD' },
];

const TPS = [
  { id: 'TP1', color: '#dbeafe', title: 'Manipulation pixel', items: ['Négatif (255−p)', 'Symétrie horizontale/verticale', 'Rotation 90°', 'Comparaison Pillow'] },
  { id: 'TP2', color: '#dcfce7', title: 'Niveaux de gris & contours', items: ['Formule luminance BT.601', 'Gradient dx+dy > seuil', 'Comparaison Pillow'] },
  { id: 'TP3', color: '#fff7ed', title: 'Fusion & floutage', items: ['Fusion max (canaux RGB)', 'Flou uniforme nxn', 'Pillow BoxBlur'] },
  { id: 'TP5', color: '#fdf4ff', title: 'Filtrage avancé', items: ['Filtre médian', 'Filtre gaussien (σ)', 'Sobel (convolution)', 'Pillow FIND_EDGES'] },
  { id: 'TP6', color: '#fef2f2', title: 'Segmentation & morphologie', items: ['Seuillage d\'Otsu', 'Érosion / Dilatation', 'Ouverture / Fermeture', 'Comptage composantes connexes'] },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '40px 24px 32px', background: 'linear-gradient(180deg, var(--primary-50) 0%, white 100%)', borderBottom: '1px solid var(--neutral-200)', marginBottom: 32 }}>
        <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔭</div>
        <h2 style={{ fontSize: '1.75rem', marginBottom: 10 }}>Système de Détection et Comptage d'Objets</h2>
        <p style={{ maxWidth: 580, margin: '0 auto', fontSize: '0.95rem', color: 'var(--neutral-600)' }}>
          Mini-projet intégrant l'ensemble des TP de traitement d'images (TP1–TP6) et l'intelligence artificielle
          (YOLOv8 + MobileNetV2) pour détecter, segmenter, classer et compter des objets dans une image.
        </p>
      </div>

      {/* Features */}
      <div className="container">
        <div className="section">
          <div className="section-title">Fonctionnalités</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {FEATURES.map((f) => (
              <div className="card" key={f.title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ fontSize: '1.8rem', flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div className="card-title" style={{ marginBottom: 0 }}>{f.title}</div>
                    <span style={{ background: 'var(--primary-100)', color: 'var(--primary-700)', fontSize: '0.65rem', borderRadius: 8, padding: '1px 7px', fontWeight: 600, whiteSpace: 'nowrap' }}>{f.badge}</span>
                  </div>
                  <p style={{ fontSize: '0.82rem' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TP Recap */}
        <div className="section">
          <div className="section-title">Travaux Pratiques intégrés</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {TPS.map((tp) => (
              <div key={tp.id} style={{ background: tp.color, border: '1px solid var(--neutral-200)', borderRadius: 'var(--radius-md)', padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ background: 'var(--neutral-800)', color: 'white', borderRadius: 6, padding: '2px 8px', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{tp.id}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--neutral-800)' }}>{tp.title}</span>
                </div>
                <ul style={{ paddingLeft: 16, fontSize: '0.78rem', color: 'var(--neutral-700)', lineHeight: 1.6 }}>
                  {tp.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Architecture */}
        <div className="section">
          <div className="section-title">Architecture technique</div>
          <div className="card">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, fontSize: '0.82rem' }}>
              {[
                { layer: 'Frontend', items: ['React 18 + TypeScript', 'Vite', 'Supabase JS'] },
                { layer: 'Backend API', items: ['Python + FastAPI', 'Pillow / PIL', 'NumPy + SciPy'] },
                { layer: 'Deep Learning', items: ['PyTorch', 'Ultralytics YOLOv8', 'MobileNetV2 (torchvision)'] },
                { layer: 'Base de données', items: ['Supabase (PostgreSQL)', 'RLS activé', 'Historique des analyses'] },
              ].map((col) => (
                <div key={col.layer}>
                  <div style={{ fontWeight: 600, color: 'var(--neutral-700)', marginBottom: 6, fontSize: '0.85rem' }}>{col.layer}</div>
                  <ul style={{ paddingLeft: 14, color: 'var(--neutral-500)', lineHeight: 1.8 }}>
                    {col.items.map((i) => <li key={i}>{i}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
