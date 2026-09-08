import { useState } from 'react';
import HomePage from './pages/HomePage';
import PipelinePage from './pages/PipelinePage';
import DetectionPage from './pages/DetectionPage';
import ClassificationPage from './pages/ClassificationPage';
import TransformsPage from './pages/TransformsPage';
import HistoryPage from './pages/HistoryPage';

type Tab = 'home' | 'pipeline' | 'classical' | 'yolo' | 'classify' | 'transforms' | 'history';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'home', label: 'Accueil', icon: '🏠' },
  { id: 'pipeline', label: 'Pipeline TP1→TP6', icon: '⚙️' },
  { id: 'classical', label: 'Détection Classique', icon: '🔍' },
  { id: 'yolo', label: 'Détection YOLOv8', icon: '🤖' },
  { id: 'classify', label: 'Classification IA', icon: '🧠' },
  { id: 'transforms', label: 'Transformations', icon: '🎛️' },
  { id: 'history', label: 'Historique', icon: '📋' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');

  function renderPage() {
    switch (activeTab) {
      case 'home': return <HomePage />;
      case 'pipeline': return <div className="container"><PipelinePage /></div>;
      case 'classical': return <div className="container"><DetectionPage mode="classical" /></div>;
      case 'yolo': return <div className="container"><DetectionPage mode="yolo" /></div>;
      case 'classify': return <div className="container"><ClassificationPage /></div>;
      case 'transforms': return <div className="container"><TransformsPage /></div>;
      case 'history': return <div className="container"><HistoryPage /></div>;
    }
  }

  return (
    <>
      <header className="app-header">
        <div className="inner">
          <div>
            <h1>🔭 ObjectDetect</h1>
            <div className="subtitle">Détection · Segmentation · Comptage · Deep Learning</div>
          </div>
          <span className="header-badge">Mini-Projet Traitement d'Images</span>
        </div>
      </header>

      <nav className="nav-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </nav>

      <main className="main-content">
        {renderPage()}
      </main>
    </>
  );
}
