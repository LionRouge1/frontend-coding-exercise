import { BaseBoxShapeUtil, HTMLContainer } from 'tldraw'
import { CAMERA_SHAPE_TYPE } from './cameraExport'

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
      <HTMLContainer className="camera-shape" style={{ pointerEvents: 'all' }}>
        <div className="camera-shape__frame" />
      </HTMLContainer>
    )
  }

  indicator(shape) {
    return <rect width={shape.props.w} height={shape.props.h} />
  }
}
