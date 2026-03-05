import { PIN_SHAPE_TYPE } from './pinShapeUtil.jsx'

const STICKY_MARGIN = 12

function getShapeBounds(editor, shape) {
  return editor.getShapePageBounds(shape) ?? null
}

function hasSameIds(left, right) {
  if (left.length !== right.length) {
    return false
  }

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return false
    }
  }

  return true
}

function getTopSortedSiblings(editor, pinShape) {
  const allSiblingIds = editor.getSortedChildIdsForParent(pinShape.parentId)
  const siblings = []

  for (let index = allSiblingIds.length - 1; index >= 0; index -= 1) {
    const shape = editor.getShape(allSiblingIds[index])
    if (!shape || shape.id === pinShape.id || shape.type === PIN_SHAPE_TYPE) {
      continue
    }
    siblings.push(shape)
  }

  return siblings
}

function getAttachedIdsForPin(editor, pinShape) {
  const pinBounds = getShapeBounds(editor, pinShape)
  if (!pinBounds) {
    return []
  }

  const stickyBounds = pinBounds.clone().expandBy(STICKY_MARGIN)
  const previousAttached = pinShape.props.attachedShapeIds ?? []
  const siblings = getTopSortedSiblings(editor, pinShape)

  const strictHits = []
  const stickyCandidates = []

  for (const candidate of siblings) {
    const candidateBounds = getShapeBounds(editor, candidate)
    if (!candidateBounds) {
      continue
    }

    if (pinBounds.collides(candidateBounds)) {
      strictHits.push(candidate.id)
      continue
    }

    if (previousAttached.includes(candidate.id) && stickyBounds.collides(candidateBounds)) {
      stickyCandidates.push(candidate.id)
    }
  }

  const attached = [...strictHits]
  for (const shapeId of stickyCandidates) {
    if (attached.length >= 2) {
      break
    }
    if (!attached.includes(shapeId)) {
      attached.push(shapeId)
    }
  }

  return attached.slice(0, 2)
}

function refreshPinAttachment(editor, pinId) {
  const pin = editor.getShape(pinId)
  if (!pin || pin.type !== PIN_SHAPE_TYPE) {
    return
  }

  const attachedShapeIds = getAttachedIdsForPin(editor, pin)
  const current = pin.props.attachedShapeIds ?? []
  if (hasSameIds(current, attachedShapeIds)) {
    return
  }

  editor.updateShape({
    id: pin.id,
    type: PIN_SHAPE_TYPE,
    props: {
      attachedShapeIds,
    },
  })
}

function refreshAllPins(editor) {
  const shapes = editor.getCurrentPageShapesSorted()
  for (const shape of shapes) {
    if (shape.type === PIN_SHAPE_TYPE) {
      refreshPinAttachment(editor, shape.id)
    }
  }
}

function moveAttachedGroup(editor, movedShapeBefore, movedShapeAfter) {
  const deltaX = movedShapeAfter.x - movedShapeBefore.x
  const deltaY = movedShapeAfter.y - movedShapeBefore.y
  if (deltaX === 0 && deltaY === 0) {
    return
  }

  const pinShapes = editor
    .getCurrentPageShapesSorted()
    .filter((shape) => shape.type === PIN_SHAPE_TYPE && shape.parentId === movedShapeAfter.parentId)

  for (const pinShape of pinShapes) {
    const attached = pinShape.props.attachedShapeIds ?? []
    if (!attached.includes(movedShapeAfter.id)) {
      continue
    }

    const updates = []

    updates.push({
      id: pinShape.id,
      type: PIN_SHAPE_TYPE,
      x: pinShape.x + deltaX,
      y: pinShape.y + deltaY,
    })

    for (const attachedId of attached) {
      if (attachedId === movedShapeAfter.id) {
        continue
      }
      const sibling = editor.getShape(attachedId)
      if (!sibling || sibling.type === PIN_SHAPE_TYPE || sibling.parentId !== movedShapeAfter.parentId) {
        continue
      }

      updates.push({
        id: sibling.id,
        type: sibling.type,
        x: sibling.x + deltaX,
        y: sibling.y + deltaY,
      })
    }

    if (updates.length > 0) {
      editor.updateShapes(updates)
    }

    refreshPinAttachment(editor, pinShape.id)
  }
}

export function installPinAttachmentBehavior(editor) {
  let isApplying = false

  const runSafely = (fn) => {
    if (isApplying) {
      return
    }
    isApplying = true
    try {
      fn()
    } finally {
      isApplying = false
    }
  }

  const dispose = editor.sideEffects.register({
    shape: {
      afterCreate: (shape) => {
        runSafely(() => {
          if (shape.type === PIN_SHAPE_TYPE) {
            refreshPinAttachment(editor, shape.id)
            return
          }
          refreshAllPins(editor)
        })
      },
      afterChange: (before, after) => {
        runSafely(() => {
          if (after.type === PIN_SHAPE_TYPE) {
            refreshPinAttachment(editor, after.id)
            return
          }

          moveAttachedGroup(editor, before, after)
          refreshAllPins(editor)
        })
      },
      afterDelete: () => {
        runSafely(() => {
          refreshAllPins(editor)
        })
      },
    },
  })

  runSafely(() => {
    refreshAllPins(editor)
  })

  return dispose
}
