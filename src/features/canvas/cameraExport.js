export const CAMERA_SHAPE_TYPE = 'camera'

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export async function exportCameraCrop(editor, cameraShapeId) {
  const cameraShape = editor.getShape(cameraShapeId)
  if (!cameraShape || cameraShape.type !== CAMERA_SHAPE_TYPE) {
    return false
  }

  const bounds = editor.getShapePageBounds(cameraShape)
  if (!bounds) {
    return false
  }

  const shapeIds = editor
    .getCurrentPageShapesSorted()
    .filter((shape) => {
      return (
        shape.type !== CAMERA_SHAPE_TYPE &&
        shape.parentId === cameraShape.parentId
      )
    })
    .map((shape) => shape.id)

  if (shapeIds.length === 0) {
    return false
  }

  const { blob } = await editor.toImage(shapeIds, {
    format: 'png',
    bounds,
    padding: 0,
    background: true,
    pixelRatio: 2,
  })

  downloadBlob(blob, `canvas-crop-${Date.now()}.png`)
  return true
}
