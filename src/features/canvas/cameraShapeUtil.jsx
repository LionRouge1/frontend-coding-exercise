import { BaseBoxShapeUtil, HTMLContainer } from 'tldraw'
import { CAMERA_SHAPE_TYPE, exportCameraCrop } from './cameraExport'

export const CAMERA_DEFAULT_WIDTH = 320
export const CAMERA_DEFAULT_HEIGHT = 220

export class CameraShapeUtil extends BaseBoxShapeUtil {
  static type = CAMERA_SHAPE_TYPE

  getDefaultProps() {
    return {
      w: CAMERA_DEFAULT_WIDTH,
      h: CAMERA_DEFAULT_HEIGHT,
    }
  }

  canBind() {
    return false
  }

  component(shape) {
    return (
      <HTMLContainer className="camera-shape">
        <div className="camera-shape__frame" />
        <button
          className="camera-shape__export"
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={async (event) => {
            event.stopPropagation()
            try {
              const exported = await exportCameraCrop(this.editor, shape.id)
              if (!exported) {
                window.alert('Add content inside the camera crop area to export.')
              }
            } catch {
              window.alert('Unable to export this crop right now.')
            }
          }}
        >
          Export PNG
        </button>
      </HTMLContainer>
    )
  }

  indicator(shape) {
    return <rect width={shape.props.w} height={shape.props.h} />
  }
}
