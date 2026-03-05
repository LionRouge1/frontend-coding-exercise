import { useRef, useState } from 'react'
import { usePdfManager } from '../hooks/usePdfManager'
import DocumentsList from './pdf/DocumentsList'
import MessageList from './pdf/MessageList'
import PdfDropzone from './pdf/PdfDropzone'
import PdfViewer from './pdf/PdfViewer'
import UploadProgressList from './pdf/UploadProgressList'
import './DisplayPdfPage.css'

export default function DisplayPdfPage() {
  const [isDragActive, setIsDragActive] = useState(false)
  const addInputRef = useRef(null)
  const replaceInputRef = useRef(null)

  const {
    documents,
    selectedDoc,
    selectedDocId,
    uploading,
    messages,
    renameDrafts,
    setSelectedDocId,
    processFiles,
    renameDocument,
    removeDocument,
    startRename,
    cancelRename,
    setRenameDraft,
    setReplaceTargetId,
  } = usePdfManager()

  function onDrop(event) {
    event.preventDefault()
    setIsDragActive(false)
    processFiles(event.dataTransfer.files, 'add')
  }

  function onSelectAddFilesClick() {
    if (!addInputRef.current) {
      return
    }
    addInputRef.current.value = ''
    addInputRef.current.click()
  }

  function onReplaceClick(docId) {
    setReplaceTargetId(docId)
    if (!replaceInputRef.current) {
      return
    }
    replaceInputRef.current.value = ''
    replaceInputRef.current.click()
  }

  return (
    <div className="pdf-page">
      <PdfDropzone
        isDragActive={isDragActive}
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragActive(true)
        }}
        onDragLeave={() => setIsDragActive(false)}
        onDrop={onDrop}
        onSelectClick={onSelectAddFilesClick}
        addInputRef={addInputRef}
        replaceInputRef={replaceInputRef}
        onAddChange={(event) => processFiles(event.target.files, 'add')}
        onReplaceChange={(event) => processFiles(event.target.files, 'replace')}
      />

      <UploadProgressList items={uploading} />
      <MessageList messages={messages} />

      <div className="pdf-layout">
        <DocumentsList
          documents={documents}
          selectedDocId={selectedDocId}
          renameDrafts={renameDrafts}
          onSelect={setSelectedDocId}
          onStartRename={startRename}
          onReplace={onReplaceClick}
          onRemove={removeDocument}
          onRenameChange={setRenameDraft}
          onRenameSave={renameDocument}
          onRenameCancel={cancelRename}
        />
        <PdfViewer document={selectedDoc} />
      </div>
    </div>
  )
}
