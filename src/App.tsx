import { Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import Subjects from './pages/Subjects'
import Faq from './pages/Faq'
import Contact from './pages/Contact'
import Notes from './pages/Notes'
function App() {
  return (
    <div className="app">
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/subjects" element={<Subjects />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/notes/:subjectName" element={<Notes />} />
      </Routes>
    </div>
  )
}

export default App
