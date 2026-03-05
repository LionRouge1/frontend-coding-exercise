import { useCallback, useMemo, useRef, useState } from 'react'
import {
  DefaultToolbar,
  DefaultToolbarContent,
  Tldraw,
  ToolbarItem,
} from 'tldraw'
import 'tldraw/tldraw.css'
import { PinShapeTool } from '../features/canvas/pinShapeTool'
import {
  PIN_SHAPE_TYPE,
  PinShapeUtil,
} from '../features/canvas/pinShapeUtil.jsx'
import { installPinAttachmentBehavior } from '../features/canvas/pinAttachments'
import { CameraShapeTool } from '../features/canvas/cameraShapeTool'
import { CameraShapeUtil } from '../features/canvas/cameraShapeUtil.jsx'
import {
  CAMERA_SHAPE_TYPE,
  exportCameraCrop,
} from '../features/canvas/cameraExport'
import './CanvasPage.css'

const CANVAS_PERSISTENCE_KEY = 'doccanvas-canvas-v1'

function CanvasToolbar() {
  return (
    <DefaultToolbar>
      <DefaultToolbarContent />
      <ToolbarItem tool="pin" />
      <ToolbarItem tool="capture" />
    </DefaultToolbar>
  )
}

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

function getCanvasElement(editor) {
  const container = editor?.getContainer?.()
  if (!container) {
    return null
  }

  const boardCanvas = container.querySelector('.tl-canvas canvas')
  if (boardCanvas instanceof HTMLCanvasElement) {
    return boardCanvas
  }

  const fallbackCanvas = container.querySelector('canvas')
  return fallbackCanvas instanceof HTMLCanvasElement ? fallbackCanvas : null
}

