import { STORAGE_KEY } from './constants'

function isValidDocument(doc) {
  return (
    typeof doc?.id === 'string' &&
    typeof doc?.name === 'string' &&
    typeof doc?.dataUrl === 'string' &&
    typeof doc?.size === 'number'
  )
}

export function loadDocumentsFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(isValidDocument)
  } catch {
    return []
  }
}

export function saveDocumentsToStorage(documents) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(documents))
}
