export default function UploadProgressList({ items }) {
  if (items.length === 0) {
    return null
  }

  return (
    <div className="uploads">
      {items.map((item) => (
        <div key={item.id} className="upload-row">
          <div className="upload-row__meta">
            <span>{item.name}</span>
            <span>{item.progress}%</span>
          </div>
          <div className="upload-row__track">
            <div className="upload-row__bar" style={{ width: `${item.progress}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}
