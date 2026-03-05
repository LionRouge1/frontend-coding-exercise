import { Navigate, Route, Routes } from 'react-router-dom'
import HomePage from './components/Homepage'
import DisplayPdfPage from './components/DisplayPdfPage'
import CanvasPage from './components/CanvasPage'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/display-pdf" element={<DisplayPdfPage />} />
      <Route path="/canvas" element={<CanvasPage />} />
      <Route path="/canva" element={<Navigate to="/canvas" replace />} />
    </Routes>
  )
}

export default App
