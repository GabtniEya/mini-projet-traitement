/*
  # Système de Détection et Comptage d'Objets - Tables

  ## Nouvelles Tables
  - `analyses`: Stocke chaque analyse d'image
    - id, image_name, image_data_url, object_count, detected_classes, processing_params, created_at
  - `detection_results`: Résultats détaillés par objet détecté
    - id, analysis_id, class_name, confidence, bbox_x, bbox_y, bbox_w, bbox_h

  ## Sécurité
  - RLS activé sur toutes les tables
  - Accès public en lecture/écriture pour la démo (sans authentification requise)
*/

CREATE TABLE IF NOT EXISTS analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_name text NOT NULL DEFAULT '',
  thumbnail_url text DEFAULT '',
  object_count integer NOT NULL DEFAULT 0,
  detected_classes jsonb DEFAULT '[]'::jsonb,
  processing_params jsonb DEFAULT '{}'::jsonb,
  pipeline_steps jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS detection_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id uuid NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  class_name text NOT NULL DEFAULT '',
  confidence float DEFAULT 0.0,
  bbox_x float DEFAULT 0.0,
  bbox_y float DEFAULT 0.0,
  bbox_w float DEFAULT 0.0,
  bbox_h float DEFAULT 0.0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE detection_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analyses"
  ON analyses FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read analyses"
  ON analyses FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert detection results"
  ON detection_results FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read detection results"
  ON detection_results FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_detection_results_analysis_id ON detection_results(analysis_id);