export default function CanvasPage() {
  const [capturePopupOpen, setCapturePopupOpen] = useState(false)
  const [captureHoverMode, setCaptureHoverMode] = useState('image')
  const [isRecording, setIsRecording] = useState(false)
  const editorRef = useRef(null)
  const captureModeRef = useRef(null)
  const pendingImageShapeIdRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const mediaStreamRef = useRef(null)
  const mediaChunksRef = useRef([])
  const recordingMimeTypeRef = useRef('video/webm')
  const recordingCanvasRef = useRef(null)
  const recordingRafIdRef = useRef(null)

  const clearRecordingRefs = useCallback(() => {
    if (recordingRafIdRef.current !== null) {
      cancelAnimationFrame(recordingRafIdRef.current)
      recordingRafIdRef.current = null
    }

    if (mediaStreamRef.current) {
      for (const track of mediaStreamRef.current.getTracks()) {
        track.stop()
      }
    }

    mediaRecorderRef.current = null
    mediaStreamRef.current = null
    mediaChunksRef.current = []
    recordingMimeTypeRef.current = 'video/webm'
    recordingCanvasRef.current = null
  }, [])

  const stopRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current
    if (!recorder || recorder.state === 'inactive') {
      setIsRecording(false)
      clearRecordingRefs()
      return
    }

    try {
      recorder.requestData()
    } catch {
      // Some browsers throw if called immediately after start.
    }

    recorder.stop()
  }, [clearRecordingRefs])

  const startRecording = useCallback(() => {
    if (isRecording) {
      return
    }

    if (typeof MediaRecorder === 'undefined') {
      return
    }

    const editor = editorRef.current
    const canvas = getCanvasElement(editor)
    if (!canvas || typeof canvas.captureStream !== 'function') {
      return
    }

    const recordingCanvas = document.createElement('canvas')
    const context = recordingCanvas.getContext('2d')
    if (!context) {
      return
    }

    const drawFrame = () => {
      if (recordingCanvas.width !== canvas.width || recordingCanvas.height !== canvas.height) {
        recordingCanvas.width = canvas.width
        recordingCanvas.height = canvas.height
      }

      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, recordingCanvas.width, recordingCanvas.height)
      context.drawImage(canvas, 0, 0, recordingCanvas.width, recordingCanvas.height)
      recordingRafIdRef.current = requestAnimationFrame(drawFrame)
    }

    recordingCanvasRef.current = recordingCanvas
    drawFrame()

    const stream = recordingCanvas.captureStream(30)
    const candidates = ['video/webm;codecs=vp8', 'video/webm']
    const mimeType = candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate))

    const recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream)

    mediaChunksRef.current = []
    mediaStreamRef.current = stream
    mediaRecorderRef.current = recorder
    recordingMimeTypeRef.current = recorder.mimeType || mimeType || 'video/webm'

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        mediaChunksRef.current.push(event.data)
      }
    }

    recorder.onstop = () => {
      const blob = new Blob(mediaChunksRef.current, {
        type: recordingMimeTypeRef.current || 'video/webm',
      })
      if (blob.size > 0) {
        downloadBlob(blob, `canvas-recording-${Date.now()}.webm`)
      }

      setIsRecording(false)
      clearRecordingRefs()
    }

    recorder.start(250)
    setIsRecording(true)
  }, [clearRecordingRefs, isRecording])

  const openCapturePopup = useCallback(() => {
    setCaptureHoverMode('image')
    setCapturePopupOpen(true)
  }, [])

  const useImageCapture = useCallback(() => {
    const editor = editorRef.current
    if (!editor) {
      return
    }

    captureModeRef.current = 'image'
    pendingImageShapeIdRef.current = null
    setCapturePopupOpen(false)
    editor.setCurrentTool(CAMERA_SHAPE_TYPE)
  }, [])

  const useVideoCapture = useCallback(() => {
    captureModeRef.current = 'video'
    pendingImageShapeIdRef.current = null
    setCapturePopupOpen(false)
    startRecording()
  }, [startRecording])

  const toolsOverrides = useMemo(
    () => ({
      tools(editor, tools) {
        return {
          ...tools,
          pin: {
            id: PIN_SHAPE_TYPE,
            label: 'Pin Tool',
            icon: <div className="pin-toolbar-icon" />,
            kbd: 'p',
            onSelect: () => {
              editor.setCurrentTool(PIN_SHAPE_TYPE)
            },
          },
          capture: {
            id: 'capture',
            label: 'Capture',
            icon: <div className="camera-toolbar-icon" />,
            kbd: 'c',
            onSelect: () => {
              editor.setCurrentTool('select')
              openCapturePopup()
            },
          },
        }
      },
    }),
    [openCapturePopup],
  )

  const components = useMemo(
    () => ({
      Toolbar: CanvasToolbar,
    }),
    [],
  )

  const handleMount = useCallback(
    (editor) => {
      editorRef.current = editor

      const disposePinBehavior = installPinAttachmentBehavior(editor)

      const disposeCameraCreate = editor.sideEffects.register({
        shape: {
          afterCreate: (shape) => {
            if (captureModeRef.current !== 'image' || shape.type !== CAMERA_SHAPE_TYPE) {
              return
            }

            pendingImageShapeIdRef.current = shape.id
          },
        },
      })

      const disposeOperationComplete = editor.sideEffects.registerOperationCompleteHandler(() => {
        if (captureModeRef.current !== 'image') {
          return
        }

        if (editor.inputs.getIsDragging()) {
          return
        }

        const shapeId = pendingImageShapeIdRef.current
        if (!shapeId) {
          return
        }

        pendingImageShapeIdRef.current = null
        captureModeRef.current = null
        setCapturePopupOpen(false)
        void exportCameraCrop(editor, shapeId)
      })

      return () => {
        disposePinBehavior()
        disposeCameraCreate()
        disposeOperationComplete()
        stopRecording()
        editorRef.current = null
      }
    },
    [stopRecording],
  )

  return (
    <section className="canvas-page">
      <header className="canvas-page__header">
        <div>
          <p className="canvas-page__eyebrow">Canvas</p>
          {/* <h1>Pin + Capture Toolkit</h1>
          <p className="canvas-page__subtitle">
            Use the bottom toolbar pin and capture tools. Capture supports image crop and direct
            video recording.
          </p> */}
        </div>
        <div className="canvas-page__actions">
          <button type="button" onClick={openCapturePopup}>
            Capture
          </button>
          {isRecording ? (
            <div className="canvas-recording-badge">
              <span className="canvas-recording-badge__dot" />
              Recording
              <button type="button" onClick={stopRecording}>
                Stop
              </button>
            </div>
          ) : null}
        </div>
      </header>

      {/* <div className="canvas-page__hint">
        Image mode: draw a crop area then release to auto-export. Video mode: records the current
        canvas instantly.
      </div> */}

      <div className="canvas-page__board">
        <Tldraw
          persistenceKey={CANVAS_PERSISTENCE_KEY}
          shapeUtils={[PinShapeUtil, CameraShapeUtil]}
          tools={[PinShapeTool, CameraShapeTool]}
          overrides={toolsOverrides}
          components={components}
          onMount={handleMount}
        />
      </div>

      {capturePopupOpen ? (
        <div className="capture-popup-overlay" role="dialog" aria-modal="true" aria-label="Capture mode">
          <div className="capture-popup">
            <button
              type="button"
              className="capture-popup__close"
              onClick={() => setCapturePopupOpen(false)}
              aria-label="Close capture options"
            >
              x
            </button>
            <div className="capture-popup__mode">{captureHoverMode}</div>
            <button
              type="button"
              className="capture-popup__icon-button"
              onMouseEnter={() => setCaptureHoverMode('image')}
              onFocus={() => setCaptureHoverMode('image')}
              onClick={useImageCapture}
              aria-label="Image capture"
              title="Image"
            >
              <span className="capture-popup__icon capture-popup__icon--image" />
            </button>
            <button
              type="button"
              className="capture-popup__icon-button"
              onMouseEnter={() => setCaptureHoverMode('video')}
              onFocus={() => setCaptureHoverMode('video')}
              onClick={useVideoCapture}
              aria-label="Video capture"
              title="Video"
            >
              <span className="capture-popup__icon capture-popup__icon--video" />
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
