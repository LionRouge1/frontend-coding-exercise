import { BaseBoxShapeUtil, HTMLContainer } from 'tldraw'

export const PIN_SHAPE_TYPE = 'pin'
export const PIN_DEFAULT_WIDTH = 30
export const PIN_DEFAULT_HEIGHT = 44

export class PinShapeUtil extends BaseBoxShapeUtil {
  static type = PIN_SHAPE_TYPE

  getDefaultProps() {
    return {
      w: PIN_DEFAULT_WIDTH,
      h: PIN_DEFAULT_HEIGHT,
      attachedShapeIds: [],
    }
  }

  canResize() {
    return false
  }

  canBind() {
    return false
  }

  hideRotateHandle() {
    return true
  }

  component(shape) {
    return (
      <HTMLContainer className="pin-shape">
        <div className="pin-shape__head" />
        <div className="pin-shape__stem" />
        <div className="pin-shape__tip" />
      </HTMLContainer>
    )
  }

  indicator(shape) {
    return <rect width={shape.props.w} height={shape.props.h} />
  }
}
