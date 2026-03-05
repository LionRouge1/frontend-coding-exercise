import { Link, Route, Routes } from 'react-router-dom'
import './App.css'

function HomePage() {
  return (
    <div>
      <h1>Home</h1>
      <p>
        Go to the <Link to="/display-pdf">Display PDF</Link> route.
      </p>
    </div>
  )
}

function DisplayPdfPage() {
  return (
    <div>
      <h1>Display PDF</h1>
      <p>This is the display PDF route.</p>
      <Link to="/">Back to Home</Link>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/display-pdf" element={<DisplayPdfPage />} />
    </Routes>
  )
}

export default App
