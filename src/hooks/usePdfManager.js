import { useMemo, useState } from 'react'
import { MAX_FILE_SIZE_BYTES, MAX_TOTAL_SIZE_BYTES } from '../features/pdf/constants'
import { loadDocumentsFromStorage, saveDocumentsToStorage } from '../features/pdf/storage'
import { isPdfFile, readPdfAsDataUrl } from '../features/pdf/utils'

function getInitialDocuments() {
  return loadDocumentsFromStorage()
}

function getInitialSelectedDocId() {
  return getInitialDocuments()[0]?.id ?? null
}

export function usePdfManager() {
  const [documents, setDocuments] = useState(getInitialDocuments)
  const [selectedDocId, setSelectedDocId] = useState(getInitialSelectedDocId)
  const [uploading, setUploading] = useState([])
  const [messages, setMessages] = useState([])
  const [renameDrafts, setRenameDrafts] = useState({})
  const [replaceTargetId, setReplaceTargetId] = useState(null)

  const selectedDoc = useMemo(
    () => documents.find((doc) => doc.id === selectedDocId) ?? null,
    [documents, selectedDocId],
  )

  function pushMessage(text) {
    setMessages((current) => [...current, text])
  }

  function saveDocuments(nextDocs) {
    try {
      saveDocumentsToStorage(nextDocs)
      setDocuments(nextDocs)
      if (!nextDocs.some((doc) => doc.id === selectedDocId)) {
        setSelectedDocId(nextDocs[0]?.id ?? null)
      }
      return true
    } catch {
      pushMessage('Storage is full. Remove documents or use smaller files.')
      return false
    }
  }

  function validateIncomingFiles(fileList, mode) {
    if (mode === 'replace' && !replaceTargetId) {
      pushMessage('No target document selected for replacement.')
      return []
    }

    if (mode === 'replace' && fileList.length > 1) {
      pushMessage('Replace accepts one PDF at a time. Only the first file will be used.')
      return [fileList[0]]
    }

    const replacingDoc =
      mode === 'replace' ? documents.find((doc) => doc.id === replaceTargetId) : null
    const currentTotalSize = documents.reduce((sum, doc) => sum + doc.size, 0)
    const totalSizeBaseline = replacingDoc
      ? currentTotalSize - replacingDoc.size
      : currentTotalSize
    let consumedBudget = 0

    const validFiles = []
    for (const file of fileList) {
      if (!isPdfFile(file)) {
        pushMessage(`"${file.name}" is not a PDF file.`)
        continue
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        pushMessage(`"${file.name}" is too large. Max size is 4 MB per file.`)
        continue
      }

      if (mode === 'add') {
        const duplicate = documents.some(
          (doc) =>
            doc.name === file.name &&
            doc.size === file.size &&
            doc.lastModified === file.lastModified,
        )
        if (duplicate) {
          pushMessage(`"${file.name}" already exists in your collection.`)
          continue
        }
      }

      if (totalSizeBaseline + consumedBudget + file.size > MAX_TOTAL_SIZE_BYTES) {
        pushMessage(
          `"${file.name}" exceeds storage budget. Keep total uploaded files under 12 MB.`,
        )
        continue
      }

      consumedBudget += file.size
      validFiles.push(file)
    }

    return validFiles
  }

  async function processFiles(files, mode = 'add') {
    const fileList = Array.from(files || [])
    if (fileList.length === 0) {
      return
    }

    const validFiles = validateIncomingFiles(fileList, mode)
    if (validFiles.length === 0) {
      return
    }

    const uploadItems = validFiles.map((file) => ({
      id: `${Date.now()}-${file.name}-${Math.random()}`,
      name: file.name,
      progress: 0,
    }))
    setUploading((current) => [...current, ...uploadItems])

    const createdDocs = []
    for (const [index, file] of validFiles.entries()) {
      const uploadItem = uploadItems[index]
      try {
        const dataUrl = await readPdfAsDataUrl(file, (progress) => {
          setUploading((current) =>
            current.map((item) =>
              item.id === uploadItem.id ? { ...item, progress } : item,
            ),
          )
        })

        createdDocs.push({
          id: mode === 'replace' ? replaceTargetId : crypto.randomUUID(),
          name: file.name,
          size: file.size,
          dataUrl,
          addedAt: new Date().toISOString(),
          lastModified: file.lastModified,
        })
      } catch (error) {
        pushMessage(error.message)
      } finally {
        setUploading((current) => current.filter((item) => item.id !== uploadItem.id))
      }
    }

    if (createdDocs.length === 0) {
      return
    }

    if (mode === 'replace' && replaceTargetId) {
      const replacement = createdDocs[0]
      const nextDocs = documents.map((doc) =>
        doc.id === replaceTargetId
          ? {
              ...doc,
              name: replacement.name,
              size: replacement.size,
              dataUrl: replacement.dataUrl,
              addedAt: replacement.addedAt,
              lastModified: replacement.lastModified,
            }
          : doc,
      )

      if (saveDocuments(nextDocs)) {
        setSelectedDocId(replaceTargetId)
      }
      setReplaceTargetId(null)
      return
    }

    const nextDocs = [...documents, ...createdDocs]
    if (saveDocuments(nextDocs)) {
      setSelectedDocId(createdDocs[0].id)
    }
  }

  function renameDocument(docId) {
    const draft = (renameDrafts[docId] || '').trim()
    if (!draft) {
      pushMessage('Document name cannot be empty.')
      return
    }

    const withExtension = draft.toLowerCase().endsWith('.pdf') ? draft : `${draft}.pdf`
    const nextDocs = documents.map((doc) =>
      doc.id === docId ? { ...doc, name: withExtension } : doc,
    )
    if (saveDocuments(nextDocs)) {
      setRenameDrafts((current) => {
        const next = { ...current }
        delete next[docId]
        return next
      })
    }
  }

  function removeDocument(docId) {
    const nextDocs = documents.filter((doc) => doc.id !== docId)
    saveDocuments(nextDocs)
  }

  function startRename(docId) {
    const doc = documents.find((item) => item.id === docId)
    if (!doc) {
      return
    }
    setRenameDrafts((current) => ({
      ...current,
      [docId]: doc.name.replace(/\.pdf$/i, ''),
    }))
  }

  function cancelRename(docId) {
    setRenameDrafts((current) => {
      const next = { ...current }
      delete next[docId]
      return next
    })
  }

  function setRenameDraft(docId, value) {
    setRenameDrafts((current) => ({
      ...current,
      [docId]: value,
    }))
  }

  return {
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
  }
}
