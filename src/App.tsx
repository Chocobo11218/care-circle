import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SessionProvider } from './lib/session'
import { DraftProvider } from './lib/draft'
import Landing from './pages/onboarding/Landing'
import CreateAccount from './pages/onboarding/CreateAccount'

export default function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <DraftProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/create-account" element={<CreateAccount />} />
          </Routes>
        </DraftProvider>
      </SessionProvider>
    </BrowserRouter>
  )
}