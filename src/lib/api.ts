const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function runPipeline(file: File) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/api/pipeline`, { method: 'POST', body: form });
  if (!res.ok) throw new Error((await res.json()).detail || 'Pipeline error');
  return res.json();
}

export async function detectClassical(file: File, minArea = 100) {
  const form = new FormData();
  form.append('file', file);
  form.append('min_area', String(minArea));
  const res = await fetch(`${API_BASE}/api/detect/classical`, { method: 'POST', body: form });
  if (!res.ok) throw new Error((await res.json()).detail || 'Detection error');
  return res.json();
}

export async function detectYolo(file: File, conf = 0.25) {
  const form = new FormData();
  form.append('file', file);
  form.append('conf', String(conf));
  const res = await fetch(`${API_BASE}/api/detect/yolo`, { method: 'POST', body: form });
  if (!res.ok) throw new Error((await res.json()).detail || 'YOLO error');
  return res.json();
}

export async function classifyImage(file: File) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/api/classify`, { method: 'POST', body: form });
  if (!res.ok) throw new Error((await res.json()).detail || 'Classification error');
  return res.json();
}

export async function applyTransform(file: File, operation: string, param = 1.5, file2?: File | null) {
  const form = new FormData();
  form.append('file', file);
  form.append('operation', operation);
  form.append('param', String(param));
  const res = await fetch(`${API_BASE}/api/transform`, { method: 'POST', body: form });
  if (!res.ok) throw new Error((await res.json()).detail || 'Transform error');
  return res.json();
}

export function b64ToUrl(b64: string): string {
  return `data:image/png;base64,${b64}`;
}
