import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Analysis = {
  id: string;
  image_name: string;
  thumbnail_url: string;
  object_count: number;
  detected_classes: string[];
  processing_params: Record<string, unknown>;
  pipeline_steps: string[];
  created_at: string;
};
