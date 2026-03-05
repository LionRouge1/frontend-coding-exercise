import { BaseBoxShapeTool } from 'tldraw'
import {
  PIN_DEFAULT_HEIGHT,
  PIN_DEFAULT_WIDTH,
  PIN_SHAPE_TYPE,
} from './pinShapeUtil.jsx'

export class PinShapeTool extends BaseBoxShapeTool {
  static id = PIN_SHAPE_TYPE
  static initial = 'idle'
  shapeType = PIN_SHAPE_TYPE

  onCreate(shape) {
    if (!shape) {
      return
    }

    this.editor.updateShape({
      id: shape.id,
      type: PIN_SHAPE_TYPE,
      props: {
        w: PIN_DEFAULT_WIDTH,
        h: PIN_DEFAULT_HEIGHT,
      },
    })

    if (this.editor.getInstanceState().isToolLocked) {
      this.editor.setCurrentTool(PIN_SHAPE_TYPE)
      return
    }

    this.editor.setCurrentTool('select.idle')
  }
}
