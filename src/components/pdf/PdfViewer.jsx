export default function PdfViewer({ document }) {
  return (
    <section className="viewer-panel">
      {document ? (
        <object
          data={document.dataUrl}
          type="application/pdf"
          className="pdf-viewer"
          aria-label={document.name}
        >
          <p>
            This browser cannot render PDFs inline.{' '}
            <a href={document.dataUrl} download={document.name}>
              Download {document.name}
            </a>
          </p>
        </object>
      ) : (
        <div className="viewer-placeholder">
          Select a document from the list to preview it.
        </div>
      )}
    </section>
  )
}
