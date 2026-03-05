import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import DisplayPdfPage from './components/DisplayPdfPage'
import CanvasPage from './components/CanvasPage'
import './App.css'

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<DisplayPdfPage />} />
        <Route path="/display-pdf" element={<Navigate to="/" replace />} />
        <Route path="/canvas" element={<CanvasPage />} />
      </Route>
      <Route path="/canva" element={<Navigate to="/canvas" replace />} />
    </Routes>
  )
}

export default App
