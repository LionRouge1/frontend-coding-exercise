export default function PdfDropzone({
  isDragActive,
  onDragOver,
  onDragLeave,
  onDrop,
  onSelectClick,
  addInputRef,
  replaceInputRef,
  onAddChange,
  onReplaceChange,
}) {
  return (
    <div
      className={`dropzone ${isDragActive ? 'dropzone--active' : ''}`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <p>Drag and drop PDF files here</p>
      <p className="dropzone__hint">
        Max 4 MB per file. Max total 12 MB. Multiple files are supported.
      </p>
      <button type="button" onClick={onSelectClick}>
        Select PDF documents
      </button>
      <input
        ref={addInputRef}
        type="file"
        accept="application/pdf,.pdf"
        multiple
        hidden
        onChange={onAddChange}
      />
      <input
        ref={replaceInputRef}
        type="file"
        accept="application/pdf,.pdf"
        hidden
        onChange={onReplaceChange}
      />
    </div>
  )
}
