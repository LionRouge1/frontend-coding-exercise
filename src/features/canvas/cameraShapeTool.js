import { BaseBoxShapeTool } from 'tldraw'
import {
  CAMERA_DEFAULT_HEIGHT,
  CAMERA_DEFAULT_WIDTH,
  CameraShapeUtil,
} from './cameraShapeUtil.jsx'

export class CameraShapeTool extends BaseBoxShapeTool {
  static id = CameraShapeUtil.type
  static initial = 'idle'
  shapeType = CameraShapeUtil.type

  onCreate(shape) {
    if (!shape) {
      return
    }

    this.editor.updateShape({
      id: shape.id,
      type: CameraShapeUtil.type,
      props: {
        w: CAMERA_DEFAULT_WIDTH,
        h: CAMERA_DEFAULT_HEIGHT,
      },
    })

    if (this.editor.getInstanceState().isToolLocked) {
      this.editor.setCurrentTool(CameraShapeUtil.type)
      return
    }

    this.editor.setCurrentTool('select.idle')
  }
}
