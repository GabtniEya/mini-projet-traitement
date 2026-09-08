import { useRef, useState, type DragEvent, type ChangeEvent } from 'react';

interface Props {
  onImageSelected: (file: File, previewUrl: string) => void;
  currentFile: File | null;
  previewUrl: string | null;
}

export default function ImageUploader({ onImageSelected, currentFile, previewUrl }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    onImageSelected(file, url);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    handleFiles(e.target.files);
    e.target.value = '';
  }

  return (
    <div className="section">
      <div className="section-title">Image source</div>
      <div
        className={`upload-zone ${dragging ? 'drag-over' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept="image/*" onChange={onChange} />
        <span className="upload-icon">🖼️</span>
        {currentFile ? (
          <>
            <h3>{currentFile.name}</h3>
            <p>{(currentFile.size / 1024).toFixed(1)} Ko · Cliquez pour changer</p>
          </>
        ) : (
          <>
            <h3>Glissez une image ici</h3>
            <p>ou cliquez pour sélectionner · JPG, PNG, BMP, WEBP</p>
          </>
        )}
      </div>
      {previewUrl && (
        <div className="image-preview" style={{ marginTop: 14 }}>
          <img src={previewUrl} alt="Aperçu" />
          <div className="img-label">Image originale · {currentFile?.name}</div>
        </div>
      )}
    </div>
  );
}
