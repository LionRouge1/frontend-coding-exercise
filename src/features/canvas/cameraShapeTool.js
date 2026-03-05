import { BaseBoxShapeTool } from 'tldraw'
import {
  CameraShapeUtil,
} from './cameraShapeUtil.jsx'
import { CAMERA_SHAPE_TYPE } from './cameraExport'

export class CameraShapeTool extends BaseBoxShapeTool {
  static id = CameraShapeUtil.type
  static initial = 'idle'
  shapeType = CameraShapeUtil.type

  onCreate(shape) {
    if (!shape) {
      return
    }

    // Keep only one active camera crop shape at a time.
    // This makes camera crops behave like a transient crop tool.
    const camerasToDelete = this.editor
      .getCurrentPageShapesSorted()
      .filter(
        (currentShape) =>
          currentShape.type === CAMERA_SHAPE_TYPE && currentShape.id !== shape.id,
      )
      .map((currentShape) => currentShape.id)

    if (camerasToDelete.length > 0) {
      this.editor.deleteShapes(camerasToDelete)
    }

    const width = Math.max(80, shape.props.w)
    const height = Math.max(60, shape.props.h)
    if (width !== shape.props.w || height !== shape.props.h) {
      this.editor.updateShape({
        id: shape.id,
        type: CameraShapeUtil.type,
        props: { w: width, h: height },
      })
    }

    if (this.editor.getInstanceState().isToolLocked) {
      this.editor.setCurrentTool(CameraShapeUtil.type)
      return
    }

    this.editor.setCurrentTool('select.idle')
  }
}
