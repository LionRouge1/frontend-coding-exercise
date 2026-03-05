import { Link, Route, Routes } from 'react-router-dom'
import HomePage from './components/Homepage'
import DisplayPdfPage from './components/DisplayPdfPage'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/display-pdf" element={<DisplayPdfPage />} />
    </Routes>
  )
}

export default App
