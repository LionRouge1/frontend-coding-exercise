import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div>
      <h1>Home</h1>
      <p>
        Go to the <Link to="/display-pdf">Display PDF</Link> route.
      </p>
    </div>
  )
}