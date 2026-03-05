import { formatBytes } from '../../features/pdf/utils'

export default function DocumentCard({
  doc,
  isSelected,
  renameDraft,
  onSelect,
  onStartRename,
  onReplace,
  onRemove,
  onRenameChange,
  onRenameSave,
  onRenameCancel,
}) {
  return (
    <div
      className={`doc-card ${isSelected ? 'doc-card--selected' : ''}`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          onSelect()
        }
      }}
    >
      <p className="doc-card__name">{doc.name}</p>
      <p className="doc-card__meta">{formatBytes(doc.size)}</p>
      <div className="doc-card__actions">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onStartRename()
          }}
        >
          Rename
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onReplace()
          }}
        >
          Replace
        </button>
        <button
          className="button--danger"
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onRemove()
          }}
        >
          Remove
        </button>
      </div>
      {renameDraft !== undefined && (
        <div className="rename-form" onClick={(event) => event.stopPropagation()}>
          <input
            value={renameDraft}
            onChange={(event) => onRenameChange(event.target.value)}
            placeholder="New file name"
          />
          <button type="button" onClick={onRenameSave}>
            Save
          </button>
          <button type="button" onClick={onRenameCancel}>
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
