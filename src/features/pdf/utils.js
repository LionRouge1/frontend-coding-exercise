export function formatBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function isPdfFile(file) {
  const fileName = file.name?.toLowerCase() ?? ''
  return file.type === 'application/pdf' || fileName.endsWith('.pdf')
}

export function readPdfAsDataUrl(file, onProgress) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onprogress = (event) => {
      if (!event.lengthComputable) {
        return
      }
      const progress = Math.min(100, Math.round((event.loaded / event.total) * 100))
      onProgress(progress)
    }

    reader.onload = () => {
      onProgress(100)
      resolve(reader.result)
    }
    reader.onerror = () => reject(new Error(`Failed to read "${file.name}".`))
    reader.onabort = () => reject(new Error(`Reading "${file.name}" was aborted.`))

    reader.readAsDataURL(file)
  })
}
