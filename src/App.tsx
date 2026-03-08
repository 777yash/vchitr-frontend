import { Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import Subjects from './pages/Subjects'
import Faq from './pages/Faq'
import Contact from './pages/Contact'

function App() {
  return (
    <div className="app">
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/contact" element={<Contact />} />
        {/* Fallback routes for now */}
        <Route path="/notes" element={<div style={{ padding: '5rem 2rem' }}>Notes page coming soon...</div>} />
      </Routes>
    </div>
  )
}

export default App
