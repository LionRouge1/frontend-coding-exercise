import DocumentCard from './DocumentCard'

export default function DocumentsList({
  documents,
  selectedDocId,
  renameDrafts,
  onSelect,
  onStartRename,
  onReplace,
  onRemove,
  onRenameChange,
  onRenameSave,
  onRenameCancel,
}) {
  return (
    <aside className="documents-list">
      <h2>Your Documents</h2>
      {documents.length === 0 && <p className="empty-state">No documents yet.</p>}
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          doc={doc}
          isSelected={selectedDocId === doc.id}
          renameDraft={renameDrafts[doc.id]}
          onSelect={() => onSelect(doc.id)}
          onStartRename={() => onStartRename(doc.id)}
          onReplace={() => onReplace(doc.id)}
          onRemove={() => onRemove(doc.id)}
          onRenameChange={(value) => onRenameChange(doc.id, value)}
          onRenameSave={() => onRenameSave(doc.id)}
          onRenameCancel={() => onRenameCancel(doc.id)}
        />
      ))}
    </aside>
  )
}
