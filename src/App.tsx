import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/onboarding/Landing'
import CreateAccount from './pages/onboarding/CreateAccount'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/create-account" element={<CreateAccount />} />
      </Routes>
    </BrowserRouter>
  )
}