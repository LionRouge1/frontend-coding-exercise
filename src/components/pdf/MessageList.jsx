export default function MessageList({ messages }) {
  if (messages.length === 0) {
    return null
  }

  return (
    <div className="messages">
      {messages.slice(-4).map((message, index) => (
        <p key={`${message}-${index}`}>{message}</p>
      ))}
    </div>
  )
}
