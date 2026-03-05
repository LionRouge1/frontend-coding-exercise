import { useEffect, useMemo, useRef, useState } from 'react'
import {
  DefaultToolbar,
  DefaultToolbarContent,
  Tldraw,
  ToolbarItem,
} from 'tldraw'
import 'tldraw/tldraw.css'
import { CAMERA_SHAPE_TYPE, exportCameraCrop } from '../features/canvas/cameraExport'
import { installPinAttachmentBehavior } from '../features/canvas/pinAttachments'
import { CameraShapeTool } from '../features/canvas/cameraShapeTool'
import { CameraShapeUtil } from '../features/canvas/cameraShapeUtil.jsx'
import { PinShapeTool } from '../features/canvas/pinShapeTool'
import { PIN_SHAPE_TYPE, PinShapeUtil } from '../features/canvas/pinShapeUtil.jsx'
import './CanvasPage.css'

function CanvasToolbar() {
  return (
    <DefaultToolbar>
      <DefaultToolbarContent />
      <ToolbarItem tool={CAMERA_SHAPE_TYPE} />
      <ToolbarItem tool={PIN_SHAPE_TYPE} />
    </DefaultToolbar>
  )
}

export default function CanvasPage() {
  const [editor, setEditor] = useState(null)
  const disposeAttachmentsRef = useRef(null)

  const tools = useMemo(() => [PinShapeTool, CameraShapeTool], [])
  const shapeUtils = useMemo(() => [PinShapeUtil, CameraShapeUtil], [])
  const uiOverrides = useMemo(
    () => ({
      tools: (editorInstance, toolsSchema) => {
        return {
          ...toolsSchema,
          [CAMERA_SHAPE_TYPE]: {
            id: CAMERA_SHAPE_TYPE,
            label: 'tool.camera',
            icon: <div className="camera-toolbar-icon" />,
            kbd: 'c',
            onSelect: () => {
              editorInstance.setCurrentTool(CAMERA_SHAPE_TYPE)
            },
          },
          [PIN_SHAPE_TYPE]: {
            id: PIN_SHAPE_TYPE,
            label: 'tool.pin',
            icon: <div className="pin-toolbar-icon" />,
            kbd: 'p',
            onSelect: () => {
              editorInstance.setCurrentTool(PIN_SHAPE_TYPE)
            },
          },
        }
      },
      translations: {
        en: {
          'tool.camera': 'Camera Crop',
          'tool.pin': 'Pin',
        },
      },
    }),
    [],
  )
  const uiComponents = useMemo(
    () => ({
      Toolbar: CanvasToolbar,
    }),
    [],
  )

  useEffect(() => {
    return () => {
      if (disposeAttachmentsRef.current) {
        disposeAttachmentsRef.current()
      }
    }
  }, [])

  async function onExportSelectedCamera() {
    if (!editor) {
      return
    }

    const selectedIds = editor.getSelectedShapeIds()
    const cameraId = selectedIds.find((shapeId) => {
      const shape = editor.getShape(shapeId)
      return shape?.type === CAMERA_SHAPE_TYPE
    })

    if (!cameraId) {
      window.alert('Select a camera crop shape first, then export.')
      return
    }

    try {
      const exported = await exportCameraCrop(editor, cameraId)
      if (!exported) {
        window.alert('No drawable content found for this camera crop.')
      }
    } catch {
      window.alert('Unable to export this crop right now.')
    }
  }

  return (
    <div className="canvas-page">
      <div className="canvas-page__header">
        <div>
          <p className="canvas-page__eyebrow">Canvas Studio</p>
        </div>
        <div className="canvas-page__actions">
          <button
            type="button"
            onClick={() => editor?.setCurrentTool(PIN_SHAPE_TYPE)}
            disabled={!editor}
          >
            Pin Tool
          </button>
          <button
            type="button"
            onClick={() => editor?.setCurrentTool(CAMERA_SHAPE_TYPE)}
            disabled={!editor}
          >
            Camera Tool
          </button>
          <button type="button" onClick={onExportSelectedCamera} disabled={!editor}>
            Export Selected Camera
          </button>
          <button type="button" onClick={() => editor?.setCurrentTool('select')} disabled={!editor}>
            Select Tool
          </button>
        </div>
      </div>

      <div className="canvas-page__board">
        <Tldraw
          tools={tools}
          shapeUtils={shapeUtils}
          overrides={uiOverrides}
          components={uiComponents}
          onMount={(mountedEditor) => {
            setEditor(mountedEditor)
            if (disposeAttachmentsRef.current) {
              disposeAttachmentsRef.current()
            }
            disposeAttachmentsRef.current = installPinAttachmentBehavior(mountedEditor)
          }}
        />
      </div>
    </div>
  )
}
