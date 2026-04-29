import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import SermonsPage from './pages/SermonsPage'
import EventsPage from './pages/EventsPage'
import DonatePage from './pages/DonatePage'
import ContactTPage from './pages/contacttpage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/sermons" element={<SermonsPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/donate" element={<DonatePage />} />
          <Route path="/contact" element={<ContactTPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
